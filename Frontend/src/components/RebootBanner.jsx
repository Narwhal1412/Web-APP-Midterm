export default function RebootBanner({ state, detail }) {
  if (state == null || state === 'up') return null;
  return (
    <div className="alert-banner" role="alert">
      <strong>ATTENTION:</strong> SERVER's REBOOTING, please wait shortly.
      {detail && <span className="detail">{detail}</span>}
    </div>
  );
}
