import React from 'react';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

function ChargingStationConfig({index, chargingstation}) {
  return (
    <Grid size={6} textAlign={'center'}>
      <strong>Charging Station {index + 1}</strong><br /><br />
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