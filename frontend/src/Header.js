import React from 'react';
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

function Header() {

  const [apiVersion, setApiVersion] = React.useState('');
  
    React.useEffect(() => {
      fetch('/api/version')
        .then(response => response.json())
        .then(data => setApiVersion(data.version))
        .catch(error => console.error('Error fetching API version:', error));
    }, []);

    return(
        <Item sx={{ backgroundColor: '#033', color: '#FFF' }}>{apiVersion ? `API Version: ${apiVersion}` : 'Loading...'}</Item>
    );
}

export default Header;