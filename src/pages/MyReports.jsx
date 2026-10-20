import React, { useEffect, useState } from 'react';
import api from '../api';
export default function MyReports() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const load = async () => {
      const r = await api.get('/complaints/mine');
      setData(r.data);
    };
    load().catch(() => setData([]));
  }, []);
  const open = async (id) => {
    const r = await api.get(`/complaints/${id}`);
    setSelected(r.data);
  };
  return (
    <section>
      <div className="mb-6">
        <h1 className="page-title">My Reports</h1>
        <p className="section-sub">Track every complaint you have submitted.</p>
      </div>
      <div className="grid gap-4">
        {data.map((c) => (
          <div key={c._id} className="card">
            <div className="flex justify-between gap-4">
              <div>
                <div className="font-bold text-lg">{c.title}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {c.complaintId} · {c.category} · {c.building} / {c.room}
                </div>
              </div>
              <span className="badge">{c.status}</span>
            </div>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{
                  width:
                    c.status === 'Resolved'
                      ? '100%'
                      : c.status === 'In Progress'
                        ? '75%'
                        : c.status === 'Assigned'
                          ? '55%'
                          : c.status === 'Verified'
                            ? '35%'
                            : '15%',
                }}
              />
            </div>
            <button
              className="text-blue-600 font-semibold text-sm mt-4"
              onClick={() => open(c._id)}
            >
              View timeline →
            </button>
          </div>
        ))}
        {!data.length && <div className="card text-slate-500">No reports found.</div>}
      </div>
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between">
              <h2 className="font-bold text-xl">{selected.complaint.complaintId}</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <p className="font-semibold mt-3">{selected.complaint.title}</p>
            <div className="mt-5 space-y-4">
              {selected.history.map((h) => (
                <div key={h._id} className="border-l-2 border-blue-500 pl-4">
                  <div className="font-semibold">{h.action}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(h.createdAt).toLocaleString()}
                  </div>
                  {h.remark && <div className="text-sm mt-1">{h.remark}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
