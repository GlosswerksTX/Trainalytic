/* ============================================================
   Setup Wizard — 7 linear steps
   1. Business basics
   2. Industry template
   3. Look & feel
   4. Skills & Scorecards
   5. Training path
   6. AI Summary
   7. Team & Connections
   ============================================================ */

const WIZARD_STEPS = [
  { id: 1, label: 'Business' },
  { id: 2, label: 'Template' },
  { id: 3, label: 'Look & feel' },
  { id: 4, label: 'Skills' },
  { id: 5, label: 'Training' },
  { id: 6, label: 'AI Summary' },
  { id: 7, label: 'Team' },
  { id: 8, label: 'Review' },
];

const WizardProgress = ({ step }) => (
  <div className="wizard-progress">
    {WIZARD_STEPS.map((s, i) => (
      <React.Fragment key={s.id}>
        <div className={`wizard-step-dot ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}>
          <div className="dot">{step > s.id ? <I.Check size={11} stroke={3} /> : s.id}</div>
          <span style={{ display: step === s.id ? 'inline' : 'none' }}>{s.label}</span>
        </div>
        {i < WIZARD_STEPS.length - 1 && <div className={`wizard-step-line ${step > s.id ? 'done' : ''}`} />}
      </React.Fragment>
    ))}
  </div>
);

/* ---- Step 1: Business basics ---- */
const Step1 = ({ config, setConfig }) => (
  <>
    <div>
      <div className="eyebrow">Step 1 of 8</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Tell us about your business</h1>
      <p className="muted" style={{ fontSize: 15, marginTop: 8, maxWidth: 520 }}>
        We use these basics to brand your dashboard, emails, and exports. You can change everything later from Settings.
      </p>
    </div>

    <div className="stack-lg">
      <Field label="Business name">
        <Input
          placeholder="e.g. Roselane Coffee Co."
          value={config.businessName}
          onChange={(e) => setConfig(c => ({ ...c, businessName: e.target.value }))}
          autoFocus
        />
      </Field>

      <Field label="Logo" hint="PNG or SVG. Used in the dashboard, emailed summaries, and exports. Optional — your business name shows if no logo is uploaded.">
        <div className="row" style={{ gap: 14 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 12, border: '1px dashed var(--border-strong)',
            display: 'grid', placeItems: 'center', color: 'var(--ink-faint)', background: 'var(--surface-alt)',
          }}>
            {config.logoFile ? (
              <div style={{ fontWeight: 600 }}>{config.businessName?.[0] || 'R'}</div>
            ) : (
              <I.Upload size={20} />
            )}
          </div>
          <div>
            <Button onClick={() => setConfig(c => ({ ...c, logoFile: 'logo.png' }))}>
              {config.logoFile ? 'Replace logo' : 'Upload logo'}
            </Button>
            {config.logoFile && (
              <Button variant="ghost" onClick={() => setConfig(c => ({ ...c, logoFile: null }))} style={{ marginLeft: 8 }}>Remove</Button>
            )}
          </div>
        </div>
      </Field>

      <Card title="Optional: rename core terms" actions={<Badge>Advanced</Badge>}>
        <p className="muted" style={{ fontSize: 13, marginTop: 0, marginBottom: 14 }}>
          Match the language your team already uses. Skip if the defaults work.
        </p>
        <div className="grid-2">
          {[
            ['trainee', 'Trainee', 'Crew member, associate, tech…'],
            ['trainer', 'Trainer', 'Mentor, lead, manager…'],
            ['scorecard', 'Scorecard', 'Evaluation, perf card…'],
            ['training_path', 'Training Path', 'Onboarding plan, ramp…'],
          ].map(([k, lbl, ph]) => (
            <Field key={k} label={lbl}>
              <Input
                placeholder={ph}
                value={config.labels[k] === DEFAULT_LABELS[k] ? '' : config.labels[k]}
                onChange={(e) => setConfig(c => ({ ...c, labels: { ...c.labels, [k]: e.target.value || DEFAULT_LABELS[k] } }))}
              />
            </Field>
          ))}
        </div>
      </Card>
    </div>
  </>
);

/* ---- Step 2: Industry template ---- */
const Step2 = ({ config, setConfig }) => (
  <>
    <div>
      <div className="eyebrow">Step 2 of 8</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Start from a template</h1>
      <p className="muted" style={{ fontSize: 15, marginTop: 8, maxWidth: 580 }}>
        Pick the closest match — we'll pre-load skills, scorecards, and training items you can edit, add to, or remove. Or start blank.
      </p>
    </div>

    <div className="grid-3" style={{ gap: 14 }}>
      {INDUSTRY_TEMPLATES.map(t => {
        const active = config.industry === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setConfig(c => ({ ...c, industry: t.id }))}
            className="card tight"
            style={{
              cursor: 'pointer',
              textAlign: 'left',
              borderColor: active ? 'var(--accent)' : 'var(--border)',
              borderWidth: active ? 2 : 1,
              padding: 18,
              background: active ? 'var(--accent-soft)' : 'var(--surface)',
              minHeight: 150,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            <div style={{ fontSize: 28 }}>{t.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14.5, color: active ? 'var(--accent-ink)' : 'var(--ink-strong)' }}>{t.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.45 }}>{t.blurb}</div>
            {t.id !== 'blank' && (
              <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 'auto' }}>
                {t.skills.length} skills · {t.training.length} training items
              </div>
            )}
          </button>
        );
      })}
    </div>
  </>
);

/* ---- Step 3: Look & feel ---- */
const Step3 = ({ config, setConfig }) => (
  <>
    <div>
      <div className="eyebrow">Step 3 of 8</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Make it yours</h1>
      <p className="muted" style={{ fontSize: 15, marginTop: 8 }}>Pick a palette and type system. You can change these anytime.</p>
    </div>

    <Card title="Color palette">
      <div className="grid-4" style={{ gap: 10 }}>
        {['sage','indigo','ocean','terracotta','rose','butter','plum','charcoal'].map(p => (
          <PaletteSwatch
            key={p}
            palette={p}
            active={config.palette === p}
            onClick={() => setConfig(c => ({ ...c, palette: p }))}
          />
        ))}
      </div>
    </Card>

    <Card title="Type pairing">
      <div className="grid-2" style={{ gap: 10 }}>
        {[
          { id: 'modern', name: 'Modern', ff: 'Geist, sans-serif', sample: 'Aa', tag: 'Geist' },
          { id: 'classic', name: 'Classic', ff: '"Source Serif 4", serif', sample: 'Aa', tag: 'Source Serif + Manrope' },
          { id: 'friendly', name: 'Friendly', ff: '"Plus Jakarta Sans", sans-serif', sample: 'Aa', tag: 'Plus Jakarta' },
          { id: 'editorial', name: 'Editorial', ff: '"DM Serif Display", serif', sample: 'Aa', tag: 'DM Serif + Manrope' },
        ].map(f => {
          const active = config.fonts === f.id;
          return (
            <button key={f.id} onClick={() => setConfig(c => ({ ...c, fonts: f.id }))} className="card tight" style={{
              cursor: 'pointer', textAlign: 'left', padding: 14,
              borderColor: active ? 'var(--accent)' : 'var(--border)',
              borderWidth: active ? 2 : 1,
              background: active ? 'var(--accent-soft)' : 'var(--surface)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 56, height: 56, display: 'grid', placeItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontFamily: f.ff, fontSize: 30, fontWeight: 600 }}>
                {f.sample}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{f.tag}</div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>

    <div className="grid-2">
      <Card title="Theme">
        <div className="grid-2" style={{ gap: 8 }}>
          {[
            { id: 'light', icon: I.Sun, label: 'Light' },
            { id: 'dark', icon: I.Moon, label: 'Dark' },
          ].map(t => {
            const active = config.theme === t.id;
            return (
              <button key={t.id} onClick={() => setConfig(c => ({ ...c, theme: t.id }))} className="card tight" style={{
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 16,
                borderColor: active ? 'var(--accent)' : 'var(--border)',
                borderWidth: active ? 2 : 1,
                background: active ? 'var(--accent-soft)' : 'var(--surface)',
              }}>
                <t.icon size={18} />
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.label}</div>
              </button>
            );
          })}
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 10, marginBottom: 0 }}>Respects system preference; users can override per-session.</p>
      </Card>
      <Card title="Density">
        <div className="grid-2" style={{ gap: 8 }}>
          {[
            { id: 'comfortable', label: 'Comfortable', desc: 'More breathing room' },
            { id: 'compact', label: 'Compact', desc: 'See more at a glance' },
          ].map(t => {
            const active = config.density === t.id;
            return (
              <button key={t.id} onClick={() => setConfig(c => ({ ...c, density: t.id }))} className="card tight" style={{
                cursor: 'pointer', textAlign: 'left', padding: 14,
                borderColor: active ? 'var(--accent)' : 'var(--border)',
                borderWidth: active ? 2 : 1,
                background: active ? 'var(--accent-soft)' : 'var(--surface)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{t.desc}</div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  </>
);

/* ---- Step 4: Skills & Scorecards ---- */
const Step4 = ({ config, setConfig, skills, setSkills }) => {
  const fmtOpts = [
    { id: 'percent', label: 'Percentage', sample: '92%' },
    { id: 'stars', label: 'Stars', sample: '★★★★☆' },
    { id: 'passfail', label: 'Pass / Fail', sample: '✓ Pass' },
  ];

  const updateSkill = (i, patch) => setSkills(s => s.map((sk, idx) => idx === i ? { ...sk, ...patch } : sk));
  const removeSkill = (i) => setSkills(s => s.filter((_, idx) => idx !== i));
  const addSkill = () => setSkills(s => [...s, { name: '', category: '', target: 90, blurb: '' }]);

  return (
    <>
      <div>
        <div className="eyebrow">Step 4 of 8</div>
        <h1 className="h1" style={{ marginTop: 10 }}>{config.labels.skills} & {config.labels.scorecards}</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 8, maxWidth: 600 }}>
          These are the abilities you'll evaluate on the floor. Each has a name, a one-line description, and an optional target. Edit, reorder, or add your own.
        </p>
      </div>

      <Card title="Rating format">
        <div className="grid-3" style={{ gap: 10 }}>
          {fmtOpts.map(f => {
            const active = config.ratingFormat === f.id;
            return (
              <button key={f.id} onClick={() => setConfig(c => ({ ...c, ratingFormat: f.id }))} className="card tight" style={{
                cursor: 'pointer', padding: 16, textAlign: 'center',
                borderColor: active ? 'var(--accent)' : 'var(--border)',
                borderWidth: active ? 2 : 1,
                background: active ? 'var(--accent-soft)' : 'var(--surface)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, marginBottom: 6, color: 'var(--accent-ink)' }}>{f.sample}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{f.label}</div>
              </button>
            );
          })}
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
          Scores are averaged over the selected date range on each {config.labels.scorecard.toLowerCase()}. No date range = lifetime average.
        </p>
      </Card>

      <Card title={`${config.labels.skills} (${skills.length})`} actions={<Button size="sm" icon={<I.Plus />} onClick={addSkill}>Add</Button>}>
        {skills.length === 0 ? (
          <div className="empty">No {config.labels.skills.toLowerCase()} yet. Click <strong>Add</strong> to create one.</div>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            {skills.map((sk, i) => (
              <div key={i} className="row" style={{ gap: 10, alignItems: 'flex-start', padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elevated)' }}>
                <I.Move size={14} className="faint" style={{ marginTop: 8, cursor: 'grab', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.5fr 1fr 80px', gap: 10 }}>
                  <Input placeholder="Skill name" value={sk.name} onChange={(e) => updateSkill(i, { name: e.target.value })} />
                  <Input placeholder="Category (optional)" value={sk.category} onChange={(e) => updateSkill(i, { category: e.target.value })} />
                  <Input placeholder="Target" type="number" value={sk.target ?? ''} onChange={(e) => updateSkill(i, { target: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <IconButton icon={I.Trash} onClick={() => removeSkill(i)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
};

/* ---- Step 5: Training path ---- */
const Step5 = ({ config, setConfig, training, setTraining }) => {
  const update = (i, patch) => setTraining(t => t.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  const remove = (i) => setTraining(t => t.filter((_, idx) => idx !== i));
  const add = () => setTraining(t => [...t, { name: '', mandatory: false, link: false, expires: '' }]);

  return (
    <>
      <div>
        <div className="eyebrow">Step 5 of 8</div>
        <h1 className="h1" style={{ marginTop: 10 }}>{config.labels.training_path}</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 8, maxWidth: 600 }}>
          Define the path a new {config.labels.trainee.toLowerCase()} walks through — the timeline, the items, and what's required vs. optional.
        </p>
      </div>

      <div className="grid-2">
        <Field label="Default path length" hint="In days. Use for tracking how far along each trainee is.">
          <Input type="number" value={config.defaultPathDays} onChange={(e) => setConfig(c => ({ ...c, defaultPathDays: Number(e.target.value) }))} />
        </Field>
        <Field label="Order">
          <div className="row" style={{ gap: 8, paddingTop: 4 }}>
            <Radio checked={!config.sequentialTraining} onChange={() => setConfig(c => ({ ...c, sequentialTraining: false }))} label="Ad-hoc — assign in any order" />
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Radio checked={config.sequentialTraining} onChange={() => setConfig(c => ({ ...c, sequentialTraining: true }))} label="Sequential — must complete in order" />
          </div>
        </Field>
      </div>

      <Card title={`${config.labels.assigned_training} (${training.length})`} actions={<Button size="sm" icon={<I.Plus />} onClick={add}>Add item</Button>}>
        {training.length === 0 ? (
          <div className="empty">No training items yet.</div>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            <div className="row" style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, padding: '0 12px' }}>
              <div style={{ flex: 1 }}>Item</div>
              <div style={{ width: 100, textAlign: 'center' }}>Mandatory</div>
              <div style={{ width: 100, textAlign: 'center' }}>Link / file</div>
              <div style={{ width: 110 }}>Expires</div>
              <div style={{ width: 36 }}></div>
            </div>
            {training.map((tr, i) => (
              <div key={i} className="row" style={{ gap: 10, padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elevated)' }}>
                <div style={{ flex: 1 }}>
                  <Input placeholder="e.g. Food Handler Cert" value={tr.name} onChange={(e) => update(i, { name: e.target.value })} />
                </div>
                <div style={{ width: 100, display: 'grid', placeItems: 'center' }}>
                  <Toggle size="sm" checked={tr.mandatory} onChange={(v) => update(i, { mandatory: v })} />
                </div>
                <div style={{ width: 100, display: 'grid', placeItems: 'center' }}>
                  <Toggle size="sm" checked={tr.link} onChange={(v) => update(i, { link: v })} />
                </div>
                <div style={{ width: 110 }}>
                  <Input placeholder="never" value={tr.expires || ''} onChange={(e) => update(i, { expires: e.target.value })} />
                </div>
                <IconButton icon={I.Trash} onClick={() => remove(i)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
};

/* ---- Step 6: AI Summary ---- */
const Step6 = ({ config, setConfig }) => {
  const setAI = (patch) => setConfig(c => ({ ...c, aiSummary: { ...c.aiSummary, ...patch } }));
  const setSec = (k, v) => setConfig(c => ({ ...c, aiSummary: { ...c.aiSummary, sections: { ...c.aiSummary.sections, [k]: v } } }));
  const ai = config.aiSummary;

  return (
    <>
      <div>
        <div className="eyebrow">Step 6 of 8</div>
        <h1 className="h1" style={{ marginTop: 10 }}>AI Summary settings</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 8, maxWidth: 620 }}>
          Configure how the AI writes weekly summaries. You can edit any generated summary after the fact — and reset back to the original if you want.
        </p>
      </div>

      <div className="grid-2">
        <Card title="Voice">
          <div className="stack">
            <Field label="Tone">
              <Select value={ai.tone} onChange={(e) => setAI({ tone: e.target.value })}>
                <option value="coaching">Coaching — encouraging + actionable</option>
                <option value="formal">Formal — for performance records</option>
                <option value="direct">Direct — short and blunt</option>
                <option value="warm">Warm — friendly + supportive</option>
              </Select>
            </Field>
            <Field label="Length">
              <Select value={ai.length} onChange={(e) => setAI({ length: e.target.value })}>
                <option value="short">Short — 1 paragraph</option>
                <option value="medium">Medium — 3–4 paragraphs</option>
                <option value="long">Long — full breakdown</option>
              </Select>
            </Field>
            <Field label="Language">
              <Select value={ai.language} onChange={(e) => setAI({ language: e.target.value })}>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Portuguese</option>
                <option>German</option>
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="What to include">
          <div className="stack-sm" style={{ gap: 10 }}>
            <Checkbox checked={ai.sections.trends} onChange={(v) => setSec('trends', v)} label="Performance trends" />
            <Checkbox checked={ai.sections.wins} onChange={(v) => setSec('wins', v)} label="Wins & highlights" />
            <Checkbox checked={ai.sections.focus} onChange={(v) => setSec('focus', v)} label="Areas to focus on" />
            <Checkbox checked={ai.sections.recommendations} onChange={(v) => setSec('recommendations', v)} label="Specific recommendations" />
            <Checkbox checked={ai.sections.attendance} onChange={(v) => setSec('attendance', v)} label="Attendance / consistency" />
          </div>
        </Card>
      </div>

      <Card title="Context (plugged into the prompt)">
        <div className="grid-2">
          <Field label="Default audience" hint="Who's the summary written for?">
            <Select value={ai.audience} onChange={(e) => setAI({ audience: e.target.value })}>
              <option>Trainee + Manager</option>
              <option>Trainee only</option>
              <option>Manager only</option>
            </Select>
          </Field>
          <Field label="Role being trained" hint={`e.g. "${config.industry === 'restaurant' ? 'Lead Barista' : 'Floor Associate'}"`}>
            <Input placeholder="e.g. Lead Barista" value={ai.role} onChange={(e) => setAI({ role: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card title="AI provider" actions={<Badge variant="accent">You bring the key</Badge>}>
        <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
          Pulse Check doesn't bundle AI usage — you connect your own Anthropic or OpenAI account so you're never billed twice. Your key is stored in your browser only. Skip this step if you don't want AI summaries.
        </p>
        <div className="grid-2">
          <Field label="Provider">
            <Select value={ai.apiProvider} onChange={(e) => setAI({ apiProvider: e.target.value })}>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT)</option>
              <option value="none">None — skip AI feature</option>
            </Select>
          </Field>
          <Field label={`${ai.apiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API key`} hint="Starts with sk-… · stored locally only">
            <Input
              type="password"
              placeholder={ai.apiProvider === 'openai' ? 'sk-proj-…' : 'sk-ant-api03-…'}
              value={ai.apiKey}
              onChange={(e) => setAI({ apiKey: e.target.value })}
              disabled={ai.apiProvider === 'none'}
            />
          </Field>
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          Don't have one? Get a key at{' '}
          <a href="https://console.anthropic.com/" target="_blank" rel="noopener" style={{ color: 'var(--pc-blue)', textDecoration: 'underline' }}>console.anthropic.com</a>
          {' '}or{' '}
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" style={{ color: 'var(--pc-blue)', textDecoration: 'underline' }}>platform.openai.com</a>.
          Typical cost: pennies per summary.
        </div>
      </Card>
    </>
  );
};

/* ---- Step 7: Team & Connections ---- */
const Step7 = ({ config, setConfig, addedTrainees, setAddedTrainees, loadSamples, setLoadSamples }) => {
  const updateNotif = (k, v) => setConfig(c => ({ ...c, notifications: { ...c.notifications, [k]: v } }));
  const updateInt = (k, v) => setConfig(c => ({ ...c, integrations: { ...c.integrations, [k]: v } }));

  return (
    <>
      <div>
        <div className="eyebrow">Step 7 of 8</div>
        <h1 className="h1" style={{ marginTop: 10 }}>Your team & connections</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 8, maxWidth: 600 }}>
          Add your first {config.labels.trainee.toLowerCase()} (or skip and add them later), connect Gmail and Calendar, and choose your notifications.
        </p>
      </div>

      <Card title={`Add your first ${config.labels.trainee.toLowerCase()}`}>
        {addedTrainees.map((t, i) => (
          <div key={i} className="row" style={{ marginBottom: 8 }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: 10 }}>
              <Input placeholder="Name" value={t.name} onChange={(e) => setAddedTrainees(a => a.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
              <Input placeholder="Position" value={t.position} onChange={(e) => setAddedTrainees(a => a.map((x, idx) => idx === i ? { ...x, position: e.target.value } : x))} />
              <Input type="date" value={t.startDate} onChange={(e) => setAddedTrainees(a => a.map((x, idx) => idx === i ? { ...x, startDate: e.target.value } : x))} />
            </div>
            <IconButton icon={I.Trash} onClick={() => setAddedTrainees(a => a.filter((_, idx) => idx !== i))} />
          </div>
        ))}
        <Button variant="ghost" icon={<I.Plus />} onClick={() => setAddedTrainees(a => [...a, { name: '', position: '', startDate: '' }])} style={{ marginTop: 4 }}>
          {addedTrainees.length === 0 ? `Add ${config.labels.trainee.toLowerCase()}` : `Add another`}
        </Button>
        <div className="hr"></div>
        <Checkbox checked={loadSamples} onChange={setLoadSamples} label={`Load sample data (5 example ${config.labels.trainees.toLowerCase()}) so I can explore first`} />
      </Card>

      <Card title="Connect Gmail & Google Calendar">
        <div className="stack">
          <div className="row between" style={{ padding: '4px 0' }}>
            <div className="row" style={{ gap: 10 }}>
              <I.Google size={20} style={{ color: 'oklch(0.5 0.15 25)' }} />
              <div>
                <div style={{ fontWeight: 500 }}>Gmail</div>
                <div className="muted" style={{ fontSize: 12 }}>Send AI summaries from your address</div>
              </div>
            </div>
            <Button variant={config.integrations.gmail ? 'default' : 'primary'} onClick={() => updateInt('gmail', !config.integrations.gmail)}>
              {config.integrations.gmail ? <><I.Check size={14} /> Connected</> : 'Connect'}
            </Button>
          </div>
          <div className="divider"></div>
          <div className="row between" style={{ padding: '4px 0' }}>
            <div className="row" style={{ gap: 10 }}>
              <I.Calendar size={20} style={{ color: 'oklch(0.5 0.15 25)' }} />
              <div>
                <div style={{ fontWeight: 500 }}>Google Calendar</div>
                <div className="muted" style={{ fontSize: 12 }}>Invite trainees & trainers to instructor-led sessions</div>
              </div>
            </div>
            <Button variant={config.integrations.calendar ? 'default' : 'primary'} onClick={() => updateInt('calendar', !config.integrations.calendar)}>
              {config.integrations.calendar ? <><I.Check size={14} /> Connected</> : 'Connect'}
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Notifications" actions={<Badge>All off by default</Badge>}>
        <div className="grid-2" style={{ gap: 14 }}>
          {[
            ['daily_reminder', 'Daily reminder', 'Reminds you to fill in today\'s evaluations'],
            ['weekly_summary_trainee', 'Weekly summary → trainee', 'Auto-email each Monday'],
            ['weekly_summary_manager', 'Weekly summary → manager', 'CC\'d on the trainee\'s weekly recap'],
            ['behind_schedule', 'Behind-schedule alert', 'When a trainee falls behind their path'],
            ['cert_expiry', 'Cert expiry alert', '30 days before any certification expires'],
            ['training_complete', 'Training-complete alert', 'When a trainee finishes their path'],
            ['calendar_invites', 'Calendar invites', 'Auto-invite trainee + trainer to sessions'],
          ].map(([k, lbl, desc]) => (
            <div key={k} className="row between" style={{ padding: 10, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elevated)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{lbl}</div>
                <div className="muted" style={{ fontSize: 12 }}>{desc}</div>
              </div>
              <Toggle size="sm" checked={config.notifications[k]} onChange={(v) => updateNotif(k, v)} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
};

/* ---- Step 8: Review & Finish ---- */
const Step8 = ({ config, skills, training, addedTrainees, loadSamples, goTo }) => {
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry);
  const enabledNotifs = Object.entries(config.notifications).filter(([_, v]) => v);
  const enabledSecs = Object.entries(config.enabledSections).filter(([_, v]) => v);

  const sectionLabel = {
    trainees: config.labels.trainees,
    skills: config.labels.skills,
    scorecards: config.labels.scorecards,
    assigned_training: config.labels.assigned_training,
    tasks: config.labels.tasks,
    ai_summary: 'AI Summary',
  };
  const notifLabel = {
    daily_reminder: 'Daily reminder',
    weekly_summary_trainee: 'Weekly summary → trainee',
    weekly_summary_manager: 'Weekly summary → manager',
    behind_schedule: 'Behind-schedule alert',
    cert_expiry: 'Cert expiry alert',
    training_complete: 'Training complete alert',
    calendar_invites: 'Calendar invites',
  };

  const ReviewRow = ({ k, v }) => (
    <div className="row between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="muted" style={{ fontSize: 13 }}>{k}</span>
      <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
    </div>
  );

  const SectionCard = ({ title, step, children }) => (
    <Card title={title} actions={<Button size="sm" variant="ghost" icon={<I.Edit />} onClick={() => goTo(step)}>Edit</Button>}>
      {children}
    </Card>
  );

  return (
    <>
      <div>
        <div className="eyebrow">Step 8 of 8 · Final review</div>
        <h1 className="h1" style={{ marginTop: 10 }}>Review your setup</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 8, maxWidth: 640 }}>
          One last look before we launch your dashboard. Everything below is editable later from Settings — but it's easier to fix things now.
        </p>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        <SectionCard title="Business" step={1}>
          <ReviewRow k="Name" v={config.businessName || <span className="faint">Not set</span>} />
          <ReviewRow k="Logo" v={config.logoFile ? 'Uploaded' : <span className="faint">None — using initial</span>} />
          <ReviewRow k="Renamed terms" v={
            Object.entries(config.labels).filter(([k, v]) => v !== DEFAULT_LABELS[k]).length || <span className="faint">None</span>
          } />
        </SectionCard>

        <SectionCard title="Template" step={2}>
          <ReviewRow k="Industry" v={tpl?.name || <span className="faint">Blank</span>} />
          <ReviewRow k="Prefilled skills" v={(tpl?.skills.length || 0) + ' suggested'} />
          <ReviewRow k="Prefilled training" v={(tpl?.training.length || 0) + ' suggested'} />
        </SectionCard>

        <SectionCard title="Look & feel" step={3}>
          <ReviewRow k="Palette" v={<span className="row" style={{ gap: 6, justifyContent: 'flex-end' }}><span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--accent)' }} /><span style={{ textTransform: 'capitalize' }}>{config.palette}</span></span>} />
          <ReviewRow k="Type pairing" v={<span style={{ textTransform: 'capitalize' }}>{config.fonts}</span>} />
          <ReviewRow k="Theme" v={<span style={{ textTransform: 'capitalize' }}>{config.theme}</span>} />
          <ReviewRow k="Density" v={<span style={{ textTransform: 'capitalize' }}>{config.density}</span>} />
        </SectionCard>

        <SectionCard title={`${config.labels.skills} & ${config.labels.scorecards}`} step={4}>
          <ReviewRow k={`${config.labels.skills} defined`} v={skills.length} />
          <ReviewRow k="Rating format" v={config.ratingFormat === 'percent' ? 'Percentage' : config.ratingFormat === 'stars' ? 'Stars' : 'Pass / Fail'} />
          {skills.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {skills.slice(0, 6).map((s, i) => <Badge key={i}>{s.name}</Badge>)}
              {skills.length > 6 && <Badge>+{skills.length - 6} more</Badge>}
            </div>
          )}
        </SectionCard>

        <SectionCard title={config.labels.training_path} step={5}>
          <ReviewRow k="Path length" v={config.defaultPathDays + ' days'} />
          <ReviewRow k="Order" v={config.sequentialTraining ? 'Sequential' : 'Ad-hoc'} />
          <ReviewRow k="Training items" v={training.length} />
          <ReviewRow k="Mandatory items" v={training.filter(t => t.mandatory).length} />
        </SectionCard>

        <SectionCard title="AI Summary" step={6}>
          <ReviewRow k="Tone" v={<span style={{ textTransform: 'capitalize' }}>{config.aiSummary.tone}</span>} />
          <ReviewRow k="Length" v={<span style={{ textTransform: 'capitalize' }}>{config.aiSummary.length}</span>} />
          <ReviewRow k="Language" v={config.aiSummary.language} />
          <ReviewRow k="Audience" v={config.aiSummary.audience} />
          <ReviewRow k="Sections" v={Object.entries(config.aiSummary.sections).filter(([_, v]) => v).length + ' included'} />
        </SectionCard>

        <SectionCard title="Team & connections" step={7}>
          <ReviewRow k={`Initial ${config.labels.trainees.toLowerCase()}`} v={
            addedTrainees.filter(t => t.name).length === 0
              ? loadSamples ? '5 sample records' : <span className="faint">None — add later</span>
              : `${addedTrainees.filter(t => t.name).length} added`
          } />
          <ReviewRow k="Gmail" v={config.integrations.gmail ? <Badge variant="good"><I.Check size={11} /> Connected</Badge> : <span className="faint">Not connected</span>} />
          <ReviewRow k="Google Calendar" v={config.integrations.calendar ? <Badge variant="good"><I.Check size={11} /> Connected</Badge> : <span className="faint">Not connected</span>} />
          <ReviewRow k="Notifications on" v={enabledNotifs.length === 0 ? <span className="faint">All off</span> : enabledNotifs.length} />
        </SectionCard>

        <SectionCard title="Enabled sections" step={3}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {enabledSecs.map(([k]) => (
              <Badge key={k} variant="accent">{sectionLabel[k]}</Badge>
            ))}
          </div>
          {enabledSecs.length < 6 && (
            <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
              {6 - enabledSecs.length} section{6 - enabledSecs.length === 1 ? '' : 's'} disabled — won't appear in the sidebar.
            </div>
          )}
        </SectionCard>
      </div>

      <Card style={{ background: 'var(--accent-soft)', border: 0 }}>
        <div className="row" style={{ gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <I.Sparkle size={20} style={{ color: 'var(--accent-ink)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--accent-ink)' }}>Ready to launch</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink)', marginTop: 4 }}>
              Click <strong>Finish & launch dashboard</strong> below to save your setup. A short product tour will walk you through where everything lives.
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

/* ---- Wizard shell ---- */
const SetupWizard = ({ config, setConfig, onFinish, onExit }) => {
  const [step, setStep] = React.useState(1);
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry);
  const [skills, setSkills] = React.useState([]);
  const [training, setTraining] = React.useState([]);
  const [addedTrainees, setAddedTrainees] = React.useState([]);
  const [loadSamples, setLoadSamples] = React.useState(false);

  // when industry changes, prefill skills/training
  React.useEffect(() => {
    if (tpl && skills.length === 0 && training.length === 0) {
      setSkills(tpl.skills.map(s => ({ ...s })));
      setTraining(tpl.training.map(t => ({ ...t })));
    }
  }, [config.industry]);

  const canNext = () => {
    if (step === 1) return config.businessName.trim().length > 0;
    if (step === 2) return !!config.industry;
    return true;
  };

  const next = () => {
    if (step < 8) {
      setStep(s => s + 1);
    } else {
      // finish
      onFinish({
        config: { ...config, setupComplete: true, showTour: true },
        skills, training, addedTrainees, loadSamples,
      });
    }
  };

  return (
    <div className="wizard">
      <div className="wizard-top">
        <div className="row" style={{ gap: 10 }}>
          <div className="brand-mark" style={{ width: 32, height: 32, fontSize: 14 }}>
            {config.businessName?.[0] || 'R'}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Set up your dashboard</div>
        </div>
        <WizardProgress step={step} />
        <Button variant="ghost" onClick={onExit}>Exit setup</Button>
      </div>
      <div className={`wizard-body ${step === 4 || step === 5 || step === 8 ? 'wide' : ''}`}>
        <div className="wizard-body-inner">
          {step === 1 && <Step1 config={config} setConfig={setConfig} />}
          {step === 2 && <Step2 config={config} setConfig={setConfig} />}
          {step === 3 && <Step3 config={config} setConfig={setConfig} />}
          {step === 4 && <Step4 config={config} setConfig={setConfig} skills={skills} setSkills={setSkills} />}
          {step === 5 && <Step5 config={config} setConfig={setConfig} training={training} setTraining={setTraining} />}
          {step === 6 && <Step6 config={config} setConfig={setConfig} />}
          {step === 7 && <Step7 config={config} setConfig={setConfig} addedTrainees={addedTrainees} setAddedTrainees={setAddedTrainees} loadSamples={loadSamples} setLoadSamples={setLoadSamples} />}
          {step === 8 && <Step8 config={config} skills={skills} training={training} addedTrainees={addedTrainees} loadSamples={loadSamples} goTo={setStep} />}
        </div>
      </div>
      <div className="wizard-foot">
        <Button variant="ghost" disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))} icon={<I.ChevronL />}>Back</Button>
        <div className="muted" style={{ fontSize: 12.5 }}>Step {step} of 8 — your progress is saved.</div>
        <Button variant="primary" disabled={!canNext()} onClick={next}>
          {step === 8 ? 'Finish & launch dashboard' : 'Continue'}
          {step !== 8 && <I.Chevron />}
        </Button>
      </div>
    </div>
  );
};

Object.assign(window, { SetupWizard });
