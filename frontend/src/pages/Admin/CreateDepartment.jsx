import React, { useState } from 'react';
import api from '../../services/api';

const CreateDepartment = () => {
  const [form, setForm] = useState({ name: '' });
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    await api.post('/admin/department', form);
    setSuccess(true);
  };

  return (
    <form className="bg-white rounded-lg shadow p-6 mt-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">Create Department</h2>
      <input name="name" placeholder="Department Name" className="input mb-2" value={form.name} onChange={handleChange} required />
      <button type="submit" className="btn-primary">Create</button>
      {success && <div className="text-green-600 mt-2">Department created!</div>}
    </form>
  );
};

export default CreateDepartment;
