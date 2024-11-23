import threading
import socket
import time
import json
import random


# Set logging level to WARNING to suppress DEBUG logs

class PowerMeter:
    def __init__(self, current_limit=30, power_meter_cfg=None):
        print("PowerMeter init")
        self.current_limit = current_limit
        self.load_limit_max = 10
        self.load_limit_min = 0
        self.load_current = 0
        self.inverter_power = 0
        self.current = self.load_current
        self.injected_power = 1000
        if power_meter_cfg:
            self.voltage = power_meter_cfg['voltage']
            self.port = power_meter_cfg['port']
        else:
            self.voltage = 230
            self.port = 8765
        
        self.broadcast_thread = threading.Thread(target=self.start_tcp_server)
        self.broadcast_thread.daemon = False
        self.broadcast_thread.start()

        self.update_load_current_thread = threading.Thread(target=self.update_current_randomly)
        self.update_load_current_thread.daemon = True
        self.update_load_current_thread.start()

        self.modbus_rtu_task = threading.Thread(target=self.start_rtu_server)
        self.modbus_rtu_task.daemon = False
        self.modbus_rtu_task.start()
        
    def update_inv_power(self, power):
        self.inverter_power = power

    def update_current_randomly(self):
        while True:
            self.load_current = random.uniform(self.load_limit_min * self.current_limit / 100, self.load_limit_max * self.current_limit / 100)
            self.current = self.load_current - self.inverter_power / self.voltage
            time.sleep(1)

    def get_current(self):
        return self.current

    def get_voltage(self):
        return self.voltage

    def get_power(self):
        return self.current * self.voltage

    def get_load(self):
        return self.load_current * self.voltage

    def set_current(self, current):
        self.current = current

    def set_voltage(self, voltage):
        self.voltage = voltage
        
    def to_json(self):
        data = {
            "load_limit_max": self.load_limit_max,
            "load_limit_min": self.load_limit_min,
            "current_limit": self.current_limit,
            "current": round(self.current, 3),
            "voltage": round(self.voltage, 1),
            "power": round(self.get_power(), 3) if self.get_power() > 0 else 0,
            "injected_power": -round(self.get_power(), 3) if self.get_power() < 0 else 0,
        }
        return json.dumps(data)

    def update_from_json(self, data):
        try:
            if "current_limit" in data:
                self.current_limit = data["current_limit"]
            if "voltage" in data:
                self.voltage = data["voltage"]
            if "load_limit_max" in data:
                self.load_limit_max = data["load_limit_max"]
            if "load_limit_min" in data:
                self.load_limit_min = data["load_limit_min"]
            if "injected_power" in data:
                self.injected_power = data["injected_power"]
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")

    def get_p1_data(self):
        data = [f"/FLU5\\253769484_A\r\n",
        "\r\n",
        "0-0:96.1.4(50217)\r\n",
        "0-0:96.1.1(3153414733313035303131373235)\r\n",
        "0-0:1.0.0(241119162126W)\r\n",
        "1-0:1.8.1(046077.141*kWh)\r\n",
        "1-0:1.8.2(031169.657*kWh)\r\n",
        "1-0:2.8.1(004279.578*kWh)\r\n",
        "1-0:2.8.2(007760.698*kWh)\r\n",
        "0-0:96.14.0(0001)\r\n",
        "1-0:1.4.0(04.065*kW)\r\n",
        "1-0:1.6.0(241115084500W)(25.891*kW)\r\n",
        "0-0:98.1.0(13)(1-0:1.6.0)(1-0:1.6.0)(231101000000W)(231026084500S)(12.195*kW)(231201000000W)(231114161500W)(17.457*kW)(240101000000W)(231220114500W)(17.440*kW)(240201000000W)(240108090000W)(17.632*kW)(240301000000W)(240207091500W)(14.301*kW)(240401000000S)(240329090000W)(13.429*kW)(240501000000S)(240411084500S)(13.080*kW)(240601000000S)(240522091500S)(16.789*kW)(240701000000S)(240619091500S)(16.074*kW)(240801000000S)(240701124500S)(15.127*kW)(240901000000S)(240813090000S)(13.067*kW)(241001000000S)(240917094500S)(20.304*kW)(241101000000W)(241029133000W)(17.198*kW)\r\n",
        "1-0:1.7.0(09.258*kW)\r\n",
        "1-0:2.7.0(00.000*kW)\r\n",
        "1-0:21.7.0(02.399*kW)\r\n",
        "1-0:41.7.0(03.181*kW)\r\n",
        "1-0:61.7.0(03.677*kW)\r\n",
        "1-0:22.7.0(00.000*kW)\r\n",
        "1-0:42.7.0(00.000*kW)\r\n",
        "1-0:62.7.0(00.000*kW)\r\n",
        "1-0:32.7.0(234.3*V)\r\n",
        "1-0:52.7.0(233.0*V)\r\n",
        "1-0:72.7.0(233.4*V)\r\n",
        "1-0:31.7.0(011.12*A)\r\n",
        "1-0:51.7.0(015.67*A)\r\n",
        "1-0:71.7.0(017.98*A)\r\n",
        "0-0:96.3.10(1)\r\n",
        "0-0:17.0.0(999.9*kW)\r\n",
        "1-0:31.4.0(999*A)\r\n",
        "0-0:96.13.0()\r\n",
        "!32DF\r\n\xFF"]
        return data

    def get_p1_data_1(self):
        is_winter_time = time.localtime().tm_mon in [1, 2, 3, 10, 11, 12]
        power = 0
        injected_power = 0
        if self.get_power() > 0:
            power = self.get_power()
        else:
            injected_power = -self.get_power()
            
        time_suffix = 'W' if is_winter_time else 'S'
        data = [f"/FLU5\\253967035_D\r\n",
                "0-0:96.1.4(50221)\r\n",
                "1-0:94.32.1(400)\r\n",
                "0-0:96.1.1(3153414733323030303135363939)\r\n",
                "0-0:96.1.2()\r\n",
                f"0-0:1.0.0({time.strftime('%y%m%d%H%M%S')}{time_suffix})\r\n",
                "1-0:1.8.1(001870.825*kWh)\r\n",
                "1-0:1.8.2(003603.478*kWh)\r\n",
                "1-0:2.8.1(002898.216*kWh)\r\n",
                "1-0:2.8.2(001235.763*kWh)\r\n",
                "0-0:96.14.0(0001)\r\n",
                "1-0:1.4.0(01.880*kW)\r\n",
                "1-0:1.6.0(241010204500S)(07.416*kW)\r\n",
                "0-0:98.1.0(10)(1-0:1.6.0)(1-0:1.6.0)(230901000000S)(230801000000S)(00.000*kW)(240201000000W)(240122083000W)(04.198*kW)(240301000000W)(240223110000W)(04.147*kW)(240401000000S)(240329190000W)(06.511*kW)(240501000000S)(240422063000S)(06.341*kW)(240601000000S)(240503091500S)(04.379*kW)(240701000000S)(240611231500S)(04.524*kW)(240801000000S)(240724220000S)(05.871*kW)(240901000000S)(240811060000S)(06.227*kW)(241001000000S)(240925191500S)(07.529*kW)\r\n",
                f"1-0:1.7.0({(power / 1000):06.3f}*kW)\r\n", # Power in kW
                f"1-0:2.7.0({(injected_power / 1000):06.3f}*kW)\r\n", # Injected Power in kW
                "1-0:21.7.0(00.310*kW)\r\n",
                "1-0:41.7.0(00.584*kW)\r\n",
                "1-0:61.7.0(00.094*kW)\r\n",
                "1-0:22.7.0(00.000*kW)\r\n",
                "1-0:42.7.0(00.000*kW)\r\n",
                "1-0:62.7.0(00.000*kW)\r\n",
                f"1-0:32.7.0({self.voltage:06.1f}*V)\r\n",
                f"1-0:52.7.0({self.voltage:06.1f}*V)\r\n",
                f"1-0:72.7.0({self.voltage:06.1f}*V)\r\n",
                f"1-0:31.7.0({self.current:06.2f}*A)\r\n",
                f"1-0:51.7.0({self.current:06.2f}*A)\r\n",
                f"1-0:71.7.0({self.current:06.2f}*A)\r\n",
                "0-0:96.3.10(1)\r\n",
                "0-0:17.0.0(99.999*kW)\r\n",
                "1-0:31.4.0(999.99*A)\r\n",
                "0-1:96.3.10(0)\r\n",
                "0-2:96.3.10(0)\r\n",
                "0-3:96.3.10(0)\r\n",
                "0-4:96.3.10(0)\r\n",
                "0-0:96.13.0()\r\n",
                "0-1:24.1.0(003)\r\n",
                "0-1:96.1.1(3753414733373030303031373739)\r\n",
                "0-1:96.1.2(000000000000000000)\r\n",
                "0-1:24.4.0(1)\r\n",
                "0-1:24.2.3(241018091251S)(00465.041*m3)\r\n",
                "0-2:24.1.0(007)\r\n",
                "0-2:96.1.1(3853455430303030323135353431)\r\n",
                "0-2:96.1.2(000000000000000000)\r\n",
                "0-2:24.2.1(241018091335S)(00044.988*m3)\r\n!"
        ]
        crc16 = 0
        for line in data:
            for char in line:
                crc16 ^= ord(char)
                for _ in range(8):
                    if crc16 & 1:
                        crc16 = (crc16 >> 1) ^ 0xA001
                    else:
                        crc16 >>= 1
        data.append(f"{crc16:04X}\r\n")
        data.append("\255")
        return data

    
    def start_tcp_server(self):
        try:
            print("Starting TCP server")
            server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server_socket.bind(("0.0.0.0", 8765))
            server_socket.listen(1)
            print("TCP server listening on port 8765")

            while True:
                client_socket, client_address = server_socket.accept()
                print(f"Accepted connection from {client_address}")
                try:
                    while True:
                        for text in self.get_p1_data_1():
                            client_socket.sendall(text.encode('latin-1'))
                            time.sleep(0.01)
                        time.sleep(1)  # Send data every second
                except (ConnectionResetError, BrokenPipeError):
                    print(f"Connection with {client_address} lost")
                finally:
                    client_socket.close()
        except Exception as e:
            print(f"Error starting TCP server: {e}")

    def start_rtu_server(self):
        try:
            server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server_socket.bind(("0.0.0.0", 8764))
            server_socket.listen(1)
            print("TCP server listening on port 8764")

            while True:
                client_socket, client_address = server_socket.accept()
                print(f"Accepted connection from {client_address}")
                try:
                    while True:
                        p1_data = "test".encode('utf-8')
                        client_socket.sendall(p1_data)
                        time.sleep(10)  # Send data every second
                except (ConnectionResetError, BrokenPipeError):
                    print(f"Connection with {client_address} lost")
                finally:
                    client_socket.close()
        except Exception as e:
            print(f"Error in RTU server: {e}")