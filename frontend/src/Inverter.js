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

export default function Inverter({ inverter, battery, solar_panel }) {
    return (
        <Item>
            <strong>Inverter</strong> <br />
            <label>Power</label> {inverter.power} W
            <br />
            <strong>Battery</strong> <br />
            <label>SoC</label> {battery.state_of_charge} % | <label>Power</label> {battery.power} W | <label>Current</label> {battery.current} A | <label>Voltage</label> {battery.voltage} V
            <br />
            <strong>Solar Panel</strong> <br />
            <label>Power</label> {solar_panel.solar_power} W  
        </Item>
    );
}
