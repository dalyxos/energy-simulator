import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

import PropTypes from 'prop-types';

PhaseLoad.propTypes = {
  phase: PropTypes.number.isRequired,
};

function PhaseLoad({phase}) {
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

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/load/phase/${phase}`)
        .then(response => response.json())
        .then(data => setLoadData(data))
        .catch(error => console.error('Error fetching load data:', error));
    }, 3000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [phase]);

  return (
    <Stack sx={{ justifyContent: 'space-between' }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', gap: 1 }}
      >
        <Typography component="h2" variant="subtitle2" sx={{width: 70}}>Phase {phase}</Typography>
        <Stack
          direction="row"
          sx={{ gap: 1 }}
        >
          <Chip label={`${loadData.voltage} V`} color="default" sx={{width: 70}} />
          <Chip label={`${loadData.current} A`} color="error" sx={{width: 70}} />
          <Chip label={`${loadData.power} W`} color="success" sx={{width: 100}} />
        </Stack>
        <Slider
          value={[loadData.load_limit_min, loadData.load_limit_max]}
          onChange={(event, newValue) => {
            setLoadData(prevData => ({
              ...prevData,
              load_limit_min: newValue[0],
              load_limit_max: newValue[1]
            }));
            fetch(`/api/load/phase/${phase}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                load_limit_min: newValue[0],
                load_limit_max: newValue[1]
              })
            })
            .then(response => response.json())
            .then(data => console.log('Successfully updated load limits:', data))
            .catch(error => console.error('Error updating load limits:', error));
          }}
          valueLabelDisplay="auto"
          getAriaValueText={(value) => `${value}%`}
          sx={{ width: 250 }}
        />
      </Stack>
    </Stack>
  );
};

export default function LoadCard() {

  return (
    <Card variant="outlined" size={{ xs: 8, sm: 6, lg: 7 }}>
      <CardContent>
        <Typography component="h2" variant="h6" gutterBottom>
          Load
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
        >
          <PhaseLoad phase="1" />
          <PhaseLoad phase="2" />
          <PhaseLoad phase="3" />
        </Stack>
      </CardContent>
    </Card>
  );
}
