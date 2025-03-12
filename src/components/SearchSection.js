import React from 'react';
import { TextField, InputAdornment, IconButton, Grid, Button } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

const SearchSection = ({ patientId, onSearch, onClear, loading }) => {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={8} md={9}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => onSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: patientId && (
              <IconButton onClick={onClear} size="small" disabled={loading}>
                <Clear fontSize="small" />
              </IconButton>
            ),
            sx: { borderRadius: 50, height: 48 }
          }}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onSearch(patientId)}
          disabled={!patientId || loading}
          sx={{ height: 48, borderRadius: 50 }}
        >
          Search
        </Button>
      </Grid>
    </Grid>
  );
};

export default React.memo(SearchSection);