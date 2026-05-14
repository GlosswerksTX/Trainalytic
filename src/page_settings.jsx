/* ============================================================
   Settings — branding, labels, sections, library, integrations, notifications
   ============================================================ */

const SettingsPage = ({ config, setConfig, onRunSetup, onDisconnect, sheetUrl }) => {
  const [tab, setTab] = React.useState('branding');
  const tabs = [
    { id: 'branding', label: 'Branding', icon: I.Palette },
    { id: 'connection', label: 'Sheet connection', icon: I.Link },
    { id: 'labels', label: 'Labels & terms', icon: I.Type },
    { id: 'sections', label: 'Sections', icon: I.Layers },
    { id: 'skills', label: config.labels.skills, icon: I.Award },
    { id: 'training', label: config.labels.assigned_training, icon: I.Book },
    { id: 'ai', label: 'AI Summary', icon: I.Sparkle },
    { id: 'integrations', label: 'Integrations', icon: I.Link },
    { id: 'notifications', label: 'Notifications', icon: I.Bell },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h1">Settings</h1>
          <div className="subtitle">Configure your dashboard. Changes save instantly.</div>
        </div>
        <div className="page-header-actions">
          <Button icon={<I.Refresh />} onClick={onRunSetup}>Re-run setup wizard</Button>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '220px 1fr', gap: 24 }}>
        <div className="stack-sm" style={{ position: 'sticky', top: 0 }}>
          {tabs.map(t => (
            <div key={t.id} className={`nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <t.icon size={15} />
              <span>{t.label}</span>
            </div>
          ))}
        </div>

        <div className="stack">
          {tab === 'branding' && <BrandingTab config={config} setConfig={setConfig} />}
          {tab === 'connection' && <ConnectionTab sheetUrl={sheetUrl} onDisconnect={onDisconnect} />}
          {tab === 'labels' && <LabelsTab config={config} setConfig={setConfig} />}
          {tab === 'sections' && <SectionsTab config={config} setConfig={setConfig} />}
          {tab === 'skills' && <SkillsTab config={config} setConfig={setConfig} />}
          {tab === 'training' && <TrainingTab config={config} setConfig={setConfig} />}
          {tab === 'ai' && <AiSettingsTab config={config} setConfig={setConfig} />}
          {tab === 'integrations' && <IntegrationsTab config={config} setConfig={setConfig} />}
          {tab === 'notifications' && <NotificationsTab config={config} setConfig={setConfig} />}
        </div>
      </div>
    </>
  );
};

const ConnectionTab = ({ sheetUrl, onDisconnect }) => {
  const [testing, setTesting] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const onTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      await SheetAPI.ping();
      const data = await SheetAPI.readAll();
      setResult({ ok: true, counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])) });
    } catch (err) {
      setResult({ ok: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  if (!sheetUrl) {
    return (
      <Card title="Google Sheet connection">
        <div className="empty" style={{ padding: 32 }}>
          <I.Link size={28} style={{ color: 'var(--ink-faint)', marginBottom: 12 }} />
          <div style={{ fontWeight: 600, color: 'var(--ink-strong)', marginBottom: 6 }}>No sheet connected</div>
          <p className="muted" style={{ fontSize: 13, maxWidth: 360, margin: '0 auto 14px' }}>
            You're using demo data. Connect your Google Sheet to start tracking real data.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card title="Google Sheet connection" actions={<Badge variant="good"><I.Check size={11} /> Connected</Badge>}>
        <Field label="Apps Script Web App URL">
          <Input value={sheetUrl} readOnly style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        </Field>
        <div className="row" style={{ gap: 8, marginTop: 12 }}>
          <Button onClick={onTest} disabled={testing} icon={<I.Refresh />}>{testing ? 'Testing…' : 'Test connection'}</Button>
          <Button variant="ghost" onClick={onDisconnect} icon={<I.Logout />} style={{ color: 'var(--danger)' }}>Disconnect</Button>
        </div>
        {result?.ok && (
          <div className="callout" style={{ marginTop: 14, background: 'var(--good-soft)', borderLeftColor: 'var(--good)', padding: 14, borderRadius: '0 10px 10px 0' }}>
            <div style={{ fontWeight: 600, color: 'var(--good)', marginBottom: 6 }}>✓ Connection healthy</div>
            <div className="muted mono" style={{ fontSize: 12 }}>
              {Object.entries(result.counts).map(([k, v]) => `${k}: ${v}`).join(' · ')}
            </div>
          </div>
        )}
        {result && !result.ok && (
          <div className="callout" style={{ marginTop: 14, background: 'var(--danger-soft)', borderLeftColor: 'var(--danger)', padding: 14, borderRadius: '0 10px 10px 0' }}>
            <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>Connection error</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>{result.error}</div>
          </div>
        )}
      </Card>
      <Card title="What disconnecting does">
        <p className="muted" style={{ fontSize: 13, margin: 0 }}>
          Disconnects this browser from your sheet. Your data <strong>stays safe</strong> in Google Sheets — disconnecting only removes the connection URL from this browser. You can reconnect anytime by pasting the URL again.
        </p>
      </Card>
    </>
  );
};

const BrandingTab = ({ config, setConfig }) => (
  <>
    <Card title="Business identity">
      <div className="grid-2">
        <Field label="Business name">
          <Input value={config.businessName} onChange={(e) => setConfig(c => ({ ...c, businessName: e.target.value }))} />
        </Field>
        <Field label="Logo">
          <div className="row" style={{ gap: 10 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--accent)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 20 }}>
              {config.businessName?.[0] || 'R'}
            </div>
            <Button>Replace logo</Button>
          </div>
        </Field>
      </div>
    </Card>

    <Card title="Color palette">
      <div className="grid-4" style={{ gap: 10 }}>
        {['sage','indigo','ocean','terracotta','rose','butter','plum','charcoal'].map(p => (
          <PaletteSwatch key={p} palette={p} active={config.palette === p} onClick={() => setConfig(c => ({ ...c, palette: p }))} />
        ))}
      </div>
    </Card>

    <Card title="Typography">
      <div className="grid-2" style={{ gap: 10 }}>
        {[
          { id: 'modern', name: 'Modern', ff: 'Geist, sans-serif' },
          { id: 'classic', name: 'Classic', ff: '"Source Serif 4", serif' },
          { id: 'friendly', name: 'Friendly', ff: '"Plus Jakarta Sans", sans-serif' },
          { id: 'editorial', name: 'Editorial', ff: '"DM Serif Display", serif' },
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
              <div style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: f.ff, fontSize: 26, fontWeight: 600 }}>Aa</div>
              <div>
                <div style={{ fontWeight: 600 }}>{f.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{f.ff.split(',')[0]}</div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>

    <Card title="Appearance">
      <div className="grid-2" style={{ gap: 16 }}>
        <div className="stack-sm">
          <div className="field-label">Theme</div>
          <div className="row" style={{ gap: 6 }}>
            <Radio checked={config.theme === 'light'} onChange={() => setConfig(c => ({ ...c, theme: 'light' }))} label="Light" />
            <Radio checked={config.theme === 'dark'} onChange={() => setConfig(c => ({ ...c, theme: 'dark' }))} label="Dark" />
          </div>
        </div>
        <div className="stack-sm">
          <div className="field-label">Density</div>
          <div className="row" style={{ gap: 6 }}>
            <Radio checked={config.density === 'comfortable'} onChange={() => setConfig(c => ({ ...c, density: 'comfortable' }))} label="Comfortable" />
            <Radio checked={config.density === 'compact'} onChange={() => setConfig(c => ({ ...c, density: 'compact' }))} label="Compact" />
          </div>
        </div>
      </div>
    </Card>
  </>
);

const LabelsTab = ({ config, setConfig }) => {
  const items = [
    ['trainee', 'Trainee'], ['trainees', 'Trainees (plural)'],
    ['trainer', 'Trainer'], ['trainers', 'Trainers (plural)'],
    ['skill', 'Skill'], ['skills', 'Skills (plural)'],
    ['scorecard', 'Scorecard'], ['scorecards', 'Scorecards (plural)'],
    ['training_path', 'Training Path'],
    ['qualification', 'Qualification'], ['qualifications', 'Qualifications (plural)'],
    ['task', 'Task'], ['tasks', 'Tasks (plural)'],
    ['assigned_training', 'Assigned Training'],
  ];
  return (
    <Card title="Rename labels to match your business">
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Empty fields fall back to the default term in parentheses.</p>
      <div className="grid-2">
        {items.map(([k, lbl]) => (
          <Field key={k} label={lbl}>
            <Input
              placeholder={DEFAULT_LABELS[k]}
              value={config.labels[k] === DEFAULT_LABELS[k] ? '' : config.labels[k]}
              onChange={(e) => setConfig(c => ({ ...c, labels: { ...c.labels, [k]: e.target.value || DEFAULT_LABELS[k] } }))}
            />
          </Field>
        ))}
      </div>
    </Card>
  );
};

const SectionsTab = ({ config, setConfig }) => {
  const sections = [
    ['trainees', config.labels.trainees, 'Roster and individual profiles', true],
    ['skills', config.labels.skills, 'Library of evaluatable abilities', true],
    ['scorecards', config.labels.scorecards, 'Skill ratings over time', true],
    ['assigned_training', config.labels.assigned_training, 'Modules, SOPs, instructor sessions', false],
    ['tasks', config.labels.tasks, 'Day-to-day checklist items', false],
    ['ai_summary', 'AI Summary', 'Generate written progress recaps', true],
  ];
  const toggle = (k, v) => setConfig(c => ({ ...c, enabledSections: { ...c.enabledSections, [k]: v } }));
  return (
    <Card title="Enable / disable sections">
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Disabled sections are hidden from the sidebar and dashboard.</p>
      <div className="stack">
        {sections.map(([k, lbl, desc, core]) => (
          <div key={k} className="row between" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elevated)' }}>
            <div>
              <div className="row" style={{ gap: 8 }}>
                <div style={{ fontWeight: 500 }}>{lbl}</div>
                {core && <Badge>Universal</Badge>}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{desc}</div>
            </div>
            <Toggle checked={config.enabledSections[k]} onChange={(v) => toggle(k, v)} />
          </div>
        ))}
      </div>
    </Card>
  );
};

const SkillsTab = ({ config }) => {
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry) || INDUSTRY_TEMPLATES[0];
  return (
    <Card title={`${config.labels.skills} library`} actions={<Button size="sm" icon={<I.Plus />}>Add {config.labels.skill.toLowerCase()}</Button>}>
      <div className="row" style={{ marginBottom: 12, gap: 8 }}>
        <Field label="Rating format">
          <div className="row" style={{ gap: 8 }}>
            {[['percent', 'Percentage'], ['stars', 'Stars'], ['passfail', 'Pass / Fail']].map(([id, lbl]) => (
              <Radio key={id} checked={config.ratingFormat === id} label={lbl} />
            ))}
          </div>
        </Field>
      </div>
      <table className="tbl">
        <thead><tr><th>{config.labels.skill}</th><th>Category</th><th>Description</th><th>Target</th><th></th></tr></thead>
        <tbody>
          {tpl.skills.map((s, i) => (
            <tr key={i}>
              <td><div style={{ fontWeight: 500 }}>{s.name}</div></td>
              <td><Badge>{s.category || '—'}</Badge></td>
              <td className="muted" style={{ fontSize: 13 }}>{s.blurb || '—'}</td>
              <td className="mono">{s.target}%</td>
              <td><IconButton icon={I.Edit} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

const TrainingTab = ({ config }) => {
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry) || INDUSTRY_TEMPLATES[0];
  return (
    <>
      <Card title={config.labels.training_path}>
        <div className="grid-2">
          <Field label="Default path length (days)">
            <Input type="number" defaultValue={config.defaultPathDays} />
          </Field>
          <Field label="Order">
            <Select defaultValue={config.sequentialTraining ? 'sequential' : 'adhoc'}>
              <option value="adhoc">Ad-hoc — any order</option>
              <option value="sequential">Sequential — must complete in order</option>
            </Select>
          </Field>
        </div>
      </Card>
      <Card title={`${config.labels.assigned_training} items`} actions={<Button size="sm" icon={<I.Plus />}>Add item</Button>}>
        <table className="tbl">
          <thead><tr><th>Item</th><th>Mandatory</th><th>Link / file</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            {tpl.training.map((t, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{t.name}</td>
                <td>{t.mandatory ? <Badge variant="accent">Mandatory</Badge> : <span className="faint">Optional</span>}</td>
                <td>{t.link ? <span className="row" style={{ gap: 4 }}><I.Link size={12} /> Attached</span> : <span className="faint">—</span>}</td>
                <td className="muted">{t.expires || 'Never'}</td>
                <td><IconButton icon={I.Edit} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
};

const AiSettingsTab = ({ config, setConfig }) => {
  const setAI = (patch) => setConfig(c => ({ ...c, aiSummary: { ...c.aiSummary, ...patch } }));
  const setSec = (k, v) => setConfig(c => ({ ...c, aiSummary: { ...c.aiSummary, sections: { ...c.aiSummary.sections, [k]: v } } }));
  const ai = config.aiSummary;
  return (
    <>
      <Card title="Voice">
        <div className="grid-2">
          <Field label="Tone">
            <Select value={ai.tone} onChange={(e) => setAI({ tone: e.target.value })}>
              <option value="coaching">Coaching</option>
              <option value="formal">Formal</option>
              <option value="direct">Direct</option>
              <option value="warm">Warm</option>
            </Select>
          </Field>
          <Field label="Length">
            <Select value={ai.length} onChange={(e) => setAI({ length: e.target.value })}>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </Select>
          </Field>
          <Field label="Language">
            <Select value={ai.language} onChange={(e) => setAI({ language: e.target.value })}>
              <option>English</option><option>Spanish</option><option>French</option><option>Portuguese</option>
            </Select>
          </Field>
          <Field label="Default audience">
            <Select value={ai.audience} onChange={(e) => setAI({ audience: e.target.value })}>
              <option>Trainee + Manager</option><option>Trainee only</option><option>Manager only</option>
            </Select>
          </Field>
          <Field label="Role being trained">
            <Input value={ai.role} onChange={(e) => setAI({ role: e.target.value })} />
          </Field>
        </div>
      </Card>
      <Card title="Sections to include">
        <div className="grid-2" style={{ gap: 12 }}>
          {[
            ['trends', 'Performance trends'],
            ['wins', 'Wins & highlights'],
            ['focus', 'Areas to focus on'],
            ['recommendations', 'Recommendations'],
            ['attendance', 'Attendance / consistency'],
          ].map(([k, lbl]) => (
            <Checkbox key={k} checked={ai.sections[k]} onChange={(v) => setSec(k, v)} label={lbl} />
          ))}
        </div>
      </Card>
      <Card title="AI provider" actions={<Badge variant="accent">Your key, your bill</Badge>}>
        <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Pulse Check doesn't bundle AI usage. Connect your own key so summaries are free for us and pennies for you.</p>
        <div className="grid-2">
          <Field label="Provider">
            <Select value={ai.apiProvider || 'anthropic'} onChange={(e) => setAI({ apiProvider: e.target.value })}>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT)</option>
              <option value="none">None — disable AI</option>
            </Select>
          </Field>
          <Field label="API key" hint="Starts with sk- · stored in your browser only">
            <Input
              type="password"
              placeholder="sk-…"
              value={ai.apiKey || ''}
              onChange={(e) => setAI({ apiKey: e.target.value })}
              disabled={ai.apiProvider === 'none'}
            />
          </Field>
        </div>
      </Card>
    </>
  );
};

const IntegrationsTab = ({ config, setConfig }) => {
  const updateInt = (k, v) => setConfig(c => ({ ...c, integrations: { ...c.integrations, [k]: v } }));
  return (
    <Card title="Connected services">
      <div className="stack">
        {[
          ['gmail', 'Gmail', 'Send AI summaries from your business address', I.Mail],
          ['calendar', 'Google Calendar', 'Auto-invite trainees and trainers to instructor-led sessions', I.Calendar],
        ].map(([k, name, desc, IconComp]) => (
          <div key={k} className="row between" style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elevated)' }}>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', display: 'grid', placeItems: 'center', border: '1px solid var(--border)' }}>
                <IconComp size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{desc}</div>
              </div>
            </div>
            <Button variant={config.integrations[k] ? 'default' : 'primary'} onClick={() => updateInt(k, !config.integrations[k])}>
              {config.integrations[k] ? <><I.Check size={14} /> Connected</> : 'Connect'}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

const NotificationsTab = ({ config, setConfig }) => {
  const updateNotif = (k, v) => setConfig(c => ({ ...c, notifications: { ...c.notifications, [k]: v } }));
  return (
    <Card title="Notifications & automations">
      <div className="stack">
        {[
          ['daily_reminder', 'Daily reminder', 'Reminds you to fill in today\'s evaluations'],
          ['weekly_summary_trainee', 'Weekly summary → trainee', 'Auto-email each Monday'],
          ['weekly_summary_manager', 'Weekly summary → manager', 'CC\'d on the trainee\'s weekly recap'],
          ['behind_schedule', 'Behind-schedule alert', 'When a trainee falls behind their path'],
          ['cert_expiry', 'Cert expiry alert', '30 days before any certification expires'],
          ['training_complete', 'Training-complete alert', 'When a trainee finishes their path'],
          ['calendar_invites', 'Calendar invites', 'Auto-invite trainee + trainer to sessions'],
        ].map(([k, lbl, desc]) => (
          <div key={k} className="row between" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elevated)' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{lbl}</div>
              <div className="muted" style={{ fontSize: 12 }}>{desc}</div>
            </div>
            <Toggle checked={config.notifications[k]} onChange={(v) => updateNotif(k, v)} />
          </div>
        ))}
      </div>
    </Card>
  );
};

Object.assign(window, { SettingsPage });
