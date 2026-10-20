import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    password: '',
  });
  const [err, setErr] = useState('');
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(f);
      nav('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-5">
      <form onSubmit={submit} className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-sm text-slate-500 mb-6">
          Create your student account with your email and password.
        </p>
        {err && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-4">{err}</div>}
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="name" className="field" placeholder="Full Name" onChange={change} required />
          <input
            name="email"
            type="email"
            className="field"
            placeholder="College Email"
            onChange={change}
            required
          />
          <input name="phone" className="field" placeholder="Phone" onChange={change} />
          <select name="department" className="field" value={f.department} onChange={change}>
            <option>Computer Science</option>
            <option>Information Technology</option>
            <option>Commerce</option>
            <option>Management</option>
            <option>Other</option>
          </select>
          <input
            name="password"
            type="password"
            className="field"
            placeholder="Password"
            onChange={change}
            required
          />
        </div>
        <button className="w-full mt-5 py-3 rounded-xl bg-blue-600 text-white font-semibold">
          Create Account
        </button>
        <p className="text-center text-sm text-slate-500 mt-5">
          Already registered?{' '}
          <Link className="text-blue-600 font-semibold" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
