from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Welcome to the Energy Simulator!"

@app.route('/api/version')
def version():
    return {"version": "0.1.0"}
