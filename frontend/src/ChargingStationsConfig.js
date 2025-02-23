import React from 'react';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import { Select } from '@mui/material';
import { MenuItem } from '@mui/material';
import { FormControl } from '@mui/material';
import { InputLabel } from '@mui/material';

function ChargingStationConfig({index, chargingstation}) {
  return (
    <Grid size={6} textAlign={'center'}>
      <strong>Charging Station {index + 1}</strong><br /><br />
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th></th>
            <th>Config</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Max current</td>
            <td>
              <Slider
                getAriaLabel={() => 'Max current range'}
                value={chargingstation.max_current}
                valueLabelDisplay="auto"
                onChange={(event, newValue) => {
                  chargingstation.max_current = newValue
                  fetch(`/api/cs/config/${index}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(
                      {max_current: chargingstation.max_current}
                    )
                  })
                    .then(response => response.json())
                    .catch(error => console.error('Error updating Charging Station config:', error));
                }}
              />
            </td>
          </tr>
          <tr>
            <td>HEMS</td>
            <td>
              <Slider
                getAriaLabel={() => 'HEMS range'}
                value={chargingstation.hems}
                valueLabelDisplay="auto"
                onChange={(event, newValue) => {
                  chargingstation.hems = newValue
                  fetch(`/api/cs/config/${index}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({hems: chargingstation.hems})
                  })
                    .then(response => response.json())
                    .catch(error => console.error('Error updating Charging Station config:', error));
                }}
              />
            </td>
          </tr>
          <tr>
            <td>Phases</td>
            <td>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="demo-simple-select-helper-label">L1</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={chargingstation.phases[0]}
                  label="L1"
                  onChange={(event) => {
                    chargingstation.phases[0] = event.target.value;
                    fetch(`/api/cs/config/${index}`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        phases: chargingstation.phases
                      })
                    })
                      .then(response => response.json())
                      .then(data => chargingstation.phases = data.phases)
                      .catch(error => console.error('Error updating Charging Station config:', error));
                  }
                  } 
                >
                  <MenuItem value={0}>None</MenuItem>
                  <MenuItem value={1}>P1</MenuItem>
                  <MenuItem value={2}>P2</MenuItem>
                  <MenuItem value={3}>P3</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="demo-simple-select-helper-label">L2</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={chargingstation.phases[1]}
                  label="L2"
                  onChange={(event) => {
                    chargingstation.phases[1] = event.target.value;
                    fetch(`/api/cs/config/${index}`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({phases: chargingstation.phases})
                    })
                      .then(response => response.json())
                      .then(data => chargingstation.phases = data.phases)
                      .catch(error => console.error('Error updating Charging Station config:', error));
                  }
                  } 
                >
                  <MenuItem value={0}>None</MenuItem>
                  <MenuItem value={1}>P1</MenuItem>
                  <MenuItem value={2}>P2</MenuItem>
                  <MenuItem value={3}>P3</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="demo-simple-select-helper-label">L3</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={chargingstation.phases[2]}
                  label="L3"
                  onChange={(event) => {
                    chargingstation.phases[2] = event.target.value;
                    fetch(`/api/cs/config/${index}`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({phases: chargingstation.phases})
                    })
                      .then(response => response.json())
                      .then(data => chargingstation.phases = data.phases)
                      .catch(error => console.error('Error updating Charging Station config:', error));
                  }
                  } 
                >
                  <MenuItem value={0}>None</MenuItem>
                  <MenuItem value={1}>P1</MenuItem>
                  <MenuItem value={2}>P2</MenuItem>
                  <MenuItem value={3}>P3</MenuItem>
                </Select>
            </FormControl>
            </td>
            <td>{chargingstation.phases}</td>
          </tr>
          <tr>
            <td>Vehicle state</td>
            <td>
              <Switch
                checked={chargingstation.vehicle_connected}
                onChange={(event) => {
                  chargingstation.vehicle_connected = event.target.checked;
                    fetch(`/api/cs/config/${index}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({vehicle_connected: chargingstation.vehicle_connected} )
                    })
                    .then(response => response.json())
                    .catch(error => console.error('Error updating Charging Station config:', error));
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Grid>
  );
}

function ChargingStationsConfig({ value }) {
  const [chargingstations, setChargingstations] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/cs/config')
      .then(response => response.json())
      .then(data => setChargingstations(data))
      .catch(error => console.error('Error fetching Charging Stations config:', error));
  }
  , []);
  return (
    <TabPanel value={value}>
      
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid size={12} textAlign={'center'}>Charging Stations Config</Grid>
          {chargingstations.map((chargingstation, index) => (
            <ChargingStationConfig index={index} chargingstation={chargingstation} />
          ))}
        </Grid>
      </Box>

    </TabPanel>
  );
}

export default ChargingStationsConfig;