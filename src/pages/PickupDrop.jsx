// src/pages/PickupDrop.jsx
// Book a Driver — send a driver to move your car from Point A to Point B,
// or book a driver to travel with you. Two modes:
//   "Drive My Car"    — driver picks up the car and takes it solo
//   "Travel with Me"  — driver accompanies you in your car

import { useState } from 'react';
import { Car, User, Check, ChevronRight, MapPin, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_PICKUP_STATUS } from '../data/mockData';

const TIME_SLOTS = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
];

const DRIVER_STEPS = [
  { label: 'Requested',        sub: 'Driver booking submitted' },
  { label: 'Driver Assigned',  sub: 'A driver has been assigned to you' },
  { label: 'Driver En Route',  sub: 'Driver is heading to your pickup point' },
  { label: 'Trip in Progress', sub: 'Your vehicle is on the move' },
  { label: 'Completed',        sub: 'Trip completed successfully' },
];

const MODE_OPTIONS = [
  {
    value: 'solo',
    icon: Car,
    label: 'Drive My Car',
    desc: 'Our driver picks up your car and delivers it to the destination — you don\'t need to be in the car.',
  },
  {
    value: 'accompanied',
    icon: User,
    label: 'Travel with Driver',
    desc: 'Driver comes to your location and drives your car while you sit back. Ideal for long trips or unfamiliar routes.',
  },
];

