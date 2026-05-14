/* ============================================================
   Pulse Check IQ — seller branding components
   ============================================================ */

/* Demo banner — shown when buyer is using sample data */
const DemoBanner = ({ onSetUp, onDismiss }) => (
  <div className="demo-banner">
    <span className="pc-logo-text">
      <img src="assets/pulse-check-iq-logo.png" alt="Pulse Check IQ" style={{ height: 18, filter: 'brightness(0) invert(1)' }} />
    </span>
    <span className="pc-divider"></span>
    <span>You're exploring with sample data. Connect your own Google Sheet to start tracking your real team.</span>
    <button className="demo-cta" onClick={onSetUp}>
      Set up my dashboard <I.Chevron size={12} />
    </button>
    <button className="demo-dismiss" onClick={onDismiss} title="Hide banner">
      <I.X size={14} />
    </button>
  </div>
);

/* Pulse Check IQ welcome / splash — shown on first launch */
const PulseCheckWelcome = ({ onConnect, onExplore }) => (
  <div className="pc-splash">
    <div className="pc-splash-card">
      <div className="pc-splash-side">
        <div>
          <div className="pc-splash-logo">
            <img src="assets/pulse-check-iq-logo.png" alt="Pulse Check IQ" />
          </div>
          <div style={{ marginTop: 24, fontSize: 13, opacity: 0.9, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Trainalytic
          </div>
          <div style={{ marginTop: 6, fontSize: 14, opacity: 0.85 }}>
            Employee Training Tracker · by Pulse Check IQ
          </div>
          <div style={{ marginTop: 14, fontSize: 24, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
            Track on-the-job training that actually moves the needle.
          </div>
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.85, lineHeight: 1.5 }}>
          v1.0 · A digital product by Pulse Check IQ<br />
          Your data stays in your Google Sheet, always.
        </div>
      </div>

      <div className="pc-splash-content">
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'oklch(0.5 0.02 250)', fontWeight: 500 }}>Welcome</div>
          <h1 style={{ marginTop: 6 }}>Let's get your dashboard set up.</h1>
        </div>
        <p>Built for small service businesses, restaurants, retail, salons, auto shops and more. Score on-the-job performance, track training milestones, and email AI-written progress summaries — all from a dashboard you customize to your business.</p>

        <ul className="pc-feature-list">
          <li><I.Check stroke={2.5} /> 5-minute setup wizard with industry-specific starter templates</li>
          <li><I.Check stroke={2.5} /> Your data stays in your own Google Sheet — you keep it forever</li>
          <li><I.Check stroke={2.5} /> One-click email summaries via your Gmail</li>
          <li><I.Check stroke={2.5} /> Customize colors, fonts, and labels to match your business</li>
        </ul>

        <div className="pc-cta-row">
          <button className="pc-btn pc-btn-primary" onClick={onConnect}>
            Connect my Google Sheet <I.Chevron size={14} />
          </button>
          <button className="pc-btn pc-btn-secondary" onClick={onExplore}>
            Explore demo first
          </button>
        </div>

        <div style={{ fontSize: 11.5, color: 'oklch(0.55 0.02 250)', marginTop: 4 }}>
          Need help? Email <strong style={{ color: 'var(--pc-navy)' }}>info.trainalytic@gmail.com</strong> — replies usually within a day.
        </div>
      </div>
    </div>
  </div>
);

