import React, { useEffect, useState } from 'react';
import api from '../api';
export default function Staff() {
  const [data, setData] = useState([]);
  const load = async () => {
    const r = await api.get('/complaints');
    setData(r.data);
  };
  useEffect(() => {
    load().catch(() => setData([]));
  }, []);
  const update = async (id, status) => {
    await api.put(`/complaints/${id}/status`, {
      status,
      resolutionRemark: status === 'Resolved' ? 'Work completed by assigned staff.' : '',
    });
    await load();
  };
  return (
    <section>
      <h1 className="page-title">Staff Dashboard</h1>
      <p className="section-sub mb-6">Work assigned to you by the college administration.</p>
      <div className="grid gap-4">
        {data.map((c) => (
          <div className="card" key={c._id}>
            <div className="flex justify-between">
              <div>
                <h2 className="font-bold text-lg">{c.title}</h2>
                <p className="text-sm text-slate-500">
                  {c.complaintId} · {c.building} / {c.room}
                </p>
              </div>
              <span className="badge">{c.status}</span>
            </div>
            <p className="mt-3 text-slate-700">{c.description}</p>
            <div className="flex gap-2 mt-4">
              {c.status === 'Assigned' && (
                <button className="btn-light" onClick={() => update(c._id, 'In Progress')}>
                  Start Work
                </button>
              )}
              {c.status === 'In Progress' && (
                <button className="btn-primary" onClick={() => update(c._id, 'Resolved')}>
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
        {!data.length && <div className="card text-slate-500">No assigned complaints.</div>}
      </div>
    </section>
  );
}
