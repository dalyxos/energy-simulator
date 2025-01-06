from flask import Flask, request
from energymanager import EnergyManager

version = "0.1.0"

energyManager = EnergyManager()

app = Flask(__name__)

@app.route('/api')
def api_index():
    return {"version": version}

@app.route('/api/load', methods=['GET'])
def get_load():
    return energyManager.load.to_json()

@app.route('/api/load', methods=['POST'])
def set_load():
    energyManager.load.update_from_json(request.json)
    return {"status": "success"}

@app.route('/api/load/phase/<int:phase>', methods=['GET'])
def get_load_phase(phase):
    return energyManager.load.phase_to_json(phase-1)

@app.route('/api/load/phase/<int:phase>', methods=['POST'])
def set_load_phase(phase):
    data = request.json
    data2 = { "phase" + str(phase): data }
    energyManager.load.update_from_json(data2)
    return {"status": "success"}

@app.route('/api/solar', methods=['GET'])
def get_solar():
    return energyManager.solar_panel.to_json()