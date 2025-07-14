import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import ComplaintForm from './pages/User/ComplaintForm';
import ComplaintList from './pages/User/ComplaintList';
import TaskForm from './pages/Subadmin/TaskForm';
import ComplaintView from './pages/Subadmin/ComplaintView';
import Dashboard from './pages/Admin/Dashboard';
import UserList from './pages/Admin/UserList';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';


const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center items-start py-8 px-2 sm:px-6">
          <div className="w-full max-w-5xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/Register" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/user/dashboard" element={
                <PrivateRoute allowedRoles={["user"]}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ComplaintList complaints={[]} />
                    <ComplaintForm onSubmit={() => {}} />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/subadmin/dashboard" element={
                <PrivateRoute allowedRoles={["subadmin"]}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ComplaintView complaints={[]} onFilter={() => {}} />
                    <TaskForm onSubmit={() => {}} />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/admin/dashboard" element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Dashboard />
                    <UserList users={[]} />
                  </div>
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
