// load.js
import React, { useEffect, useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';


const Phase = ({ phase }) => {
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

  const handleDoubleClick = (field) => {
    const fieldParts = field.split('.');
    const newValue = prompt(`Enter new value for ${field}:`, fieldParts.length === 2 ? loadData[fieldParts[0]][fieldParts[1]] : loadData[field]);
    if (newValue !== null) {
      setLoadData(prevData => {
        if (fieldParts.length === 2) {
          return {
            ...prevData,
            [fieldParts[0]]: {
              ...prevData[fieldParts[0]],
              [fieldParts[1]]: parseFloat(newValue)
            }
          };
        } else {
          return {
            ...prevData,
            [field]: parseFloat(newValue)
          };
        }
      });
      fetch(`/api/load/phase/${phase}` , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: parseFloat(newValue) })
      })
      .then(response => response.json())
      .then(data => console.log('Successfully updated load data:', data))
      .catch(error => console.error('Error updating load data:', error));
    }
  };
  return (
    <TableRow
      key={phase}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
      >
      <TableCell component="th" scope="row">{phase}</TableCell>
      <TableCell style={{ cursor: 'pointer', textDecoration: 'underline' }} onDoubleClick={() => handleDoubleClick('voltage')}>{loadData.voltage}</TableCell>
      <TableCell>{loadData.current}</TableCell>
      <TableCell>{loadData.power }</TableCell>
      <TableCell>
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
            />
      </TableCell>
    </TableRow>
  );
};

const Load = () => {
  const [loadData, setLoadData] = useState({
    total_power: 0,
    current_limit: 0
  });

  useEffect(() => {
    fetch('/api/load')
      .then(response => response.json())
      .then(data => setLoadData(data))
      .catch(error => console.error('Error fetching load data:', error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/load')
        .then(response => response.json())
        .then(data => setLoadData(data))
        .catch(error => console.error('Error fetching load data:', error));
    }, 3000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleDoubleClick = (field) => {
    const fieldParts = field.split('.');
    const newValue = prompt(`Enter new value for ${field}:`, fieldParts.length === 2 ? loadData[fieldParts[0]][fieldParts[1]] : loadData[field]);
    if (newValue !== null) {
      setLoadData(prevData => {
        if (fieldParts.length === 2) {
          return {
            ...prevData,
            [fieldParts[0]]: {
              ...prevData[fieldParts[0]],
              [fieldParts[1]]: parseFloat(newValue)
            }
          };
        } else {
          return {
            ...prevData,
            [field]: parseFloat(newValue)
          };
        }
      });
      fetch('/api/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fieldParts.length === 2 ? { [fieldParts[0]]: { [fieldParts[1]]: parseFloat(newValue) } } : { [field]: parseFloat(newValue) })
      })
      .then(response => response.json())
      .then(data => console.log('Successfully updated load data:', data))
      .catch(error => console.error('Error updating load data:', error));
    }
  };
  return (
    <Box sx={{ mb: 2, p: 2, borderRadius: '4px', border: '1px solid #ccc' }}>
      <h2>Load</h2>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
        <Paper elevation={3} sx={{ width: '250px', height: '50px', alignContent: 'center', textAlign: 'center' }}>Total Power: {loadData.total_power} W</Paper>
        <Paper elevation={3} sx={{ width: '250px', height: '50px', alignContent: 'center', textAlign: 'center' }} onDoubleClick={() => handleDoubleClick('current_limit')}>Current Limit: {loadData.current_limit} A</Paper>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Phase</TableCell>
              <TableCell>Voltage&nbsp;(V)</TableCell>
              <TableCell>Current&nbsp;(A)</TableCell>
              <TableCell>Active Power&nbsp;(W)</TableCell>
              <TableCell>Current Range</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              <Phase phase="1" />
              <Phase phase="2" />
              <Phase phase="3" />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Load;