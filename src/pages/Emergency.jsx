// src/pages/Emergency.jsx
// Emergency roadside assistance with SOS flow and mock technician assignment

import { useState, useEffect } from 'react';
import { AlertTriangle, Circle, BatteryLow, Settings, Fuel, HelpCircle, MapPin, Phone, Users, Check, Wrench, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EMERGENCY_TYPES, assignMechanic } from '../data/mockData';

// Icon lookup for emergency types
const ICON_MAP = {
  'flat_tyre':  Circle,
  'battery':    BatteryLow,
  'engine':     Settings,
  'fuel':       Fuel,
  'accident':   AlertTriangle,
  'other':      HelpCircle,
};

export default function Emergency({ onNavigate }) {
  const { state, dispatch } = useApp();
  const { emergencyState } = state;

  const [locating, setLocating] = useState(false);
  const [locationFound, setLocationFound] = useState(false);

  // Auto-progress from searching → found after a delay
  useEffect(() => {
    if (emergencyState?.phase === 'searching') {
      // First simulate location detection
      const t1 = setTimeout(() => setLocationFound(true), 1200);
      // Then simulate finding a mechanic from one of our service centers
      const t2 = setTimeout(() => {
        dispatch({ type: 'EMERGENCY_FOUND', payload: assignMechanic() });
      }, 3500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [emergencyState?.phase]);

  // Auto-progress from found → arrived, simulating the technician's drive
  // over (sped up for the demo rather than waiting the real ETA).
  useEffect(() => {
    if (emergencyState?.phase === 'found') {
      const t = setTimeout(() => {
        dispatch({ type: 'EMERGENCY_ARRIVED' });
      }, 8000 + Math.random() * 4000);
      return () => clearTimeout(t);
    }
  }, [emergencyState?.phase]);

  // Auto-progress from working → ready_to_confirm, simulating the repair
  // itself taking a bit of time once the user confirms arrival.
  useEffect(() => {
    if (emergencyState?.phase === 'working') {
      const t = setTimeout(() => {
        dispatch({ type: 'EMERGENCY_WORK_COMPLETE' });
      }, 6000 + Math.random() * 4000);
      return () => clearTimeout(t);
    }
  }, [emergencyState?.phase]);

  function handleConfirmArrival() {
    dispatch({ type: 'EMERGENCY_CONFIRM_ARRIVAL' });
  }

  function handleConfirmResolved() {
    dispatch({ type: 'EMERGENCY_RESOLVED' });
  }

  function handleSelectType(typeId) {
    dispatch({ type: 'EMERGENCY_SET_TYPE', payload: typeId });
  }

  function handleSOS() {
    setLocating(true);
    dispatch({ type: 'EMERGENCY_SOS' });
  }

  function handleReset() {
    setLocating(false);
    setLocationFound(false);
    dispatch({ type: 'EMERGENCY_RESET' });
  }

  const phase = emergencyState?.phase;
  const selectedType = EMERGENCY_TYPES.find(t => t.id === emergencyState?.type);

  // Phase: resolved — technician confirmed done, request closed out
  if (phase === 'resolved') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Emergency Assistance</h1>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--color-green-bg)', border: '1px solid var(--color-green-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle2 size={28} style={{ color: 'var(--color-green)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Issue Resolved</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 6, maxWidth: 340 }}>
                {emergencyState.mechanic?.name} completed the job for your {selectedType?.label.toLowerCase()} issue.
                A record has been added to your Service History.
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 8 }}
              onClick={() => { handleReset(); onNavigate('dashboard'); }}
              id="btn-emergency-resolved-done"
            >
              Done — Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase: arrived — technician is on-site, awaiting user's confirmation
  // that they're actually there before work "starts".
  if (phase === 'arrived') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Emergency Assistance</h1>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Reported issue: </span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedType?.label}</span>
          <span className="badge badge-green" style={{ marginLeft: 10 }}>Technician on site</span>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <p className="section-title">Technician Has Arrived</p>
          <div className="mechanic-card">
            <div className="mechanic-avatar">{emergencyState.mechanic.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{emergencyState.mechanic.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{emergencyState.mechanic.role}</div>
            </div>
            <a
              href={`tel:${emergencyState.mechanic.phone}`}
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              <Phone size={13} /> Call
            </a>
          </div>
        </div>

        <div className="card" style={{ borderColor: 'var(--color-green-border)', background: 'var(--color-green-bg)' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>Is the technician with you?</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
            Confirm they've reached you so we can mark the job as in progress.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleConfirmArrival}
            id="btn-confirm-arrival"
          >
            <Check size={15} /> Confirm Arrival
          </button>
        </div>
      </div>
    );
  }

  // Phase: working — user confirmed arrival, technician is on the job
  if (phase === 'working') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Emergency Assistance</h1>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Reported issue: </span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedType?.label}</span>
          <span className="badge badge-green" style={{ marginLeft: 10 }}>Work in progress</span>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="mechanic-card">
            <div className="mechanic-avatar">{emergencyState.mechanic.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{emergencyState.mechanic.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{emergencyState.mechanic.role}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div className="spinner" style={{ width: 30, height: 30, borderWidth: 3 }} />
            <div>
              <div style={{ fontWeight: 600 }}>Working on your vehicle…</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                {emergencyState.mechanic.name.split(' ')[0]} is handling your {selectedType?.label.toLowerCase()} issue.
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => dispatch({ type: 'EMERGENCY_WORK_COMPLETE' })}
              id="btn-manual-work-complete"
              style={{ color: 'var(--color-text-muted)', marginTop: 4 }}
            >
              Technician says it's done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase: ready_to_confirm — technician finished, awaiting final sign-off
  if (phase === 'ready_to_confirm') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Emergency Assistance</h1>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Reported issue: </span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedType?.label}</span>
          <span className="badge badge-blue" style={{ marginLeft: 10 }}>Work completed</span>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="mechanic-card">
            <div className="mechanic-avatar">{emergencyState.mechanic.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{emergencyState.mechanic.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{emergencyState.mechanic.role}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ borderColor: 'var(--color-green-border)', background: 'var(--color-green-bg)' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>
            {emergencyState.mechanic.name.split(' ')[0]} says the job is done — has it been fixed?
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
            Once you confirm, we'll close this request and log the visit to your Service History.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleConfirmResolved}
            id="btn-confirm-work-done"
          >
            <Check size={15} /> Confirm — Issue Fixed
          </button>
        </div>
      </div>
    );
  }

  // Phase: found — show mechanic card
  if (phase === 'found' || phase === 'cancelled_by_community') {
    const isCancelled = phase === 'cancelled_by_community';
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Emergency Assistance</h1>
        </div>

        {isCancelled ? (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--color-green-bg)', border: '1px solid var(--color-green-border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--color-green)', fontWeight: 500 }}>
            Community assistance resolved your issue. Professional request has been cancelled.
          </div>
        ) : null}

        {/* Problem recap */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Reported issue: </span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedType?.label}</span>
          <span className="badge badge-green" style={{ marginLeft: 10 }}>Location detected</span>
        </div>

        {/* Mechanic card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <p className="section-title">
            {isCancelled ? 'Request Cancelled' : 'Nearest Technician Found'}
          </p>
          <div className={`mechanic-card${isCancelled ? ' ' : ''}`} style={{ opacity: isCancelled ? 0.5 : 1 }}>
            <div className="mechanic-avatar">{emergencyState.mechanic.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{emergencyState.mechanic.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {emergencyState.mechanic.role}
                {emergencyState.mechanic.centerName && ` · Dispatched from ${emergencyState.mechanic.centerName}`}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
                  {emergencyState.mechanic.distance}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>
                  ETA: {isCancelled ? 'Cancelled' : `${emergencyState.mechanic.eta} min`}
                </span>
              </div>
            </div>
            {!isCancelled && (
              <a
                href={`tel:${emergencyState.mechanic.phone}`}
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                <Phone size={13} /> Call
              </a>
            )}
          </div>
        </div>

        {/* Community ping option — only if ETA > 15 min and not cancelled */}
        {!isCancelled && emergencyState.mechanic.eta > 15 && (
          <div className="card" style={{ borderColor: 'var(--color-amber-border)', background: 'var(--color-amber-bg)' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>Need help sooner?</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
              Ping verified CarCare users within 3 km. Someone nearby may arrive before the technician.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate('community-ping')}
                id="btn-ping-nearby"
              >
                <Users size={15} /> Ping Nearby Drivers
              </button>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-amber)', fontWeight: 500 }}>
                Reward: +50 Credits
              </span>
            </div>
          </div>
        )}

        {isCancelled ? (
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: 16 }}
            onClick={() => { handleReset(); onNavigate('dashboard'); }}
            id="btn-emergency-done"
          >
            Done — Back to Dashboard
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleReset} id="btn-cancel-emergency">
              Cancel Emergency Request
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => dispatch({ type: 'EMERGENCY_ARRIVED' })}
              id="btn-manual-arrived"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Technician has arrived
            </button>
          </div>
        )}
      </div>
    );
  }

  // Phase: searching
  if (phase === 'searching') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Emergency Assistance</h1>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {!locationFound ? (
              <>
                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Detecting your location…</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    This will only take a moment
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={20} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Location detected</span>
                </div>
                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Finding nearest CarCare technician…</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Checking availability in your area
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Initial view: select emergency type + SOS button
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Emergency Assistance</h1>
      </div>

      <div className="emergency-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <AlertTriangle size={20} style={{ color: 'var(--color-red)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Need roadside assistance?</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Tell us what's wrong and we'll find the fastest available help near you.
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <p className="section-title">What's the problem?</p>
        <div className="emergency-type-grid">
          {EMERGENCY_TYPES.map(type => {
            const Icon = ICON_MAP[type.id] || HelpCircle;
            const selected = emergencyState?.type === type.id;
            return (
              <button
                key={type.id}
                className={`emergency-type-card${selected ? ' selected' : ''}`}
                onClick={() => handleSelectType(type.id)}
                id={`emergency-type-${type.id}`}
              >
                <Icon size={22} style={{ color: selected ? 'var(--color-red)' : 'var(--color-text-muted)' }} />
                <span className="emergency-type-label">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SOS Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 8 }}>
        <button
          className="sos-btn"
          onClick={handleSOS}
          disabled={!emergencyState?.type}
          style={{ opacity: emergencyState?.type ? 1 : 0.4, cursor: emergencyState?.type ? 'pointer' : 'not-allowed' }}
          id="btn-sos"
        >
          <AlertTriangle size={22} />
          <span style={{ fontSize: '0.9rem' }}>SOS</span>
        </button>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: 280 }}>
          {emergencyState?.type
            ? 'Press SOS to request immediate roadside assistance'
            : 'Select a problem type above to enable SOS'}
        </p>
      </div>
    </div>
  );
}
