import React, { useEffect, useState } from 'react';
import api from '../api';

const getMatchScore = (item, candidate) => {
  const normalize = (value) => value?.trim().toLowerCase() || '';
  const itemName = normalize(item.itemName);
  const candidateName = normalize(candidate.itemName);
  let score = normalize(item.category) === normalize(candidate.category) ? 2 : 0;
  if (
    itemName.length >= 3 &&
    candidateName.length >= 3 &&
    (itemName.includes(candidateName) || candidateName.includes(itemName))
  )
    score += 3;
  const itemDate = Date.parse(item.date);
  const candidateDate = Date.parse(candidate.date);
  if (!Number.isNaN(itemDate) && !Number.isNaN(candidateDate)) {
    const daysApart = Math.abs(itemDate - candidateDate) / (1000 * 60 * 60 * 24);
    if (daysApart <= 7) score += 1;
  }
  return score;
};

const sortByMatch = (reports, candidates) => {
  const scoreFor = (candidate) =>
    reports.reduce((bestScore, report) => Math.max(bestScore, getMatchScore(report, candidate)), 0);
  return candidates
    .filter((candidate) => candidate.status !== 'Resolved')
    .sort((a, b) => scoreFor(b) - scoreFor(a) || new Date(b.createdAt) - new Date(a.createdAt));
};

