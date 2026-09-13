// src/context/AppContext.jsx
// Global application state via React Context + useReducer
// Per-user state is stored in localStorage keyed by userId.
// No mock user is pre-loaded — users must register/login.

import { createContext, useContext, useReducer, useEffect } from 'react';
import {
  getSession,
  saveSession,
  clearSession,
  getUserState,
  saveUserState,
  getUsers,
} from '../data/userStore';

// ---------- Initial State ----------
const blankUserState = {
  isLoggedIn: false,
  user: null,
  userId: null,
  vehicles: [],
  bookings: [],
  serviceHistory: [],
  pickupRequest: null,
  emergencyState: null,
  pingState: null,
  helperMode: false,
  incomingPing: null,      // null, or { type, distance, etaLabel, isReal } when a request is pending
  activeHelperJob: null,   // details of the job I accepted as a helper
  helperProgress: null,
  credits: 0,
  creditTransactions: [],
  notifications: [],
  onboarded: false,
  firstServicePromptSeen: false,
};

// Builds a human notification body for an incoming ping, e.g.
// "Karan Bedi (Hyundai Creta) · 1.8 km away needs help. Reward: +50 Credits."
function formatPingNotifBody(payload) {
  const who = payload.requesterName || 'A driver';
  const vehiclePart = payload.requesterVehicle ? ` (${payload.requesterVehicle})` : '';
  const distancePart = payload.distance ? ` · ${payload.distance}` : '';
  return `${who}${vehiclePart}${distancePart} needs help. Reward: +50 Credits.`;
}

// A helper job sitting at 'completed' has already been paid out — it's// terminal. If a session ends (tab closed, logout) before the user clicks
// "Done" on that screen, it would otherwise be restored on next load/login
// and immediately show a stale "already completed" card with no way out.
function sanitizeHelperProgress(saved) {
  if (saved?.helperProgress === 'completed') {
    return { ...saved, helperProgress: null, activeHelperJob: null, incomingPing: null };
  }
  return saved;
}

// Load state for currently-sessioned user, or blank state
function loadState() {
  try {
    const userId = getSession();
    if (userId) {
      const users = getUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        const saved = sanitizeHelperProgress(getUserState(userId));
        return {
          ...blankUserState,
          ...(saved || {}),
          // Always hydrate user from the users table (in case profile was updated)
          user,
          userId,
          isLoggedIn: true,
          serviceHistory: saved?.serviceHistory || [],
        };
      }
    }
  } catch { /* ignore */ }
  return blankUserState;
}

