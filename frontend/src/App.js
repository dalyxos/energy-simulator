import React, { useEffect, useState } from 'react';
import './App.css';
import { Layout, Typography } from 'antd';
import SmartMeter from './smartMeter';
import SolarPanel from './solarPanel';
import Battery from './battery';
import Inverter from './inverter';
import Load from './load';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

function App() {
  const [apiVersion, setApiVersion] = useState('');

  useEffect(() => {
    fetch('/api')
      .then(response => response.json())
      .then(data => setApiVersion(data.version))
      .catch(error => console.error('Error fetching API version:', error));
  }, []);

  return (
    <Layout className="layout">
      <Header style={{ color: "white" }}>
        Energy Simulator (API Version: {apiVersion})
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <br />
        <Box sx={{ flexGrow: 1 }}>
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid size={6}>
              <Load />
            </Grid>
            <Grid size={6}>
              <Item>2</Item>
            </Grid>
            <Grid size={6}>
              <Item>3</Item>
            </Grid>
            <Grid size={6}>
              <Item>4</Item>
            </Grid>
          </Grid>
        </Box>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Energy Simulator © {new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default App;