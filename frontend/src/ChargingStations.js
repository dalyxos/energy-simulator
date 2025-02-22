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

function ChargngStations({ charging_stations }) {
    return (
        <Item>
            {charging_stations.map((charging_station, index) => (
                <div key={index}>
                    <strong>CS {index+1} </strong>
                    <span>(Vehicle {charging_station.vehicle_state}, SoC {charging_station.soc}%)</span>
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
                                <td>Current (A)</td>
                                {Array.isArray(charging_station.current) && charging_station.current.map((current, index) => (
                                    <td key={index}>{current}</td>
                                ))}
                                <td>MAX: {charging_station.current ? Math.max(...charging_station.current) : 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Power (kW)</td>
                                {Array.isArray(charging_station.power) && charging_station.power.map((power, index) => (
                                    <td key={index}>{power}</td>
                                ))}
                                <td>{charging_station.tot_power}</td>
                            </tr>
                            <tr>
                                <td>Energy (kWh)</td><td></td><td></td><td></td>
                                <td>{charging_station.energy_index}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </Item>
    );
}

export default ChargngStations;