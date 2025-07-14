import React, { useState } from 'react';
import api from '../../services/api';

const CreateSubadmin = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    await api.post('/admin/subadmin', form);
    setSuccess(true);
  };

  return (
    <form className="bg-white rounded-lg shadow p-6 mt-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">Create Subadmin</h2>
      <input name="name" placeholder="Name" className="input mb-2" value={form.name} onChange={handleChange} required />
      <input name="email" placeholder="Email" className="input mb-2" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" className="input mb-2" value={form.password} onChange={handleChange} required />
      <button type="submit" className="btn-primary">Create</button>
      {success && <div className="text-green-600 mt-2">Subadmin created!</div>}
    </form>
  );
};

export default CreateSubadmin;
