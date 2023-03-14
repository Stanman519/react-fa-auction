
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import React from 'react';

export default function DashboardTabNav({onChange, tabs}: {tabs: Array<{label: string, value: string}>, onChange: (value: string) => void}) {
  const [value, setValue] = React.useState('league');
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    onChange(newValue);
  };
  
  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Tabs
        variant='fullWidth'
        value={value}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        aria-label="secondary tabs example"
      >
        {tabs.map(t =>
          <Tab key={t.label} value={t.value} label={t.label} />
        )}

      </Tabs>
    </Box>
  );
}