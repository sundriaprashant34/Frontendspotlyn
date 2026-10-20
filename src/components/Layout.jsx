import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const nav = [
  ['/dashboard', '🏠', 'Dashboard'],
  ['/report-problem', '📋', 'Report Problem'],
  ['/lost-item', '📦', 'Lost Item'],
  ['/found-item', '🔎', 'Found Item'],
  ['/my-reports', '🗂️', 'My Reports'],
  ['/profile', '👤', 'Profile'],
];
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navg = useNavigate();
  const items =
    user?.role === 'ADMIN'
      ? [
          ['/admin', '📊', 'Admin Dashboard'],
          ['/admin/complaints', '🧾', 'Complaints'],
          ['/admin/lost-found', '📦', 'Lost & Found'],
          ['/admin/staff', '🧑‍🔧', 'Staff'],
          ['/admin/students', '🎓', 'Students'],
        ]
      : user?.role === 'STAFF'
        ? [['/staff', '🛠️', 'Staff Dashboard']]
        : nav;
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white fixed inset-y-0 left-0 z-30 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-bold text-xl">
              S
            </div>
            <div>
              <div className="font-bold text-xl">Spotlyn</div>
              <div className="text-xs text-slate-400">College Campus Hub</div>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {items.map(([to, icon, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => {
            logout();
            navg('/login');
          }}
          className="m-4 py-3 rounded-xl bg-red-500 text-white font-semibold"
        >
          🚪 Logout
        </button>
      </aside>
      <main className="w-full md:ml-64">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="px-5 md:px-8 py-4 flex justify-between items-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-blue-600 font-bold">
                Spotlyn
              </div>
              <div className="font-bold text-xl text-slate-900">
                College Complaint & Lost/Found Management
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="font-semibold text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.role}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
