import asyncio
import threading
from pymodbus.datastore import ModbusSlaveContext, ModbusSequentialDataBlock, ModbusServerContext
from pymodbus.server.async_io import StartAsyncTcpServer
from pymodbus.device import ModbusDeviceIdentification

#import logging
#logging.basicConfig(level=logging.DEBUG)

class Modbus:
    def __init__(self, port, parameters):
        self.port = port
        self.parameters = parameters
        max_hr_address = 250
        max_ir_address = 250
        max_fc6_address = 250
        max_fc16_address = 250
        #print(f'parameters: {parameters}')
        for item in parameters:
            #print(f'item: {item}')
            if item['function_code'] == 3 and item['address'] > max_hr_address:
                max_hr_address = item['address'] + 10
            elif item['function_code'] == 4 and item['address'] > max_ir_address:
                max_ir_address = item['address'] + 10
            elif item['function_code'] == 6 and item['address'] > max_fc6_address:
                max_fc6_address = item['address'] + 10
            elif item['function_code'] == 16 and item['address'] > max_fc16_address:
                max_fc16_address = item['address'] + 10

        print(f'max_hr_address: {max_hr_address}')
        print(f'max_ir_address: {max_ir_address}')
        print(f'max_fc6_address: {max_fc6_address}')
        
        store = ModbusSlaveContext(
            di=ModbusSequentialDataBlock(0, [0]*100),
            co=ModbusSequentialDataBlock(0, [0]*100),
            hr=ModbusSequentialDataBlock(0, [0]*max_hr_address),
            ir=ModbusSequentialDataBlock(0, [0]*max_ir_address))
        store.register(6, 'fc6', ModbusSequentialDataBlock(0, [0]*max_fc6_address))  # Data block for function code 6
        store.register(16, 'fc16', ModbusSequentialDataBlock(0, [0]*max_fc16_address))  # Data block for function code 6

        self.context = ModbusServerContext(slaves=store, single=True)

        async def run_server():
            await StartAsyncTcpServer(
                context=self.context,
                identity=self.get_identity,
                address=("0.0.0.0", port)
            )

        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.loop.create_task(run_server())
        self.server_thread = threading.Thread(target=self.loop.run_forever)
        self.server_thread.daemon = True
        self.server_thread.start()

    def stop_modbus_server(self):
        self.loop.call_soon_threadsafe(self.loop.stop)
        self.server_thread.join()
        return True
    
    def get_identity(self):
        identity = ModbusDeviceIdentification()
        identity.VendorName = 'pymodbus'
        identity.ProductCode = 'PM'
        identity.VendorUrl = 'http://github.com/riptideio/pymodbus/'
        identity.ProductName = 'pymodbus Server'
        identity.ModelName = 'pymodbus Server'
        identity.MajorMinorRevision = '1.0'
        return identity

    def find_parameter_by_name(self, name):
        for param in self.parameters:
            if param['name'] == name:
                return param
        return None

    def get_modbus_server_parameter_value(self, name):
        param = self.find_parameter_by_name(name)
        if param:
            fc, address = param['function_code'], param['address']
            count = determine_count(param)
            values = self.context[0].getValues(fc, address, count=count)
            return parse_values(param, values)
        return None

    def set_modbus_server_parameter_value(self, name, value):
        if isinstance(value, float):
            value = int(value)
        param = self.find_parameter_by_name(name)
        if param:
            if value >= 0:
                values = [value]
            else:
                values = [0xFFFF + value + 1]
            set_default_values(self.context[0], [param])
            self.context[0].setValues(param['function_code'], param['address'], values)
            return True
        return False

def determine_count(param):
    if param['type'] == 'string':
        return param['size']
    elif param['type'] in ['u64', 'i64']:
        return 4
    elif param['type'] in ['u32', 'i32', 'float']:
        return 2
    return 1

def set_default_values(store, parameters):
    for param in parameters:
        fc = param['function_code']
        address = param['address']
        default = param['default']
        if '16' in param:
            store.setValues(fc, address, [default])
        elif '32' in param['type']:
            store.setValues(fc, address, [default & 0xFFFF, (default >> 16) & 0xFFFF])
        elif param['type'] == 'u64':
            store.setValues(fc, address, [default & 0xFFFF, (default >> 16) & 0xFFFF, (default >> 32) & 0xFFFF, (default >> 48) & 0xFFFF])
        elif param['type'] == 'float':
            import struct
            packed = struct.pack('>f', default)
            unpacked = struct.unpack('>HH', packed)
            store.setValues(fc, address, list(unpacked))
        elif param['type'] == 'string':
            values = [ord(c) for c in default.ljust(param['size'], '\x00')]
            store.setValues(fc, address, values)