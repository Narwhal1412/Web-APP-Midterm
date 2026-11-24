import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { parseHealth } from '../utils/health';

// Polls GET /api/health every second and classifies the answer:
//   up       -> 200
//   degraded -> 503 (the web service answers, but the database or Redis is down)
//   down     -> no answer at all (container stopped / restarting, timeout, 502, 504)
// Every switch away from "up" and back is recorded, so downtime is measured, not guessed.
// Precision is about +/- one polling interval.
export default function useHealthMonitor(intervalMs = 1000) {
  const [state, setState] = useState(null); // null = not known yet
  const [snapshot, setSnapshot] = useState(null);
  const [events, setEvents] = useState([]); // newest first
  const downSince = useRef(null);

  useEffect(() => {
    let stopped = false;
    let timer;

    const tick = async () => {
      let next = 'down';
      let payload = null;
      try {
        const { body } = await api.health();
        next = 'up';
        payload = body;
      } catch (e) {
        if (e.status === 503) {
          next = 'degraded';
          payload = e.body;
        }
      }
      if (stopped) return;

      const now = Date.now();
      if (next !== 'up' && downSince.current === null) {
        downSince.current = now;
        setEvents((ev) => [{ id: now, type: 'down', state: next, at: now }, ...ev]);
      } else if (next === 'up' && downSince.current !== null) {
        const downtimeMs = now - downSince.current;
        downSince.current = null;
        setEvents((ev) => [{ id: now, type: 'up', at: now, downtimeMs }, ...ev]);
      }
      setState(next);
      if (payload) setSnapshot(parseHealth(payload));
      timer = setTimeout(tick, intervalMs);
    };

    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [intervalMs]);

  return { state, snapshot, events, clearEvents: () => setEvents([]) };
}
