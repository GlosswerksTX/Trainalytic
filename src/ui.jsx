/* ============================================================
   Shared UI primitives
   ============================================================ */

const Button = ({ variant = 'default', size, icon, children, className = '', ...rest }) => {
  const cls = ['btn', variant !== 'default' && variant, size, className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {icon && icon}
      {children}
    </button>
  );
};

const IconButton = ({ icon: IconComp, active, ...rest }) => (
  <button className={`icon-btn ${active ? 'active' : ''}`} {...rest}>
    <IconComp />
  </button>
);

const Card = ({ title, actions, children, className = '', tight = false, ...rest }) => (
  <div className={`card ${tight ? 'tight' : ''} ${className}`} {...rest}>
    {(title || actions) && (
      <div className="card-header">
        {title && <div className="h3">{title}</div>}
        {actions && <div className="card-header-actions">{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label, size }) => (
  <div className={`toggle ${checked ? 'on' : ''} ${size || ''}`} onClick={() => onChange?.(!checked)}>
    <div className="toggle-track">
      <div className="toggle-thumb" />
    </div>
    {label && <span>{label}</span>}
  </div>
);

const Checkbox = ({ checked, onChange, label, size = '' }) => (
  <label className="row" style={{ gap: 10, cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); onChange?.(!checked); }}>
    <span className={`checkbox ${checked ? 'checked' : ''} ${size}`}></span>
    {label && <span style={{ fontSize: 13.5 }}>{label}</span>}
  </label>
);

const Radio = ({ checked, onChange, label }) => (
  <label className="row" style={{ gap: 10, cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); onChange?.(true); }}>
    <span className={`radio ${checked ? 'checked' : ''}`}></span>
    {label && <span style={{ fontSize: 13.5 }}>{label}</span>}
  </label>
);

const Field = ({ label, hint, children }) => (
  <div className="field">
    {label && <label className="field-label">{label}</label>}
    {children}
    {hint && <div className="field-hint">{hint}</div>}
  </div>
);

const Input = ({ ...rest }) => <input className="input" {...rest} />;
const Textarea = ({ ...rest }) => <textarea className="textarea" {...rest} />;
const Select = ({ children, ...rest }) => <select className="select input" {...rest}>{children}</select>;

const Avatar = ({ name, size = '' }) => (
  <div className={`avatar ${size}`}>{initials(name || '?')}</div>
);

const Stars = ({ value = 0, max = 5, size = '' }) => (
  <div className={`stars ${size}`}>
    {Array.from({ length: max }).map((_, i) => (
      i < value ? <I.StarFilled key={i} className="filled" size={size === 'lg' ? 18 : 14} stroke="0" /> : <I.Star key={i} size={size === 'lg' ? 18 : 14} />
    ))}
  </div>
);

const Bar = ({ value = 0, max = 100, danger, warn, thick, className = '' }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tone = danger ? 'danger' : warn ? 'warn' : '';
  return (
    <div className={`bar ${thick ? 'thick' : ''} ${tone} ${className}`}>
      <div className="bar-fill" style={{ width: pct + '%' }} />
    </div>
  );
};

const Trend = ({ dir }) => {
  if (dir === 'up') return <span className="trend up"><I.ArrowUp size={11} /></span>;
  if (dir === 'down') return <span className="trend down"><I.ArrowDown size={11} /></span>;
  return <span className="trend flat"><I.Minus size={11} /></span>;
};

const Badge = ({ children, variant = '' }) => (
  <span className={`badge ${variant}`}>{children}</span>
);

const StatusBadge = ({ status }) => {
  if (status === 'on-track') return <Badge variant="good"><span className="dot" />On track</Badge>;
  if (status === 'flagged') return <Badge variant="danger"><span className="dot" />Flagged</Badge>;
  if (status === 'behind') return <Badge variant="warn"><span className="dot" />Behind</Badge>;
  if (status === 'graduating') return <Badge variant="accent"><span className="dot" />Graduating</Badge>;
  return <Badge>{status}</Badge>;
};

/* Render a score in the configured format */
const ScoreDisplay = ({ value, format = 'percent', target, size = '' }) => {
  if (value == null) return <span className="faint mono" style={{ fontSize: 13 }}>—</span>;
  if (format === 'stars') {
    const stars = Math.round((value / 100) * 5);
    return <Stars value={stars} size={size} />;
  }
  if (format === 'passfail') {
    const pass = target ? value >= target : value >= 80;
    return <Badge variant={pass ? 'good' : 'danger'}>{pass ? 'Pass' : 'Needs work'}</Badge>;
  }
  // percent
  const tone = target == null ? '' : value >= target ? 'good' : value >= target - 10 ? 'warn' : 'danger';
  return (
    <span className={`mono ${tone ? 'badge ' + tone : ''}`} style={{ fontWeight: 600, fontSize: size === 'lg' ? 18 : 13 }}>
      {Math.round(value)}%
    </span>
  );
};

/* Palette swatch */
const PaletteSwatch = ({ palette, active, label, onClick }) => {
  const map = {
    sage: ['oklch(0.55 0.085 145)', 'oklch(0.93 0.04 145)'],
    indigo: ['oklch(0.5 0.13 265)', 'oklch(0.94 0.045 265)'],
    terracotta: ['oklch(0.6 0.14 40)', 'oklch(0.95 0.04 40)'],
    ocean: ['oklch(0.55 0.1 230)', 'oklch(0.94 0.045 230)'],
    rose: ['oklch(0.6 0.13 5)', 'oklch(0.95 0.04 5)'],
    charcoal: ['oklch(0.32 0.005 75)', 'oklch(0.9 0.005 75)'],
    butter: ['oklch(0.65 0.13 95)', 'oklch(0.95 0.05 95)'],
    plum: ['oklch(0.45 0.12 320)', 'oklch(0.94 0.04 320)'],
  };
  const [a, b] = map[palette] || map.sage;
  return (
    <button
      onClick={onClick}
      className={`card tight ${active ? '' : ''}`}
      style={{
        padding: 14, cursor: 'pointer', textAlign: 'left',
        borderColor: active ? a : 'var(--border)',
        borderWidth: active ? 2 : 1,
        background: 'var(--surface)',
      }}
    >
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <div style={{ width: 40, height: 28, borderRadius: 6, background: a }} />
        <div style={{ width: 28, height: 28, borderRadius: 6, background: b }} />
        <div style={{ width: 18, height: 28, borderRadius: 6, background: 'var(--ink-strong)' }} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500, textTransform: 'capitalize' }}>{label || palette}</div>
    </button>
  );
};

Object.assign(window, {
  Button, IconButton, Card, Toggle, Checkbox, Radio, Field, Input, Textarea, Select,
  Avatar, Stars, Bar, Trend, Badge, StatusBadge, ScoreDisplay, PaletteSwatch,
});
