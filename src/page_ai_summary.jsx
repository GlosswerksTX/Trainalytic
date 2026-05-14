/* ============================================================
   AI Summary generator page
   ============================================================ */

const SAMPLE_SUMMARIES = {
  t1: {
    trends: "Maya's third week shows continued upward movement across the board. Customer Service climbed from 82% → 88% and Drink Prep is up to 78% after focused practice on free pours. POS Operation is now at 92%, well above the 90% target.",
    wins: "Solo'd the morning rush on Tuesday, May 12 with three concurrent mobile orders and zero remakes. First time handling a Tuesday open without senior support — opening checklist completed in 28 minutes (target: 35).",
    focus: "Latte art consistency is the standout gap. Devon noted inconsistent rosettas during slower shifts. Suggest scheduling 30 minutes of free-pour practice at the start of three shifts this week.",
    recommendations: "1) Pair Maya with Jordan on Saturday open for latte art shadowing. 2) Move closing procedure into next week's evaluation rotation — she's ready. 3) Begin introducing customer recovery scenarios.",
  },
  t3: {
    trends: "Dani's overall numbers remain strong on people-side skills (Customer Service 91%, Drink Prep 90%) but operational accuracy has slipped. Cash Handling dropped from 84% → 72% over the last two weeks, and Closing Procedure is trending down (78% → 70%).",
    wins: "Customer recovery on the Saturday-night noise complaint was handled exactly to spec — clear de-escalation, manager loop-in, and a follow-up email logged. Bar work is genuinely strong, especially on espresso pulls.",
    focus: "Cash drawer was short $11 on Wed and Sat. Closing checklist missed two items twice in the past 7 days (cleaning log, alarm code). This is the single biggest blocker to shift-lead readiness. Coaching conversation booked Thursday.",
    recommendations: "1) Side-by-side drawer count for next three closes with Marcus. 2) Move alarm/lockup to a pre-leave checklist sign-off — must be initialed before clocking out. 3) Hold off on remaining shift-lead modules until we see two clean weeks.",
  },
};

const SUMMARIES = SAMPLE_TRAINEES.reduce((acc, t) => {
  acc[t.id] = SAMPLE_SUMMARIES[t.id] || {
    trends: `${t.name}'s scores over the selected range trend mostly stable. Average performance ~${Math.round(Object.values(t.scores).filter(Boolean).reduce((a,b)=>a+b,0) / Object.values(t.scores).filter(Boolean).length)}%.`,
    wins: `Consistent showing across day-to-day skills. ${t.trainer} has logged ${t.notes.length} positive observations.`,
    focus: `Continue building reps on lower-scoring skills.`,
    recommendations: `Maintain current pace. Schedule next evaluation block.`,
  };
  return acc;
}, {});

