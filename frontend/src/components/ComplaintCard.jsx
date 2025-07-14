import React from 'react';

const severityColors = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
};

const ComplaintCard = ({ complaint }) => (
  <div className="border rounded p-4 shadow-md bg-white">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-bold text-lg">{complaint.title}</h3>
      <span className={`px-2 py-1 rounded text-white text-xs ${severityColors[complaint.severity]}`}>{complaint.severity}</span>
    </div>
    <p className="mb-2">{complaint.description}</p>
    <div className="text-sm text-gray-600">Department: {complaint.department}</div>
    <div className="text-sm text-gray-600">Status: {complaint.status}</div>
  </div>
);

export default ComplaintCard;
