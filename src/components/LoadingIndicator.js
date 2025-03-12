import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingIndicator = ({ size = 40, color = 'primary' }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        width: '100%'
      }}
    >
      <CircularProgress 
        size={size} 
        color={color} 
        thickness={4}
        sx={{
          animationDuration: '600ms',
          '&.MuiCircularProgress-indeterminate': {
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0s'
          }
        }}
      />
    </Box>
  );
};

export default React.memo(LoadingIndicator);