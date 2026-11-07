import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Tractor, ShoppingBag } from 'lucide-react';

export default function Auth({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Buyer',
    farmName: '',
    location: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = isRegister
        ? await register(form)
        : await login({ email: form.email, password: form.password });
      nav(u.role === 'Admin' ? '/dashboard' : u.role === 'Farmer' ? '/dashboard' : '/');
    } catch (e) {
      setError(e.response?.data?.message || 'Authentication request failed');
    } finally {
      setBusy(false);
    }
  }

  async function fillDemo(email, password) {
    setForm(prev => ({ ...prev, email, password }));
    setBusy(true);
    setError('');
    try {
      const u = await login({ email, password });
      nav(u.role === 'Admin' || u.role === 'Farmer' ? '/dashboard' : '/');
    } catch (e) {
      setError(e.response?.data?.message || 'Demo login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">AGRICONNECT DIRECT</span>
        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">
          {isRegister
            ? 'Join farmers and buyers building a transparent produce marketplace.'
            : 'Sign in to access your dashboard, listings, and orders.'}
        </p>

        {!isRegister && (
          <div className="demo-accounts-box">
            <span className="demo-title">⚡ Quick 1-Click Demo Login:</span>
            <div className="demo-buttons">
              <button
                type="button"
                className="demo-btn farmer-btn"
                onClick={() => fillDemo('ramesh@farm.com', 'Farmer123!')}
              >
                <Tractor size={15} /> Farmer (Ramesh)
              </button>
              <button
                type="button"
                className="demo-btn buyer-btn"
                onClick={() => fillDemo('priya@market.com', 'Buyer123!')}
              >
                <ShoppingBag size={15} /> Buyer (Priya)
              </button>
              <button
                type="button"
                className="demo-btn admin-btn"
                onClick={() => fillDemo('admin@agriconnect.com', 'ChangeMe123!')}
              >
                <ShieldCheck size={15} /> Admin
              </button>
            </div>
          </div>
        )}

        {isRegister && (
          <>
            <label>
              Full name
              <input name="name" value={form.name} onChange={change} required placeholder="e.g. Ramesh Patel" />
            </label>
            <label>
              Account type
              <select name="role" value={form.role} onChange={change}>
                <option value="Buyer">Buyer (Consumer / Restaurant / Retailer)</option>
                <option value="Farmer">Farmer (Grower / Producer)</option>
              </select>
            </label>
            {form.role === 'Farmer' && (
              <>
                <label>
                  Farm name
                  <input name="farmName" value={form.farmName} onChange={change} placeholder="e.g. Green Valley Organic Farm" required />
                </label>
                <label>
                  Farm location
                  <input name="location" value={form.location} onChange={change} placeholder="e.g. Nashik, Maharashtra" required />
                </label>
              </>
            )}
            <label>
              Phone number
              <input name="phone" value={form.phone} onChange={change} placeholder="e.g. +91 98765 43210" required />
            </label>
            <label>
              Delivery address / Primary address
              <input name="address" value={form.address} onChange={change} placeholder="Street, City, State, PIN" />
            </label>
          </>
        )}

        <label>
          Email address
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={change}
            required
            placeholder="you@domain.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            minLength="8"
            value={form.password}
            onChange={change}
            required
            placeholder="At least 8 characters"
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="primary-button full" disabled={busy}>
          {busy ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>

        <p className="muted center">
          {isRegister ? 'Already have an account?' : 'New to AgriConnect?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </form>
    </main>
  );
}