const AiSummaryPage = ({ config, trainees, contextArg }) => {
  const L = config.labels;
  const [traineeId, setTraineeId] = React.useState(contextArg?.traineeId || trainees[0]?.id);
  const [range, setRange] = React.useState('7d');
  const [generating, setGenerating] = React.useState(false);
  const [generated, setGenerated] = React.useState(false);
  const [genError, setGenError] = React.useState(null);
  const [liveSummary, setLiveSummary] = React.useState(null); // null = use canned; object = Claude output
  const [edited, setEdited] = React.useState(null); // null = use generated, otherwise edited markup
  const [sendOpen, setSendOpen] = React.useState(false);

  const trainee = trainees.find(t => t.id === traineeId);
  const cannedSummary = SUMMARIES[traineeId];
  const summary = liveSummary || cannedSummary;

  React.useEffect(() => {
    setGenerated(false);
    setEdited(null);
    setLiveSummary(null);
    setGenError(null);
  }, [traineeId, range]);

  const generate = async () => {
    setGenerating(true);
    setGenError(null);
    setLiveSummary(null);

    try {
      const t = trainee;
      const rangeLabel = range === '7d' ? 'last 7 days' : range === '30d' ? 'last 30 days' : 'lifetime';
      const sections = Object.entries(config.aiSummary.sections).filter(([_, v]) => v).map(([k]) => k);
      const recentNotes = (t.notes || []).slice(0, 5).map(n => `[${n.date} ${n.author}] ${n.text}`).join('\n');
      const flagsText = (t.redFlags || []).map(f => `[${f.kind} ${f.severity}] ${f.text}`).join('\n') || 'None';

      const prompt = `You are writing a performance summary for ${t.name}, who is on day ${t.daysIn} of a ${t.pathDays}-day ${config.labels.training_path.toLowerCase()} as a ${t.position} at ${config.businessName}. Their assigned ${config.labels.trainer.toLowerCase()} is ${t.trainer}.

TIME RANGE: ${rangeLabel}
TONE: ${config.aiSummary.tone}
LENGTH: ${config.aiSummary.length} (short = 1 paragraph each section, medium = 2-3 sentences, long = full breakdown)
LANGUAGE: ${config.aiSummary.language}
AUDIENCE: ${config.aiSummary.audience}

SCORECARD (out of 100, target ≈85):
${Object.entries(t.scores).map(([k, v]) => `- ${k}: ${v == null ? 'not yet evaluated' : v + '% (' + (t.trend[k] || 'flat') + ')'}`).join('\n')}

TRAINING: ${t.trainingDone} of ${t.trainingTotal} items complete. Certifications earned: ${t.quals.join(', ') || 'none yet'}.

RED FLAGS / ESCALATIONS:
${flagsText}

RECENT TRAINER NOTES:
${recentNotes || 'None recorded.'}

Return ONLY valid JSON in this exact shape (no markdown fences, no preamble):
{
${sections.includes('trends') ? '  "trends": "...",\n' : ''}${sections.includes('wins') ? '  "wins": "...",\n' : ''}${sections.includes('focus') ? '  "focus": "...",\n' : ''}${sections.includes('recommendations') ? '  "recommendations": "1) ... 2) ... 3) ...",\n' : ''}${sections.includes('attendance') ? '  "attendance": "...",\n' : ''}}

For "recommendations", number them 1) 2) 3). Be specific — reference actual scores, trends, and notes from the data. Avoid generic advice.`;

      const text = await window.claude.complete(prompt);
      let parsed;
      try {
        // Strip any code fences if the model added them
        const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (e) {
        throw new Error('Could not parse model response');
      }
      setLiveSummary(parsed);
      setGenerated(true);
    } catch (e) {
      // Fallback to canned, but show a note
      setGenError(e.message || 'Generation failed — showing sample summary instead');
      setGenerated(true);
    } finally {
      setGenerating(false);
    }
  };

  const sections = config.aiSummary.sections;
  const tone = config.aiSummary.tone;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h1">AI Summary</h1>
          <div className="subtitle">Generate a weekly or custom-range summary. Edit it, then email or export.</div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '300px 1fr', gap: 16 }}>
        {/* LEFT: Configuration */}
        <div className="stack">
          <Card tight title="Trainee">
            <Select value={traineeId} onChange={(e) => setTraineeId(e.target.value)}>
              {trainees.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Card>

          <Card tight title="Date range">
            <div className="stack-sm">
              {[
                ['7d', 'Last 7 days'],
                ['30d', 'Last 30 days'],
                ['lifetime', 'Lifetime'],
                ['custom', 'Custom range…'],
              ].map(([id, lbl]) => (
                <Radio key={id} checked={range === id} onChange={() => setRange(id)} label={lbl} />
              ))}
            </div>
          </Card>

          <Card tight title="Voice (saved)" actions={<Badge>Edit in Settings</Badge>}>
            <div className="stack-sm" style={{ fontSize: 12.5 }}>
              <div><span className="faint">Tone: </span><span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{tone}</span></div>
              <div><span className="faint">Length: </span><span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{config.aiSummary.length}</span></div>
              <div><span className="faint">Language: </span><span style={{ fontWeight: 500 }}>{config.aiSummary.language}</span></div>
              <div><span className="faint">Role: </span><span style={{ fontWeight: 500 }}>{config.aiSummary.role || '—'}</span></div>
              <div><span className="faint">Model: </span>
                <span style={{ fontWeight: 500 }}>
                  {config.aiSummary.apiProvider === 'none'
                    ? 'Disabled'
                    : config.aiSummary.apiKey
                      ? `${config.aiSummary.apiProvider === 'openai' ? 'OpenAI' : 'Claude'} · key connected`
                      : 'No key set'}
                </span>
              </div>
            </div>
          </Card>

          <Card tight title="Include sections">
            <div className="stack-sm" style={{ gap: 8 }}>
              <Checkbox checked={sections.trends} label="Performance trends" />
              <Checkbox checked={sections.wins} label="Wins & highlights" />
              <Checkbox checked={sections.focus} label="Focus areas" />
              <Checkbox checked={sections.recommendations} label="Recommendations" />
              <Checkbox checked={sections.attendance} label="Attendance" />
            </div>
          </Card>

          <Button variant="primary" icon={<I.Sparkle />} disabled={generating} onClick={generate} style={{ width: '100%', justifyContent: 'center' }}>
            {generating ? 'Generating…' : generated ? 'Regenerate' : 'Generate summary'}
          </Button>
        </div>

        {/* RIGHT: Preview */}
        <div>
          {!generated && !generating && (
            <div className="ai-card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14, background: 'var(--surface)', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)' }}>
                <I.Sparkle size={22} style={{ color: 'var(--accent-ink)' }} />
              </div>
              <h3 className="h3" style={{ marginBottom: 6 }}>Ready when you are</h3>
              <p className="muted" style={{ fontSize: 13.5, maxWidth: 380, margin: '0 auto' }}>
                Choose a {L.trainee.toLowerCase()} and date range, then hit <strong>Generate summary</strong>. Output will reflect the voice and sections you've set in Settings.
              </p>
            </div>
          )}

          {generating && (
            <div className="ai-card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14, background: 'var(--surface)', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)' }}>
                <I.Sparkle size={22} style={{ color: 'var(--accent-ink)', animation: 'spin 1.5s linear infinite' }} />
              </div>
              <h3 className="h3" style={{ marginBottom: 6 }}>Reading the data…</h3>
              <p className="muted" style={{ fontSize: 13.5 }}>Pulling {range === '7d' ? '7 days' : range === '30d' ? '30 days' : 'all-time'} of scores, notes, and training events for {trainee.name}.</p>
            </div>
          )}

          {generated && (
            <div className="ai-card">
              <div className="row between" style={{ marginBottom: 16 }}>
                <div>
                  <div className="eyebrow" style={{ color: 'var(--accent-ink)' }}>
                    Weekly Summary · {range === '7d' ? 'May 6 – May 12' : range === '30d' ? 'Apr 13 – May 12' : 'Lifetime'}
                    {liveSummary && <Badge variant="accent" style={{ marginLeft: 8 }}><I.Sparkle size={10} /> Live AI</Badge>}
                    {genError && <Badge variant="warn" style={{ marginLeft: 8 }} title={genError}>Sample fallback</Badge>}
                  </div>
                  <h2 className="h2" style={{ marginTop: 8 }}>{trainee.name}</h2>
                  <div className="muted" style={{ fontSize: 13 }}>{trainee.position} · {trainee.trainer} · Day {trainee.daysIn} of {trainee.pathDays}</div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <IconButton icon={I.Edit} active={edited !== null} onClick={() => setEdited(edited === null ? '' : null)} title="Edit" />
                  {edited !== null && <Button size="sm" variant="ghost" onClick={() => setEdited(null)} icon={<I.Refresh />}>Reset</Button>}
                </div>
              </div>

              {edited !== null ? (
                <Textarea
                  value={edited || makePlainSummary(trainee, summary, sections)}
                  onChange={(e) => setEdited(e.target.value)}
                  style={{ minHeight: 320, fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.6 }}
                />
              ) : (
                <div className="ai-prose">
                  {sections.trends && summary.trends && (<><h4>Performance trends</h4><p>{summary.trends}</p></>)}
                  {sections.wins && summary.wins && (<><h4>Wins & highlights</h4><p>{summary.wins}</p></>)}
                  {sections.focus && summary.focus && (<><h4>Areas to focus on</h4><p>{summary.focus}</p></>)}
                  {sections.recommendations && summary.recommendations && (
                    <>
                      <h4>Recommendations</h4>
                      <ul>
                        {summary.recommendations.split(/\d\)\s/).filter(Boolean).map((r, i) => <li key={i}>{r.trim().replace(/\.$/, '.')}</li>)}
                      </ul>
                    </>
                  )}
                  {sections.attendance && summary.attendance && (<><h4>Attendance</h4><p>{summary.attendance}</p></>)}
                </div>
              )}

              <div className="hr"></div>

              <div className="row between">
                <div className="muted" style={{ fontSize: 12 }}>
                  Generated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · auto-attached: scorecards, notes, training events
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <Button icon={<I.Download />}>Export</Button>
                  <Button variant="primary" icon={<I.Mail />} onClick={() => setSendOpen(true)}>Email summary</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email modal with preview */}
      {sendOpen && (
        <EmailComposer
          config={config}
          trainee={trainee}
          range={range}
          summary={summary}
          editedText={edited}
          sections={sections}
          onClose={() => setSendOpen(false)}
        />
      )}
    </>
  );
};

