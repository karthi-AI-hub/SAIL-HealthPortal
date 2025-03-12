import React from 'react';
import { Typography, Chip } from '@mui/material';

const ReportMetadata = ({ report }) => {
  return (
    <>
      <Typography variant="body2" color="text.secondary">
        Uploaded: {new Date(report.uploadDate).toLocaleDateString()}
      </Typography>
      
      {report.notes && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Notes: {report.notes}
        </Typography>
      )}
      
      <Chip
        label={report.department}
        size="small"
        sx={{ mt: 1, bgcolor: 'primary.light', color: 'primary.contrastText' }}
      />
    </>
  );
};

export default React.memo(ReportMetadata);