import random

class Load:
    def __init__(self, current_limit=[[0, 2], [0, 0], [0, 0]]):
        self.current_limit = current_limit
        self.current = [0, 0, 0]

    def generate_current(self):
        self.current = [random.uniform(self.current_limit[i][0], self.current_limit[i][1]) for i in range(3)]
        
    def to_json(self):
        return {
            "current": [round(value, 2) for value in self.current],
        }
        
    def config_to_json(self):
        return {
            "current_limit": self.current_limit
        }
        
    def json_to_config(self, json):
        if "current_limit" in json:
            self.current_limit = json["current_limit"]
        return self.config_to_json()
