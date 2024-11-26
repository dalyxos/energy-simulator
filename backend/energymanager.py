from smartmeter import PowerMeter
from load import Load
from inverter import SolarPanel, Battery, Inverter

class EnergyManager:
    def __init__(self):
        self.load = Load()
        self.power_meter = PowerMeter()
        self.solar_panel = SolarPanel(latitude=52.52, longitude=13.41)
        self.battery = Battery(capacity=3000)
        self.inverter = Inverter(self.solar_panel, self.battery, self.power_meter)