export default function LostFound({ type = 'lost' }) {
  const [items, setItems] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [f, setF] = useState({
    itemName: '',
    category: 'ID Card',
    description: '',
    location: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [claimTarget, setClaimTarget] = useState(null);
  const [claimDetails, setClaimDetails] = useState('');
  const [handoverCodes, setHandoverCodes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');

  const refreshItems = async () => {
    const [itemResponse, relatedResponse, claimsResponse] = await Promise.all([
      api.get(`/lost-found/${type}`),
      api.get(`/lost-found/${type === 'lost' ? 'found' : 'lost'}`),
      api.get('/lost-found/claims/mine'),
    ]);
    setItems(itemResponse.data);
    setRelatedItems(relatedResponse.data);
    setClaims(claimsResponse.data);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [itemResponse, relatedResponse, claimsResponse] = await Promise.all([
          api.get(`/lost-found/${type}`),
          api.get(`/lost-found/${type === 'lost' ? 'found' : 'lost'}`),
          api.get('/lost-found/claims/mine'),
        ]);
        if (!active) return;
        setItems(itemResponse.data);
        setRelatedItems(relatedResponse.data);
        setClaims(claimsResponse.data);
      } catch (requestError) {
        if (active)
          setError(requestError.response?.data?.message || 'Could not load Lost & Found reports.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [type]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMsg('');
    try {
      const formData = new FormData();
      Object.entries(f).forEach(([key, value]) => formData.append(key, value));
      if (file) formData.append('image', file);
      await api.post(`/lost-found/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg('Report submitted. It will appear to students after admin approval.');
      setF({
        itemName: '',
        category: 'ID Card',
        description: '',
        location: '',
        date: new Date().toISOString().slice(0, 10),
      });
      setFile(null);
      await refreshItems();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit report.');
    }
  };

  const submitClaim = async (event) => {
    event.preventDefault();
    if (!claimTarget) return;
    setBusyAction(`claim-${claimTarget._id}`);
    setError('');
    setMsg('');
    try {
      await api.post(`/lost-found/${claimTarget.type}/${claimTarget._id}/claims`, {
        details: claimDetails,
      });
      setMsg('Your claim was sent to the admin for verification.');
      setClaimTarget(null);
      setClaimDetails('');
      await refreshItems();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit claim.');
    } finally {
      setBusyAction('');
    }
  };

  const confirmHandover = async (claim) => {
    setBusyAction(`handover-${claim._id}`);
    setError('');
    try {
      await api.post(`/lost-found/claims/${claim._id}/confirm-handover`, {
        code: handoverCodes[claim._id] || '',
      });
      setHandoverCodes((current) => ({ ...current, [claim._id]: '' }));
      setMsg('Your confirmation was saved.');
      await refreshItems();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not confirm handover.');
    } finally {
      setBusyAction('');
    }
  };

  const requestNewHandoverCode = async (claim) => {
    setBusyAction(`code-${claim._id}`);
    setError('');
    try {
      const response = await api.post(`/lost-found/claims/${claim._id}/handover-code`);
      setMsg(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send a new handover code.');
    } finally {
      setBusyAction('');
    }
  };

  const relatedType = type === 'lost' ? 'found' : 'lost';
  const matchedItems = sortByMatch(
    items,
    relatedItems.map((item) => ({ ...item, type: relatedType }))
  );
  const hasSubmittedClaim = (item) =>
    claims.some(
      (claim) =>
        String(claim.item?._id) === String(item._id) &&
        claim.itemType === item.type &&
        (claim.status === 'Pending' || claim.status === 'Approved' || claim.status === 'Returned')
    );

  const renderItem = (item, itemType, canClaim = false) => (
    <article key={`${itemType}-${item._id}`} className="rounded-xl border border-slate-200 p-4">
      {item.image && (
        <a href={item.image} target="_blank" rel="noreferrer">
          <img
            src={item.image}
            alt={`Reported ${itemType} item: ${item.itemName}`}
            className="mb-3 h-40 w-full rounded-lg object-cover"
          />
        </a>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="font-bold">{item.itemName}</div>
        <span className="badge">{item.status || 'Open'}</span>
      </div>
      {item.isMine && item.reviewStatus && (
        <p className="mt-1 text-xs text-slate-500">Admin review: {item.reviewStatus}</p>
      )}
      <div className="text-sm text-slate-500">
        {item.category} · {item.location || 'Location not provided'}
        {item.date && ` · ${new Date(item.date).toLocaleDateString()}`}
      </div>
      {item.description && <div className="mt-2 text-sm">{item.description}</div>}
      {canClaim && !item.isMine && !hasSubmittedClaim(item) && (
        <button
          type="button"
          className="btn-primary mt-3 px-4 py-2 text-sm"
          onClick={() => {
            setClaimTarget({ _id: item._id, type: item.type, itemName: item.itemName });
            setClaimDetails('');
            setError('');
            setMsg('');
          }}
        >
          {item.type === 'found' ? 'This is my item' : 'I found this item'}
        </button>
      )}
      {canClaim && item.isMine && <p className="mt-3 text-xs text-slate-500">Your report</p>}
      {canClaim && !item.isMine && hasSubmittedClaim(item) && (
        <p className="mt-3 text-xs text-slate-500">
          You already submitted a claim for this report.
        </p>
      )}
    </article>
  );

  return (
    <section>
      <div className="card mb-6">
        <h1 className="page-title">Report {type === 'lost' ? 'Lost' : 'Found'} Item</h1>
        <p className="section-sub mb-6">
          {type === 'lost'
            ? 'Share the missing item details so the campus community can help.'
            : 'Help reconnect a campus item with its rightful owner.'}
        </p>
        {msg && (
          <div role="status" className="notice mb-4">
            {msg}
          </div>
        )}
        {error && (
          <div role="alert" className="notice mb-4">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <input
            className="field"
            placeholder="Item Name"
            value={f.itemName}
            onChange={(event) => setF({ ...f, itemName: event.target.value })}
            required
          />
          <select
            className="field"
            value={f.category}
            onChange={(event) => setF({ ...f, category: event.target.value })}
          >
            {['ID Card', 'Wallet', 'Mobile', 'Bag', 'Book', 'Water Bottle', 'Other'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input
            className="field"
            placeholder={type === 'lost' ? 'Lost Location' : 'Found Location'}
            value={f.location}
            onChange={(event) => setF({ ...f, location: event.target.value })}
            required
          />
          <input
            className="field"
            type="date"
            value={f.date}
            onChange={(event) => setF({ ...f, date: event.target.value })}
            required
          />
          <textarea
            className="field min-h-28 md:col-span-2"
            placeholder="Description and identifying details"
            value={f.description}
            onChange={(event) => setF({ ...f, description: event.target.value })}
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

      {claimTarget && (
        <form onSubmit={submitClaim} className="card mb-6">
          <h2 className="section-title">Submit claim for {claimTarget.itemName}</h2>
          <p className="section-sub mt-1">
            Give identifying details that are not already visible in the report. Admin will review
            this before contact details are shared.
          </p>
          <textarea
            className="field mt-4 min-h-28"
            value={claimDetails}
            onChange={(event) => setClaimDetails(event.target.value)}
            maxLength={1000}
            placeholder="Describe a private identifying detail or evidence of ownership / finding."
            required
          />
          <div className="mt-3 flex gap-2">
            <button
              className="btn-primary px-4 py-2 text-sm"
              disabled={busyAction.startsWith('claim-')}
            >
              Submit claim
            </button>
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm"
              onClick={() => setClaimTarget(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <h2 className="section-title">Recent {type === 'lost' ? 'Lost' : 'Found'} Items</h2>
        {!isLoading && items.length === 0 && (
          <p className="section-sub mt-4">No approved {type} item reports yet.</p>
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {items.map((item) => renderItem(item, type))}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="section-title">Possible {type === 'lost' ? 'Found' : 'Lost'} Matches</h2>
        <p className="section-sub mt-1">
          Similar category, item name and date reports appear first. Phone numbers are never shown
          on public item cards.
        </p>
        {!isLoading && matchedItems.length === 0 && (
          <p className="section-sub mt-4">No possible {relatedType} matches are available yet.</p>
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {matchedItems.map((item) => renderItem(item, relatedType, true))}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="section-title">My claims and handovers</h2>
        <div className="mt-4 space-y-3">
          {claims.map((claim) => (
            <article key={claim._id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{claim.item?.itemName}</div>
                  <p className="mt-1 text-sm text-slate-600">
                    {claim.itemType === 'found' ? 'Found item claim' : 'Response to lost item'} ·{' '}
                    {claim.counterpart?.name}
                  </p>
                  {claim.status === 'Approved' || claim.status === 'Returned' ? (
                    claim.counterpart?.phoneShared ? (
                      <p className="mt-1 text-sm">Contact number: {claim.counterpart.phone}</p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        No phone number was shared. Arrange the handover through a trusted,
                        campus-approved channel.
                      </p>
                    )
                  ) : null}
                </div>
                <span className="badge">{claim.status}</span>
              </div>
              {claim.status === 'Pending' && (
                <p className="mt-3 text-sm text-slate-500">Waiting for admin review.</p>
              )}
              {(claim.status === 'Approved' || claim.status === 'Returned') && (
                <div className="mt-3 space-y-2 text-sm">
                  <p>
                    Owner:{' '}
                    {claim.ownerConfirmed ? 'confirmed receipt' : 'waiting to confirm receipt'}
                  </p>
                  <p>
                    Finder:{' '}
                    {claim.finderConfirmed ? 'confirmed handover' : 'waiting to confirm handover'}
                  </p>
                  {claim.isOwner && !claim.finderConfirmed && (
                    <p className="text-xs text-slate-500">
                      A one-time code was sent to your notifications. Share it with the finder only
                      when the item is physically handed over.
                    </p>
                  )}
                  {claim.isFinder && !claim.finderConfirmed && (
                    <label className="block text-xs text-slate-600">
                      One-time code from the owner
                      <input
                        className="field mt-1 max-w-xs"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={handoverCodes[claim._id] || ''}
                        onChange={(event) =>
                          setHandoverCodes((current) => ({
                            ...current,
                            [claim._id]: event.target.value.replace(/\D/g, '').slice(0, 6),
                          }))
                        }
                        required
                      />
                    </label>
                  )}
                  {claim.status === 'Approved' && (
                    <button
                      type="button"
                      className="btn-primary mt-2 px-4 py-2 text-sm"
                      disabled={
                        busyAction === `handover-${claim._id}` ||
                        (claim.isOwner && claim.ownerConfirmed) ||
                        (claim.isFinder && claim.finderConfirmed) ||
                        (claim.isFinder && (handoverCodes[claim._id] || '').length !== 6)
                      }
                      onClick={() => confirmHandover(claim)}
                    >
                      {claim.isOwner
                        ? claim.ownerConfirmed
                          ? 'Receipt confirmed'
                          : 'I received the item'
                        : claim.finderConfirmed
                          ? 'Handover confirmed'
                          : 'I handed over the item'}
                    </button>
                  )}
                  {claim.isOwner && claim.status === 'Approved' && !claim.finderConfirmed && (
                    <button
                      type="button"
                      className="ml-2 mt-2 rounded-lg border px-4 py-2 text-sm"
                      disabled={busyAction === `code-${claim._id}`}
                      onClick={() => requestNewHandoverCode(claim)}
                    >
                      Send a new code
                    </button>
                  )}
                  {claim.status === 'Returned' && (
                    <p className="font-semibold text-green-700">
                      Handover confirmed by both students.
                    </p>
                  )}
                </div>
              )}
              {claim.status === 'Rejected' && (
                <p className="mt-3 text-sm text-red-700">The admin did not approve this claim.</p>
              )}
            </article>
          ))}
          {!isLoading && claims.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">No claims or handovers yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
