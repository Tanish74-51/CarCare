// src/components/PingListener.jsx
// Always-mounted (lives in Layout, on every page) so "Available to Help" runs
// quietly in the background instead of taking over the Community Ping screen.
//
// Responsibilities:
//   - Listens for real incoming pings from other tabs via BroadcastChannel,
//     regardless of which page the user is currently viewing.
//   - Surfaces a small floating card when a request needs a response — not a
//     full-page takeover. The rest of the app stays usable underneath it.
//   - Awards credits the moment a requester confirms, even if the helper has
//     since navigated away from the Community Help page.
//   - Shows a compact status pill while a job is in progress, so the user can
//     jump back into the details when they want to, instead of being forced
//     to sit on that page while "listening".
//
// A real incoming/matching notification is also pushed into the Notifications
// list (see AppContext) so the bell badge lights up either way.

import { useEffect, useRef } from 'react';
import { Users, Check, X, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePingChannel } from '../hooks/usePingChannel';
import { EMERGENCY_TYPES, MOCK_REQUESTER_NAMES, MOCK_REQUESTER_VEHICLES } from '../data/mockData';

export default function PingListener({ onNavigate, currentPage }) {
  const { state, dispatch } = useApp();
  const { helperMode, incomingPing, helperProgress, activeHelperJob, user } = state;
  const listeningTimerRef = useRef(null);

  // ---- Natural incoming-request simulation ----
  // While available to help (and not already busy or holding a request),
  // periodically roll a chance that a nearby driver's request comes in —
  // after a real delay, and not guaranteed every time. Runs here (not on the
  // Community Help page) so it keeps working no matter what page is open.
  useEffect(() => {
    function scheduleNextRoll() {
      const delay = 6000 + Math.random() * 9000; // 6–15s, feels natural rather than instant
      listeningTimerRef.current = setTimeout(() => {
        const chanceToFire = 0.55; // request doesn't show up every single time
        if (Math.random() < chanceToFire) {
          const type = EMERGENCY_TYPES[Math.floor(Math.random() * EMERGENCY_TYPES.length)];
          const distance = `${(0.5 + Math.random() * 2.5).toFixed(1)} km away`;
          const requesterName = MOCK_REQUESTER_NAMES[Math.floor(Math.random() * MOCK_REQUESTER_NAMES.length)];
          const requesterVehicle = MOCK_REQUESTER_VEHICLES[Math.floor(Math.random() * MOCK_REQUESTER_VEHICLES.length)];
          dispatch({
            type: 'SIMULATE_INCOMING_PING',
            payload: { type: type.id, label: type.label, distance, etaLabel: '5–10 minutes', requesterName, requesterVehicle },
          });
        } else {
          scheduleNextRoll();
        }
      }, delay);
    }

    if (helperMode && !incomingPing && !helperProgress) {
      scheduleNextRoll();
    }
    return () => {
      if (listeningTimerRef.current) {
        clearTimeout(listeningTimerRef.current);
        listeningTimerRef.current = null;
      }
    };
  }, [helperMode, incomingPing, helperProgress]);

  const arrivalConfirmTimerRef = useRef(null);

  // ---- Mock-requester confirmation (helper side) ----
  // A job accepted from the *simulated* incoming-ping generator has no real
  // requester on the other end to confirm it — without this, it would sit at
  // "Awaiting Confirmation" forever. Real (cross-tab) jobs are excluded here;
  // those wait for an actual REQUESTER_CONFIRMED broadcast via onConfirmed.
  useEffect(() => {
    if (helperProgress === 'awaiting_confirm' && activeHelperJob && !activeHelperJob.isReal) {
      arrivalConfirmTimerRef.current = setTimeout(() => {
        dispatch({ type: 'HELPER_CREDITS_AWARDED' });
      }, 3000 + Math.random() * 3000);
    }
    return () => {
      if (arrivalConfirmTimerRef.current) {
        clearTimeout(arrivalConfirmTimerRef.current);
        arrivalConfirmTimerRef.current = null;
      }
    };
  }, [helperProgress, activeHelperJob]);

  const { send } = usePingChannel({
    // Another tab's requester sent a ping — only react if we're free to help
    onPingReceived: (payload) => {
      if (state.helperMode && !state.helperProgress && !state.incomingPing) {
        dispatch({ type: 'SET_REAL_INCOMING_PING', payload });
      }
    },
    // The requester confirmed our help — award credits no matter what page we're on
    onConfirmed: () => {
      dispatch({ type: 'HELPER_CREDITS_AWARDED' });
    },
  });

  function handleAccept() {
    dispatch({ type: 'HELPER_ACCEPT' });
    send('HELPER_ACCEPTED', {
      name: user.name,
      initials: user.initials,
      distance: '~1.1 km away',
      eta: Math.floor(Math.random() * 6) + 4, // 4-10 min
      isRealUser: true,
    });
    // Take the user to the Community Help page so they can see the job they
    // just accepted — otherwise accepting from a floating toast on some
    // other page looks like it did nothing.
    onNavigate('community-ping');
  }

  function handleDecline() {
    dispatch({ type: 'HELPER_DECLINE' });
  }

  if (!helperMode) return null;

  // A request just came in and needs a response — small floating card
  if (incomingPing && !helperProgress) {
    const label = incomingPing.label
      || EMERGENCY_TYPES.find(t => t.id === incomingPing.type)?.label
      || 'Roadside issue';

    return (
      <div className="ping-toast">
        <div className="ping-toast-header">
          <Users size={13} />
          <span>Help Request Nearby</span>
          {incomingPing.isReal && (
            <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Live</span>
          )}
        </div>
        <div className="ping-toast-body">
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{label}</div>
          {(incomingPing.requesterName || incomingPing.requesterVehicle) && (
            <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>
              {incomingPing.requesterName || 'Nearby driver'}
              {incomingPing.requesterVehicle && (
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}> &middot; {incomingPing.requesterVehicle}</span>
              )}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              <MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />
              Approx. {incomingPing.distance || '1–2 km away'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
              {incomingPing.etaLabel || '5–10 minutes'} away
            </div>
          </div>
          <div className="ping-toast-reward">
            <span>Reward for helping</span>
            <strong>+50 Credits</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleAccept} id="btn-toast-help-driver">
              <Check size={13} /> Help
            </button>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={handleDecline} id="btn-toast-decline">
              <X size={13} /> Decline
            </button>
          </div>
        </div>
      </div>
    );
  }

  // A job is already in progress — small pill, only when not already on the
  // page that shows full detail (no point stacking it on top of itself)
  if (helperProgress && helperProgress !== 'completed' && currentPage !== 'community-ping') {
    const label = activeHelperJob?.label
      || EMERGENCY_TYPES.find(t => t.id === activeHelperJob?.type)?.label
      || 'a nearby driver';

    return (
      <button className="ping-pill" onClick={() => onNavigate('community-ping')} id="btn-ping-pill">
        <span className="ping-pill-dot" />
        <span>Helping with {label.toLowerCase()} &middot; tap for details</span>
        <ChevronRight size={13} />
      </button>
    );
  }

  return null;
}
