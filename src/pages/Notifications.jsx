import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/notifications')
      .then((response) => setNotifications(response.data))
      .catch((requestError) =>
        setError(requestError.response?.data?.message || 'Could not load notifications.')
      )
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (notification) => {
    if (notification.read) return;
    try {
      const response = await api.put(`/notifications/${notification._id}/read`);
      setNotifications((current) =>
        current.map((item) => (item._id === notification._id ? response.data : item))
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update notification.');
    }
  };

  return (
    <section className="card">
      <h1 className="page-title">Notifications</h1>
      <p className="section-sub mt-1">Updates about your reports, claims and item handovers.</p>
      {error && (
        <p role="alert" className="notice mt-4">
          {error}
        </p>
      )}
      <div className="mt-5 space-y-3">
        {notifications.map((notification) => (
          <button
            key={notification._id}
            type="button"
            onClick={() => markRead(notification)}
            className={`block w-full rounded-xl border p-4 text-left ${notification.read ? 'border-slate-200 bg-white' : 'border-aubergine-200 bg-aubergine-50'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-semibold">{notification.title}</span>
              {!notification.read && <span className="badge">New</span>}
            </div>
            <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
            <p className="mt-2 text-xs text-slate-400">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </button>
        ))}
        {!loading && notifications.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">You have no notifications.</p>
        )}
      </div>
    </section>
  );
}
