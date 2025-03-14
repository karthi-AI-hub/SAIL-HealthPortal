import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  useTheme,
  CircularProgress,
  Chip,
  TablePagination,
  Link,
  TableSortLabel,
  Skeleton,
} from "@mui/material";
import { Description, Search, ArrowDropDown, FilterList } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import EmployeeProfileView from "../../components/EmployeeProfileView";
import EmployeeProfileEdit from "../../components/EmployeeProfileEdit";
import { useTechnician } from "../../context/TechnicianContext";
import { alpha } from "@mui/material/styles";

const TechnicianPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [profileViewOpen, setProfileViewOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("EmployeeID");
  const [sortOrder, setSortOrder] = useState("asc");

  const db = getFirestore();
  const { technicianId } = useTechnician();
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "Employee"),
      (snapshot) => {
        try {
          const patientsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPatients(patientsList);
          setLoading(false);
        } catch (err) {
          setError("Failed to load patient data");
          setLoading(false);
        }
      },
      (error) => {
        setError("Error connecting to database");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [technicianId, db]);

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(field);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const filteredPatients = patients
    .filter((patient) => {
      const query = searchQuery.toLowerCase();
      return (
        patient.EmployeeID?.toLowerCase().includes(query) ||
        patient.Name?.toLowerCase().includes(query) ||
        patient.Phone?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const isAsc = sortOrder === "asc";
      if (a[sortBy] < b[sortBy]) return isAsc ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return isAsc ? 1 : -1;
      return 0;
    });

    const EnhancedTableHead = () => (
      <TableHead>
        <TableRow sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `2px solid ${theme.palette.divider}`,
          '& th': { py: 3 }
        }}>
          <TableCell sx={{ width: 60, fontWeight: 700, fontSize: '0.875rem' }}>
            #
          </TableCell>
          {[
            { id: 'EmployeeID', label: 'Employee ID' },
            { id: 'Name', label: 'Full Name' },
            { id: 'Phone', label: 'Contact' },
            { id: 'actions', label: 'Reports' },
          ].map((header) => (
            <TableCell
              key={header.id}
              sx={{ fontWeight: 700, fontSize: '0.875rem' }}
              sortDirection={sortBy === header.id ? sortOrder : false}
            >
              {header.id !== 'actions' ? (
                <TableSortLabel
                  active={sortBy === header.id}
                  direction={sortOrder}
                  onClick={() => handleSort(header.id)}
                  IconComponent={ArrowDropDown}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      color: `${theme.palette.primary.main} !important`,
                    },
                  }}
                >
                  {header.label}
                </TableSortLabel>
              ) : (
                <Box display="flex" alignItems="center">
                  {header.label}
                  <FilterList fontSize="small" sx={{ ml: 1, color: theme.palette.action.active }} />
                </Box>
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  

    const LoadingSkeleton = () => (
      <>
        {Array(rowsPerPage).fill(null).map((_, index) => (
          <TableRow key={index} hover>
            <TableCell><Skeleton variant="text" width="60%" animation="wave" /></TableCell>
            <TableCell><Skeleton variant="text" width="80%" animation="wave" /></TableCell>
            <TableCell><Skeleton variant="text" width="70%" animation="wave" /></TableCell>
            <TableCell><Skeleton variant="text" width="50%" animation="wave" /></TableCell>
            <TableCell><Skeleton variant="circular" width={32} height={32} animation="wave" /></TableCell>
          </TableRow>
        ))}
      </>
    );

    const EmptyState = () => (
      <TableRow>
        <TableCell colSpan={5}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8,
            color: theme.palette.text.secondary
          }}>
            <Search sx={{ fontSize: 64, mb: 2, color: alpha(theme.palette.text.secondary, 0.3) }} />
            <Typography variant="h6" color="textSecondary">
              No employees found
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error || "Try adjusting your search criteria"}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    );

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      backgroundColor: 'background.default', 
      minHeight: '100vh',
      maxWidth: 1600,
      margin: '0 auto'
    }}>
      {/* Enhanced Header Section */}
      <Box sx={{ 
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3
      }}>
        <Typography variant="h4" fontWeight={700} sx={{ 
          color: 'text.primary',
          fontSize: { xs: '1.5rem', md: '2rem' },
          letterSpacing: '-0.5px'
        }}>
          Employee Directory
        </Typography>
        <Paper sx={{ 
          flex: 1,
          maxWidth: 600,
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: theme.shadows[3]
          }
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search Employees by ID, Name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
                  <Search />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                '& input::placeholder': {
                  opacity: 0.7
                }
              }
            }}
          />
        </Paper>
      </Box>

      {/* Enhanced Table Container */}
      <Paper sx={{ 
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
      }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader aria-label="employee directory" sx={{ minWidth: 800 }}>
            <EnhancedTableHead />
            
            <TableBody>
              {loading ? (
                <LoadingSkeleton />
              ) : error ? (
                <EmptyState />
              ) : filteredPatients.length === 0 ? (
                <EmptyState />
              ) : (
                filteredPatients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((patient, index) => (
                    <TableRow 
                      key={patient.id}
                      hover
                      sx={{ 
                        '&:last-child td': { border: 0 },
                        transition: 'background-color 0.2s',
                        '&:nth-of-type(even)': {
                          backgroundColor: alpha(theme.palette.action.hover, 0.04)
                        }
                      }}
                    >
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      
                      <TableCell>
                        <Link
                          component="button"
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setProfileViewOpen(true);
                          }}
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            textDecoration: 'none',
                            '&:hover': {
                              color: 'primary.main',
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {patient.EmployeeID || 'N/A'}
                        </Link>
                      </TableCell>
                      
                      <TableCell sx={{ fontWeight: 500 }}>
                        {patient.Name || 'N/A'}
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={patient.Phone || 'N/A'}
                          size="small"
                          sx={{
                            borderRadius: 1,
                            backgroundColor: alpha(theme.palette.primary.light, 0.1),
                            color: 'text.primary',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Tooltip title="View Medical Reports" arrow>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/technician/dashboard?employeeID=${patient.id}`);
                            }}
                            sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2)
                              }
                            }}
                          >
                            <Description fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Enhanced Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: 'background.paper',
            '& .MuiTablePagination-toolbar': {
              minHeight: 64
            }
          }}
        />
      </Paper>

      {/* Keep modals unchanged */}
      <EmployeeProfileView
        open={profileViewOpen}
        onClose={() => setProfileViewOpen(false)}
        employeeId={selectedPatientId}
      />
      <EmployeeProfileEdit
        open={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        employeeId={selectedPatientId}
      />
    </Box>
  );
};

export default TechnicianPatients;