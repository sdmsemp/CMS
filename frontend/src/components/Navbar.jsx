import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  if (!user) return null;
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="font-bold">Complaint Management</div>
      <div>
        {user.role === 'admin' && <Link to="/admin/dashboard" className="mr-4">Admin</Link>}
        {user.role === 'subadmin' && <Link to="/subadmin/dashboard" className="mr-4">Subadmin</Link>}
        {user.role === 'user' && <Link to="/user/dashboard" className="mr-4">User</Link>}
        <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
