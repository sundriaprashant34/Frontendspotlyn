import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
export default function ReportProblem() {
  const nav = useNavigate();
  const [f, setF] = useState({
    title: '',
    category: 'Lab',
    subcategory: '',
    building: 'Main Building',
    floor: '2nd Floor',
    room: 'Computer Lab 1',
    priority: 'Medium',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const d = new FormData();
    Object.entries(f).forEach(([k, v]) => d.append(k, v));
    if (file) d.append('image', file);
    try {
      const r = await api.post('/complaints', d, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg(`Complaint ${r.data.complaintId} submitted successfully.`);
      setTimeout(() => nav('/my-reports'), 700);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Could not submit complaint');
    }
  };
  return (
    <section className="card">
      <h1 className="page-title">Report a Campus Problem</h1>
      <p className="section-sub mb-7">
        Share infrastructure, safety, lab, or service issues affecting students.
      </p>
      {msg && <div className="notice">{msg}</div>}
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-5">
        <label>
          Problem Title
          <input
            name="title"
            className="field"
            placeholder="e.g. Computer not working"
            onChange={change}
            required
          />
        </label>
        <label>
          Category
          <select name="category" className="field" onChange={change}>
            {[
              'Lab',
              'Electrical',
              'Infrastructure',
              'Internet / Network',
              'Classroom',
              'Washroom',
              'Other',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Building
          <select name="building" className="field" onChange={change}>
            <option>Main Building</option>
            <option>Science Block</option>
            <option>Library Block</option>
            <option>Admin Block</option>
          </select>
        </label>
        <label>
          Floor
          <select name="floor" className="field" onChange={change}>
            <option>Ground Floor</option>
            <option>1st Floor</option>
            <option>2nd Floor</option>
            <option>3rd Floor</option>
          </select>
        </label>
        <label>
          Room / Lab
          <input name="room" className="field" value={f.room} onChange={change} required />
        </label>
        <label>
          Priority
          <select name="priority" className="field" onChange={change}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Emergency</option>
          </select>
        </label>
        <label className="md:col-span-2">
          Description
          <textarea
            name="description"
            className="field min-h-32"
            placeholder="Describe the issue in detail..."
            onChange={change}
            required
          />
        </label>
        <label className="md:col-span-2">
          Optional Image
          <input
            type="file"
            accept="image/*"
            className="field"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <div className="md:col-span-2">
          <button className="btn-primary">Submit Complaint</button>
        </div>
      </form>
    </section>
  );
}
