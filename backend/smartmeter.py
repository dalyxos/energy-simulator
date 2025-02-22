import threading
import time
        
class SmartMeter:
    def __init__(self, breaker_current, callback=None):
        self.breaker_current = breaker_current
        self.callback = callback
        self.start_callback_thread()

    # Start the thread
    def start_callback_thread(self):
        thread = threading.Thread(target=self.callback_thread)
        thread.daemon = True
        thread.start()

    def callback_thread(self):
        while True:
            if self.callback:
                self.callback()
            time.sleep(1)
