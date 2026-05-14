/* ============================================================
   Daily Entry Form
   Auto-generated from the configured skills + training items.
   Rating control matches config.ratingFormat (percent/stars/passfail).
   ============================================================ */

const DailyEntryPage = ({ config, trainees, skills: skillsProp, trainingItems: trainingProp, contextArg, onNavigate, onSaveEntry }) => {
  const L = config.labels;
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry) || INDUSTRY_TEMPLATES[0];
  const allSkills = (skillsProp && skillsProp.length) ? skillsProp : tpl.skills;
  const allTraining = (trainingProp && trainingProp.length) ? trainingProp : tpl.training;

  const [traineeId, setTraineeId] = React.useState(contextArg?.traineeId || trainees[0]?.id);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = React.useState('morning');

  // Skill scores keyed by skill name
  const [scores, setScores] = React.useState({});           // { 'Customer Service': 88 }
  const [skillNotes, setSkillNotes] = React.useState({});   // { 'Customer Service': 'great today' }
  const [notPerformed, setNotPerformed] = React.useState({});// { 'Closing Procedure': true }
  const [openNoteFor, setOpenNoteFor] = React.useState(null);

  const [trainingCompleted, setTrainingCompleted] = React.useState({});

  const [overallNote, setOverallNote] = React.useState('');
  const [flagThis, setFlagThis] = React.useState(false);
  const [flagText, setFlagText] = React.useState('');
  const [flagKind, setFlagKind] = React.useState('cash');

  const [saved, setSaved] = React.useState(false);

  const trainee = trainees.find(t => t.id === traineeId);

  // Counts for progress
  const totalSkills = allSkills.length;
  const scoredCount = allSkills.filter(s => scores[s.name] != null || notPerformed[s.name]).length;
  const progressPct = totalSkills ? Math.round((scoredCount / totalSkills) * 100) : 0;

  const setScore = (skill, value) => {
    setScores(prev => ({ ...prev, [skill]: value }));
    setNotPerformed(prev => ({ ...prev, [skill]: false }));
  };

  const togglePerformed = (skill) => {
    const next = !notPerformed[skill];
    setNotPerformed(prev => ({ ...prev, [skill]: next }));
    if (next) setScores(prev => ({ ...prev, [skill]: null }));
  };

  const onSave = () => {
    if (onSaveEntry) {
      onSaveEntry({
        traineeId,
        date,
        shift,
        scores,
        skillNotes,
        notPerformed,
        trainingCompleted,
        overallNote,
        flag: flagThis ? { kind: flagKind, severity: 'watch', text: flagText } : null,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const reset = () => {
    setScores({});
    setSkillNotes({});
    setNotPerformed({});
    setTrainingCompleted({});
    setOverallNote('');
    setFlagThis(false);
    setFlagText('');
    setOpenNoteFor(null);
  };

  // Group skills by category
  const cats = [...new Set(allSkills.map(s => s.category))];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h1">Daily Entry</h1>
          <div className="subtitle">
            Quick-capture today's evaluation. Auto-built from your {L.skills.toLowerCase()} and {L.assigned_training.toLowerCase()}.
          </div>
        </div>
        <div className="page-header-actions">
          <Button variant="ghost" onClick={reset}>Clear form</Button>
          <Button variant="primary" icon={<I.Check />} onClick={onSave}>Save entry</Button>
        </div>
      </div>

      {/* Saved toast */}
      {saved && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 60,
          background: 'var(--ink-strong)', color: 'var(--bg)',
          padding: '12px 16px', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: 'var(--shadow-lg)',
          animation: 'tourpop .25s ease',
        }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--good)', display: 'grid', placeItems: 'center' }}>
            <I.Check size={13} stroke={3} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>Entry saved for {trainee.name}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{scoredCount} skills · {Object.values(trainingCompleted).filter(Boolean).length} training items</div>
          </div>
        </div>
      )}

      {/* Context bar */}
      <Card className="entry-context" style={{ marginBottom: 16 }}>
        <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
          <Field label={`Who is this for?`}>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {trainees.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTraineeId(t.id)}
                  className={`chip ${traineeId === t.id ? 'active' : ''}`}
                  style={{ padding: '6px 12px 6px 4px' }}
                >
                  <Avatar name={t.name} size="sm" />
                  {t.name}
                </button>
              ))}
            </div>
          </Field>
          <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }} />
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 160 }} />
          </Field>
          <Field label="Shift">
            <div className="row" style={{ gap: 4 }}>
              {['morning', 'mid', 'close'].map(s => (
                <button key={s} className={`chip ${shift === s ? 'active' : ''}`} onClick={() => setShift(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
              ))}
            </div>
          </Field>
          <div style={{ marginLeft: 'auto' }}>
            <Field label="Progress">
              <div className="row" style={{ gap: 10, width: 220 }}>
                <Bar value={progressPct} />
                <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, minWidth: 64 }}>
                  {scoredCount} / {totalSkills}
                </span>
              </div>
            </Field>
          </div>
        </div>
      </Card>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'flex-start' }}>
        {/* LEFT: Form */}
        <div className="stack">
          {/* Skills sections */}
          {cats.map(cat => (
            <Card key={cat} title={cat || L.skills}>
              <div className="stack" style={{ gap: 4 }}>
                {allSkills.filter(s => s.category === cat).map(skill => {
                  const value = scores[skill.name];
                  const np = notPerformed[skill.name];
                  const noteOpen = openNoteFor === skill.name;
                  return (
                    <div key={skill.name} className="entry-row" style={{
                      padding: '14px 0',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{skill.name}</div>
                          {skill.blurb && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{skill.blurb}</div>}
                          {skill.target && <div className="faint mono" style={{ fontSize: 11, marginTop: 4 }}>Target: {skill.target}%</div>}
                        </div>
                        <div style={{ width: 280, flexShrink: 0 }}>
                          {np ? (
                            <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                              <Badge variant="warn"><I.Minus size={11} />Not performed today</Badge>
                            </div>
                          ) : (
                            <RatingInput
                              format={config.ratingFormat}
                              value={value}
                              target={skill.target}
                              onChange={(v) => setScore(skill.name, v)}
                            />
                          )}
                        </div>
                        <div className="row shrink-0" style={{ gap: 4 }}>
                          <button
                            className={`icon-btn ${skillNotes[skill.name] ? 'active' : ''}`}
                            onClick={() => setOpenNoteFor(noteOpen ? null : skill.name)}
                            title="Add note"
                          >
                            <I.Edit size={14} />
                          </button>
                          <button
                            className={`icon-btn ${np ? 'active' : ''}`}
                            onClick={() => togglePerformed(skill.name)}
                            title="Not performed today"
                          >
                            <I.Minus size={14} />
                          </button>
                        </div>
                      </div>
                      {noteOpen && (
                        <div style={{ marginTop: 10, paddingLeft: 4 }}>
                          <Textarea
                            placeholder={`Context for ${skill.name.toLowerCase()} today — what happened, what's tricky, what you observed…`}
                            value={skillNotes[skill.name] || ''}
                            onChange={(e) => setSkillNotes(prev => ({ ...prev, [skill.name]: e.target.value }))}
                            style={{ minHeight: 64 }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}

          {/* Training items */}
          {config.enabledSections.assigned_training && allTraining.length > 0 && (
            <Card title={L.assigned_training} actions={<Badge>Check anything completed today</Badge>}>
              <div className="stack" style={{ gap: 8 }}>
                {allTraining.map(tr => (
                  <label key={tr.name} className="row" style={{
                    gap: 12, padding: 12, border: '1px solid var(--border)',
                    borderRadius: 10, background: 'var(--bg-elevated)', cursor: 'pointer',
                  }} onClick={(e) => { e.preventDefault(); setTrainingCompleted(prev => ({ ...prev, [tr.name]: !prev[tr.name] })); }}>
                    <span className={`checkbox lg ${trainingCompleted[tr.name] ? 'checked' : ''}`}></span>
                    <div style={{ flex: 1 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <span style={{ fontWeight: 500, fontSize: 13.5 }}>{tr.name}</span>
                        {tr.mandatory && <Badge variant="accent">Mandatory</Badge>}
                        {tr.expires && <Badge>Expires {tr.expires}</Badge>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {/* Overall note */}
          <Card title="Today's notes" actions={<Badge>Optional</Badge>}>
            <Textarea
              placeholder={`Anything that doesn't fit cleanly into a score — gray-area situations, context from a customer interaction, why a skill couldn't be evaluated, what you'd want to remember for next time…`}
              value={overallNote}
              onChange={(e) => setOverallNote(e.target.value)}
              style={{ minHeight: 100 }}
            />
          </Card>

          {/* Flag */}
          <Card title="Escalate this entry?" actions={<Toggle size="sm" checked={flagThis} onChange={setFlagThis} label={flagThis ? 'On' : 'Off'} />}>
            {flagThis ? (
              <div className="stack">
                <div className="grid-2">
                  <Field label="Type">
                    <Select value={flagKind} onChange={(e) => setFlagKind(e.target.value)}>
                      <option value="cash">Cash / register issue</option>
                      <option value="safety">Safety</option>
                      <option value="conduct">Conduct / interpersonal</option>
                      <option value="attendance">Attendance</option>
                      <option value="performance">Performance gap</option>
                      <option value="other">Other</option>
                    </Select>
                  </Field>
                  <Field label="Severity">
                    <div className="row" style={{ gap: 4, paddingTop: 4 }}>
                      <Radio checked={true} label="Watch item" />
                      <Radio checked={false} label="Red flag" />
                    </div>
                  </Field>
                </div>
                <Field label="What happened">
                  <Textarea
                    placeholder="Brief description. This will surface on the trainee's profile and on the home dashboard."
                    value={flagText}
                    onChange={(e) => setFlagText(e.target.value)}
                  />
                </Field>
              </div>
            ) : (
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                Use this when something serious needs attention — cash shortages, safety issues, repeated misses.
                Flags surface on the {L.trainee.toLowerCase()}'s profile and on the home dashboard.
              </p>
            )}
          </Card>

          <div className="row" style={{ gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button variant="ghost" onClick={() => onNavigate('home')}>Cancel</Button>
            <Button onClick={onSave} icon={<I.Check />}>Save & enter another</Button>
            <Button variant="primary" onClick={() => { onSave(); setTimeout(() => onNavigate('trainees', { traineeId }), 600); }} icon={<I.Check />}>Save & view {L.trainee.toLowerCase()}</Button>
          </div>
        </div>

        {/* RIGHT: Sticky preview / summary */}
        <div style={{ position: 'sticky', top: 8 }}>
          <Card tight title="Today's snapshot">
            {trainee && (
              <>
                <div className="row" style={{ gap: 12, marginBottom: 14 }}>
                  <Avatar name={trainee.name} size="lg" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{trainee.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{trainee.position}</div>
                    <div className="faint" style={{ fontSize: 11.5, marginTop: 2 }}>Day {trainee.daysIn} of {trainee.pathDays} · {trainee.trainer}</div>
                  </div>
                </div>
                <div className="divider"></div>
                <div className="stack-sm" style={{ marginTop: 12 }}>
                  <SummaryStat label={`${L.skills} scored`} value={`${scoredCount} / ${totalSkills}`} />
                  <SummaryStat label="Not performed" value={Object.values(notPerformed).filter(Boolean).length} />
                  <SummaryStat label={`${L.assigned_training} done`} value={`${Object.values(trainingCompleted).filter(Boolean).length} / ${allTraining.length}`} />
                  <SummaryStat label="Skill notes" value={Object.values(skillNotes).filter(Boolean).length} />
                  <SummaryStat label="Flag raised" value={flagThis ? 'Yes' : 'No'} tone={flagThis ? 'danger' : ''} />
                </div>
                {scoredCount > 0 && (
                  <>
                    <div className="divider" style={{ margin: '14px 0' }}></div>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Today's average</div>
                    {(() => {
                      const vals = Object.values(scores).filter(v => v != null);
                      const avg = vals.length ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length) : 0;
                      return (
                        <>
                          <div className="h2" style={{ margin: 0, color: avg >= 85 ? 'var(--good)' : avg >= 70 ? 'var(--ink-strong)' : 'var(--danger)' }}>{avg}%</div>
                          <Bar value={avg} thick warn={avg < 85} danger={avg < 70} />
                        </>
                      );
                    })()}
                  </>
                )}
              </>
            )}
          </Card>

          <Card tight title="Tips" style={{ marginTop: 16 }}>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
              <li>Leave a {L.skill.toLowerCase()} blank if you didn't observe it today — that's fine.</li>
              <li>Use "Not performed" when the trainee was scheduled to do something but didn't get to it.</li>
              <li>Notes are pulled into the AI summary along with scores.</li>
              <li>Flags surface on the home dashboard immediately.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
};

const SummaryStat = ({ label, value, tone }) => (
  <div className="row between" style={{ padding: '4px 0' }}>
    <span className="muted" style={{ fontSize: 12.5 }}>{label}</span>
    <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: tone === 'danger' ? 'var(--danger)' : 'var(--ink-strong)' }}>{value}</span>
  </div>
);

/* ---- Rating input: switches based on configured format ---- */
const RatingInput = ({ format, value, target, onChange }) => {
  if (format === 'stars') {
    const stars = value != null ? Math.round((value / 100) * 5) : 0;
    return (
      <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => onChange(n * 20)} className="icon-btn" style={{ width: 28, height: 28 }}>
            {n <= stars
              ? <I.StarFilled size={18} stroke={0} style={{ color: 'var(--accent)' }} />
              : <I.Star size={18} style={{ color: 'var(--border-strong)' }} />}
          </button>
        ))}
      </div>
    );
  }
  if (format === 'passfail') {
    const pass = value != null && value >= (target || 80);
    const fail = value != null && value < (target || 80);
    return (
      <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
        <button className={`chip ${fail ? 'active' : ''}`} onClick={() => onChange(50)} style={{ background: fail ? 'var(--danger)' : '', borderColor: fail ? 'var(--danger)' : '', color: fail ? 'white' : '' }}>
          <I.X size={12} /> Needs work
        </button>
        <button className={`chip ${pass ? 'active' : ''}`} onClick={() => onChange(100)} style={{ background: pass ? 'var(--good)' : '', borderColor: pass ? 'var(--good)' : '', color: pass ? 'white' : '' }}>
          <I.Check size={12} /> Pass
        </button>
      </div>
    );
  }
  // percent — quick chips + slider
  return (
    <div className="row" style={{ gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
      <input
        type="range" min="0" max="100" step="5"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: 'var(--accent)' }}
      />
      <div style={{
        minWidth: 64, textAlign: 'center', padding: '4px 8px',
        fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13,
        background: value == null ? 'var(--surface-alt)' : value >= (target || 85) ? 'var(--good-soft)' : value >= (target || 85) - 10 ? 'var(--warn-soft)' : 'var(--danger-soft)',
        color: value == null ? 'var(--ink-faint)' : value >= (target || 85) ? 'var(--good)' : value >= (target || 85) - 10 ? 'oklch(0.45 0.1 75)' : 'var(--danger)',
        borderRadius: 6,
      }}>
        {value == null ? '—' : value + '%'}
      </div>
    </div>
  );
};

Object.assign(window, { DailyEntryPage });