export default function PickupDrop() {
  const { state, dispatch } = useApp();
  const { vehicles, pickupRequest } = state;

  const [vehicleId, setVehicleId]       = useState(vehicles[0]?.id || '');
  const [tripMode, setTripMode]         = useState('solo');
  const [pickupLocation, setPickupLoc]  = useState('');
  const [dropLocation, setDropLoc]      = useState('');
  const [date, setDate]                 = useState('');
  const [time, setTime]                 = useState('');
  const [notes, setNotes]               = useState('');
  const [formError, setFormError]       = useState('');

  function handleRequest() {
    if (!vehicleId || !pickupLocation || !dropLocation || !date || !time) {
      setFormError('Please fill in all fields.');
      return;
    }
    const vehicle = vehicles.find(v => v.id === vehicleId);
    dispatch({
      type: 'REQUEST_PICKUP',
      payload: {
        vehicleId,
        vehicleName: `${vehicle.brand} ${vehicle.model}`,
        registration: vehicle.registration,
        tripMode,
        pickupLocation,
        dropLocation,
        date,
        time,
        notes,
        centerName: dropLocation,
      },
    });
  }

  function handleAdvance() {
    dispatch({ type: 'ADVANCE_PICKUP' });
  }

  function handleCancel() {
    dispatch({ type: 'CLEAR_PICKUP' });
  }

  // Active trip status view
  if (pickupRequest) {
    const step = pickupRequest.step;
    const isComplete = step >= 4;
    const isSolo = pickupRequest.tripMode === 'solo';

    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Book a Driver</h1>
          <p className="page-subtitle">Track your active trip</p>
        </div>

        {/* Trip info banner */}
        <div className="card card-sm" style={{ marginBottom: 16, background: 'var(--color-surface2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Trip Details
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flex: 1, minWidth: 160 }}>
              <MapPin size={13} style={{ color: 'var(--color-green)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>From</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{pickupRequest.pickupLocation}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flex: 1, minWidth: 160 }}>
              <MapPin size={13} style={{ color: 'var(--color-red)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>To</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{pickupRequest.dropLocation}</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Vehicle</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{pickupRequest.vehicleName}</div>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Mode</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                {isSolo ? 'Drive My Car' : 'Travel with Driver'}
              </div>
            </div>
          </div>
        </div>

        <div className="status-tracker" style={{ marginBottom: 20 }}>
          {/* Driver card */}
          <div className="driver-card">
            <div className="mechanic-avatar">{MOCK_PICKUP_STATUS.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{MOCK_PICKUP_STATUS.driver}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {isSolo ? 'Assigned Driver' : 'Your Driver'} &middot; {MOCK_PICKUP_STATUS.driverPhone}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Scheduled: {pickupRequest.time}, {pickupRequest.date}
              </div>
            </div>
            {step >= 1 && step < 4 && (
              <span className="badge badge-blue">En route</span>
            )}
            {isComplete && <span className="badge badge-green"><Check size={10} /> Done</span>}
          </div>

          {step >= 1 && step < 4 && (
            <a
              href={`tel:${MOCK_PICKUP_STATUS.driverPhone}`}
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none', marginBottom: 16 }}
            >
              <Phone size={13} /> Call Driver
            </a>
          )}

          {/* Timeline */}
          <div className="timeline">
            {DRIVER_STEPS.map((s, i) => {
              const isDone   = i < step;
              const isActive = i === step;
              return (
                <div key={s.label} className={`timeline-item${isDone ? ' done' : ''}`}>
                  <div className={`timeline-dot${isDone ? ' done' : isActive ? ' active' : ''}`}>
                    {isDone && <Check size={10} color="#fff" />}
                  </div>
                  <div className="timeline-content">
                    <div
                      className={`timeline-label${isActive ? ' font-semibold' : ''}`}
                      style={{ color: isDone ? 'var(--color-text-muted)' : isActive ? 'var(--color-text)' : 'var(--color-text-faint)' }}
                    >
                      {s.label}
                    </div>
                    {(isDone || isActive) && (
                      <div className="timeline-sub">{s.sub}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {!isComplete && (
            <button className="btn btn-primary btn-sm" onClick={handleAdvance} id="btn-advance-pickup">
              <ChevronRight size={14} /> Simulate Next Step
            </button>
          )}
          {isComplete && (
            <div style={{
              padding: '10px 16px', background: 'var(--color-green-bg)',
              border: '1px solid var(--color-green-border)', borderRadius: 'var(--radius)',
              fontSize: '0.875rem', color: 'var(--color-green)', fontWeight: 500,
            }}>
              Trip completed — {pickupRequest.vehicleName} delivered to {pickupRequest.dropLocation}
            </div>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
            {isComplete ? 'Close' : 'Cancel Trip'}
          </button>
        </div>
      </div>
    );
  }

  // Booking form
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Book a Driver</h1>
        <p className="page-subtitle">Get a driver to move your car — solo or with you on board</p>
      </div>

      <div className="booking-layout">
        <div className="card">
          {/* Mode selection */}
          <div style={{ marginBottom: 20 }}>
            <p className="section-title">Select Mode</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {MODE_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const selected = tripMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTripMode(opt.value)}
                    style={{
                      flex: 1, minWidth: 180, textAlign: 'left',
                      padding: '14px 16px', border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      background: selected ? '#f0f4f8' : 'var(--color-surface)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Icon size={18} style={{ color: selected ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: selected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                        {opt.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Vehicle */}
            {vehicles.length > 0 && (
              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select className="form-select" value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} — {v.registration}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pickup location */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--color-green)' }} />
                Pickup Location *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={tripMode === 'solo' ? 'Where is your car parked?' : 'Where should the driver meet you?'}
                value={pickupLocation}
                onChange={e => { setPickupLoc(e.target.value); setFormError(''); }}
              />
            </div>

            {/* Drop location */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--color-red)' }} />
                Drop-off Location *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={tripMode === 'solo' ? 'Where should your car be delivered?' : 'Where are you headed?'}
                value={dropLocation}
                onChange={e => { setDropLoc(e.target.value); setFormError(''); }}
              />
            </div>

            {/* Date and time */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => { setDate(e.target.value); setFormError(''); }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <select className="form-select" value={time} onChange={e => { setTime(e.target.value); setFormError(''); }}>
                  <option value="">Select time</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Special instructions (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g., Gate code, parking instructions, preferred route…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {formError && <p style={{ color: 'var(--color-red)', fontSize: '0.82rem' }}>{formError}</p>}

            <button className="btn btn-primary" onClick={handleRequest} id="btn-request-pickup">
              <Car size={15} /> Confirm Booking
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <p className="section-title">How it Works</p>
          {(tripMode === 'solo' ? [
              ['1', 'Enter your car\'s current location and where it needs to go.'],
              ['2', 'A verified CarCare driver is assigned and heads to your car.'],
              ['3', 'Driver picks up your car and drives it to the destination.'],
              ['4', 'You get a confirmation when the car is delivered safely.'],
            ] : [
              ['1', 'Enter your location and destination.'],
              ['2', 'A verified CarCare driver arrives at your location.'],
              ['3', 'Driver takes the wheel while you relax in your own car.'],
              ['4', 'You arrive at your destination safely without driving.'],
            ]
          ).map(([n, text]) => (
            <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--color-primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: 1,
              }}>{n}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}

          <div style={{
            marginTop: 8, padding: '10px 14px',
            background: 'var(--color-surface2)', borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)', fontSize: '0.78rem', color: 'var(--color-text-muted)',
          }}>
            All CarCare drivers are background-verified with valid driving licenses.
          </div>
        </div>
      </div>
    </div>
  );
}
