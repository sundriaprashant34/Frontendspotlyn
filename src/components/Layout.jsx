import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const nav = [
  ['/dashboard', '🏠', 'Dashboard'],
  ['/report-problem', '📋', 'Report Problem'],
  ['/lost-item', '📦', 'Lost Item'],
  ['/found-item', '🔎', 'Found Item'],
  ['/my-reports', '🗂️', 'My Reports'],
  ['/notifications', '🔔', 'Notifications'],
  ['/chatbot', '🤖', 'Spotlyn AI'],
];
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navg = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items =
    user?.role === 'ADMIN'
      ? [
          ['/admin', '📊', 'Admin Dashboard'],
          ['/admin/complaints', '🧾', 'Complaints'],
          ['/admin/lost-found', '📦', 'Lost & Found'],
          ['/admin/staff', '🧑‍🔧', 'Staff'],
          ['/admin/students', '🎓', 'Students'],
          ['/chatbot', '🤖', 'Spotlyn AI'],
        ]
      : user?.role === 'STAFF'
        ? [
            ['/staff', '🛠️', 'Staff Dashboard'],
            ['/notifications', '🔔', 'Notifications'],
            ['/chatbot', '🤖', 'Spotlyn AI'],
          ]
        : nav;
  return (
    <div className="ambient-background min-h-screen flex">
      <aside className="glass-sidebar w-64 text-white fixed inset-y-0 left-0 z-30 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-marigold-400 text-ink flex items-center justify-center font-bold text-xl">
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
        <header className="glass-navbar sticky top-0 z-20">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-8 md:py-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-aubergine-700 font-bold md:text-xs">
                Spotlyn
              </div>
              <div className="hidden font-bold text-xl text-slate-900 sm:block">
                College Complaint & Lost/Found Management
              </div>
              <div className="font-semibold text-sm text-slate-900 sm:hidden">Campus Hub</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="font-semibold text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.role}</div>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-marigold-100 font-bold text-aubergine-900 ring-2 ring-white transition hover:ring-marigold-400 sm:h-10 sm:w-10"
                aria-label="Open profile"
                title="Open profile"
                onClick={() => navg('/profile')}
              >
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || '?'
                )}
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-xl text-slate-700 hover:bg-slate-50 md:hidden"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                <span aria-hidden="true">{mobileMenuOpen ? '×' : '☰'}</span>
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              className="glass-menu absolute right-3 top-full z-50 grid w-[calc(100%-1.5rem)] max-w-sm grid-cols-2 gap-2 rounded-xl p-3 shadow-xl sm:grid-cols-3 md:hidden"
            >
              {items.map(([to, icon, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${isActive ? 'bg-aubergine-50 text-aubergine-800' : 'text-slate-600 hover:bg-slate-50'}`
                  }
                >
                  <span aria-hidden="true">{icon}</span>
                  <span>{label}</span>
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navg('/login');
                }}
                className="flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <span aria-hidden="true">🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          )}
        </header>
        <div className="p-4 sm:p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
