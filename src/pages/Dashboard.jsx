import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  useEffect(() => {
    api.get('/complaints/mine').then((r) => setData(r.data));
  }, []);
  const counts = {
    pending: data.filter((x) => ['Submitted', 'Verified', 'Assigned'].includes(x.status)).length,
    inProgress: data.filter((x) => x.status === 'In Progress').length,
    resolved: data.filter((x) => x.status === 'Resolved').length,
  };
  return (
    <>
      <div className="hero">
        <div>
          <span className="pill">WELCOME BACK</span>
          <h1>Hello, {user.name} 👋</h1>
          <p>Track your college complaints, item reports, and updates from one dashboard.</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <StatCard icon="📊" label="Total Reports" value={data.length} />
        <StatCard icon="⏳" label="Pending" value={counts.pending} note="Needs attention" />
        <StatCard icon="🔧" label="In Progress" value={counts.inProgress} />
        <StatCard icon="🎯" label="Resolved" value={counts.resolved} />
      </div>
      <section className="card mt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="section-title">Recent Reports</h2>
            <p className="section-sub">Latest updates from your complaints.</p>
          </div>
          <Link to="/my-reports" className="text-blue-600 font-semibold text-sm">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {data.slice(0, 5).map((c) => (
            <Link
              key={c._id}
              to={`/my-reports?open=${c._id}`}
              className="block border border-slate-200 rounded-xl p-4 hover:border-blue-300"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{c.title}</div>
                  <div className="break-words text-sm text-slate-500">
                    {c.complaintId} · {c.building} / {c.room}
                  </div>
                </div>
                <span className="badge self-start sm:self-auto">{c.status}</span>
              </div>
            </Link>
          ))}
          {!data.length && (
            <p className="text-slate-500 text-sm">
              No complaints yet. Start by reporting a college issue.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
