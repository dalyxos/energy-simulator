import React from 'react';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Slider from '@mui/material/Slider';

function valuetext(value) {
  return `${value} Amp`;
}

function SmartmeterConfig({ value }) {

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
    <TabPanel value={value}>
      
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid size={12} textAlign={'center'}>Smartmeter Config</Grid>
          <Grid size={6} textAlign={'center'}>smartmeter</Grid>
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
                          if (newValue[0] <= newValue[1]) {
                            setLoadConfig({
                              current_limit: loadConfig.current_limit.map((limit, i) => i === index ? newValue : limit)
                            });
                            fetch('/api/load/config', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                current_limit: loadConfig.current_limit
                              })
                            });
                          }
                        }}
                        getAriaValueText={valuetext}
                      />
                    </td>
                    <td>{current_limit[0]} - {current_limit[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Grid>
        </Grid>
      </Box>

    </TabPanel>
  );
}

export default SmartmeterConfig;