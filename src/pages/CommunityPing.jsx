// src/pages/CommunityPing.jsx
// Community Ping — requester side AND helper side in one component.
//
// Bug fixes in this version:
//   1. Helper mode no longer hijacks the requester view.
//      If helperMode is ON but the user has an active pingState (they requested help),
//      the requester view takes priority.
//   2. Completion is confirmed by the REQUESTER, not the helper.
//      Helper advances to 'awaiting_confirm' and then waits.
//      The "Mark as Completed" button only appears on the requester side.
//   3. "Available to Help" no longer replaces this whole page with a full-screen
//      "listening" placeholder. The toggle, an in-progress job (if any), and the
//      normal request-a-ping form now all live on the page together. Incoming
//      requests and credit awards are handled in the background by
//      <PingListener>, mounted once in Layout — so they work no matter which
//      page you're on, not just this one.
//
// Real-time cross-tab sync:
//   - Uses BroadcastChannel via usePingChannel hook.
//   - When requester sends a ping, all other tabs that have helper mode ON
//     receive the request immediately (no 4-second mock delay).
//   - If no real tab responds in 5s, mock helper kicks in as fallback.
//   - When helper accepts in another tab, requester sees it in real time.
//   - Open two browser windows to demo the live cross-tab experience.

import { useState, useEffect, useRef } from 'react';
import { Users, Check, MapPin, Clock, ChevronRight, Info, Circle, BatteryLow, Settings, Fuel, HelpCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_HELPER, MOCK_HELPERS, EMERGENCY_TYPES } from '../data/mockData';
import { usePingChannel } from '../hooks/usePingChannel';
import Modal from '../components/Modal';

// Icon lookup for emergency/issue types (same mapping used on the Emergency page)
const ISSUE_ICON_MAP = {
  flat_tyre: Circle,
  battery:   BatteryLow,
  engine:    Settings,
  fuel:      Fuel,
  accident:  AlertTriangle,
  other:     HelpCircle,
};

// Helper progress labels (steps shown on helper side)
const HELPER_STEPS = [
  { id: 'accepted',        label: 'Accepted',              sub: 'Request accepted' },
  { id: 'on_the_way',     label: 'On the Way',            sub: 'Heading to location' },
  { id: 'arrived',         label: 'Arrived',               sub: 'Reached the driver' },
  { id: 'awaiting_confirm',label: 'Awaiting Confirmation', sub: 'Waiting for requester to confirm' },
  { id: 'completed',       label: 'Help Completed',        sub: 'Assistance confirmed by driver' },
];

