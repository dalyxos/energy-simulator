import * as React from 'react';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';

import SmartmeterConfig from './SmartmeterConfig';
import ChargingStationsConfig from './ChargingStationsConfig';
import InvertersConfig from './InvertersConfig';

export default function Settings() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <TabContext value={value}>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <TabList onChange={handleChange} aria-label="lab API tabs example">
        <Tab label="Smartmeter" value="1" />
        <Tab label="Charging Stations" value="2" />
        <Tab label="Inverters" value="3" />
      </TabList>
    </Box>
    <SmartmeterConfig value="1" />
    <ChargingStationsConfig value="2" />
    <InvertersConfig value="3" />
  </TabContext>
  );
}