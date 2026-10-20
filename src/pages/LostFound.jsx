import React, { useEffect, useState } from 'react';
import api from '../api';
export default function LostFound({ type = 'lost' }) {
  const [items, setItems] = useState([]);
  const [f, setF] = useState({
    itemName: '',
    category: 'ID Card',
    description: '',
    location: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [msg, setMsg] = useState('');
  const [file, setFile] = useState(null);
  useEffect(() => {
    const load = async () => {
      const r = await api.get(`/lost-found/${type}`);
      setItems(r.data);
    };
    load().catch(() => setItems([]));
  }, [type]);
  const submit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(f).forEach(([key, value]) => formData.append(key, value));
      if (file) formData.append('image', file);
      await api.post(`/lost-found/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg(`${type === 'lost' ? 'Lost' : 'Found'} item report submitted.`);
      setF({ ...f, itemName: '', description: '', location: '' });
      setFile(null);
      const r = await api.get(`/lost-found/${type}`);
      setItems(r.data);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed');
    }
  };
  return (
    <section>
      <div className="card mb-6">
        <h1 className="page-title">Report {type === 'lost' ? 'Lost' : 'Found'} Item</h1>
        <p className="section-sub mb-6">
          {type === 'lost'
            ? 'Share the missing item details so the campus community can help.'
            : 'Help reconnect a campus item with its rightful owner.'}
        </p>
        {msg && <div className="notice mb-4">{msg}</div>}
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <input
            className="field"
            placeholder="Item Name"
            value={f.itemName}
            onChange={(e) => setF({ ...f, itemName: e.target.value })}
            required
          />
          <select
            className="field"
            value={f.category}
            onChange={(e) => setF({ ...f, category: e.target.value })}
          >
            {['ID Card', 'Wallet', 'Mobile', 'Bag', 'Book', 'Water Bottle', 'Other'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <input
            className="field"
            placeholder={type === 'lost' ? 'Lost Location' : 'Found Location'}
            value={f.location}
            onChange={(e) => setF({ ...f, location: e.target.value })}
            required
          />
          <input
            className="field"
            type="date"
            value={f.date}
            onChange={(e) => setF({ ...f, date: e.target.value })}
            required
          />
          <textarea
            className="field md:col-span-2 min-h-28"
            placeholder="Description and identifying details"
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
          <label className="text-sm font-medium md:col-span-2">
            Optional image (up to 5 MB)
            <input
              className="field"
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
          <button className="btn-primary md:col-span-2">Submit Report</button>
        </form>
      </div>
      <div className="card">
        <h2 className="section-title">Recent {type === 'lost' ? 'Lost' : 'Found'} Items</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {items.map((x) => (
            <div key={x._id} className="border rounded-xl p-4">
              {x.image && (
                <a href={x.image} target="_blank" rel="noreferrer">
                  <img
                    src={x.image}
                    alt={`Reported ${type} item: ${x.itemName}`}
                    className="mb-3 h-40 w-full rounded-lg object-cover"
                  />
                </a>
              )}
              <div className="font-bold">{x.itemName}</div>
              <div className="text-sm text-slate-500">
                {x.category} · {x.location}
              </div>
              <div className="text-sm mt-2">{x.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
