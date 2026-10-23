import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [dbConnected, setDbConnected] = useState(false);
  useEffect(() => {
    let mounted = true;
    const checkDatabase = () => {
      api
        .get('/health')
        .then((res) => {
          if (mounted) setDbConnected(res.data?.database?.connected === true);
        })
        .catch(() => {
          if (mounted) setDbConnected(false);
        });
    };
    checkDatabase();
    const intervalId = window.setInterval(checkDatabase, 10000);
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const u = await login(id, pw);
      nav(u.role === 'ADMIN' ? '/admin' : u.role === 'STAFF' ? '/staff' : '/dashboard');
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          (e.request
            ? 'Please wait for the database connection to be established.'
            : 'Login failed. Please try again.'),
      );
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-5">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            S
          </div>
          <div>
            <h1 className="text-2xl font-bold">Spotlyn</h1>
            <p className="text-sm text-slate-500">College Campus Portal</p>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-1">Welcome back</h2>
        <p className="text-sm text-slate-500 mb-6">Login with your email.</p>
        {err && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-4">{err}</div>}
        <input
          className="field"
          placeholder="Email"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <input
          className="field mt-3"
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
        <button className="w-full mt-5 py-3 rounded-xl bg-blue-600 text-white font-semibold">
          Login
        </button>
        <p className="text-center text-sm text-slate-500 mt-5">
          New student?{' '}
          <Link className="text-blue-600 font-semibold" to="/register">
            Create account
          </Link>
        </p>
      </form>
      <div className="group fixed bottom-4 right-4 z-50">
        <span
          aria-label={`MongoDB ${dbConnected ? 'connected' : 'not connected'}`}
          aria-live="polite"
          className={`block h-3 w-3 rounded-full shadow-md ring-2 ring-white ${
            dbConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
          role="status"
          tabIndex={0}
        />
        <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          MongoDB {dbConnected ? 'connected' : 'not connected'}
        </span>
      </div>
    </div>
  );
}
