import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { Search, Clear, Close } from "@mui/icons-material";
import { format } from "date-fns";

const DoctorReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [selectedReport, setSelectedReport] = useState(null); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  useEffect(() => {
    fetchReports();
  }, [filterType, startDate, endDate]);

  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const formattedStartDate = startDate
        ? format(new Date(startDate), "yyyy-MM-dd")
        : null;
      const formattedEndDate = endDate
        ? format(new Date(endDate), "yyyy-MM-dd")
        : null;

      const response = await fetch("https://sail-backend.onrender.com/fetch-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: filterType !== "all" ? filterType : null,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        }),
      });

      const data = await response.json();

      // console.log("formattedStartDate:", formattedStartDate);
      // console.log("formattedEndDate:", formattedEndDate);
      // console.log("Backend response:", data);

      if (Array.isArray(data)) {
        setReports(data);
        setFilteredReports(data);
      } else if (data.error) {
        console.error("Backend error:", data.error);
        setError(data.error);
        setReports([]);
        setFilteredReports([]);
      } else {
        console.error("Invalid response format:", data);
        setError("Invalid response from server.");
        setReports([]);
        setFilteredReports([]);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to fetch reports.");
      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    applyFilters(query, filterType, filterDate);
  };

  const handleFilterTypeChange = (event) => {
    const type = event.target.value;
    setFilterType(type);
    applyFilters(searchQuery, type, filterDate);
  };

  const handleFilterDateChange = (event) => {
    const date = event.target.value;
    setFilterDate(date);
    applyFilters(searchQuery, filterType, date);
  };

  const applyFilters = (query, type, date) => {
    let filtered = reports;

    if (query) {
      filtered = filtered.filter((report) =>
        report.name.toLowerCase().includes(query)
      );
    }

    if (type !== "all") {
      filtered = filtered.filter((report) => report.department === type);
    }

    if (date) {
      filtered = filtered.filter((report) => {
        try {
          const [day, month, year] = report.uploadDate.split("-");
          const reportDate = new Date(`${year}-${month}-${day}`).toISOString().split("T")[0];
          return reportDate === date;
        } catch (error) {
          console.error("Invalid date format for report:", report);
          return false; 
        }
      });
    }

    setFilteredReports(filtered || []);
    setCurrentPage(1); // Reset to the first page
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterDate("");
    fetchReports(); // Refetch reports from the backend
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleCloseDialog = () => {
    setSelectedReport(null);
  };

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by Report Name"
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={handleFilterTypeChange}
                label="Filter by Type"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="LAB">LAB</MenuItem>
                <MenuItem value="ECG">ECG</MenuItem>
                <MenuItem value="SCAN">SCAN</MenuItem>
                <MenuItem value="XRAY">XRAY</MenuItem>
                <MenuItem value="PHARMACY">PHARMACY</MenuItem>
                <MenuItem value="OTHERS">OTHERS</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClearFilters}
              startIcon={<Clear />}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Uploaded On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentReports.map((report) => (
                  <TableRow
                    key={report.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleViewReport(report)}
                  >
                    <TableCell>{report.name}</TableCell>
                    <TableCell>{report.department}</TableCell>
                    <TableCell>
                      {(() => {
                        try {
                          const [day, month, year] = report.uploadDate.split("-");
                          return `${day}-${month}-${year}`;
                        } catch (error) {
                          console.error("Invalid date format for report:", report);
                          return "Invalid Date";
                        }
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={Math.ceil(filteredReports.length / reportsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      <Dialog open={!!selectedReport} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Report Details
          <Button
            onClick={handleCloseDialog}
            sx={{ position: "absolute", right: 16, top: 16 }}
          >
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <>
              <Typography variant="h6">Name: {selectedReport.name}</Typography>
              <Typography variant="body1">Department: {selectedReport.department}</Typography>
              <Typography variant="body1">Notes: {selectedReport.notes || "N/A"}</Typography>
              <Typography variant="body1">
                Instructions:
                {Array.isArray(selectedReport.instructions) && selectedReport.instructions.length > 0 ? (
                  <ul>
                    {selectedReport.instructions.map((inst, index) => (
                      <li key={index}>
                        <strong>Text:</strong> {inst.text} <br />
                        <strong>Doctor ID:</strong> {inst.doctorId} <br />
                        <strong>Timestamp:</strong> {new Date(inst.timestamp).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "N/A"
                )}
              </Typography>
              <Typography variant="body1">
                Uploaded On: {selectedReport.uploadDate}
              </Typography>
              <Typography variant="body1">
                <a href={selectedReport.url} target="_blank" rel="noopener noreferrer">
                  View Report
                </a>
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorReports;