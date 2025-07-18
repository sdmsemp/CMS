import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Auth/Login';
import ComplaintForm from './pages/User/ComplaintForm';
import ComplaintList from './pages/User/ComplaintList';
import TaskForm from './pages/Subadmin/TaskForm';
import ComplaintView from './pages/Subadmin/ComplaintView';
import Dashboard from './pages/Admin/Dashboard';
import UserList from './pages/Admin/UserList';
import CreateSubadmin from './pages/Admin/CreateSubadmin';
import CreateDepartment from './pages/Admin/CreateDepartment';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Register from './pages/Auth/Register';
import Profile from './pages/Auth/Profile';
// MUI imports
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </BrowserRouter>
);

const AppContent = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname.toLowerCase());

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
  <AuthProvider>
          <div>
            {!isAuthPage && <Navbar />}
            <main>
          <div className="w-full max-w-5xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/Register" />} />
              <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={
                    <PrivateRoute allowedRoles={["admin", "subadmin", "user"]}>
                      <Profile />
                    </PrivateRoute>
                  } />
                  
                  {/* User Routes */}
              <Route path="/user/dashboard" element={
                <PrivateRoute allowedRoles={["user"]}>
                      <ComplaintList showCreateButton={true} />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/user/complaints/create" element={
                    <PrivateRoute allowedRoles={["user"]}>
                      <div className="container mx-auto p-4">
                    <ComplaintForm onSubmit={() => {}} />
                  </div>
                      </PrivateRoute>
                    } />

                  {/* Subadmin Routes */}
                  <Route path="/subadmin/complaints" element={
                    <PrivateRoute allowedRoles={["subadmin"]}>
                      <ComplaintView />
                    </PrivateRoute>
                  } />
                  <Route path="/subadmin/task/create" element={
                    <PrivateRoute allowedRoles={["subadmin"]}>
                      <TaskForm />
                </PrivateRoute>
              } />
              <Route path="/subadmin/dashboard" element={
                <PrivateRoute allowedRoles={["subadmin"]}>
                      <ComplaintView />
                </PrivateRoute>
              } />

                  {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute allowedRoles={["admin"]}>
                    <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/admin/create-subadmin" element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <CreateSubadmin />
                    </PrivateRoute>
                  } />
                  <Route path="/admin/create-department" element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <CreateDepartment />
                    </PrivateRoute>
                  } />
                  <Route path="/admin/users" element={
                    <PrivateRoute allowedRoles={["admin"]}>
                    <UserList users={[]} />
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </main>
      </div>
  </AuthProvider>
          </LocalizationProvider>
    </MuiThemeProvider>
);
};

export default App;
