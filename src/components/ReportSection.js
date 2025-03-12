import React from 'react';
import { Box, Tabs, Tab, Collapse } from '@mui/material';
import { FixedSizeList as List } from 'react-window';

const ReportSection = ({ 
  reports, 
  renderRow, 
  reportTypeTab,  // Add this prop
  onTabChange, 
  subTab,         // Add if using sub-tabs
  onSubTabChange  // Add if using sub-tabs
}) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Tabs
        value={reportTypeTab}
        onChange={(e, newValue) => onTabChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {['all', 'LAB', 'ECG', 'SCAN', 'XRAY'].map((type) => (
          <Tab key={type} label={type === 'all' ? 'All' : type} value={type} />
        ))}
      </Tabs>

      {/* Add LAB sub-tabs if needed */}
      {reportTypeTab === 'LAB' && (
        <Collapse in={reportTypeTab === 'LAB'}>
          <Tabs
            value={subTab}
            onChange={(e, newValue) => onSubTabChange(newValue)}
            variant="scrollable"
          >
            {['Hematology', 'Biochemistry', 'Microbiology', 'Bloodbank'].map((sub) => (
              <Tab key={sub} label={sub} value={sub} />
            ))}
          </Tabs>
        </Collapse>
      )}

      <List
        height={600}
        itemCount={reports.length}
        itemSize={250}
        width="100%"
      >
        {renderRow}
      </List>
    </Box>
  );
};

export default React.memo(ReportSection);