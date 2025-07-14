import React, { useState } from 'react';
import api from '../../services/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" className="input w-full" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="input w-full" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="input w-full" value={form.password} onChange={handleChange} required />
        <button type="submit" className="btn-primary w-full">Register</button>
        {success && <div className="text-green-600 text-center mt-2">Registration successful!</div>}
        {error && <div className="text-red-500 text-center mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default Register;
