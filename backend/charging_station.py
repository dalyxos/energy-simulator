import time
from enum import Enum

class Vehicle:
    def __init__(self, capacity=50, max_current=16, soc=0, connected=False):
        self.capacity = capacity
        self.soc = soc
        self.max_current = max_current
        self.connected = connected
        self.charging_start_delay = 5
        self.charging_delay = 3
        self.current = 0
        self.charging_start_time = 0
        
    def connect(self):
        if(not self.connected):
            self.connected = True
            self.charging_start_time = time.time()
        
    def disconnect(self):
        self.connected = False
        
    def get_current(self):
        if not self.connected:
            self.current = 0
        elif time.time() - self.charging_start_time < self.charging_start_delay:
            self.current = 0
        elif self.soc >= self.capacity:
            self.current = 0
        elif self.soc < self.capacity * 0.99:
            self.current = self.max_current * (time.time() - self.charging_start_time - self.charging_start_delay) / self.charging_delay
        else:
            self.current = self.max_current * (1 - self.soc / self.capacity)
        return self.current
    
    def increase_soc(self, energy):
        self.soc += energy
        
class VehicleState(Enum):
    DISCONNECTED = 0
    CONNECTED_NOT_CHARGING = 1
    CHARGING = 2
    FULLY_CHARGED = 3

class ChargingStation():
    def __init__(self, max_current=16, phases=[1, 0, 0]):
        self.vehicle = Vehicle(max_current=max_current)
        self.max_current = max_current
        self.energy_index = 0
        self.phases = phases
        self.voltage = [0, 0, 0]
        self.current = [0, 0, 0]
        self.hems = 0

    def update(self):
        vehicle_current = self.vehicle.get_current()
        if vehicle_current > self.hems:
            vehicle_current = self.hems
        self.current = [vehicle_current if i in self.phases else 0 for i in range(1, 4)]
        increment = sum([self.current[i] * self.voltage[i] for i in range(3)]) / 1000
        self.energy_index += increment
        self.vehicle.increase_soc(increment)
        
    def get_vehicle_state(self):
        if not self.vehicle.connected:
            return VehicleState.DISCONNECTED
        elif self.vehicle.current == 0:
            return VehicleState.CONNECTED_NOT_CHARGING
        elif self.vehicle.soc >= self.vehicle.capacity:
            return VehicleState.FULLY_CHARGED
        else:
            return VehicleState.CHARGING
    
    def to_json(self):
        return {
            "energy_index": round(self.energy_index, 2),
            "voltage": [round(value, 2) for value in self.voltage],
            "current": [round(value, 2) for value in self.current],
            "soc": round(self.vehicle.soc * 100 / self.vehicle.capacity, 2),
            "vehicle_state": self.get_vehicle_state().name
        }
    
    def set_voltage(self, voltage):
        self.voltage = voltage
        
    def config_to_json(self):
        return {
            "max_current": self.max_current,
            "phases": self.phases,
            "hems": self.hems,
            "vehicle_connected": self.vehicle.connected
        }
        
    def config_from_json(self, json):
        print(json)
        if "max_current" in json:
            self.max_current = json["max_current"]
        if "phases" in json:
            self.phases = json["phases"]
        if "hems" in json:
            self.hems = json["hems"]
        if "vehicle_connected" in json:
            if json["vehicle_connected"]:
                self.vehicle.connect()
            else:
                self.vehicle.disconnect()
            
        return self.config_to_json()
    
        