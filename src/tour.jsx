/* ============================================================
   First-run product tour — sequential overlay cards
   ============================================================ */

const TOUR_STEPS = [
  {
    icon: '👋',
    title: 'Welcome to your new dashboard',
    body: "Your setup is saved. Here's a quick 30-second tour of where everything lives — you can skip it any time.",
  },
  {
    icon: '👥',
    title: 'Trainees live in the sidebar',
    body: "Click any name to open their full profile — scorecards, training progress, notes, and red flags.",
  },
  {
    icon: '🚩',
    title: 'Red flags surface on the home page',
    body: "Anything that needs attention — cash shortages, missed checklists, behind-schedule trainees — shows up on Home AND on the trainee's profile.",
  },
  {
    icon: '✨',
    title: 'Generate weekly AI summaries',
    body: "Pick a trainee, pick a date range, generate. Edit if you want, then email via Gmail or export to Word / Google Docs.",
  },
  {
    icon: '⚙️',
    title: 'Change anything from Settings',
    body: "Rename labels to match your team's vocabulary, swap palette/fonts, add new skills, disable sections you don't need.",
  },
];

const Tour = ({ onDone }) => {
  const [step, setStep] = React.useState(0);
  const s = TOUR_STEPS[step];

  return (
    <div className="tour-backdrop" onClick={onDone}>
      <div className="tour-card" onClick={(e) => e.stopPropagation()}>
        <div className="tour-img">
          <div style={{ fontSize: 56 }}>{s.icon}</div>
        </div>
        <div className="eyebrow">Tour · {step + 1} of {TOUR_STEPS.length}</div>
        <h2 className="h2" style={{ margin: '8px 0 12px' }}>{s.title}</h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)', margin: 0 }}>{s.body}</p>

        <div className="row between" style={{ marginTop: 24 }}>
          <Button variant="ghost" onClick={onDone}>Skip tour</Button>
          <div className="row" style={{ gap: 8 }}>
            {step > 0 && <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>}
            <Button variant="primary" onClick={() => step < TOUR_STEPS.length - 1 ? setStep(s => s + 1) : onDone()}>
              {step === TOUR_STEPS.length - 1 ? 'Get started' : 'Next'}
              {step < TOUR_STEPS.length - 1 && <I.Chevron />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Tour });
