import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Table from '../../components/Table';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/admin/logs')
      .then(res => setLogs(res.data))
      .catch(() => setLogs([]));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
      <Table data={logs} columns={[{ label: 'User', key: 'user' }, { label: 'Action', key: 'action' }, { label: 'Timestamp', key: 'timestamp' }]} />
    </div>
  );
};

export default ActivityLogs;
