import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/admin/departments')
      .then(res => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  const handleDelete = async id => {
    await api.delete(`/admin/department/${id}`);
    setDepartments(departments.filter(dep => dep.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Departments</h2>
      <Table data={departments} columns={[{ label: 'Name', key: 'name' }, { label: 'Actions', key: 'actions', render: (dep) => (
        <button className="btn-danger" onClick={() => handleDelete(dep.id)}>Delete</button>
      ) }]} />
    </div>
  );
};

export default DepartmentList;
