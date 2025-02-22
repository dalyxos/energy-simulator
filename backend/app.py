from urllib import request
from flask import Flask
from smartmeter import SmartMeter
from load import Load

class EnergySimulator:
    def __init__(self):
        self.load = Load()
        self.smart_meter = SmartMeter(10, callback=self.callback)
        self.smart_meter.start_callback_thread()

    def callback(self):
        self.load.generate_current()
        self.smart_meter.current = self.load.current
        

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
        "smartmeter": sim.smart_meter.to_json()
    }

@app.route('/api/load/config')
def load_config():
    return sim.load.config_to_json()

@app.route('/api/load/config', methods=['POST'])
def set_load_config():
    return sim.load.json_to_config(request.json)
