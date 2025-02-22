import threading
import time
import random
        
class SmartMeter:
    def __init__(self, breaker_current, voltage_limit=[225, 235], callback=None):
        self.breaker_current = breaker_current
        self.current = [0, 0, 0]
        self.voltage_limit = voltage_limit
        self.voltage = [0, 0, 0]
        self.callback = callback
        
    def generate_voltage(self):
        self.voltage = [random.uniform(self.voltage_limit[0], self.voltage_limit[1]) for i in range(3)]

    # Start the thread
    def start_callback_thread(self):
        thread = threading.Thread(target=self.callback_thread)
        thread.daemon = True
        thread.start()

    def callback_thread(self):
        while True:
            self.generate_voltage()
            if self.callback:
                self.callback()
            time.sleep(1)

    def config_to_json(self):
        return {
            "breaker_current": self.breaker_current,
            "voltage_limit": self.voltage_limit
        }
    
    def config_from_json(self, json):
        if("voltage_limit" in json):
            self.voltage_limit = json["voltage_limit"]
        if("breaker_current" in json):
            self.breaker_current = json["breaker_current"]
    
    def to_json(self):
        return {
            "voltage": [round(value, 2) for value in self.voltage],
            "current": [round(value, 2) for value in self.current],
            "power": [round(self.current[i] * self.voltage[i] / 1000, 2) for i in range(3)],
            "tot_power": round(sum([self.current[i] * self.voltage[i] / 1000 for i in range(3)], 2))
        }
