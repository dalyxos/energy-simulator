// solarPanel.js
import React, { useEffect, useState } from 'react';
import { Card, Flex, Switch } from 'antd';


const SolarPanel = () => {
  const [solarPanelData, setsolarPanelData] = useState({
    latitude: 0,
    longitude: 0,
    temperature: 0,
    solar_power: 0,
    manual_mode: 0
  });

  useEffect(() => {
    fetch('/api/solar')
      .then(response => response.json())
      .then(data => setsolarPanelData(data))
      .catch(error => console.error('Error fetching power meter data:', error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/solar')
        .then(response => response.json())
        .then(data => setsolarPanelData(data))
        .catch(error => console.error('Error fetching power meter data:', error));
    }, 30000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleDoubleClick = (field) => {
    const newValue = prompt(`Enter new value for ${field}:`, solarPanelData[field]);
    if (newValue !== null) {
      setsolarPanelData(prevData => ({
        ...prevData,
        [field]: parseFloat(newValue)
      }));
      fetch('/api/solar', {
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

    <Card title="Solar Panel" bordered={false} style={{ marginTop: 16 }}>
    <Flex justify='center' align='center' style={{ gap: '16px' }}>
      <Card title="Location" style={{ width: 150, marginTop: 16 }}>{solarPanelData.latitude}, {solarPanelData.longitude}</Card>
      <Card title="Temperature" style={{ width: 150, marginTop: 16 }} onDoubleClick={() => handleDoubleClick('temperature')}>{solarPanelData.temperature} °C</Card>
      <Card title="Power" style={{ width: 150, marginTop: 16 }} onDoubleClick={() => handleDoubleClick('solar_power')}>{solarPanelData.solar_power} W</Card>
      <Card title="Manual Mode" style={{ width: 200, marginTop: 16 }}>
        <Switch
          checked={solarPanelData.manual_mode === 1}
          onChange={(checked) => {
            const newManualMode = checked ? 1 : 0;
            setsolarPanelData(prevData => ({
              ...prevData,
              manual_mode: newManualMode
            }));
            fetch('/api/solar', {
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

export default SolarPanel;