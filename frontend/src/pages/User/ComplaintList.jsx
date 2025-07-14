import React from 'react';
import ComplaintCard from '../../components/ComplaintCard';

const ComplaintList = ({ complaints }) => (
  <div className="grid gap-4">
    {complaints.map(complaint => (
      <ComplaintCard key={complaint.id} complaint={complaint} />
    ))}
  </div>
);

export default ComplaintList;
