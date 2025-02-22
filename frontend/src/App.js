import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';

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

  const [apiVersion, setApiVersion] = React.useState('');

  React.useEffect(() => {
    fetch('/api/version')
      .then(response => response.json())
      .then(data => setApiVersion(data.version))
      .catch(error => console.error('Error fetching API version:', error));
  }, []);

  const [overviewData, setOverviewData] = React.useState({
    load: {
      current: [0, 0, 0]
    },
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
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Item sx={{ backgroundColor: '#033', color: '#FFF' }}>{apiVersion ? `API Version: ${apiVersion}` : 'Loading...'}</Item>
        </Grid>
        <Grid size={3}>
          <Item>
            Load Info
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{width: '28%'}}>Phase</th>
                  <th style={{width: '18%'}}>L1</th>
                  <th style={{width: '18%'}}>L2</th>
                  <th style={{width: '18%'}}>L3</th>
                  <th style={{width: '18%'}}>Max</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Current (A)</td>
                  {overviewData.load.current.map((current, index) => (
                    <td key={index}>{current}</td>
                  ))}
                  <td>{Math.max(...overviewData.load.current)}</td>
                </tr>
              </tbody>
            </table>
          </Item>
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
