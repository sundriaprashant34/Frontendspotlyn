import React from 'react';
export default function StatCard({ icon, label, value, note }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex justify-between">
        <div className="text-2xl">{icon}</div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
          <div className="text-3xl font-bold text-slate-900 mt-1">{value}</div>
        </div>
      </div>
      {note && <div className="text-xs text-slate-500 mt-3">{note}</div>}
    </div>
  );
}
