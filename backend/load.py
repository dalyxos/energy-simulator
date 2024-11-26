from device import Device
import threading
import time
import random
import json

class Load(Device):
    def __init__(self, current_limit=30, voltage=230, phase=1):
        self.current_limit = current_limit
        self.voltage = [voltage]*3
        self.load_limit_max = [10]*3
        self.load_limit_min = [0]*3
        self.load_current = [0]*3

        self.update_load_current_thread = threading.Thread(target=self.update_current_randomly)
        self.update_load_current_thread.daemon = True
        self.update_load_current_thread.start()

    def get_power(self):
        return sum([self.voltage[i] * self.load_current[i] for i in range(3)])

    def update_current_randomly(self):
        while True:
            self.load_current[0] = random.uniform(self.load_limit_min[0] * self.current_limit / 100, self.load_limit_max[0] * self.current_limit / 100)
            self.load_current[1] = random.uniform(self.load_limit_min[1] * self.current_limit / 100, self.load_limit_max[1] * self.current_limit / 100)
            self.load_current[2] = random.uniform(self.load_limit_min[2] * self.current_limit / 100, self.load_limit_max[2] * self.current_limit / 100)
            time.sleep(1)
    
    def to_json(self):
        data = {
            "total_power": round(sum(self.load_current[i] * self.voltage[i] for i in range(3)), 3),
            "current_limit": self.current_limit,
            "phase1": {
                "current": round(self.load_current[0], 3),
                "voltage": round(self.voltage[0], 1),
                "power": round(self.voltage[0] * self.load_current[0], 3),
                "load_limit_max": self.load_limit_max[0],
                "load_limit_min": self.load_limit_min[0],
            },
            "phase2": {
                "current": round(self.load_current[1], 3),
                "voltage": round(self.voltage[1], 1),
                "power": round(self.voltage[1] * self.load_current[1], 3),
                "load_limit_max": self.load_limit_max[1],
                "load_limit_min": self.load_limit_min[1],
            },
            "phase3": {
                "current": round(self.load_current[2], 3),
                "voltage": round(self.voltage[2], 1),
                "power": round(self.voltage[2] * self.load_current[2], 3),
                "load_limit_max": self.load_limit_max[2],
                "load_limit_min": self.load_limit_min[2],
            },
        }
        return json.dumps(data)
    
    def update_from_json(self, data):
        try:
            print(data)
            self.update_current_limit(data)
            self.update_phase(data, "phase1", 0)
            self.update_phase(data, "phase2", 1)
            self.update_phase(data, "phase3", 2)
        except Exception as e:
            print(e)
            return False
        return True

    def update_current_limit(self, data):
        if "current_limit" in data:
            self.current_limit = data["current_limit"]

    def update_phase(self, data, phase_key, index):
        if phase_key in data:
            phase_data = data[phase_key]
            if "load_limit_max" in phase_data:
                self.load_limit_max[index] = phase_data["load_limit_max"]
            if "load_limit_min" in phase_data:
                self.load_limit_min[index] = phase_data["load_limit_min"]
            if "voltage" in phase_data:
                self.voltage[index] = phase_data["voltage"]