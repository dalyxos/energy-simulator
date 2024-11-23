// SmartMeter.js
import React, { useEffect, useState } from 'react';
import { Card, Flex, Slider } from 'antd';


const SmartMeter = () => {
  const [powerMeterData, setPowerMeterData] = useState({
    current_limit: 0,
    current: 0,
    voltage: 0,
    power: 0,
    injected_power: 0,
    load_limit_max: 0,
    load_limit_min: 0
  });

  useEffect(() => {
    fetch('/api/powermeter')
      .then(response => response.json())
      .then(data => setPowerMeterData(data))
      .catch(error => console.error('Error fetching power meter data:', error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/powermeter')
        .then(response => response.json())
        .then(data => setPowerMeterData(data))
        .catch(error => console.error('Error fetching power meter data:', error));
    }, 1000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleDoubleClick = (field) => {
    const newValue = prompt(`Enter new value for ${field}:`, powerMeterData[field]);
    if (newValue !== null) {
      setPowerMeterData(prevData => ({
        ...prevData,
        [field]: parseFloat(newValue)
      }));
      fetch('/api/powermeter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: parseFloat(newValue) })
      })
      .then(response => response.json())
      .then(data => console.log('Successfully updated power meter data:', data))
      .catch(error => console.error('Error updating power meter data:', error));
    }
  };
  return (

    <Card title="Smart Meter" bordered={false} style={{ marginTop: 16 }}>
    <Flex justify='center' align='center' style={{ gap: '16px' }}>
      <Card title="Phase X1" style={{ width: 150 }}>TODO</Card>
      <Card title="Voltage" style={{ width: 150, marginTop: 16 }}>{powerMeterData.voltage} V</Card>
      <Card title="Current Limit" style={{ width: 150, marginTop: 16 }} onDoubleClick={() => handleDoubleClick('current_limit')}>{powerMeterData.current_limit} A</Card>
      <Card title="Current" style={{ width: 150, marginTop: 16 }}>{powerMeterData.current} A</Card>
      <Card title="Power" style={{ width: 150, marginTop: 16 }}>{powerMeterData.power} W</Card>
      <Card title="Injected Power" style={{ width: 150, marginTop: 16 }} onDoubleClick={() => handleDoubleClick('injected_power')}>{powerMeterData.injected_power} W</Card>
      <br />
      <Card title="Load Limit" style={{ width: 300, marginTop: 16 }}>
        {powerMeterData.load_limit_min} % - {powerMeterData.load_limit_max} %
        <Slider
          range
          min={0}
          max={100}
          value={[powerMeterData.load_limit_min, powerMeterData.load_limit_max]}
          onChange={(values) => {
            const [min, max] = values;
            setPowerMeterData(prevData => ({
              ...prevData,
              load_limit_min: min,
              load_limit_max: max
            }));
            fetch('/api/powermeter', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ load_limit_min: min, load_limit_max: max })
            })
            .then(response => response.json())
            .then(data => console.log('Successfully updated load limits:', data))
            .catch(error => console.error('Error updating load limits:', error));
          }}
        />
      </Card>
    </Flex>
  </Card>
  );
};

export default SmartMeter;