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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Item sx={{ backgroundColor: '#033', color: '#FFF' }}>{apiVersion ? `API Version: ${apiVersion}` : 'Loading...'}</Item>
        </Grid>
        <Grid size={3}>
          <Item>Load Info</Item>
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
