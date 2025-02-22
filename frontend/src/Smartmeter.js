import * as React from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';


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

function Smartmeter({ load, smartmeter }) {
    return (
        <Item>
            <strong>Smartmeter</strong>
            <table style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{width: '28%'}}>Phase</th>
                        <th style={{width: '15%'}}>L1</th>
                        <th style={{width: '15%'}}>L2</th>
                        <th style={{width: '15%'}}>L3</th>
                        <th style={{width: '27%'}}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Voltage (V)</td>
                        {Array.isArray(smartmeter.voltage) && smartmeter.voltage.map((voltage, index) => (
                            <td key={index}>{voltage}</td>
                        ))}
                        <td></td>
                    </tr>
                    <tr>
                        <td>Current (A)</td>
                        {Array.isArray(smartmeter.current) && smartmeter.current.map((current, index) => (
                            <td key={index}>{current}</td>
                        ))}
                        <td>MAX: {smartmeter.current ? Math.max(...smartmeter.current) : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Power (kW)</td>
                        {Array.isArray(smartmeter.power) && smartmeter.power.map((power, index) => (
                            <td key={index}>{power}</td>
                        ))}
                        <td>{smartmeter.tot_power}</td>
                    </tr>
                </tbody>
            </table>
            <strong>Load</strong>
            <table style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{width: '28%'}}>Phase</th>
                        <th style={{width: '15%'}}>L1</th>
                        <th style={{width: '15%'}}>L2</th>
                        <th style={{width: '15%'}}>L3</th>
                        <th style={{width: '27%'}}>Max</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Current (A)</td>
                        {Array.isArray(load.current) && load.current.map((current, index) => (
                            <td key={index}>{current}</td>
                        ))}
                        <td>{load.current ? Math.max(...load.current) : 'N/A'}</td>
                    </tr>
                </tbody>
            </table>
        </Item>
    );
}

export default Smartmeter;