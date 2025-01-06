import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LoadCard from './LoadCard';
import SolarPanelCard from './SolarPanelCard';

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h1" variant="h6" sx={{ mb: 2 }}>
        Energy Simulator
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
          <LoadCard />
          <SolarPanelCard />
      </Grid>
    </Box>
  );
}
