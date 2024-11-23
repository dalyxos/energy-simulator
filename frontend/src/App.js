import React, { useEffect, useState } from 'react';
import './App.css';
import { Layout, Typography } from 'antd';
import SmartMeter from './smartMeter';
import SolarPanel from './solarPanel';
import Battery from './battery';
import Inverter from './inverter';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

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
        <div className="site-layout-content">
          <Title>Dashboard</Title>
          <Paragraph>Energy Simulator Dashboard</Paragraph>
          <SmartMeter />
          <SolarPanel />
          <Battery />
          <Inverter />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Energy Simulator © {new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default App;