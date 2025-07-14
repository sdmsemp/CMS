import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const TopActiveUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/admin/most-active')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Top 10 Active Users</h2>
      <Table data={users} columns={[{ label: 'Name', key: 'name' }, { label: 'Actions', key: 'actions' }]} />
    </div>
  );
};

export default TopActiveUsers;
