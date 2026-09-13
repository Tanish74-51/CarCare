// src/pages/BookService.jsx
// Multi-step service booking wizard — with a real month-view calendar for date selection.

import { useState, useMemo } from 'react';
import { Check, ChevronRight, ChevronLeft, CheckCircle, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  SERVICE_TYPES, SERVICE_CENTERS, TIME_SLOTS, getNearestServiceCenter,
} from '../data/mockData';

const STEPS = ['Vehicle', 'Service', 'Date', 'Time', 'Confirm'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ---------- Calendar Component ----------
function CalendarPicker({ value, onChange }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1); // at least tomorrow

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 60); // 2 months out

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  // Can we navigate?
  const canGoPrev = !(viewYear === minDate.getFullYear() && viewMonth <= minDate.getMonth());
  const canGoNext = !(viewYear === maxDate.getFullYear() && viewMonth >= maxDate.getMonth());

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const arr = [];
    // Empty cells before month start
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [viewYear, viewMonth]);

  function isDisabled(day) {
    if (!day) return true;
    const d = new Date(viewYear, viewMonth, day);
    if (d.getDay() === 0) return true; // Sunday
    if (d < minDate) return true;
    if (d > maxDate) return true;
    return false;
  }

  function formatValue(day) {
    const d = new Date(viewYear, viewMonth, day);
    return `${day} ${MONTHS[viewMonth].slice(0, 3)} ${viewYear}`;
  }

  function isSelected(day) {
    return value === formatValue(day);
  }

  return (
    <div className="calendar-widget">
      {/* Header */}
      <div className="calendar-header">
        <button
          className="calendar-nav-btn"
          onClick={prevMonth}
          disabled={!canGoPrev}
          type="button"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="calendar-month-label">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          className="calendar-nav-btn"
          onClick={nextMonth}
          disabled={!canGoNext}
          type="button"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="calendar-grid">
        {WEEKDAYS.map(w => (
          <div key={w} className="calendar-weekday">{w}</div>
        ))}
        {/* Day cells */}
        {cells.map((day, i) => {
          const disabled = isDisabled(day);
          const selected = day && isSelected(day);
          const isSun = day && new Date(viewYear, viewMonth, day).getDay() === 0;
          return (
            <button
              key={i}
              type="button"
              className={[
                'calendar-day',
                !day ? 'calendar-day-empty' : '',
                disabled ? 'calendar-day-disabled' : '',
                selected ? 'calendar-day-selected' : '',
                isSun && day ? 'calendar-day-sunday' : '',
              ].join(' ')}
              onClick={() => !disabled && day && onChange(formatValue(day))}
              disabled={disabled || !day}
            >
              {day || ''}
            </button>
          );
        })}
      </div>

      {value && (
        <div className="calendar-selected-label">
          Selected: <strong>{value}</strong>
        </div>
      )}
    </div>
  );
}

