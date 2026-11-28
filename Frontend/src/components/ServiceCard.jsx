const LABEL = { up: 'Running', down: 'Down', unknown: 'Unknown' };

export default function ServiceCard({ name, hint, status, rows }) {
  return (
    <article className={`card service ${status}`} aria-label={`${name}: ${LABEL[status]}`}>
      <div className="service-head">
        <h3>{name}</h3>
        <span className={`badge ${status}`}>{LABEL[status]}</span>
      </div>
      <p className="hint">{hint}</p>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v ?? '–'}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