// ---------- Reducer ----------
function reducer(state, action) {
  switch (action.type) {

    case 'LOGIN': {
      const { user } = action.payload;
      const saved = sanitizeHelperProgress(getUserState(user.id));
      return {
        ...blankUserState,
        ...(saved || {}),
        user,
        userId: user.id,
        isLoggedIn: true,
        // Brand-new accounts start completely empty — no seeded mock data
        credits: saved ? saved.credits : 0,
        creditTransactions: saved ? saved.creditTransactions : [],
        notifications: saved ? saved.notifications : [],
        serviceHistory: saved?.serviceHistory || [],
        onboarded: saved ? (saved.onboarded ?? false) : false,
      };
    }

    case 'DISMISS_ONBOARDING':
      return { ...state, onboarded: true };

    case 'MARK_FIRST_SERVICE_PROMPT_SEEN':
      return { ...state, firstServicePromptSeen: true };

    case 'LOGOUT':
      clearSession();
      return { ...blankUserState };

    case 'UPDATE_PROFILE':
      return { ...state, user: { ...state.user, ...action.payload } };

    case 'ADD_VEHICLE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };

    case 'REMOVE_VEHICLE':
      return { ...state, vehicles: state.vehicles.filter(v => v.id !== action.payload) };

    case 'ADD_BOOKING': {
      const booking = action.payload;
      return {
        ...state,
        bookings: [booking, ...state.bookings],
        notifications: [
          {
            id: `n_${Date.now()}`,
            type: 'service',
            title: 'Booking Confirmed',
            body: `${booking.service} for ${booking.vehicle} on ${booking.date} at ${booking.time}.`,
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'REQUEST_PICKUP':
      return {
        ...state,
        pickupRequest: { ...action.payload, step: 0 },
      };

    case 'ADVANCE_PICKUP':
      return {
        ...state,
        pickupRequest: state.pickupRequest
          ? { ...state.pickupRequest, step: Math.min(state.pickupRequest.step + 1, 4) }
          : null,
      };

    case 'CLEAR_PICKUP':
      return { ...state, pickupRequest: null };

    case 'EMERGENCY_SET_TYPE':
      return { ...state, emergencyState: { type: action.payload, phase: 'selected' } };

    case 'EMERGENCY_SOS':
      return { ...state, emergencyState: { ...state.emergencyState, phase: 'searching' } };

    case 'EMERGENCY_FOUND':
      return {
        ...state,
        emergencyState: { ...state.emergencyState, phase: 'found', mechanic: action.payload },
        notifications: [
          {
            id: `n_em_${Date.now()}`,
            type: 'service',
            title: 'Technician Assigned',
            body: `${action.payload.name} is on the way. ETA: ${action.payload.eta} min.`,
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };

    // Technician has physically reached the user's location. User still
    // needs to actively confirm this before work "starts", so it doesn't
    // silently skip a step.
    case 'EMERGENCY_ARRIVED':
      return {
        ...state,
        emergencyState: state.emergencyState
          ? { ...state.emergencyState, phase: 'arrived' }
          : state.emergencyState,
        notifications: [
          {
            id: `n_em_arr_${Date.now()}`,
            type: 'service',
            title: 'Technician Arrived',
            body: `${state.emergencyState?.mechanic?.name || 'Your technician'} has arrived at your location.`,
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };

    // User confirms the technician is on-site — work begins.
    case 'EMERGENCY_CONFIRM_ARRIVAL':
      return {
        ...state,
        emergencyState: state.emergencyState
          ? { ...state.emergencyState, phase: 'working' }
          : state.emergencyState,
      };

    // Technician has finished the physical work — awaiting the user's final
    // sign-off before the request closes.
    case 'EMERGENCY_WORK_COMPLETE':
      return {
        ...state,
        emergencyState: state.emergencyState
          ? { ...state.emergencyState, phase: 'ready_to_confirm' }
          : state.emergencyState,
      };

    // User confirms the job is done. Logs the visit into Service History and
    // closes out the emergency request.
    case 'EMERGENCY_RESOLVED': {
      const mechanic = state.emergencyState?.mechanic;
      const vehicle = state.vehicles[0];
      const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return {
        ...state,
        emergencyState: state.emergencyState
          ? { ...state.emergencyState, phase: 'resolved' }
          : state.emergencyState,
        serviceHistory: [
          {
            id: `h_em_${Date.now()}`,
            date: today,
            vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Your vehicle',
            registration: vehicle?.registration || '—',
            service: 'Emergency Roadside Assistance',
            location: 'On-location technician visit',
            amount: '—',
            status: 'Completed',
            mechanic: mechanic?.name || 'CarCare Technician',
            parts: '—',
            notes: 'Resolved via emergency roadside assistance request.',
          },
          ...state.serviceHistory,
        ],
        notifications: [
          {
            id: `n_em_res_${Date.now()}`,
            type: 'service',
            title: 'Issue Resolved',
            body: `${mechanic?.name || 'Your technician'} completed the job. Your emergency request has been closed.`,
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'EMERGENCY_RESET':
      return { ...state, emergencyState: null, pingState: null };

    // Requester dismisses the "Assistance Confirmed" screen and returns to
    // being able to send a fresh ping.
    case 'PING_RESET':
      return { ...state, pingState: null };

    case 'PING_SEND':
      return {
        ...state,
        pingState: { phase: 'sent', notified: 12, type: action.payload?.type, assignedHelperProgress: null },
      };

    case 'PING_HELPER_FOUND':
      return {
        ...state,
        pingState: { ...state.pingState, phase: 'helper_found', helper: action.payload, assignedHelperProgress: 'on_the_way' },
        notifications: [
          {
            id: `n_ph_${Date.now()}`,
            type: 'ping_accepted',
            title: 'Helper Found',
            body: `${action.payload.name} has accepted and is on the way. ETA: ${action.payload.eta} min.`,
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };

    case 'PING_COMPLETE': {
      const helperName = state.pingState?.helper?.name || 'Helper';
      return {
        ...state,
        pingState: { ...state.pingState, phase: 'completed', assignedHelperProgress: 'completed' },
        emergencyState: state.emergencyState
          ? { ...state.emergencyState, phase: 'cancelled_by_community' }
          : state.emergencyState,
        credits: state.credits + 50,
        creditTransactions: [
          {
            id: `ct_${Date.now()}`,
            description: `Credits earned by ${helperName} for roadside help`,
            amount: +50,
            date: 'Just now',
            type: 'earn',
          },
          ...state.creditTransactions,
        ],
        notifications: [
          {
            id: `n_cr_${Date.now()}`,
            type: 'credit',
            title: 'Assistance Confirmed',
            body: `You confirmed ${helperName}'s help. They earned 50 credits.`,
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'TOGGLE_HELPER_MODE': {
      const turningOn = !state.helperMode;
      // A 'completed' job has already been paid out — it's a terminal state
      // and shouldn't resurface just because the toggle gets flipped again
      // (e.g. if the user never clicked "Done" before navigating away, or
      // the toggle was already "On" on page load from a prior session).
      const staleCompleted = state.helperProgress === 'completed';
      const keepJob = turningOn && !staleCompleted;
      return {
        ...state,
        helperMode: turningOn,
        // Going offline cancels any pending request and your own helper job.
        // Going online does NOT fabricate a request — one arrives later (see
        // SIMULATE_INCOMING_PING), and it never touches your own pingState.
        incomingPing: keepJob ? state.incomingPing : null,
        helperProgress: keepJob ? state.helperProgress : null,
        activeHelperJob: keepJob ? state.activeHelperJob : null,
      };
    }

    case 'SIMULATE_INCOMING_PING': {
      // Guard: only show a simulated request if still available and not already busy
      if (!state.helperMode || state.helperProgress || state.incomingPing) return state;
      const notifId = `n_ping_${Date.now()}`;
      return {
        ...state,
        incomingPing: { ...action.payload, notifId },
        notifications: [
          {
            id: notifId,
            type: 'ping',
            title: 'Ping Request Nearby',
            body: formatPingNotifBody(action.payload),
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'SET_REAL_INCOMING_PING': {
      if (!state.helperMode || state.helperProgress || state.incomingPing) return state;
      const notifId = `n_ping_${Date.now()}`;
      return {
        ...state,
        incomingPing: { ...action.payload, isReal: true, notifId },
        notifications: [
          {
            id: notifId,
            type: 'ping',
            title: 'Ping Request Nearby',
            body: formatPingNotifBody(action.payload),
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'HELPER_ACCEPT':
      return {
        ...state,
        helperProgress: 'accepted',
        activeHelperJob: state.incomingPing,
        incomingPing: null,
        notifications: state.incomingPing?.notifId
          ? state.notifications.filter(n => n.id !== state.incomingPing.notifId)
          : state.notifications,
      };

    case 'HELPER_DECLINE':
      return {
        ...state,
        incomingPing: null,
        notifications: state.incomingPing?.notifId
          ? state.notifications.filter(n => n.id !== state.incomingPing.notifId)
          : state.notifications,
      };

    case 'REAL_HELPER_ACCEPT': {
      return {
        ...state,
        pingState: { ...state.pingState, phase: 'helper_found', helper: action.payload, assignedHelperProgress: 'on_the_way' },
        notifications: [
          {
            id: `n_rha_${Date.now()}`,
            type: 'ping_accepted',
            title: 'Helper Found',
            body: `${action.payload.name} has accepted and is on the way. ETA: ${action.payload.eta} min.`,
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // Updates the status of the helper assigned to MY request (as seen from
    // the requester's tab) — kept separate from `helperProgress`, which is
    // only ever about a job I personally accepted as a helper.
    case 'SYNC_HELPER_PROGRESS':
      return {
        ...state,
        pingState: state.pingState
          ? { ...state.pingState, assignedHelperProgress: action.payload }
          : state.pingState,
      };

    // Fired on the HELPER's own tab once the requester confirms completion.
    case 'HELPER_CREDITS_AWARDED':
      return {
        ...state,
        helperProgress: 'completed',
        credits: state.credits + 50,
        creditTransactions: [
          {
            id: `ct_hc_${Date.now()}`,
            description: 'Credits earned for roadside help',
            amount: +50,
            date: 'Just now',
            type: 'earn',
          },
          ...state.creditTransactions,
        ],
        notifications: [
          {
            id: `n_hca_${Date.now()}`,
            type: 'credit',
            title: 'Credits Earned',
            body: 'You earned 50 credits for helping a nearby driver.',
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };

    // Helper dismisses the "Confirmed" screen and goes back to being
    // available for the next request.
    case 'HELPER_JOB_DONE':
      return { ...state, helperProgress: null, activeHelperJob: null, incomingPing: null };

    case 'HELPER_ADVANCE': {
      const steps = ['accepted', 'on_the_way', 'arrived', 'awaiting_confirm'];
      const idx = steps.indexOf(state.helperProgress);
      const next = steps[Math.min(idx + 1, steps.length - 1)];
      return { ...state, helperProgress: next };
    }

    case 'REQUESTER_CONFIRM_COMPLETE': {
      const helperName = state.pingState?.helper?.name || 'Helper';
      return {
        ...state,
        pingState: { ...state.pingState, phase: 'completed', assignedHelperProgress: 'completed' },
        emergencyState: state.emergencyState
          ? { ...state.emergencyState, phase: 'cancelled_by_community' }
          : state.emergencyState,
        credits: state.credits + 50,
        creditTransactions: [
          {
            id: `ct_${Date.now()}`,
            description: `Credits earned by ${helperName} for roadside help`,
            amount: +50,
            date: 'Just now',
            type: 'earn',
          },
          ...state.creditTransactions,
        ],
        notifications: [
          {
            id: `n_cr_${Date.now()}`,
            type: 'credit',
            title: 'Assistance Confirmed',
            body: `You confirmed ${helperName}'s help. They earned 50 credits.`,
            time: 'Just now',
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'REDEEM_CREDITS': {
      const cost = action.payload;
      if (state.credits < cost) return state;
      return {
        ...state,
        credits: state.credits - cost,
        creditTransactions: [
          {
            id: `ct_r_${Date.now()}`,
            description: action.label || 'Credit redemption',
            amount: -cost,
            date: 'Just now',
            type: 'spend',
          },
          ...state.creditTransactions,
        ],
      };
    }

    case 'MARK_NOTIF_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      };

    // NEW: delete a single notification
    case 'DELETE_NOTIF':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    // NEW: clear all notifications
    case 'DELETE_ALL_NOTIFS':
      return { ...state, notifications: [] };

    default:
      return state;
  }
}

// ---------- Context ----------
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Persist to per-user localStorage slot on every state change
  useEffect(() => {
    if (state.isLoggedIn && state.userId) {
      // Save session so refresh restores login
      saveSession(state.userId);
      // Save full user state (serviceHistory freshened on load, so omit it)
      const { serviceHistory, ...rest } = state;
      saveUserState(state.userId, rest);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