// ---------- Main Component ----------
export default function BookService({ onNavigate }) {
  const { state, dispatch } = useApp();
  const { vehicles } = state;

  // Default to the first of our 4 service centers.
  const nearestCenter = useMemo(() => getNearestServiceCenter(), []);

  const [step, setStep]               = useState(0);
  const [vehicleId, setVehicleId]     = useState(vehicles[0]?.id || '');
  const [serviceId, setServiceId]     = useState('');
  const [date, setDate]               = useState('');
  const [time, setTime]               = useState('');
  const [centerId, setCenterId]       = useState(nearestCenter.id);
  const [pickupMode, setPickupMode]   = useState('center');
  const [pickupAddress, setPickupAddress] = useState('');
  const [notes, setNotes]             = useState('');
  const [confirmed, setConfirmed]     = useState(false);

  const vehicle = vehicles.find(v => v.id === vehicleId);
  const service = SERVICE_TYPES.find(s => s.id === serviceId);
  const center  = SERVICE_CENTERS.find(c => c.id === centerId);

  function canAdvance() {
    if (step === 0) return !!vehicleId;
    if (step === 1) return !!serviceId;
    if (step === 2) return !!date;
    if (step === 3) return !!time;
    if (step === 4) return pickupMode === 'center' || !!pickupAddress;
    return false;
  }

  function handleConfirm() {
    dispatch({
      type: 'ADD_BOOKING',
      payload: {
        id: `b_${Date.now()}`,
        vehicle: `${vehicle.brand} ${vehicle.model}`,
        registration: vehicle.registration,
        service: service.name,
        date,
        time,
        center: center.name,
        pickupMode,
        pickupAddress: pickupMode === 'pickup' ? pickupAddress : null,
        notes,
        status: 'Confirmed',
      },
    });
    setConfirmed(true);
  }

  function resetFlow() {
    setStep(0);
    setVehicleId(vehicles[0]?.id || '');
    setServiceId('');
    setDate('');
    setTime('');
    setCenterId(nearestCenter.id);
    setPickupMode('center');
    setPickupAddress('');
    setNotes('');
    setConfirmed(false);
  }

  // Success state
  if (confirmed) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Book Service</h1>
        </div>
        <div className="card">
          <div className="success-banner">
            <div className="success-icon-wrap">
              <CheckCircle size={30} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Booking Confirmed</div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                Your appointment has been scheduled successfully.
              </p>
            </div>
            <div style={{
              background: 'var(--color-surface2)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', padding: '16px 20px', width: '100%', maxWidth: 360,
            }}>
              {[
                ['Vehicle',  `${vehicle?.brand} ${vehicle?.model}`],
                ['Service',  service?.name],
                ['Date',     date],
                ['Time',     time],
                ['Location', center?.name],
                ['Mode',     pickupMode === 'pickup' ? 'Pickup from address' : 'Drop at service center'],
              ].map(([k, v]) => (
                <div key={k} className="booking-summary-row">
                  <span className="booking-summary-key">{k}</span>
                  <span className="booking-summary-val">{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={resetFlow} id="btn-book-another">
                Book Another Service
              </button>
              <button className="btn btn-secondary" onClick={() => onNavigate?.('dashboard')}>
                <Home size={14} /> Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Book Service</h1>
        <p className="page-subtitle">Schedule a service appointment for your vehicle</p>
      </div>

      {/* Step bar */}
      <div className="step-bar">
        {STEPS.map((label, i) => (
          <div key={label} className="step-item">
            <div className={`step-circle ${i < step ? 'done' : i === step ? 'active' : ''}`}>
              {i < step ? <Check size={12} /> : i + 1}
            </div>
            <span className={`step-label ${i === step ? 'active' : ''}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`step-line${i < step ? ' done' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="booking-layout">
        {/* Left: step content */}
        <div className="card">
          {/* Step 0: Vehicle */}
          {step === 0 && (
            <div>
              <p className="section-title">Select Vehicle</p>
              {vehicles.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div className="empty-state-title">No vehicles added</div>
                  <div className="empty-state-desc">Go to My Vehicles to add your car first.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {vehicles.map(v => (
                    <label
                      key={v.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                        border: `1px solid ${vehicleId === v.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius)', cursor: 'pointer',
                        background: vehicleId === v.id ? '#f0f4f8' : 'var(--color-surface)',
                      }}
                    >
                      <input
                        type="radio"
                        name="vehicle"
                        value={v.id}
                        checked={vehicleId === v.id}
                        onChange={() => setVehicleId(v.id)}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{v.brand} {v.model}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {v.registration} &middot; {v.year} &middot; {v.fuelType}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Service */}
          {step === 1 && (
            <div>
              <p className="section-title">Select Service</p>
              <div className="service-option-grid">
                {SERVICE_TYPES.map(s => (
                  <div
                    key={s.id}
                    className={`service-option${serviceId === s.id ? ' selected' : ''}`}
                    onClick={() => setServiceId(s.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="service-option-name">{s.name}</div>
                    <div className="service-option-price">{s.price}</div>
                    <div className="service-option-price">{s.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date — Calendar */}
          {step === 2 && (
            <div>
              <p className="section-title">Select Date</p>
              <CalendarPicker value={date} onChange={setDate} />
            </div>
          )}

          {/* Step 3: Time */}
          {step === 3 && (
            <div>
              <p className="section-title">Select Time Slot</p>
              <div className="time-grid">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    className={`time-slot${time === t ? ' selected' : ''}`}
                    onClick={() => setTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirm details */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <p className="section-title">Service Center</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SERVICE_CENTERS.map(c => (
                    <label
                      key={c.id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                        border: `1px solid ${centerId === c.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius)', cursor: 'pointer',
                        background: centerId === c.id ? '#f0f4f8' : 'var(--color-surface)',
                      }}
                    >
                      <input type="radio" name="center" value={c.id} checked={centerId === c.id} onChange={() => setCenterId(c.id)} style={{ marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{c.name}</div>
                          {c.id === nearestCenter.id && (
                            <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>Nearest to you</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{c.address}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="section-title" style={{ marginBottom: 10 }}>Vehicle Drop-off</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { value: 'center', label: 'I will drop at the center' },
                    { value: 'pickup', label: 'Request vehicle pickup' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        flex: 1, padding: '12px 14px',
                        border: `1px solid ${pickupMode === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: pickupMode === opt.value ? '#f0f4f8' : 'var(--color-surface)',
                        fontSize: '0.875rem', fontWeight: 500,
                      }}
                    >
                      <input type="radio" name="pickup" value={opt.value} checked={pickupMode === opt.value} onChange={() => setPickupMode(opt.value)} />
                      {opt.label}
                    </label>
                  ))}
                </div>

                {pickupMode === 'pickup' && (
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label">Pickup Address *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter your address for pickup"
                      value={pickupAddress}
                      onChange={e => setPickupAddress(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Problem Description (optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe any specific issues you've noticed…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
            >
              Back
            </button>

            {step < 4 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
                id="btn-next-step"
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={!canAdvance()}
                id="btn-confirm-booking"
              >
                <Check size={15} /> Confirm Booking
              </button>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="booking-summary">
          <p className="section-title">Booking Summary</p>

          <div className="booking-summary-row">
            <span className="booking-summary-key">Vehicle</span>
            <span className="booking-summary-val">{vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}</span>
          </div>
          <div className="booking-summary-row">
            <span className="booking-summary-key">Service</span>
            <span className="booking-summary-val">{service ? service.name : '—'}</span>
          </div>
          <div className="booking-summary-row">
            <span className="booking-summary-key">Date</span>
            <span className="booking-summary-val">{date || '—'}</span>
          </div>
          <div className="booking-summary-row">
            <span className="booking-summary-key">Time</span>
            <span className="booking-summary-val">{time || '—'}</span>
          </div>
          <div className="booking-summary-row">
            <span className="booking-summary-key">Location</span>
            <span className="booking-summary-val">{center ? center.name : '—'}</span>
          </div>
          <div className="booking-summary-row">
            <span className="booking-summary-key">Drop-off</span>
            <span className="booking-summary-val">{pickupMode === 'pickup' ? 'Pickup requested' : 'Self drop-off'}</span>
          </div>

          {service && (
            <div className="cost-estimate">
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Estimated Cost</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{service.price}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Final amount may vary based on inspection
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
