import React, { useState } from 'react';

const TaskForm = ({ onSubmit, initial = {} }) => {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    dueDate: initial.dueDate || ''
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
      <input name="title" placeholder="Task Title" value={form.title} onChange={handleChange} className="w-full mb-4 p-2 border rounded" required />
      <textarea name="description" placeholder="Task Description" value={form.description} onChange={handleChange} className="w-full mb-4 p-2 border rounded" required />
      <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="w-full mb-4 p-2 border rounded" />
      <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">Save Task</button>
    </form>
  );
};

export default TaskForm;
