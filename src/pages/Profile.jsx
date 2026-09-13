// src/pages/Profile.jsx
// User profile with editable fields, preferences, and community toggle

import { useState } from 'react';
import { Check, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { state, dispatch } = useApp();
  const { user, credits, helperMode } = state;

  const [form, setForm] = useState({
    name:    user.name,
    email:   user.email,
    phone:   user.phone,
    city:    user.city,
    pincode: user.pincode || '',
  });
  const [notifPrefs, setNotifPrefs] = useState({
    serviceReminders: true,
    pingRequests:     true,
    promotions:       false,
  });
  const [emergencyPref, setEmergencyPref] = useState('community_first');
  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    dispatch({ type: 'UPDATE_PROFILE', payload: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function toggleHelperMode() {
    dispatch({ type: 'TOGGLE_HELPER_MODE' });
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your personal information and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Personal info */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className="profile-avatar-lg">{user.initials}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{user.email}</div>
              </div>
            </div>

            <p className="section-title">Personal Information</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-phone">Phone Number</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    className="form-input"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-city">City</label>
                  <input
                    id="profile-city"
                    type="text"
                    className="form-input"
                    value={form.city}
                    onChange={e => update('city', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-pincode">Pincode</label>
                <input
                  id="profile-pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-input"
                  value={form.pincode}
                  onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Used to find your nearest service center and assign the closest technician in an emergency.
                </p>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Notification preferences */}
          <div className="card">
            <p className="section-title">Notification Preferences</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'serviceReminders', label: 'Service reminders',    desc: 'Get reminded when your vehicle is due for service' },
                { key: 'pingRequests',     label: 'Community ping alerts', desc: 'Receive alerts when nearby drivers need help' },
                { key: 'promotions',       label: 'Promotions & offers',   desc: 'CarCare promotions and discount notifications' },
              ].map(pref => (
                <div key={pref.key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{pref.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{pref.desc}</div>
                  </div>
                  <label className="toggle-switch" style={{ flexShrink: 0, marginTop: 2 }}>
                    <input
                      type="checkbox"
                      checked={notifPrefs[pref.key]}
                      onChange={() => setNotifPrefs(p => ({ ...p, [pref.key]: !p[pref.key] }))}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency preferences */}
          <div className="card">
            <p className="section-title">Emergency Preferences</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: 'professional_first', label: 'Professional first', desc: 'Always prioritize CarCare technicians over community help' },
                { value: 'community_first',    label: 'Community first (faster)', desc: 'Ping community helpers before waiting for a technician' },
                { value: 'both',               label: 'Both simultaneously', desc: 'Request professional help and ping community at the same time' },
              ].map(opt => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                    border: `1px solid ${emergencyPref === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius)', cursor: 'pointer',
                    background: emergencyPref === opt.value ? '#f0f4f8' : 'var(--color-surface)',
                  }}
                >
                  <input
                    type="radio"
                    name="emergencyPref"
                    value={opt.value}
                    checked={emergencyPref === opt.value}
                    onChange={() => setEmergencyPref(opt.value)}
                    style={{ marginTop: 2 }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSave} id="btn-save-profile">
              {saved ? <><Check size={15} /> Saved</> : <><Save size={15} /> Save Changes</>}
            </button>
            {saved && (
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.82rem', color: 'var(--color-green)' }}>
                Profile updated successfully
              </span>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Community help toggle */}
          <div className="card">
            <p className="section-title">Community Help</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={helperMode}
                  onChange={toggleHelperMode}
                  id="profile-helper-toggle"
                />
                <span className="toggle-slider" />
              </label>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Available to Help</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
                  {helperMode ? 'You are active and visible to nearby drivers' : 'Enable to receive help requests'}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              When enabled, you can receive Ping requests from nearby CarCare users and earn credits by helping them.
            </p>
          </div>

          {/* Credit summary */}
          <div className="card">
            <p className="section-title">Credits</p>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-1px' }}>
                {credits}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Available Credits
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Earn credits by helping other drivers with flat tyres, battery issues, and fuel shortages.
            </div>
          </div>

          {/* Account info */}
          <div className="card">
            <p className="section-title">Account</p>
            {[
              ['Member since', 'January 2025'],
              ['Vehicles',     '2 registered'],
              ['Helps given',  '3 assists'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