/* Connect Sheet modal — collects the Apps Script URL */
const ConnectSheetModal = ({ onClose, onConnect }) => {
  const [step, setStep] = React.useState(1); // 1: duplicate, 2: deploy, 3: paste
  const [url, setUrl] = React.useState('');
  const [error, setError] = React.useState(null);

  const validate = (v) => {
    if (!v.trim()) return 'Paste your Apps Script Web App URL';
    if (!/script\.google\.com.*\/exec/.test(v) && !/sheets/i.test(v)) {
      return 'That doesn\'t look like an Apps Script URL — check the setup guide';
    }
    return null;
  };

  const onSubmit = () => {
    const err = validate(url);
    if (err) { setError(err); return; }
    onConnect(url);
  };

  return (
    <div className="pc-splash">
      <div className="pc-splash-card solo" style={{ maxWidth: 640 }}>
        <div style={{ padding: '32px 36px 28px' }}>
          <div className="row between" style={{ marginBottom: 22 }}>
            <div className="row" style={{ gap: 12 }}>
              <img src="assets/pulse-check-iq-logo.png" alt="Pulse Check IQ" style={{ height: 22 }} />
              <span style={{ width: 1, height: 18, background: 'var(--border)' }}></span>
              <span style={{ fontSize: 13, color: 'var(--ink-muted)', fontWeight: 500 }}>Connect your Google Sheet</span>
            </div>
            <IconButton icon={I.X} onClick={onClose} />
          </div>

          <h1 className="h2" style={{ marginBottom: 8, color: 'var(--pc-navy)' }}>Three steps. Five minutes.</h1>
          <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
            Your dashboard reads and writes data to <strong>your own Google Sheet</strong> — we never see it. Follow the steps below; you'll only ever do this once.
          </p>

          {/* Step 1: Duplicate template */}
          <div className={`cs-step ${step > 1 ? 'done' : ''}`}>
            <div className="cs-step-num">{step > 1 ? <I.Check size={14} stroke={3} /> : 1}</div>
            <div className="cs-step-body">
              <div className="cs-step-title">Duplicate the template sheet</div>
              <div className="cs-step-desc">Make your own copy of the master Google Sheet. Your business data will live here.</div>
              <div className="cs-step-actions">
                <a className="btn primary" href="#" onClick={(e) => { e.preventDefault(); setStep(Math.max(step, 2)); }}>
                  <I.Link size={13} /> Open template &amp; make a copy
                </a>
                {step > 1 && <Badge variant="good"><I.Check size={11} /> Done</Badge>}
              </div>
            </div>
          </div>

          {/* Step 2: Apps Script deploy */}
          <div className={`cs-step ${step > 2 ? 'done' : ''}`}>
            <div className="cs-step-num">{step > 2 ? <I.Check size={14} stroke={3} /> : 2}</div>
            <div className="cs-step-body">
              <div className="cs-step-title">Publish your Apps Script Web App</div>
              <div className="cs-step-desc">In your copied sheet: <strong>Extensions → Apps Script → Deploy → New deployment → Web App</strong>. Set "Execute as: Me" and "Anyone with the link". Copy the URL.</div>
              <div className="cs-step-actions">
                <Button onClick={() => setStep(Math.max(step, 3))}>Got the URL — next</Button>
                <Button variant="ghost"><I.File size={13} /> View detailed guide</Button>
              </div>
            </div>
          </div>

          {/* Step 3: Paste URL */}
          <div className="cs-step">
            <div className="cs-step-num">3</div>
            <div className="cs-step-body">
              <div className="cs-step-title">Paste your Web App URL below</div>
              <div className="cs-step-desc">This is what your dashboard uses to talk to your sheet. It stays in your browser — never sent anywhere else.</div>
              <div style={{ marginTop: 10 }}>
                <Input
                  placeholder="https://script.google.com/macros/s/AKfyc.../exec"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(null); }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}
                />
                {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{error}</div>}
              </div>
            </div>
          </div>

          <div className="row between" style={{ marginTop: 24, gap: 12 }}>
            <Button variant="ghost" onClick={onClose}>I'll do this later</Button>
            <Button variant="primary" disabled={step < 3 || !url.trim()} onClick={onSubmit} icon={<I.Check />}>
              Connect &amp; start setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Powered-by footer badge */
const PoweredByPulseCheck = () => (
  <a href="#" onClick={(e) => e.preventDefault()} className="powered-by" title="Built by Pulse Check IQ">
    Powered by
    <img src="assets/pulse-check-iq-logo.png" alt="Pulse Check IQ" />
  </a>
);

Object.assign(window, { DemoBanner, PulseCheckWelcome, ConnectSheetModal, PoweredByPulseCheck });
