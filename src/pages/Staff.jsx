import React, { useEffect, useState } from 'react';
import api from '../api';
import { APPROVAL_REASONS, REJECTION_REASONS } from '../utils/complaintReview.js';

export default function Staff() {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  const load = async () => {
    const response = await api.get('/complaints');
    setData(response.data);
  };

  useEffect(() => {
    load()
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Could not load assigned complaints.');
      })
      .finally(() => setLoading(false));
  }, []);

  const update = async (id, status) => {
    setError('');
    try {
      await api.put(`/complaints/${id}/status`, {
        status,
        resolutionRemark: status === 'Resolved' ? 'Work completed by assigned staff.' : '',
      });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update complaint status.');
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.put(`/complaints/${reviewing.id}/review`, {
        decision: reviewing.decision,
        reason: reviewing.reason,
        details: reviewing.details,
      });
      setReviewing(null);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save complaint review.');
    }
  };

  return (
    <section>
      <h1 className="page-title">Staff Dashboard</h1>
      <p className="section-sub mb-6">Review and work on complaints assigned to you.</p>
      {error && (
        <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-4">
        {data.map((c) => {
          const imageUrl = c.image
            ? new URL(c.image, new URL(api.defaults.baseURL, window.location.origin)).href
            : '';
          return (
            <article className="card" key={c._id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{c.title}</h2>
                  <p className="text-sm text-slate-500">
                    {c.complaintId} · Submitted{' '}
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : 'date unavailable'}
                  </p>
                </div>
                <span className="badge">{c.status}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-slate-700">{c.description}</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['Category', c.category],
                  ['Subcategory', c.subcategory],
                  ['Priority', c.priority],
                  ['Building', c.building],
                  ['Floor', c.floor],
                  ['Room', c.room],
                  ['Assigned department', c.assignedDepartment],
                  ['Student', c.student?.name || c.studentName],
                  ['Student email', c.student?.email],
                  ['Student phone', c.student?.phone],
                  ['Student department', c.student?.department],
                  ['Administration note', c.adminRemark],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt className="font-semibold text-slate-600">{label}</dt>
                      <dd className="mt-0.5 text-slate-800">{value}</dd>
                    </div>
                  ))}
                {c.staffDecisionReason && (
                  <div>
                    <dt className="font-semibold text-slate-600">Staff decision reason</dt>
                    <dd className="mt-0.5 text-slate-800">
                      {c.staffDecisionReason}
                      {c.staffDecisionDetails ? `: ${c.staffDecisionDetails}` : ''}
                    </dd>
                  </div>
                )}
                {c.resolutionRemark && (
                  <div>
                    <dt className="font-semibold text-slate-600">Resolution note</dt>
                    <dd className="mt-0.5 text-slate-800">{c.resolutionRemark}</dd>
                  </div>
                )}
              </dl>
              {imageUrl && (
                <a
                  className="mt-4 inline-block text-sm font-semibold text-blue-600"
                  href={imageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View complaint photo
                </a>
              )}
              {c.resolutionImage && (
                <a
                  className="ml-4 mt-4 inline-block text-sm font-semibold text-blue-600"
                  href={
                    new URL(
                      c.resolutionImage,
                      new URL(api.defaults.baseURL, window.location.origin)
                    ).href
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  View resolution photo
                </a>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {c.status === 'Assigned' && (
                  <>
                    <button
                      className="btn-primary"
                      onClick={() =>
                        setReviewing({
                          id: c._id,
                          decision: 'approve',
                          reason: '',
                          details: '',
                        })
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="btn-light"
                      onClick={() =>
                        setReviewing({
                          id: c._id,
                          decision: 'reject',
                          reason: '',
                          details: '',
                        })
                      }
                    >
                      Reject
                    </button>
                  </>
                )}
                {c.status === 'Approved' && (
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
            </article>
          );
        })}
        {loading && <div className="card text-slate-500">Loading assigned complaints...</div>}
        {!loading && !data.length && (
          <div className="card text-slate-500">No assigned complaints.</div>
        )}
      </div>

      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onSubmit={submitReview}
          >
            <h2 id="review-title" className="text-xl font-bold">
              {reviewing.decision === 'approve' ? 'Approve complaint' : 'Reject complaint'}
            </h2>
            <label className="mt-5 block text-sm font-semibold" htmlFor="review-reason">
              Choose a reason
            </label>
            <select
              id="review-reason"
              className="field mt-2 w-full"
              value={reviewing.reason}
              onChange={(event) => setReviewing({ ...reviewing, reason: event.target.value })}
              required
            >
              <option value="">Select a reason</option>
              {(reviewing.decision === 'approve' ? APPROVAL_REASONS : REJECTION_REASONS).map(
                (reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                )
              )}
            </select>
            {reviewing.reason === 'Other' && (
              <label className="mt-4 block text-sm font-semibold" htmlFor="review-details">
                Please explain
                <textarea
                  id="review-details"
                  className="field mt-2 min-h-24 w-full"
                  maxLength={500}
                  value={reviewing.details}
                  onChange={(event) => setReviewing({ ...reviewing, details: event.target.value })}
                  required
                />
              </label>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn-light" onClick={() => setReviewing(null)}>
                Cancel
              </button>
              <button className="btn-primary" type="submit">
                Confirm {reviewing.decision === 'approve' ? 'approval' : 'rejection'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
