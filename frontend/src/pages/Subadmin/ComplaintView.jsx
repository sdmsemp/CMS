import React from 'react';
import ComplaintCard from '../../components/ComplaintCard';

const ComplaintView = ({ complaints, onFilter }) => (
  <div>
    <div className="mb-4">
      <label>Filter by Severity: </label>
      <select onChange={e => onFilter(e.target.value)} className="p-2 border rounded">
        <option value="">All</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>
    <div className="grid gap-4">
      {complaints.map(complaint => (
        <ComplaintCard key={complaint.id} complaint={complaint} />
      ))}
    </div>
  </div>
);

export default ComplaintView;
