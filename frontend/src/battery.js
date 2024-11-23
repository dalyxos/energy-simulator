// battery.js
import React, { useEffect, useState } from 'react';
import { Card, Flex, Switch } from 'antd';


const Battery = () => {
  const [batteryData, setBatteryData] = useState({
    capacity: 0,
    voltage: 0,
    state_of_charge: 0,
    current: 0,
    power: 0,
    manual_mode: 0,
  });

  useEffect(() => {
    fetch('/api/battery')
      .then(response => response.json())
      .then(data => setBatteryData(data))
      .catch(error => console.error('Error fetching power meter data:', error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/battery')
        .then(response => response.json())
        .then(data => setBatteryData(data))
        .catch(error => console.error('Error fetching power meter data:', error));
    }, 1000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleDoubleClick = (field) => {
    const newValue = prompt(`Enter new value for ${field}:`, batteryData[field]);
    if (newValue !== null) {
      setBatteryData(prevData => ({
        ...prevData,
        [field]: parseFloat(newValue)
      }));
      fetch('/api/battery', {
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

    <Card title="Battery" bordered={false} style={{ marginTop: 16 }}>
    <Flex justify='center' align='center' style={{ gap: '16px' }}>
      <Card title="Capacity" style={{ width: 150, marginTop: 16 }}>{batteryData.capacity} Wh</Card>
      <Card title="Voltage" style={{ width: 150, marginTop: 16 }} onDoubleClick={() => handleDoubleClick('voltage')}>{batteryData.voltage} V</Card>
      <Card title="Current" style={{ width: 150, marginTop: 16 }} onDoubleClick={() => handleDoubleClick('current')}>{batteryData.current} A</Card>
      <Card title="Power" style={{ width: 150, marginTop: 16 }} onDoubleClick={() => handleDoubleClick('power')}>{batteryData.power} W</Card>
      <Card title="SoC" style={{ width: 150, marginTop: 16 }} onDoubleClick={() => handleDoubleClick('state_of_charge')}>{batteryData.state_of_charge} %</Card>
      <Card title="Manual Mode" style={{ width: 200, marginTop: 16 }}>
        <Switch
          checked={batteryData.manual_mode === 1}
          onChange={(checked) => {
            const newManualMode = checked ? 1 : 0;
            setBatteryData(prevData => ({
              ...prevData,
              manual_mode: newManualMode
            }));
            fetch('/api/battery', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ manual_mode: newManualMode })
            })
            .then(response => response.json())
            .then(data => console.log('Successfully updated manual mode:', data))
            .catch(error => console.error('Error updating manual mode:', error));
          }}
        />
      </Card>
    </Flex>
  </Card>
  );
};

export default Battery;