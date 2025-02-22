import random

class Load:
    def __init__(self, current_min_limit=[0, 0, 0], current_max_limit=[10, 10, 10]):
        self.current_min_limit = current_min_limit
        self.current_max_limit = current_max_limit
        self.current = [0, 0, 0]

    def generate_current(self):
        self.current = [random.uniform(self.current_min_limit[i], self.current_max_limit[i]) for i in range(3)]
        
    def to_json(self):
        return {
            "current": [round(value, 2) for value in self.current],
        }
        
    def config_to_json(self):
        return {
            "current_min_limit": self.current_min_limit,
            "current_max_limit": self.current_max_limit
        }
        
    def json_to_config(self, json):
        if "current_min_limit" in json:
            self.current_min_limit = json["current_min_limit"]
        if "current_max_limit" in json:
            self.current_max_limit = json["current_max_limit"]
        return self.config_to_json()
