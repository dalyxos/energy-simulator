import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry
import threading
import json
from enum import Enum
from modbus import Modbus

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
        self.manual_mode = False
        self.polling_interval = 60
        self.api_url = "https://api.open-meteo.com/v1/forecast"
        cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
        retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
        self.openmeteo = openmeteo_requests.Client(session = retry_session)
        self.timer = None
        self.schedule_power_generation()
        
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
        print(f"Temperature: {self.temperature}°C")
        print(f"GHI: {minutely_15.Variables(0).ValuesAsNumpy()[1]} W/m²")
        self.solar_power = self.calculate_pv_power(float(minutely_15.Variables(0).ValuesAsNumpy()[1]), self.temperature)
        self.solar_energy += self.solar_power * self.polling_interval / 3660

    def schedule_power_generation(self):
        if not self.manual_mode:
            self.generate_power()
            self.timer = threading.Timer(self.polling_interval, self.schedule_power_generation)
            self.timer.start()

    def to_json(self):
        data = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "temperature": round(self.temperature, 1),
            "solar_power": round(self.solar_power, 3),
            "manual_mode": self.manual_mode
        }
        return json.dumps(data)
    
    def update_from_json(self, data):
        if "latitude" in data:
            self.latitude = data["latitude"]
        if "longitude" in data:
            self.longitude = data["longitude"]
        if "temperature" in data:
            self.temperature = data["temperature"]
        if "solar_power" in data:
            self.solar_power = data["solar_power"]
        if "manual_mode" in data and self.manual_mode != data["manual_mode"]:
            self.manual_mode = data["manual_mode"]
            self.timer.cancel()
            if not self.manual_mode:
                self.schedule_power_generation()

class Battery:
    def __init__(self, capacity):
        self.capacity = capacity
        self.state_of_charge = 0
        self.max_charge_current = 30
        self.max_discharge_current = 30
        self.volts = 48
        self.current = 0
        self.feed_in = 0
        self.feed_out = 0
        self.manual_mode = False
        self.polling_interval = 30
        self.timer = None
        self.schedule_charge_update()

    def update_charge(self):
        if not self.manual_mode:
            # Assuming a simple model where state of charge is updated based on current and voltage
            # This is a placeholder for a more complex battery management algorithm
            energy_exchanged = self.current * self.volts * self.polling_interval / 3600
            if energy_exchanged > 0:
                self.feed_in += energy_exchanged
            else:
                self.feed_out -= energy_exchanged
            self.state_of_charge += energy_exchanged
            self.state_of_charge = min(max(self.state_of_charge, 0), self.capacity)
            print(f"Battery charge: {round(self.state_of_charge, 3)} Wh")
            print(f"SoC: {round(self.state_of_charge * 100 /self.capacity, 1)}%")
            self.timer = threading.Timer(self.polling_interval, self.update_charge)
            self.timer.start()

    def schedule_charge_update(self):
        self.update_charge()

    def to_json(self):
        data = {
            "capacity": self.capacity,
            "voltage": self.volts,
            "state_of_charge": round(self.state_of_charge * 100 /self.capacity, 1),
            "current": round(self.current, 3),
            "power": round(self.current * self.volts, 3),
            "max_charge_current": self.max_charge_current,
            "max_discharge_current": self.max_discharge_current,
            "manual_mode": self.manual_mode
        }
        return json.dumps(data)
    
    def update_from_json(self, data):
        if "capacity" in data:
            self.capacity = data["capacity"]
        if "voltage" in data:
            self.volts = data["voltage"]
        if "state_of_charge" in data:
            self.state_of_charge = data["state_of_charge"] * self.capacity / 100
        if "current" in data:
            self.current = data["current"]
        if "max_charge_current" in data:
            self.max_charge_current = data["max_charge_current"]
        if "max_discharge_current" in data:
            self.max_discharge_current = data["max_discharge_current"]
        if "manual_mode" in data and self.manual_mode != data["manual_mode"]:
            self.manual_mode = data["manual_mode"]
            self.timer.cancel()
            if not self.manual_mode:
                self.schedule_charge_update()


class SolarUseMode(Enum):
    SelfUse = 0
    Backup = 2
    Manual = 3

class BatteryUseMode(Enum):
    Stop = 0
    Charge = 1
    Discharge = 2

