// src/pages/Dashboard.jsx
// Main dashboard with vehicle summary, quick actions, and activity

import { useState, useEffect } from 'react';
import { CalendarCheck, Truck, AlertTriangle, Users, Clock, ChevronRight, Wrench, Sparkles, X, Car, ClipboardList } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TUTORIAL_STEPS = [
  { icon: Car,           title: 'Add your vehicle',        desc: 'Register your car so CarCare can track servicing and reminders for it.' },
  { icon: CalendarCheck, title: 'Book a service',          desc: 'Schedule maintenance at a nearby CarCare center, or request doorstep pickup.' },
  { icon: AlertTriangle, title: 'Stuck on the road?',       desc: 'Use Emergency Help for a technician, or Ping Nearby to reach other CarCare drivers.' },
];

export default function Dashboard({ onNavigate }) {
  const { state, dispatch } = useApp();
  const { user, vehicles, serviceHistory, bookings, onboarded, firstServicePromptSeen } = state;

  const primaryVehicle = vehicles[0];

  // A booking counts as "you've engaged with servicing this vehicle" even
  // before it's completed — without this, a vehicle with a confirmed
  // upcoming booking would still show "no service history", contradicting
  // what Service History actually displays.
  const primaryVehicleBooking = primaryVehicle
    ? bookings.find(b =>
        b.registration === primaryVehicle.registration ||
        b.vehicle === `${primaryVehicle.brand} ${primaryVehicle.model}`
      )
    : null;
  const primaryVehicleNeverEngaged =
    Boolean(primaryVehicle) && primaryVehicle.lastService === 'No record' && !primaryVehicleBooking;

  // Show the "book your first service" nudge only the very first time it's
  // eligible — captured once on mount so it doesn't disappear mid-visit, but
  // never reappears on later dashboard loads once seen.
  const [showFirstServicePrompt] = useState(
    () => primaryVehicleNeverEngaged && !firstServicePromptSeen
  );

  useEffect(() => {
    if (showFirstServicePrompt) {
      dispatch({ type: 'MARK_FIRST_SERVICE_PROMPT_SEEN' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentActivity = serviceHistory.slice(0, 3);

  // Upcoming: check bookings first, fall back to mock upcoming
  const upcoming = bookings[0] || null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.name.split(' ')[0];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="greeting">{greeting}, {firstName}</h1>
        <p className="greeting-sub">Here's what's happening with your vehicles.</p>
      </div>

      {/* First-time tutorial */}
      {!onboarded && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--color-primary)', position: 'relative' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => dispatch({ type: 'DISMISS_ONBOARDING' })}
            style={{ position: 'absolute', top: 12, right: 12 }}
            aria-label="Dismiss tutorial"
            id="btn-dismiss-onboarding"
          >
            <X size={15} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
            <p className="section-title" style={{ marginBottom: 0 }}>Welcome to CarCare</p>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
            Here's a quick look at what you can do:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
            {TUTORIAL_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <div className="quick-action-icon" style={{ flexShrink: 0 }}><Icon size={16} /></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{step.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('vehicles')} id="btn-onboarding-add-vehicle">
            Add Your First Vehicle
          </button>
        </div>
      )}

      {/* Vehicle summary bar */}
      {primaryVehicle && (
        <div className="vehicle-summary-bar">
          <div className="vehicle-summary-info">
            <div className="vehicle-name">{primaryVehicle.brand} {primaryVehicle.model}</div>
            <div className="vehicle-reg">{primaryVehicle.registration} &middot; {primaryVehicle.year} &middot; {primaryVehicle.fuelType}</div>
          </div>
          {primaryVehicle.lastService !== 'No record' ? (
            <div className="service-due-pill">
              <Clock size={12} />
              Service due in {primaryVehicle.serviceDaysLeft} days
            </div>
          ) : primaryVehicleBooking ? (
            <button
              className="service-due-pill"
              style={{ background: 'var(--color-blue-bg, #eef2ff)', color: 'var(--color-blue, #3b5bdb)', border: 'none', cursor: 'pointer' }}
              onClick={() => onNavigate('service-history')}
              id="pill-service-booked"
            >
              <CalendarCheck size={12} />
              {primaryVehicleBooking.service} booked for {primaryVehicleBooking.date}
            </button>
          ) : showFirstServicePrompt ? (
            <button
              className="service-due-pill"
              style={{ background: 'var(--color-blue-bg, #eef2ff)', color: 'var(--color-blue, #3b5bdb)', border: 'none', cursor: 'pointer' }}
              onClick={() => onNavigate('book-service')}
              id="pill-book-first-service"
            >
              <CalendarCheck size={12} />
              No service history — Book your first service
            </button>
          ) : (
            <div className="service-due-pill" style={{ background: 'var(--color-surface2)', color: 'var(--color-text-muted)' }}>
              <Clock size={12} />
              No service booked yet
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginTop: 24 }}>
        <p className="section-title">Quick Actions</p>
        <div className="quick-actions">
          <button className="quick-action" onClick={() => onNavigate('book-service')} id="qa-book-service">
            <div className="quick-action-icon"><CalendarCheck size={18} /></div>
            <div>
              <div className="quick-action-label">Book Service</div>
              <div className="quick-action-desc">Schedule a service</div>
            </div>
          </button>

          <button className="quick-action" onClick={() => onNavigate('pickup-drop')} id="qa-pickup">
            <div className="quick-action-icon"><Truck size={18} /></div>
            <div>
              <div className="quick-action-label">Request Pickup</div>
              <div className="quick-action-desc">Door-to-door service</div>
            </div>
          </button>

          <button className="quick-action emergency" onClick={() => onNavigate('emergency')} id="qa-emergency">
            <div className="quick-action-icon"><AlertTriangle size={18} /></div>
            <div>
              <div className="quick-action-label" style={{ color: 'var(--color-red)' }}>Emergency Help</div>
              <div className="quick-action-desc" style={{ color: 'var(--color-red)' }}>Roadside assistance</div>
            </div>
          </button>

          <button className="quick-action ping" onClick={() => onNavigate('community-ping')} id="qa-ping">
            <div className="quick-action-icon"><Users size={18} /></div>
            <div>
              <div className="quick-action-label" style={{ color: 'var(--color-amber)' }}>Ping Nearby</div>
              <div className="quick-action-desc" style={{ color: 'var(--color-amber)' }}>Community help</div>
            </div>
          </button>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="dashboard-grid">
        {/* Upcoming Service */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="section-title" style={{ marginBottom: 0 }}>Upcoming Service</p>
          </div>

          {upcoming ? (
            <div className="upcoming-service-item">
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{upcoming.vehicle}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {upcoming.service}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {upcoming.date} &middot; {upcoming.time} &middot; {upcoming.center}
                  </div>
                </div>
                <span className="badge badge-blue">Booked</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => onNavigate('book-service')}
              >
                View Details
              </button>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '20px 12px' }}>
              <CalendarCheck size={26} className="empty-state-icon" />
              <div className="empty-state-title">No upcoming service</div>
              <div className="empty-state-desc">
                {vehicles.length === 0
                  ? 'Add a vehicle to start booking services.'
                  : "You don't have anything scheduled yet."}
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => onNavigate(vehicles.length === 0 ? 'vehicles' : 'book-service')}
              >
                {vehicles.length === 0 ? 'Add Vehicle' : 'Book a Service'}
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="section-title" style={{ marginBottom: 0 }}>Recent Activity</p>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('service-history')}
              style={{ fontSize: '0.78rem' }}
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 12px' }}>
              <ClipboardList size={26} className="empty-state-icon" />
              <div className="empty-state-title">No activity yet</div>
              <div className="empty-state-desc">Completed services will show up here.</div>
            </div>
          ) : recentActivity.map(item => (
            <div key={item.id} className="activity-item">
              <div>
                <div className="activity-date">{item.date}</div>
                <div style={{ fontWeight: 500, fontSize: '0.875rem', marginTop: 2 }}>{item.service}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {item.vehicle} &middot; {item.location}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="activity-amount">{item.amount}</div>
                <span className="badge badge-green" style={{ marginTop: 4 }}>Completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle fleet quick view */}
      {vehicles.length > 1 && (
        <div style={{ marginTop: 20 }}>
          <div className="flex items-center justify-between mb-2">
            <p className="section-title" style={{ marginBottom: 0 }}>Your Vehicles</p>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('vehicles')} style={{ fontSize: '0.78rem' }}>
              Manage <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid-2">
            {vehicles.map(v => (
              <div
                key={v.id}
                className="card card-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                onClick={() => onNavigate('vehicles')}
              >
                <div className="vehicle-icon-wrap"><Wrench size={16} /></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v.brand} {v.model}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{v.registration}</div>
                </div>
                <span className={`badge ${v.serviceDaysLeft <= 14 ? 'badge-amber' : 'badge-green'}`} style={{ marginLeft: 'auto' }}>
                  {v.serviceDaysLeft <= 14 ? `Due in ${v.serviceDaysLeft}d` : 'OK'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
