import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry
import json
from enum import Enum

class SolarPanel:
    def __init__(self, latitude, longitude):
        self.panel_efficiency = 0.2 # 20% Nominal panel efficiency (decimal)
        self.panel_area = 10 # Total surface area of the PV panel (m²)
        self.inverter_efficiency = 0.95 # 95% Inverter efficiency (decimal)
        self.shading_factor = 0.9 # 10% Factor to account for shading (0-1)
        self.latitude = latitude
        self.longitude = longitude
        self.temperature = 0
        self.solar_power = 0
        self.solar_energy = 0
        self.api_url = "https://api.open-meteo.com/v1/forecast"
        cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
        retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
        self.openmeteo = openmeteo_requests.Client(session = retry_session)
        
    def calculate_pv_power(self, ghi, temp):
        """
        Calculates PV power output considering advanced factors.

        Args:
            ghi: Global Horizontal Irradiance (W/m²)
            temp: Temperature (°C)
            shading_factor: Factor to account for shading (0-1)

        Returns:
            PV power output (W)
        """

        # Temperature coefficient (typical value for crystalline silicon)
        temp_coeff = -0.0045 #/ °C

        # Adjust panel efficiency for efficency
        adjusted_efficiency = self.panel_efficiency * (1 + temp_coeff * (temp - 25))

        # Calculate raw power output
        raw_power = ghi * adjusted_efficiency * self.panel_area

        # Account for shading
        shaded_power = raw_power * self.shading_factor

        # Account for inverter efficiency
        final_power = shaded_power * self.inverter_efficiency

        return final_power
    
    def get_weather_forecast(self):
        params = {
            'latitude': self.latitude,
            'longitude': self.longitude,
            'current': "temperature_2m",
            "minutely_15": "shortwave_radiation",
            "past_minutely_15": 1,
            "timezone": "auto"
        }
        responses = self.openmeteo.weather_api(self.api_url, params=params)
        # Process first location. Add a for-loop for multiple locations or weather models
        response = responses[0]
        return response.Current(), response.Minutely15()
    
    def generate_power(self):
        current, minutely_15 = self.get_weather_forecast()
        self.temperature = current.Variables(0).Value()
        #print(f"Temperature: {self.temperature}°C")
        #print(f"GHI: {minutely_15.Variables(0).ValuesAsNumpy()[1]} W/m²")
        self.solar_power = self.calculate_pv_power(float(minutely_15.Variables(0).ValuesAsNumpy()[1]), self.temperature)
        self.solar_energy += self.solar_power / 3600

    def to_json(self):
        return {
            "solar_power": round(self.solar_power, 3)
        }
    
    def config_to_json(self):
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "temperature": self.temperature
        }
    
    def config_from_json(self, data):
        if "latitude" in data:
            self.latitude = data["latitude"]
        if "longitude" in data:
            self.longitude = data["longitude"]
        if "temperature" in data:
            self.temperature = data["temperature"]

class Battery:
    def __init__(self, capacity, soc=0):
        self.capacity = capacity
        self.state_of_charge = soc
        self.max_charge_current = 30
        self.max_discharge_current = 30
        self.volts = 100
        self.current = 0
        self.feed_in = 0
        self.feed_out = 0

    def update_charge(self):
        energy_exchanged = self.current * self.volts  / 3600
        if energy_exchanged > 0:
            self.feed_in += energy_exchanged
        else:
            self.feed_out -= energy_exchanged
        self.state_of_charge += energy_exchanged
        self.state_of_charge = min(max(self.state_of_charge, 0), self.capacity)
        #print(f"Battery charge: {round(self.state_of_charge, 3)} Wh")
        #print(f"SoC: {round(self.state_of_charge * 100 /self.capacity, 1)}%")

    def schedule_charge_update(self):
        self.update_charge()

    def to_json(self):
        return {
            "voltage": self.volts,
            "state_of_charge": round(self.state_of_charge * 100 /self.capacity, 1),
            "current": round(self.current, 3),
            "power": round(self.current * self.volts, 3)
        }
    
    def config_to_json(self):
        return {
            "capacity": self.capacity,
            "max_charge_current": self.max_charge_current,
            "max_discharge_current": self.max_discharge_current
        }
    
    def config_from_json(self, data):
        if "capacity" in data:
            self.capacity = data["capacity"]
        if "max_charge_current" in data:
            self.max_charge_current = data["max_charge_current"]
        if "max_discharge_current" in data:
            self.max_discharge_current = data["max_discharge_current"]


class SolarUseMode(Enum):
    SelfUse = 0
    Backup = 2
    Manual = 3

class BatteryUseMode(Enum):
    Stop = 0
    Charge = 1
    Discharge = 2

class Inverter:
    def __init__(self):
        self.solar_panel = SolarPanel(52.52, 13.40)
        self.battery = Battery(15, soc=10)
        self.solar_use_mode = SolarUseMode.SelfUse
        self.battery_use_mode = BatteryUseMode.Stop
    
    def schedule_power_output(self, sm_power=[0, 0, 0]):
        self.solar_panel.generate_power()
        self.battery.update_charge()
        if self.solar_use_mode == SolarUseMode.SelfUse:
            if(self.solar_panel.solar_power > sum(sm_power)) and (self.battery.state_of_charge < self.battery.capacity):
                self.battery.current = min(self.battery.max_charge_current, (self.solar_panel.solar_power - sum(sm_power)) / self.battery.volts)
            elif self.solar_panel.solar_power < sum(sm_power) and self.battery.state_of_charge > 0:
                self.battery.current = -min(self.battery.max_discharge_current, (sum(sm_power) - self.solar_panel.solar_power) / self.battery.volts)
            else:
                self.battery.current = 0
        elif self.solar_use_mode == SolarUseMode.Backup:
            self.battery.current = 0
        elif self.battery_use_mode == BatteryUseMode.Charge:
            self.battery.current = self.battery.max_charge_current
        elif self.battery_use_mode == BatteryUseMode.Discharge:
            self.battery.current = -self.battery.max_discharge_current
        else:
            self.battery.current = 0

    def get_power(self):
        return (self.solar_panel.solar_power - self.battery.current * self.battery.volts)
    
    def to_json(self):
        return {
            "power": round(self.get_power(), 3)
        }
    
    def config_to_json(self):
        return {
            "solar_use_mode": self.solar_use_mode.name,
            "battery_use_mode": self.battery_use_mode.name
        }
    
    def config_from_json(self, data):
        if "solar_use_mode" in data:
            print(f"Setting solar use mode to {data['solar_use_mode']}")
            self.solar_use_mode = SolarUseMode[data["solar_use_mode"]]
        if "battery_use_mode" in data:
            print(f"Setting battery use mode to {data['battery_use_mode']}")
            self.battery_use_mode = BatteryUseMode[data["battery_use_mode"]]
