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

  const current = resolve(choice);
  const swatch = (p) => `linear-gradient(160deg, ${p.top}, ${p.base})`;

  return (
    <div className="bgpick" ref={box}>
      <button className="ghost bg-btn" aria-haspopup="true" aria-expanded={open} aria-label="Settings" title="Settings" onClick={() => setOpen(!open)}>
        <svg className="bg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
        <span className="lbl">Settings</span>
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
