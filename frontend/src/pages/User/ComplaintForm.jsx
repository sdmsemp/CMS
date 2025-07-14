import React, { useState } from 'react';

const ComplaintForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'Low',
    department: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="w-full mb-4 p-2 border rounded" required />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full mb-4 p-2 border rounded" required />
      <select name="severity" value={form.severity} onChange={handleChange} className="w-full mb-4 p-2 border rounded">
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <input name="department" placeholder="Department" value={form.department} onChange={handleChange} className="w-full mb-4 p-2 border rounded" required />
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Submit Complaint</button>
    </form>
  );
};

export default ComplaintForm;
