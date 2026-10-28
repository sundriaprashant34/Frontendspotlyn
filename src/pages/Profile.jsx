import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(user.profilePhoto || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sharePhone, setSharePhone] = useState(Boolean(user.sharePhoneForHandover));
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const photoInput = useRef(null);

  useEffect(() => {
    if (!photo) {
      setPreview(user.profilePhoto || '');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo, user.profilePhoto]);

  useEffect(() => {
    if (!error) return undefined;
    const timeoutId = window.setTimeout(() => setError(''), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [error]);

  useEffect(() => {
    setSharePhone(Boolean(user.sharePhoneForHandover));
  }, [user.sharePhoneForHandover]);

  const choosePhoto = (event) => {
    const selected = event.target.files?.[0];
    setMessage('');
    setError('');
    if (!selected) {
      setPhoto(null);
      return;
    }
    if (!selected.type.startsWith('image/')) {
      setError('Please choose an image file.');
      event.target.value = '';
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('Profile photos must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    setPhoto(selected);
    event.target.value = '';
    uploadPhoto(selected);
  };

  const uploadPhoto = async (selected) => {
    setSaving(true);
    setMessage('Uploading profile photo...');
    setError('');
    const formData = new FormData();
    formData.append('profilePhoto', selected);
    try {
      const response = await api.put('/users/profile', formData);
      updateUser(response.data.user);
      setPhoto(null);
      setMessage('Profile photo updated successfully.');
    } catch (requestError) {
      setPhoto(null);
      setMessage('');
      setError(requestError.response?.data?.message || 'Could not update profile photo.');
    } finally {
      setSaving(false);
    }
  };

  const savePrivacy = async () => {
    setSavingPrivacy(true);
    setError('');
    setMessage('');
    try {
      const response = await api.put('/users/profile', {
        sharePhoneForHandover: sharePhone,
      });
      updateUser(response.data.user);
      setMessage('Handover contact preference updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update contact preference.');
    } finally {
      setSavingPrivacy(false);
    }
  };

  return (
    <section className="card mx-auto max-w-3xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <button
          type="button"
          className="group relative h-28 w-28 shrink-0 self-center overflow-hidden rounded-full bg-marigold-100 text-aubergine-900 ring-4 ring-white shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-marigold-500 sm:self-auto"
          aria-label="Upload or change profile photo"
          title="Click to upload or change profile photo"
          aria-busy={saving}
          disabled={saving}
          onClick={() => photoInput.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt={`${user.name}'s profile`}
              className="h-full w-full object-cover transition duration-200 group-hover:brightness-75"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-4xl font-bold">
              {user.name?.[0]?.toUpperCase() || '?'}
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 bg-aubergine-950/75 py-2 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            Change photo
          </span>
        </button>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="pill">MY PROFILE</p>
          <h1 className="page-title mt-3 break-words">{user.name}</h1>
          <p className="section-sub mt-1">{user.department || user.staffDepartment || user.role}</p>
          <input
            ref={photoInput}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={choosePhoto}
          />
          {message && (
            <p role="status" className="mt-3 text-sm font-medium text-aubergine-700">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 border-t border-white/70 pt-6 sm:grid-cols-2">
        {[
          ['Email', user.email],
          ['Phone', user.phone || 'Not provided'],
          ['Department', user.department || user.staffDepartment || 'Not provided'],
          ['Role', user.role],
          ...(user.staffDesignation ? [['Designation', user.staffDesignation]] : []),
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/80 bg-white/55 p-4">
            <div className="text-xs text-slate-500">{label}</div>
            <div className="mt-1 break-words font-semibold text-aubergine-950">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-white/80 bg-white/55 p-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={sharePhone}
            disabled={!user.phone || savingPrivacy}
            onChange={(event) => setSharePhone(event.target.checked)}
          />
          <span>
            <span className="font-semibold">Share my phone for approved item handovers</span>
            <span className="mt-1 block text-slate-600">
              Your number is shared only with the other student after an admin approves the claim.
              It is never shown on public item cards.
              {!user.phone && ' Add a phone number before enabling this preference.'}
            </span>
          </span>
        </label>
        <button
          type="button"
          className="btn-primary mt-4 px-4 py-2 text-sm"
          disabled={savingPrivacy || sharePhone === Boolean(user.sharePhoneForHandover)}
          onClick={savePrivacy}
        >
          {savingPrivacy ? 'Saving…' : 'Save contact preference'}
        </button>
      </div>
    </section>
  );
}
