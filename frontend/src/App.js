import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';

import Header from './Header';
import Smartmeter from './Smartmeter';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#cee',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

function BasicGrid() {

  const [overviewData, setOverviewData] = React.useState({
    load: {
      current: [0, 0, 0]
    },
    smartmeter:
    {
      voltage: [0, 0, 0],
      current: [0, 0, 0],
      power: [0, 0, 0],
      tot_power: 0
    }
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/overview')
        .then(response => response.json())
        .then(data => {
          setOverviewData(data);
          console.log('Overview data:', data);
        })
        .catch(error => console.error('Error fetching overview data:', error));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Header />
        </Grid>
        <Grid size={3}>
          <Smartmeter load={overviewData.load} smartmeter={overviewData.smartmeter} />
        </Grid>
        <Grid size={3}>
          <Item>Charging Stations</Item>
        </Grid>
        <Grid size={3}>
          <Item>Inverters</Item>
        </Grid>
        <Grid size={3}>
          <Item>Heat Pump</Item>
        </Grid>
        <Grid size={12}>
          <Item>Settings / Config</Item>
        </Grid>
      </Grid>
    </Box>
  );
}

function App() {
  return (
    <BasicGrid />
  );
}

export default App;
