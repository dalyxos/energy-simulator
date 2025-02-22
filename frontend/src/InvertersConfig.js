import React from 'react';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

function InvertersConfig({ value }) {

  return (
    <TabPanel value={value}>
      
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid size={12} textAlign={'center'}>Inverters Config</Grid>
        </Grid>
      </Box>

    </TabPanel>
  );
}

export default InvertersConfig;