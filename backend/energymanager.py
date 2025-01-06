from load import Load
from inverter import SolarPanel

class EnergyManager:
    def __init__(self):
        self.load = Load()
        self.solar_panel = SolarPanel(51.04,3.76)