import React from 'react';
import { useAuth } from '../context/AuthContext';
export default function Profile() {
  const { user } = useAuth();
  return (
    <section className="card">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
          {user.name[0]}
        </div>
        <div>
          <h1 className="page-title">{user.name}</h1>
          <p className="section-sub">
            {user.department} · {user.role}
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          ['Email', user.email],
          ['Phone', user.phone || 'Not provided'],
          ['Department', user.department],
          ['Role', user.role],
        ].map(([a, b]) => (
          <div key={a} className="p-4 bg-slate-50 rounded-xl">
            <div className="text-xs text-slate-500">{a}</div>
            <div className="font-semibold mt-1">{b}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
