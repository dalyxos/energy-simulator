import React from 'react';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Slider from '@mui/material/Slider';

function valuetext(value) {
  return `${value} Amp`;
}

function LoadConfig() {
  const [loadConfig, setLoadConfig] = React.useState({
    current_limit: [[0, 0], [0, 0], [0, 0]]
  });
  
  React.useEffect(() => {
    fetch('/api/load/config')
      .then(response => response.json())
      .then(data => setLoadConfig(data))
      .catch(error => console.error('Error fetching Load config:', error));
  }, []);
  return (
    <Grid size={6} textAlign={'center'}>
    <strong>Load Config</strong><br /><br />
    <table style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>Phase</th>
          <th>Current Limit (A)</th>
        </tr>
      </thead>
      <tbody>
        {loadConfig.current_limit.map((current_limit, index) => (
          <tr key={index}>
            <td>L{index + 1}</td>
            <td>
              <Slider
                getAriaLabel={() => 'Current limit range'}
                value={current_limit}
                valueLabelDisplay="auto"
                onChange={(event, newValue) => {
                  loadConfig.current_limit[index] = newValue;
                  setLoadConfig({ ...loadConfig });
                  fetch('/api/load/config', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      current_limit: loadConfig.current_limit
                    })
                  })
                    .then(response => response.json())
                    .catch(error => console.error('Error updating Load config:', error));
                }}
                getAriaValueText={valuetext}
              />
            </td>
            <td>{current_limit[0]} - {current_limit[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Grid>);
}

function SmConfig() {

  const [smartmeterConfig, setSmartmeterConfig] = React.useState({
    voltage_limit: [0, 0],
    breaker_current: 0
  });
  
  React.useEffect(() => {
    fetch('/api/sm/config')
      .then(response => response.json())
      .then(data => setSmartmeterConfig(data))
      .catch(error => console.error('Error fetching Smartmeter config:', error));
  }, []);

  return (          <Grid size={6} textAlign={'center'}>
    <strong>Smartmeter</strong>
    <table style={{ width: '100%' }}>
      <thead>
        <tr>
          <th> </th>
          <th>Limits</th>
          <th> </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Voltage limit</td>
          <td>
            <Slider
              getAriaLabel={() => 'Voltage limit range'}
              value={smartmeterConfig.voltage_limit}
              valueLabelDisplay="auto"
              onChange={(event, newValue) => {
                setSmartmeterConfig({ smartmeterConfig, voltage_limit: newValue });
                fetch('/api/sm/config', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    voltage_limit: newValue
                  })
                })
                  .then(response => response.json())
                  .catch(error => console.error('Error updating Smartmeter config:', error));
              }}
              getAriaValueText={valuetext}
              max={300}
              min={150}
            />
          </td>
          <td>{smartmeterConfig.voltage_limit[0]} - {smartmeterConfig.voltage_limit[1]} </td>
        </tr>
        <tr>
          <td>Breaker limit</td>
          <td>
            <Slider
              getAriaLabel={() => 'Breaker limit range'}
              value={smartmeterConfig.breaker_current}
              valueLabelDisplay="auto"
              onChange={(event, newValue) => {
                setSmartmeterConfig({ ...smartmeterConfig, breaker_current: newValue });
                fetch('/api/sm/config', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    breaker_current: newValue
                  })
                })
                  .then(response => response.json())
                  .catch(error => console.error('Error updating Smartmeter config:', error));
              }}
              getAriaValueText={valuetext}
            />
          </td>
          <td>{smartmeterConfig.breaker_current}</td>
        </tr>
      </tbody>
    </table>
  </Grid>);
}

function SmartmeterConfig({ value }) {

  return (
    <TabPanel value={value}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid size={12} textAlign={'center'}>Smartmeter Config</Grid>
          <SmConfig />
          <LoadConfig />
        </Grid>
      </Box>

    </TabPanel>
  );
}

export default SmartmeterConfig;