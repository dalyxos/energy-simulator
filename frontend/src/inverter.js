// inverter.js
import React, { useEffect, useState } from 'react';
import { Card, Flex, Switch, Select } from 'antd';


const Inverter = () => {
  const [inverterData, setInverterData] = useState({
    solar_use_mode: 0,
    battery_use_mode: 0,
    power: 0,
    manual_mode: 0,
  });

  useEffect(() => {
    fetch('/api/inverter')
      .then(response => response.json())
      .then(data => setInverterData(data))
      .catch(error => console.error('Error fetching power meter data:', error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/inverter')
        .then(response => response.json())
        .then(data => setInverterData(data))
        .catch(error => console.error('Error fetching power meter data:', error));
    }, 1000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleDoubleClick = (field) => {
    const newValue = prompt(`Enter new value for ${field}:`, inverterData[field]);
    if (newValue !== null) {
      setInverterData(prevData => ({
        ...prevData,
        [field]: parseFloat(newValue)
      }));
      fetch('/api/inverter', {
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

    <Card title="Inverter" bordered={false} style={{ marginTop: 16 }}>
    <Flex justify='center' align='center' style={{ gap: '16px' }}>
      <Card title="Power" style={{ width: 150, marginTop: 16 }}>{inverterData.power} W</Card>
      <Card title="Solar Use Mode" style={{ width: 200, marginTop: 16 }}>
        <Select
          value={inverterData.solar_use_mode}
          onChange={(value) => {
            setInverterData(prevData => ({
              ...prevData,
              solar_use_mode: value
            }));
            fetch('/api/inverter', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ solar_use_mode: value })
            })
            .then(response => response.json())
            .then(data => console.log('Successfully updated solar use mode:', data))
            .catch(error => console.error('Error updating solar use mode:', error));
          }}
        >
          <Select.Option value={"SelfUse"}>Self Use</Select.Option>
          <Select.Option value={"Backup"}>Backup</Select.Option>
          <Select.Option value={"Manual"}>Manual</Select.Option>
        </Select>
      </Card>
      {inverterData.solar_use_mode === "Manual" && (
      <Card title="Battery Use Mode" style={{ width: 200, marginTop: 16 }}>
        <Select
          value={inverterData.battery_use_mode}
          onChange={(value) => {
            setInverterData(prevData => ({
              ...prevData,
              battery_use_mode: value
            }));
            fetch('/api/inverter', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ battery_use_mode: value })
            })
            .then(response => response.json())
            .then(data => console.log('Successfully updated battery use mode:', data))
            .catch(error => console.error('Error updating battery use mode:', error));
          }}
        >
          <Select.Option value={"Stop"}>Stop</Select.Option>
          <Select.Option value={"Charge"}>Force charge</Select.Option>
          <Select.Option value={"Discharge"}>Force discharge</Select.Option>
        </Select>
      </Card>
      )}
      <Card title="Manual Mode" style={{ width: 200, marginTop: 16 }}>
        <Switch
          checked={inverterData.manual_mode === 1}
          onChange={(checked) => {
            const newManualMode = checked ? 1 : 0;
            setInverterData(prevData => ({
              ...prevData,
              manual_mode: newManualMode
            }));
            fetch('/api/inverter', {
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

export default Inverter;