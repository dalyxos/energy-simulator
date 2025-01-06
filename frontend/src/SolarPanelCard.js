import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function SolarPanelCard() {
  const [solarPanelData, setSolarPanelData] = useState({
    latitude: 0,
    longitude: 0,
    temperature: 0,
    solar_power: 0
  });

  useEffect(() => {
    fetch('/api/solar')
      .then(response => response.json())
      .then(data => setSolarPanelData(data))
      .catch(error => console.error('Error fetching power meter data:', error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/solar')
        .then(response => response.json())
        .then(data => setSolarPanelData(data))
        .catch(error => console.error('Error fetching power meter data:', error));
    }, 30000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <Card variant="outlined" size={{ xs: 5, sm: 5, lg: 2 }}>
      <CardContent>
        <Typography component="h2" variant="h6" gutterBottom>
          Solar Panel
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
        >
          <Stack direction="row">
            <Typography component="h3" variant="subtitle2" sx={{ width: 100 }}>
              Location
            </Typography>
            <Chip label={`${solarPanelData.latitude}, ${solarPanelData.longitude}`} color="primary" sx={{width: 120}}/>
          </Stack>
          <Stack direction="row">
            <Typography component="h3" variant="subtitle2" sx={{ width: 100 }}>
              Temperature
            </Typography>
            <Chip label={`${solarPanelData.temperature} °C`} color="primary" sx={{width: 120}}/>
          </Stack>
          <Stack direction="row">
            <Typography component="h3" variant="subtitle2" sx={{ width: 100 }}>
              Solar Power
            </Typography>
            <Chip label={`${solarPanelData.solar_power} W`} color="primary" sx={{width: 120}}/>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
