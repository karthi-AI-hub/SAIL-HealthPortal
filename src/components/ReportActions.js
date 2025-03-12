import React, { useState } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { MoreVert, FileDownload, Share, Clear } from '@mui/icons-material';

const ReportActions = ({ onDownload, onShare, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen}>
        <MoreVert />
      </IconButton>
      
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => { onDownload(); handleClose(); }}>
          <FileDownload sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem onClick={() => { onShare(); handleClose(); }}>
          <Share sx={{ mr: 1 }} /> Share
        </MenuItem>
        <MenuItem onClick={() => { onDelete(); handleClose(); }} sx={{ color: 'error.main' }}>
          <Clear sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default React.memo(ReportActions);