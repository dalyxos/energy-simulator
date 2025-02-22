from flask import Flask, request
from smartmeter import SmartMeter
from load import Load
from charging_station import ChargingStation

class EnergySimulator:
    def __init__(self):
        self.load = Load()
        self.smart_meter = SmartMeter(10, callback=self.callback)
        self.charging_stations = [ChargingStation() for _ in range(2)]
        self.smart_meter.start_callback_thread()

    def callback(self):
        self.load.generate_current()
        for station in self.charging_stations:
            station.update()
        total_current = self.load.current
        for i in range(3):
            phase_current = sum(station.current[i] for station in self.charging_stations)
            total_current[i] += phase_current
        self.smart_meter.current = total_current
        

sim = EnergySimulator()

app = Flask(__name__)

@app.route('/')
def home():
    return "Welcome to the Energy Simulator!"

@app.route('/api/version')
def version():
    return {"version": "0.1.0"}

@app.route('/api/overview')
def overview():
    return {
        "load": sim.load.to_json(),
        "breaker_current": sim.smart_meter.breaker_current,
        "smartmeter": sim.smart_meter.to_json(),
        "charging_stations": [station.to_json() for station in sim.charging_stations]
    }

@app.route('/api/load/config')
def load_config():
    return sim.load.config_to_json()

@app.route('/api/load/config', methods=['POST'])
def set_load_config():
    return sim.load.json_to_config(request.json)

@app.route('/api/cs/config/<int:index>')
def charging_station_config(index):
    return sim.charging_stations[index].config_to_json()

@app.route('/api/cs/config/<int:index>', methods=['POST'])
def set_charging_station_config(index):
    return sim.charging_stations[index].config_from_json(request.json)