export default function CommunityPing() {
  const { state, dispatch } = useApp();
  const { pingState, emergencyState, helperMode, incomingPing, helperProgress, activeHelperJob, credits, user, vehicles } = state;

  const [showConfirm, setShowConfirm] = useState(false);
  const [realHelperConnected, setRealHelperConnected] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(emergencyState?.type || null);
  const fallbackTimerRef = useRef(null);
  const arrivalTimerRef = useRef(null);

  // ---- BroadcastChannel Integration (requester-side events) ----
  // Note: incoming-ping detection and helper credit-awarding are handled by
  // <PingListener> in Layout so they keep working in the background —
  // this hook instance only needs the events relevant to being a requester.
  const { send } = usePingChannel({
    // This tab (requester) was notified that a real helper accepted
    onHelperAccepted: (payload) => {
      if (state.pingState?.phase === 'sent') {
        setRealHelperConnected(true);
        clearFallbackTimer();
        dispatch({ type: 'REAL_HELPER_ACCEPT', payload });
      }
    },
    // Helper advanced status — update requester's view of helper progress
    onHelperAdvanced: (payload) => {
      dispatch({ type: 'SYNC_HELPER_PROGRESS', payload: payload.progress });
    },
    // Helper arrived — unlock confirm button on requester side
    onHelperArrived: (payload) => {
      dispatch({ type: 'SYNC_HELPER_PROGRESS', payload: 'arrived' });
    },
  });

  function clearFallbackTimer() {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }

  // Note: the "natural incoming-request" mock simulation used to live here,
  // but that meant it only ran while this page was open — the opposite of
  // "available to help" working in the background. It now lives in
  // <PingListener> (mounted once in Layout) so it keeps rolling no matter
  // which page you're on.

  // ---- Mock-helper arrival simulation (requester side) ----
  // Lets the full ping flow work solo, without needing a second browser tab —
  // only for non-real (mock) helpers found via the fallback timer.
  useEffect(() => {
    if (pingState?.phase === 'helper_found' && !pingState.helper?.isRealUser && pingState.assignedHelperProgress === 'on_the_way') {
      arrivalTimerRef.current = setTimeout(() => {
        dispatch({ type: 'SYNC_HELPER_PROGRESS', payload: 'arrived' });
      }, 4000 + Math.random() * 3000);
    }
    return () => {
      if (arrivalTimerRef.current) {
        clearTimeout(arrivalTimerRef.current);
        arrivalTimerRef.current = null;
      }
    };
  }, [pingState?.phase, pingState?.assignedHelperProgress, pingState?.helper?.isRealUser]);

  // After ping is sent, broadcast it and start a 5s fallback timer
  useEffect(() => {
    if (pingState?.phase === 'sent') {
      // Broadcast to other tabs — include the requester's real name and
      // vehicle so the helper sees who they'd be helping, not just "a driver"
      const requesterVehicle = vehicles[0] ? `${vehicles[0].brand} ${vehicles[0].model}` : undefined;
      send('PING_BROADCAST', {
        type: emergencyState?.type,
        notified: pingState.notified,
        requesterName: user?.name,
        requesterVehicle,
      });

      // Fallback: if no real tab responds in 5s, use mock helper
      fallbackTimerRef.current = setTimeout(() => {
        if (!realHelperConnected) {
          const helpers = MOCK_HELPERS || [MOCK_HELPER];
          const randomHelper = helpers[Math.floor(Math.random() * helpers.length)];
          dispatch({ type: 'PING_HELPER_FOUND', payload: randomHelper });
        }
      }, 5000);
    }
    return () => clearFallbackTimer();
  }, [pingState?.phase]);

  // When helper mode is toggled off/on, cleanup incoming real ping state
  useEffect(() => {
    if (!helperMode) {
      clearFallbackTimer();
    }
  }, [helperMode]);

  const problemType = EMERGENCY_TYPES.find(
    t => t.id === (pingState?.type || selectedIssue || emergencyState?.type)
  );

  function handleSendPing() {
    setShowConfirm(false);
    setRealHelperConnected(false);
    dispatch({ type: 'PING_SEND', payload: { type: selectedIssue } });
  }

  // Requester confirms the helper actually showed up and helped
  function handleRequesterConfirm() {
    dispatch({ type: 'REQUESTER_CONFIRM_COMPLETE' });
    // Notify helper tab so they receive credits there too
    send('REQUESTER_CONFIRMED', {});
  }

  // Accepting/declining an incoming request is handled by <PingListener>
  // (mounted in Layout) so it works the same way from any page.

  function handleHelperAdvance() {
    const steps = ['accepted', 'on_the_way', 'arrived', 'awaiting_confirm'];
    const idx = steps.indexOf(helperProgress);
    const next = steps[Math.min(idx + 1, steps.length - 1)];
    dispatch({ type: 'HELPER_ADVANCE' });
    if (next === 'arrived') {
      send('HELPER_ARRIVED', { progress: 'arrived' });
    } else {
      send('HELPER_ADVANCED', { progress: next });
    }
  }

  // Both roles now live on this one page at once — toggling "Available to
  // Help" no longer swaps out the whole screen. Only when you have an active
  // request of your own does helper status pause (shown via the note below),
  // matching the existing rule that you can't be both at once.
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Community Ping</h1>
        <p className="page-subtitle">Get help from verified CarCare users nearby, or help them</p>
      </div>

      {/* Note if user has helper mode on but is also requesting */}
      {helperMode && pingState && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '10px 14px', background: 'var(--color-blue-bg)',
          border: '1px solid var(--color-blue-border)', borderRadius: 'var(--radius)',
          marginBottom: 16, fontSize: '0.82rem', color: 'var(--color-text-muted)',
        }}>
          <Info size={15} style={{ color: 'var(--color-blue)', flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong style={{ color: 'var(--color-text)' }}>Helper mode is on</strong>, but you have an active request.
            You're viewing your own help request. Your helper status is paused until this is resolved.
          </span>
        </div>
      )}

      {/* Active help job — shown here when you tap through from the floating
          status pill, or navigate here directly while helping someone */}
      {helperMode && !pingState && helperProgress && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p className="section-title">Active Help Request</p>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {activeHelperJob?.label || EMERGENCY_TYPES.find(t => t.id === activeHelperJob?.type)?.label || 'Requester needs roadside help'}
            </div>
            {(activeHelperJob?.requesterName || activeHelperJob?.requesterVehicle) && (
              <div style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: 4 }}>
                {activeHelperJob?.requesterName || 'Nearby driver'}
                {activeHelperJob?.requesterVehicle && (
                  <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}> &middot; {activeHelperJob.requesterVehicle}</span>
                )}
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              <MapPin size={11} style={{ display: 'inline' }} /> Approx. {activeHelperJob?.distance || '1–2 km away'} &nbsp;·&nbsp; Reward: +50 Credits
            </div>
          </div>

          <div className="timeline">
            {HELPER_STEPS.map((s, i) => {
              const stepIdx = HELPER_STEPS.findIndex(st => st.id === helperProgress);
              const isDone = i < stepIdx;
              const isActive = i === stepIdx;
              return (
                <div key={s.id} className={`timeline-item${isDone ? ' done' : ''}`}>
                  <div className={`timeline-dot${isDone ? ' done' : isActive ? ' active' : ''}`}>
                    {isDone && <Check size={10} color="#fff" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-label" style={{
                      color: isDone ? 'var(--color-text-muted)' : isActive ? 'var(--color-text)' : 'var(--color-text-faint)',
                      fontWeight: isActive ? 600 : 400,
                    }}>
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

          {/* Helper actions — stop at awaiting_confirm, then wait for requester */}
          {helperProgress === 'awaiting_confirm' ? (
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--color-amber-bg)', border: '1px solid var(--color-amber-border)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-amber)', fontSize: '0.875rem', marginBottom: 2 }}>
                <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
                Waiting for the driver to confirm
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                The driver will confirm you arrived and helped. Credits are awarded after their confirmation.
              </div>
            </div>
          ) : helperProgress === 'completed' ? (
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--color-green-bg)', border: '1px solid var(--color-green-border)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-green)', fontSize: '0.875rem' }}>
                <Check size={14} style={{ display: 'inline', marginRight: 4 }} />
                Confirmed — 50 credits added to your balance
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Your new balance: {credits} credits
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 10 }}
                onClick={() => dispatch({ type: 'HELPER_JOB_DONE' })}
                id="btn-helper-job-done"
              >
                Done
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={handleHelperAdvance} id="btn-advance-help">
              <ChevronRight size={14} /> Advance Status
            </button>
          )}
        </div>
      )}

      {/* Toggle to helper mode (only shown when not mid-request) */}
      {!pingState && (
        <div className="helper-mode-toggle" style={{ marginBottom: 20 }}>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={helperMode}
              onChange={() => dispatch({ type: 'TOGGLE_HELPER_MODE' })}
              id="toggle-helper-mode-off"
            />
            <span className="toggle-slider" />
          </label>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Available to Help</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Enable to receive help requests from nearby drivers
            </div>
          </div>
          <span className={`badge ${helperMode ? 'badge-green' : 'badge-gray'}`} style={{ marginLeft: 'auto' }}>
            {helperMode ? 'On' : 'Off'}
          </span>
        </div>
      )}

      {/* Professional mechanic summary (from emergency state) */}
      {emergencyState?.mechanic && emergencyState.phase === 'found' && (
        <div style={{ marginBottom: 16 }}>
          <div className="card card-sm" style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Professional Assistance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="mechanic-avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                {emergencyState.mechanic.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emergencyState.mechanic.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {emergencyState.mechanic.distance} · ETA: {emergencyState.mechanic.eta} min
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid var(--color-amber-border)', borderRadius: 'var(--radius)', marginBottom: 6 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>Need help sooner?</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Ping verified CarCare users within 3 km. Someone nearby may be able to help before the technician arrives.
            </div>
          </div>
        </div>
      )}

      {/* Ping states */}
      {!pingState && (
        <div className="card">
          <p className="section-title">Send a Community Ping</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            A Ping notifies verified CarCare users within 3 km about your situation.
            They can choose to help you while you wait for the professional technician.
          </p>

          {/* What's the problem? — required before pinging */}
          <p className="section-title" style={{ marginBottom: 10 }}>What's the problem?</p>
          <div className="emergency-type-grid" style={{ marginBottom: 20 }}>
            {EMERGENCY_TYPES.map(t => {
              const Icon = ISSUE_ICON_MAP[t.id] || HelpCircle;
              const selected = selectedIssue === t.id;
              return (
                <button
                  key={t.id}
                  className={`emergency-type-card${selected ? ' selected' : ''}`}
                  onClick={() => setSelectedIssue(t.id)}
                  id={`ping-issue-${t.id}`}
                  type="button"
                >
                  <Icon size={20} style={{ color: selected ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                  <span className="emergency-type-label">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What you get</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          {[
            ['Faster help', 'Community helpers arrive in 5–10 min vs 20+ min for technicians'],
            ['Safe & verified', 'Only CarCare-verified users receive the ping'],
            ['+50 Credits', 'The helper earns 50 credits — but only after YOU confirm they helped'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--color-green-bg)', border: '1px solid var(--color-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Check size={10} color="var(--color-green)" />
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{desc}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--color-surface2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 18 }}>
            Only your approximate location is shared with nearby helpers before a request is accepted.
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowConfirm(true)}
            disabled={!selectedIssue}
            title={!selectedIssue ? 'Select what the problem is first' : ''}
            id="btn-ping-nearby-drivers"
          >
            <Users size={15} /> Ping Nearby Drivers
          </button>
          {!selectedIssue && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
              Select what's wrong above to send a ping.
            </p>
          )}
        </div>
      )}

      {/* Ping sent — searching */}
      {pingState?.phase === 'sent' && (
        <div>
          <div className="ping-active-banner" style={{ marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-amber)' }}>PING ACTIVE</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Your request has been sent to CarCare users within 3 km
              </div>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{pingState.notified} users notified</span>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: 28, height: 28, borderWidth: 3 }} />
            <div style={{ fontWeight: 600 }}>Searching for a nearby helper…</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Waiting for someone nearby to accept
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: 8 }}>
              If you have another tab open with helper mode on, they'll receive this ping live
            </div>
          </div>
        </div>
      )}

      {/* Helper found — waiting for them to arrive */}
      {pingState?.phase === 'helper_found' && (
        <div>
          <div className="ping-active-banner" style={{ marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-amber)' }}>PING ACTIVE</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {pingState.notified} users were notified
              </div>
            </div>
            {pingState.helper?.isRealUser && (
              <span className="badge badge-green">Live</span>
            )}
          </div>

          <div className="helper-card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div className="mechanic-avatar" style={{ background: 'var(--color-green-bg)', color: 'var(--color-green)', border: '1px solid var(--color-green-border)' }}>
                {pingState.helper.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {pingState.helper.name}
                  {pingState.helper.isRealUser && (
                    <span className="badge badge-green" style={{ marginLeft: 8, fontSize: '0.7rem' }}>Live user</span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {pingState.helper.distance} · ETA: {pingState.helper.eta} min
                </div>
              </div>
              <span className="badge badge-green">On the way</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
              {pingState.helper.name} has accepted your request and is on the way.
            </p>

            {/* Requester waits for helper to arrive before confirm button appears */}
            <div style={{ padding: '10px 12px', background: 'var(--color-surface2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <Clock size={13} style={{ display: 'inline', marginRight: 6 }} />
              The "Confirm Help" button will appear once the helper marks themselves as arrived.
            </div>
          </div>
        </div>
      )}

      {/* Helper has arrived — requester can now confirm */}
      {(pingState?.phase === 'helper_found' && pingState.assignedHelperProgress === 'arrived') ||
       (pingState?.phase === 'helper_found' && pingState.assignedHelperProgress === 'awaiting_confirm') ? (
        <div className="helper-card" style={{ marginBottom: 16, borderColor: 'var(--color-green-border)', background: 'var(--color-green-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="mechanic-avatar" style={{ background: 'var(--color-green-bg)', color: 'var(--color-green)', border: '1px solid var(--color-green-border)' }}>
              {pingState.helper?.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{pingState.helper?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-green)', fontWeight: 500 }}>Has arrived at your location</div>
            </div>
            <span className="badge badge-green">Arrived</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
            Did {pingState.helper?.name} arrive and help you? Please confirm to award them their credits.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleRequesterConfirm}
            id="btn-confirm-help"
          >
            <Check size={14} /> Confirm Help Received
          </button>
        </div>
      ) : null}

      {/* Completed */}
      {pingState?.phase === 'completed' && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-green-bg)', border: '1px solid var(--color-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Check size={24} color="var(--color-green)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Assistance Confirmed</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            You confirmed {pingState.helper?.name}'s help. They earned +50 Credits.
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)', marginTop: 8 }}>
            Thanks for keeping the CarCare community honest.
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: 18 }}
            onClick={() => { dispatch({ type: 'PING_RESET' }); setSelectedIssue(null); }}
            id="btn-ping-done"
          >
            Done
          </button>
        </div>
      )}

      {/* Confirm ping modal */}
      {showConfirm && (
        <Modal
          title="Send a Help Request?"
          onClose={() => setShowConfirm(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSendPing} id="btn-send-ping">
                Send Ping
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'var(--color-surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{problemType?.label || 'Roadside issue'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Approximate location shared with nearby helpers
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '4px 0' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Helper reward (after your confirmation)</span>
              <span style={{ fontWeight: 600, color: 'var(--color-amber)' }}>+50 Credits</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '10px 12px', background: 'var(--color-surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
              You will confirm when the helper arrives. Credits are only awarded after your confirmation.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