solax_parameters = [
                { "name": "factory_name", "function_code": 3, "address": 7, "type": "string", "size": 7, "default": "" },
                { "name": "power_limit", "function_code": 3, "address": 37, "type": "u16", "default": 0 },
                { "name": "solar_charge_use_mode", "function_code": 3, "address": 139, "type": "u16", "default": 0 },
                { "name": "manual_mode", "function_code": 3, "address": 140, "type": "u16", "default": 0 },
                { "name": "battery_type", "function_code": 3, "address": 141, "type": "u16", "default": 0 },
                { "name": "battery_charge_float_voltage", "function_code": 3, "address": 142, "type": "u16", "default": 0 },
                { "name": "battery_charge_max_current", "function_code": 3, "address": 144, "type": "u16", "default": 0 },
                { "name": "battery_discharge_max_current", "function_code": 3, "address": 145, "type": "u16", "default": 0 },
                { "name": "battery_absorb_voltage", "function_code": 3, "address": 146, "type": "u16", "default": 0 },
                { "name": "grid_current", "function_code": 4, "address": 1, "type": "i16", "default": 0 },
                { "name": "grid_power", "function_code": 4, "address": 2, "type": "u32", "default": 0 },
                { "name": "solar_connected", "function_code": 4, "address": 3, "type": "u16", "default": 0 },
                { "name": "pv_power", "function_code": 4, "address": 10, "type": "u32", "default": 0 },
                { "name": "battery_voltage", "function_code": 4, "address": 20, "type": "i16", "default": 0 },
                { "name": "battery_current", "function_code": 4, "address": 21, "type": "i16", "default": 0 },
                { "name": "battery_power", "function_code": 4, "address": 22, "type": "i32", "default": 0 },
                { "name": "battery_connected", "function_code": 4, "address": 23, "type": "u16", "default": 0 },
                { "name": "state_of_charge", "function_code": 4, "address": 28, "type": "u16", "default": 0 },
                { "name": "out_charge_energy", "function_code": 4, "address": 29, "type": "u32", "default": 0 },
                { "name": "in_charge_energy", "function_code": 4, "address": 33, "type": "u32", "default": 0 },
                { "name": "battery_capacity", "function_code": 4, "address": 38, "type": "u16", "default": 0 },
                { "name": "battery_error", "function_code": 4, "address": 67, "type": "u16", "default": 0 },
                { "name": "feeding_power", "function_code": 4, "address": 70, "type": "u32", "default": 0 },
                { "name": "feeding_energy", "function_code": 4, "address": 72, "type": "u32", "default": 0 },
                { "name": "consum_energy", "function_code": 4, "address": 74, "type": "u32", "default": 0 },
                { "name": "total_energy_to_grid", "function_code": 4, "address": 82, "type": "u32", "default": 0 },
                { "name": "solar_energy_index", "function_code": 4, "address": 148, "type": "u32", "default": 0 }
            ]

class Inverter:
    def __init__(self, solar_panel, battery, power_meter):
        self.modbus = Modbus(5020, solax_parameters)
        self.solar_panel = solar_panel
        self.battery = battery
        self.update_timer = 2
        self.manual_mode = False
        self.solar_use_mode = SolarUseMode.SelfUse
        self.battery_use_mode = BatteryUseMode.Stop
        self.power_meter = power_meter
        self.timer = None
        self.schedule_power_output()
    
    def schedule_power_output(self):
        if not self.manual_mode:
            #print(f"solar_use_mode: {self.solar_use_mode}")
            #print(f"battery_use_mode: {self.battery_use_mode}")
            if self.solar_use_mode == SolarUseMode.SelfUse:
                if(self.solar_panel.solar_power > self.power_meter.get_load()) and (self.battery.state_of_charge < self.battery.capacity):
                    self.battery.current = min(self.battery.max_charge_current, (self.solar_panel.solar_power - self.power_meter.get_load()) / self.battery.volts)
                elif self.solar_panel.solar_power < self.power_meter.get_load() and self.battery.state_of_charge > 0:
                    self.battery.current = -min(self.battery.max_discharge_current, (self.power_meter.get_load() - self.solar_panel.solar_power) / self.battery.volts)
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
            #print(f"Current: {self.battery.current}")
            self.update_modbus_context()
            self.power_meter.update_inv_power(self.get_power())
            self.timer = threading.Timer(self.update_timer, self.schedule_power_output)
            self.timer.start()
            
    def update_modbus_context(self):
        
        self.modbus.set_modbus_server_parameter_value("battery_charge_max_current", self.battery.max_charge_current * 10)
        self.modbus.set_modbus_server_parameter_value("battery_discharge_max_current", self.battery.max_discharge_current * 10)
        self.modbus.set_modbus_server_parameter_value("power_limit", 100)
        self.modbus.set_modbus_server_parameter_value("battery_voltage", self.battery.volts * 10)
        self.modbus.set_modbus_server_parameter_value("battery_current", self.battery.current * 10)
        self.modbus.set_modbus_server_parameter_value("battery_capacity", self.battery.capacity)
        self.modbus.set_modbus_server_parameter_value("state_of_charge", round(self.battery.state_of_charge * 100 /self.battery.capacity, 1))
        self.modbus.set_modbus_server_parameter_value("solar_charge_use_mode", self.solar_use_mode.value)
        self.modbus.set_modbus_server_parameter_value("manual_mode", self.battery_use_mode.value)
        self.modbus.set_modbus_server_parameter_value("battery_type", 1)
        self.modbus.set_modbus_server_parameter_value("battery_power", self.battery.current * self.battery.volts)
        self.modbus.set_modbus_server_parameter_value("pv_power", self.solar_panel.solar_power)
        self.modbus.set_modbus_server_parameter_value("solar_energy_index", self.solar_panel.solar_energy / 1000)
    
    def get_power(self):
        return (self.solar_panel.solar_power - self.battery.current * self.battery.volts)
    
    def to_json(self):
        data = {
            #"solar_panel": self.solar_panel.to_json(),
            #"battery": self.battery.to_json(),
            "power": round(self.get_power(), 3),
            "solar_use_mode": self.solar_use_mode.name,
            "battery_use_mode": self.battery_use_mode.name,
            "manual_mode": self.manual_mode
        }
        return json.dumps(data)
    
    def update_from_json(self, data):
        #if "solar_panel" in data:
        #    self.solar_panel.update_from_json(json.loads(data["solar_panel"]))
        #if "battery" in data:
        #    self.battery.update_from_json(json.loads(data["battery"]))
        if "solar_use_mode" in data:
            print(f"Setting solar use mode to {data['solar_use_mode']}")
            self.solar_use_mode = SolarUseMode[data["solar_use_mode"]]
        if "battery_use_mode" in data:
            print(f"Setting battery use mode to {data['battery_use_mode']}")
            self.battery_use_mode = BatteryUseMode[data["battery_use_mode"]]
        if "manual_mode" in data and self.manual_mode != data["manual_mode"]:
            self.manual_mode = data["manual_mode"]
            self.timer.cancel()
            if not self.manual_mode:
                self.schedule_power_output()
