import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function LoadCard({ phase }) {
  const [loadData, setLoadData] = useState({
    current: 0,
    voltage: 0,
    power: 0,
    load_limit_max: 0,
    load_limit_min: 0
  });

  useEffect(() => {
    fetch(`/api/load/phase/${phase}`)
      .then(response => response.json())
      .then(data => setLoadData(data))
      .catch(error => console.error('Error fetching load data:', error));
  }, [phase]);

  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Phase {phase}
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', flexGrow: 1, gap: 1 }}
        >
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography>Voltage:</Typography>
              <Chip label={`${loadData.voltage} V`} />
            </Stack>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography>Current:</Typography>
              <Chip label={`${loadData.current} A`} />
            </Stack>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography>Power:</Typography>
              <Chip label={`${loadData.power} W`} />
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}