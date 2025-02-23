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
                                <th style={{width: '27%'}}>HEMS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Current (A)</td>
                                {Array.isArray(charging_station.current) && charging_station.current.map((current, index) => (
                                    <td key={index}>{current}</td>
                                ))}
                                <td>{charging_station.hems}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </Item>
    );
}

export default ChargngStations;