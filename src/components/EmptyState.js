import React from 'react';
import { Box, Typography, Icon } from '@mui/material';

const EmptyState = ({ title, description, icon }) => (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <Icon sx={{ fontSize: 64, mb: 2 }}>{icon}</Icon>
    <Typography variant="h5" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body1" color="textSecondary">
      {description}
    </Typography>
  </Box>
);

export default EmptyState;