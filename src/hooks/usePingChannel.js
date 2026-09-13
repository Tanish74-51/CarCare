// src/hooks/usePingChannel.js
// Real-time cross-tab sync for Community Ping using the BroadcastChannel API.
//
// How it works:
//   - Every tab gets a unique tabId generated fresh at runtime (not persisted
//     in sessionStorage — see getTabId() for why).
//   - All tabs open the same BroadcastChannel('carcare_ping').
//   - When requester sends a ping, it broadcasts PING_BROADCAST.
//   - Helper tabs receive it and show the real incoming request.
//   - When helper accepts, broadcasts HELPER_ACCEPTED back to the requester tab.
//   - When helper marks arrived, broadcasts HELPER_ARRIVED.
//   - When requester confirms, broadcasts REQUESTER_CONFIRMED so the helper gets credits.
//
// Fallback:
//   - If no real tab responds within 5 seconds of a PING_BROADCAST,
//     the mock timer kicks in (same as before). This keeps the demo working
//     even with only one tab open.
//
// Limitation:
//   - BroadcastChannel only works across tabs/windows in the SAME browser on the
//     SAME device. True cross-device sync requires a backend (WebSockets / Firebase).
//   - For a demo/prototype, open two browser tabs to experience the real-time flow.

import { useEffect, useRef, useCallback } from 'react';

const CHANNEL_NAME = 'carcare_ping';

// Unique ID for this tab. Generated fresh in memory on every load rather than
// persisted in sessionStorage: browsers (Chrome, Edge, Firefox) copy
// sessionStorage into a new tab when it's opened via "Duplicate Tab", which
// is the natural way to quickly spin up a "second person" for testing. That
// would give both tabs the exact same tabId, and since incoming messages are
// filtered with `if (senderId === tabId.current) return` (to ignore a tab's
// own broadcasts), the duplicated tab would mistake the original tab's pings
// for its own and silently drop them. A fresh random ID per page load avoids
// that collision entirely, at the harmless cost of a new ID on every reload.
function getTabId() {
  return 'tab_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

/**
 * usePingChannel(handlers)
 *
 * Returns a `send(type, payload)` function.
 * Calls handler functions when messages arrive from OTHER tabs.
 *
 * handlers: {
 *   onPingReceived(payload)    — helper tab: incoming ping request
 *   onHelperAccepted(payload)  — requester tab: helper accepted
 *   onHelperAdvanced(payload)  — requester tab: helper status updated
 *   onHelperArrived(payload)   — requester tab: helper has arrived
 *   onConfirmed(payload)       — helper tab: requester confirmed completion
 * }
 */
export function usePingChannel(handlers) {
  const tabId = useRef(getTabId());
  const channelRef = useRef(null);
  const handlersRef = useRef(handlers);

  // Keep handlers ref up to date without re-subscribing
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    // BroadcastChannel is supported in all modern browsers
    if (!window.BroadcastChannel) return;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { senderId, type, payload } = event.data;
      // Ignore our own messages
      if (senderId === tabId.current) return;

      const h = handlersRef.current;
      switch (type) {
        case 'PING_BROADCAST':
          h?.onPingReceived?.(payload);
          break;
        case 'HELPER_ACCEPTED':
          h?.onHelperAccepted?.(payload);
          break;
        case 'HELPER_ADVANCED':
          h?.onHelperAdvanced?.(payload);
          break;
        case 'HELPER_ARRIVED':
          h?.onHelperArrived?.(payload);
          break;
        case 'REQUESTER_CONFIRMED':
          h?.onConfirmed?.(payload);
          break;
        default:
          break;
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []); // Only run once on mount

  const send = useCallback((type, payload = {}) => {
    if (!channelRef.current) return false;
    channelRef.current.postMessage({ senderId: tabId.current, type, payload });
    return true;
  }, []);

  return { send, tabId: tabId.current };
}
