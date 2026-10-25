import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Register() {
  const { requestRegistrationOtp, verifyRegistrationOtp } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    password: '',
  });
  const [err, setErr] = useState('');
  const [notice, setNotice] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setNotice('');
    setSubmitting(true);
    try {
      if (!otpSent) {
        const result = await requestRegistrationOtp(f);
        setOtpSent(true);
        setNotice(result.message);
      } else {
        await verifyRegistrationOtp(f.email, code);
        nav('/dashboard');
      }
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="ambient-background min-h-screen flex items-center justify-center p-5">
      <form onSubmit={submit} className="glass-panel w-full max-w-2xl rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-sm text-slate-500 mb-6">
          {otpSent
            ? `Enter the 6-digit verification code sent to ${f.email}. Check Spam or Promotions too; the subject is "Verify your Spotlyn account".`
            : 'Create your student account. We will email you a verification code.'}
        </p>
        {err && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-4">{err}</div>}
        {notice && (
          <div role="status" className="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm mb-4">
            {notice}
          </div>
        )}
        {!otpSent ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              name="name"
              className="field"
              placeholder="Full Name"
              onChange={change}
              required
            />
            <input
              name="email"
              type="email"
              className="field"
              placeholder="College Email"
              onChange={change}
              required
            />
            <input name="phone" className="field" placeholder="Phone" onChange={change} />
            <select name="department" className="field" value={f.department} onChange={change}>
              <option>Computer Science</option>
              <option>Information Technology</option>
              <option>Commerce</option>
              <option>Management</option>
              <option>Other</option>
            </select>
            <input
              name="password"
              type="password"
              className="field"
              placeholder="Password (at least 8 characters)"
              minLength={8}
              onChange={change}
              required
            />
          </div>
        ) : (
          <input
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="field w-full text-center tracking-[0.4em]"
            placeholder="6-digit code"
            aria-label="Email verification code"
            maxLength={6}
            pattern="[0-9]{6}"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />
        )}
        <button
          disabled={submitting}
          className="w-full mt-5 py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-60"
        >
          {submitting
            ? 'Please wait...'
            : otpSent
              ? 'Verify email and create account'
              : 'Send verification code'}
        </button>
        {otpSent && (
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm font-semibold">
            <button
              type="button"
              className="text-blue-600"
              disabled={submitting}
              onClick={async () => {
                setErr('');
                setNotice('');
                setSubmitting(true);
                try {
                  const result = await requestRegistrationOtp(f);
                  setNotice(result.message);
                } catch (e) {
                  setErr(e.response?.data?.message || 'Could not resend verification code.');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              Resend code
            </button>
            <button
              type="button"
              className="text-slate-600"
              onClick={() => {
                setOtpSent(false);
                setCode('');
                setNotice('');
                setErr('');
              }}
            >
              Change registration details
            </button>
          </div>
        )}
        <p className="text-center text-sm text-slate-500 mt-5">
          Already registered?{' '}
          <Link className="text-blue-600 font-semibold" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
