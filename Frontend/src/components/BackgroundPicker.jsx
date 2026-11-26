import { useEffect, useRef, useState } from 'react';
import { PRESETS, applyBg, loadBg, saveBg, resolve } from '../lib/theme';
import { useShowCache } from '../lib/settings';

export default function BackgroundPicker() {
  const [choice, setChoice] = useState(loadBg);
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const [showCache, setShowCache] = useShowCache();

  useEffect(() => { applyBg(choice); saveBg(choice); }, [choice]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const swatch = (p) => `linear-gradient(160deg, ${p.top}, ${p.base})`;
  const current = resolve(choice);

  return (
    <div className="bgpick" ref={box}>
      <button className="ghost bg-btn" aria-haspopup="true" aria-expanded={open} aria-label="Settings" title="Settings" onClick={() => setOpen(!open)}>
        <span className="bg-dot" style={{ background: swatch(current) }} aria-hidden="true" />
        Settings
      </button>
      {open && (
        <div className="bg-pop" role="group" aria-label="Settings">
          <div className="bg-title">Background</div>
          <div className="bg-grid">
            {PRESETS.map((p) => (
              <button key={p.id} className="bg-chip" aria-pressed={!choice.custom && choice.id === p.id} onClick={() => setChoice({ id: p.id })}>
                <span className="bg-swatch" style={{ background: `radial-gradient(60px 30px at 20% 0%, ${p.glow}, transparent), ${swatch(p)}` }} />
                {p.name}
              </button>
            ))}
          </div>
          <label className="bg-custom">
            Custom color
            <input type="color" value={choice.custom || current.base} onChange={(e) => setChoice({ id: 'custom', custom: e.target.value })} />
          </label>
          <label className="bg-custom bg-toggle">
            Show “served from cache”
            <input type="checkbox" role="switch" className="switch" checked={showCache} onChange={(e) => setShowCache(e.target.checked)} />
          </label>
        </div>
      )}
    </div>
  );
}
