
class VehicleBattery:
    def __init__(self, max_capacity=100, current_capacity=100):
        self.max_capacity = max_capacity
        self.current_capacity = current_capacity

    def to_json(self):
        return json.dumps({
            'max_capacity': self.max_capacity,
            'current_capacity': self.current_capacity
        })
    
    def update_from_json(self, data):
        if 'max_capacity' in data:
            self.max_capacity = data['max_capacity']
        if 'current_capacity' in data:
            self.current_capacity = data['current_capacity']

class ChargingStation:
    def __init__(self):
        self.max_num_charging_points = 2

    def to_json(self):
        return json.dumps({
            'charging': self.station_id,
            'location': self.location,
            'capacity': self.capacity,
            'current_load': self.current_load
        })
    
    def update_from_json(self, data):
        if 'station_id' in data:
            self.station_id = data['station_id']
        if 'location' in data:
            self.location = data['location']
        if 'capacity' in data:
            self.capacity = data['capacity']
        if 'current_load' in data:
            self.current_load = data['current_load']