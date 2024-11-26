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


const Load = () => {
  const [loadData, setLoadData] = useState({
    total_power: 0,
    current_limit: 0,
    phase1: {
      current: 0,
      voltage: 0,
      power: 0,
      load_limit_max: 0,
      load_limit_min: 0
    },
    phase2: {
      current: 0,
      voltage: 0,
      power: 0,
      load_limit_max: 0,
      load_limit_min: 0
    },
    phase3: {
      current: 0,
      voltage: 0,
      power: 0,
      load_limit_max: 0,
      load_limit_min: 0
    }
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
              <TableRow
                key="1"
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                <TableCell component="th" scope="row">1</TableCell>
                <TableCell style={{ cursor: 'pointer', textDecoration: 'underline' }} onDoubleClick={() => handleDoubleClick('phase1.voltage')}>{loadData.phase1.voltage}</TableCell>
                <TableCell>{loadData.phase1.current}</TableCell>
                <TableCell>{loadData.phase1.power }</TableCell>
                <TableCell>
                    <Slider
                      value={[loadData.phase1.load_limit_min, loadData.phase1.load_limit_max]}
                      onChange={(event, newValue) => {
                        setLoadData(prevData => ({
                          ...prevData,
                          phase1: {
                            ...prevData.phase1,
                            load_limit_min: newValue[0],
                            load_limit_max: newValue[1]
                          }
                        }));
                        fetch('/api/load', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            phase1: {
                              load_limit_min: newValue[0],
                              load_limit_max: newValue[1]
                            }
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
              <TableRow
                key="2"
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                <TableCell component="th" scope="row">2</TableCell>
                <TableCell style={{ cursor: 'pointer', textDecoration: 'underline' }}onDoubleClick={() => handleDoubleClick('phase2.voltage')}>{loadData.phase2.voltage}</TableCell>
                <TableCell>{loadData.phase2.current}</TableCell>
                <TableCell>{loadData.phase2.power }</TableCell>
                <TableCell>
                    <Slider
                      value={[loadData.phase2.load_limit_min, loadData.phase2.load_limit_max]}
                      onChange={(event, newValue) => {
                        setLoadData(prevData => ({
                          ...prevData,
                          phase2: {
                            ...prevData.phase2,
                            load_limit_min: newValue[0],
                            load_limit_max: newValue[1]
                          }
                        }));
                        fetch('/api/load', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            phase2: {
                              load_limit_min: newValue[0],
                              load_limit_max: newValue[1]
                            }
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
              <TableRow
                key="3"
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                <TableCell component="th" scope="row">3</TableCell>
                <TableCell style={{ cursor: 'pointer', textDecoration: 'underline' }}onDoubleClick={() => handleDoubleClick('phase3.voltage')}>{loadData.phase3.voltage}</TableCell>
                <TableCell>{loadData.phase3.current}</TableCell>
                <TableCell>{loadData.phase3.power }</TableCell>
                <TableCell>
                    <Slider
                      value={[loadData.phase3.load_limit_min, loadData.phase3.load_limit_max]}
                      onChange={(event, newValue) => {
                        setLoadData(prevData => ({
                          ...prevData,
                          phase3: {
                            ...prevData.phase3,
                            load_limit_min: newValue[0],
                            load_limit_max: newValue[1]
                          }
                        }));
                        fetch('/api/load', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            phase3: {
                              load_limit_min: newValue[0],
                              load_limit_max: newValue[1]
                            }
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
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Load;