/* ============================================================
   Email composer — form on left, live Gmail-style preview on right
   ============================================================ */

const EmailComposer = ({ config, trainee, range, summary, editedText, sections, onClose }) => {
  const businessSlug = config.businessName.toLowerCase().replace(/[^a-z]/g, '');
  const rangeLabel = range === '7d' ? 'May 6 – May 12' : range === '30d' ? 'Apr 13 – May 12' : 'Lifetime';
  const subjectDefault = `Your weekly OJT summary — ${rangeLabel}`;

  const [to, setTo] = React.useState(`${trainee.name.toLowerCase().replace(' ', '.')}@${businessSlug}.com`);
  const [cc, setCC] = React.useState(config.aiSummary.audience.includes('Manager')
    ? `${trainee.trainer.toLowerCase().replace(/[.\s]+/g, '.')}@${businessSlug}.com`
    : '');
  const [subject, setSubject] = React.useState(subjectDefault);
  const [intro, setIntro] = React.useState(`Hi ${trainee.name.split(' ')[0]} — here's your weekly recap. Reply if anything looks off.`);
  const [footer, setFooter] = React.useState(`— ${config.businessName} · OJT Dashboard`);
  const [sendMode, setSendMode] = React.useState('body'); // 'body' | 'pdf'
  const [sent, setSent] = React.useState(false);

  const initial = config.businessName?.[0] || 'R';

  return (
    <div className="tour-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        width: 'min(1080px, 95vw)',
        maxHeight: '90vh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        animation: 'tourpop .25s ease',
        overflow: 'hidden',
      }}>
        <div className="row between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <div className="row" style={{ gap: 10 }}>
            <I.Mail size={18} />
            <h3 className="h3" style={{ margin: 0 }}>{sent ? 'Sent!' : 'Send weekly summary'}</h3>
            <Badge>via Gmail</Badge>
          </div>
          <IconButton icon={I.X} onClick={onClose} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', overflow: 'hidden' }}>
          {/* LEFT: form */}
          <div style={{ padding: 22, overflowY: 'auto', borderRight: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            {sent ? (
              <div className="stack" style={{ alignItems: 'center', padding: 30, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--good-soft)', color: 'var(--good)', display: 'grid', placeItems: 'center' }}>
                  <I.Check size={24} stroke={2.5} />
                </div>
                <div>
                  <h3 className="h3" style={{ margin: 0 }}>Email sent</h3>
                  <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                    Delivered to <strong>{to}</strong>{cc && <> · cc <strong>{cc}</strong></>}.
                    A copy was logged on {trainee.name}'s profile.
                  </p>
                </div>
                <Button variant="primary" onClick={onClose}>Done</Button>
              </div>
            ) : (
              <div className="stack">
                <Field label="To"><Input value={to} onChange={(e) => setTo(e.target.value)} /></Field>
                <Field label="CC"><Input value={cc} onChange={(e) => setCC(e.target.value)} placeholder="Optional" /></Field>
                <Field label="Subject"><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
                <Field label="Opening line">
                  <Textarea value={intro} onChange={(e) => setIntro(e.target.value)} style={{ minHeight: 60 }} />
                </Field>
                <Field label="Signature / footer">
                  <Input value={footer} onChange={(e) => setFooter(e.target.value)} />
                </Field>
                <Field label="Format">
                  <div className="stack-sm" style={{ gap: 6 }}>
                    <Radio checked={sendMode === 'body'} onChange={() => setSendMode('body')} label="Email body (rich text)" />
                    <Radio checked={sendMode === 'pdf'} onChange={() => setSendMode('pdf')} label="Attach as PDF" />
                  </div>
                </Field>
                <div className="muted row" style={{ gap: 6, fontSize: 12 }}>
                  <I.Google size={13} /> Sent from your connected Gmail · auto-cc yourself
                </div>
                <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button variant="primary" icon={<I.Mail />} onClick={() => setSent(true)}>Send now</Button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Gmail-style preview */}
          <div style={{ background: 'oklch(0.96 0.005 75)', padding: 20, overflowY: 'auto' }}>
            <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <I.Eye size={11} /> Live preview · what {trainee.name.split(' ')[0]} will see
            </div>
            <div style={{
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              maxWidth: 560,
              margin: '0 auto',
            }}>
              {/* Gmail-ish header */}
              <div style={{ padding: '16px 20px 0', color: '#202124' }}>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: '#202124', fontWeight: 500 }}>
                  {subject || subjectDefault}
                </div>
                <div className="row" style={{ marginTop: 10, gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--accent)', color: 'white',
                    display: 'grid', placeItems: 'center',
                    fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-display)',
                  }}>{initial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: '#202124' }}>
                      <span style={{ fontWeight: 500 }}>{config.businessName}</span>
                      <span style={{ color: '#5f6368' }}> &lt;dashboard@{businessSlug}.com&gt;</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#5f6368', marginTop: 2 }}>
                      to {to.split('@')[0]}{cc && `, cc ${cc.split('@')[0]}`}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#5f6368' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e8eaed', margin: '14px 0 0' }} />

              {/* Email body */}
              <div style={{ padding: '20px 22px 24px', color: '#202124', fontSize: 14, lineHeight: 1.6, fontFamily: 'var(--font-sans)' }}>
                {/* Branded header bar */}
                <div style={{
                  background: 'var(--accent)', color: 'white',
                  padding: '14px 18px', borderRadius: 8,
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 18,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'white', color: 'var(--accent-ink)',
                    display: 'grid', placeItems: 'center',
                    fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)',
                  }}>{initial}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{config.businessName}</div>
                    <div style={{ fontSize: 11.5, opacity: 0.9 }}>Weekly OJT summary · {rangeLabel}</div>
                  </div>
                </div>

                <p style={{ margin: '0 0 16px' }}>{intro}</p>

                {sendMode === 'pdf' ? (
                  <div style={{
                    background: '#f8f9fa', border: '1px solid #e8eaed',
                    padding: 14, borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center',
                    margin: '12px 0',
                  }}>
                    <div style={{ width: 36, height: 44, background: 'var(--danger)', color: 'white', borderRadius: 4, display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700 }}>PDF</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13.5, color: '#202124' }}>{trainee.name} — Weekly Summary.pdf</div>
                      <div style={{ fontSize: 11.5, color: '#5f6368' }}>{rangeLabel} · 2 pages · 184 KB</div>
                    </div>
                    <I.Download size={16} style={{ color: '#5f6368' }} />
                  </div>
                ) : (
                  <div style={{ padding: '0' }}>
                    {sections.trends && summary.trends && (
                      <>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--accent-ink)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 10, marginBottom: 6 }}>Performance trends</div>
                        <p style={{ margin: '0 0 14px' }}>{summary.trends}</p>
                      </>
                    )}
                    {sections.wins && summary.wins && (
                      <>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--accent-ink)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 10, marginBottom: 6 }}>Wins this week</div>
                        <p style={{ margin: '0 0 14px' }}>{summary.wins}</p>
                      </>
                    )}
                    {sections.focus && summary.focus && (
                      <>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--accent-ink)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 10, marginBottom: 6 }}>Where to focus next</div>
                        <p style={{ margin: '0 0 14px' }}>{summary.focus}</p>
                      </>
                    )}
                    {sections.recommendations && summary.recommendations && (
                      <>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--accent-ink)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 10, marginBottom: 6 }}>Recommendations</div>
                        <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
                          {summary.recommendations.split(/\d\)\s/).filter(Boolean).map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r.trim().replace(/\.$/, '.')}</li>)}
                        </ol>
                      </>
                    )}
                  </div>
                )}

                <div style={{ borderTop: '1px solid #e8eaed', margin: '20px 0 14px' }} />

                <p style={{ margin: 0, color: '#5f6368', fontSize: 12 }}>{footer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const makePlainSummary = (t, s, sec) => {
  let out = '';
  if (sec.trends && s.trends) out += `PERFORMANCE TRENDS\n\n${s.trends}\n\n`;
  if (sec.wins && s.wins) out += `WINS & HIGHLIGHTS\n\n${s.wins}\n\n`;
  if (sec.focus && s.focus) out += `AREAS TO FOCUS ON\n\n${s.focus}\n\n`;
  if (sec.recommendations && s.recommendations) out += `RECOMMENDATIONS\n\n${s.recommendations}\n\n`;
  if (sec.attendance && s.attendance) out += `ATTENDANCE\n\n${s.attendance}\n\n`;
  return out.trim();
};

Object.assign(window, { AiSummaryPage });
