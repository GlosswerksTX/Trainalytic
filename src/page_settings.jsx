/* ============================================================
   Settings — branding, labels, sections, library, integrations, notifications
   ============================================================ */

const SettingsPage = ({ config, setConfig, skills, trainingItems, onSaveSkill, onDeleteSkill, onSaveTraining, onDeleteTraining, onRunSetup, onDisconnect, sheetUrl }) => {
  const [tab, setTab] = React.useState('branding');
  const tabs = [
    { id: 'branding', label: 'Branding', icon: I.Palette },
    { id: 'connection', label: 'Sheet connection', icon: I.Link },
    { id: 'labels', label: 'Labels & terms', icon: I.Type },
    { id: 'sections', label: 'Sections', icon: I.Layers },
    { id: 'skills', label: config.labels.skills, icon: I.Award },
    { id: 'training', label: config.labels.assigned_training, icon: I.Book },
    { id: 'templates', label: 'Industry templates', icon: I.File },
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
          {tab === 'skills' && <SkillsTab config={config} setConfig={setConfig} skills={skills} onSaveSkill={onSaveSkill} onDeleteSkill={onDeleteSkill} />}
          {tab === 'training' && <TrainingTab config={config} setConfig={setConfig} trainingItems={trainingItems} onSaveTraining={onSaveTraining} onDeleteTraining={onDeleteTraining} />}
          {tab === 'templates' && <TemplatesTab config={config} setConfig={setConfig} onSaveSkill={onSaveSkill} onSaveTraining={onSaveTraining} />}
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

const SkillsTab = ({ config, setConfig, skills, onSaveSkill, onDeleteSkill }) => {
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry) || INDUSTRY_TEMPLATES[0];
  const list = (skills && skills.length) ? skills : tpl.skills;
  const [editing, setEditing] = React.useState(null); // null | 'new' | skill obj

  return (
    <>
      <Card title={`${config.labels.skills} library`} actions={<Button size="sm" icon={<I.Plus />} onClick={() => setEditing('new')}>Add {config.labels.skill.toLowerCase()}</Button>}>
        <div className="row" style={{ marginBottom: 12, gap: 8 }}>
          <Field label="Rating format">
            <div className="row" style={{ gap: 8 }}>
              {[['percent', 'Percentage'], ['stars', 'Stars'], ['passfail', 'Pass / Fail']].map(([id, lbl]) => (
                <Radio key={id} checked={config.ratingFormat === id} onChange={() => setConfig(c => ({ ...c, ratingFormat: id }))} label={lbl} />
              ))}
            </div>
          </Field>
        </div>
        {list.length === 0 ? (
          <div className="empty">No {config.labels.skills.toLowerCase()} yet. Click <strong>Add</strong> to create one.</div>
        ) : (
          <table className="tbl">
            <thead><tr><th>{config.labels.skill}</th><th>Category</th><th>Description</th><th>Target</th><th></th></tr></thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={s.id || i}>
                  <td><div style={{ fontWeight: 500 }}>{s.name}</div></td>
                  <td>{s.category ? <Badge>{s.category}</Badge> : <span className="faint">—</span>}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{s.blurb || '—'}</td>
                  <td className="mono">{s.target}%</td>
                  <td style={{ width: 90 }}>
                    <div className="row" style={{ gap: 4 }}>
                      <IconButton icon={I.Edit} onClick={() => setEditing(s)} />
                      <IconButton icon={I.Trash} onClick={() => {
                        if (s.id && confirm(`Remove "${s.name}"? This will only affect future evaluations — past scores stay in your sheet.`)) {
                          onDeleteSkill?.(s.id);
                        }
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {editing && (
        <SkillFormModal
          skill={editing === 'new' ? null : editing}
          labels={config.labels}
          onClose={() => setEditing(null)}
          onSave={async (s) => {
            const isNew = editing === 'new';
            const ok = await onSaveSkill?.(s, isNew);
            if (ok !== false) setEditing(null);
          }}
        />
      )}
    </>
  );
};

const SkillFormModal = ({ skill, labels, onClose, onSave }) => {
  const isNew = !skill;
  const [form, setForm] = React.useState(skill || { name: '', category: '', blurb: '', target: 90 });
  const [saving, setSaving] = React.useState(false);
  return (
    <div className="tour-backdrop" onClick={onClose}>
      <div className="tour-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: 0 }}>
        <div className="row between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 className="h3" style={{ margin: 0 }}>{isNew ? `Add ${labels.skill.toLowerCase()}` : `Edit ${labels.skill.toLowerCase()}`}</h3>
          <IconButton icon={I.X} onClick={onClose} />
        </div>
        <div style={{ padding: 24 }}>
          <div className="stack">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus placeholder="e.g. Customer Service" />
            </Field>
            <Field label="Category" hint="Optional. Groups skills on the scorecard.">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Front of House" />
            </Field>
            <Field label="Description (one-liner)">
              <Input value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} placeholder="What 'good' looks like" />
            </Field>
            <Field label="Target %" hint="The score considered passing.">
              <Input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} />
            </Field>
          </div>
        </div>
        <div className="row between" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={saving || !form.name.trim()} onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}>
            {saving ? 'Saving…' : (isNew ? 'Add' : 'Save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const TrainingTab = ({ config, setConfig, trainingItems, onSaveTraining, onDeleteTraining }) => {
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry) || INDUSTRY_TEMPLATES[0];
  const list = (trainingItems && trainingItems.length) ? trainingItems : tpl.training;
  const [editing, setEditing] = React.useState(null);

  return (
    <>
      <Card title={config.labels.training_path}>
        <div className="grid-2">
          <Field label="Default path length (days)">
            <Input type="number" value={config.defaultPathDays} onChange={(e) => setConfig(c => ({ ...c, defaultPathDays: Number(e.target.value) }))} />
          </Field>
          <Field label="Order">
            <Select value={config.sequentialTraining ? 'sequential' : 'adhoc'} onChange={(e) => setConfig(c => ({ ...c, sequentialTraining: e.target.value === 'sequential' }))}>
              <option value="adhoc">Ad-hoc — any order</option>
              <option value="sequential">Sequential — must complete in order</option>
            </Select>
          </Field>
        </div>
      </Card>
      <Card title={`${config.labels.assigned_training} items`} actions={<Button size="sm" icon={<I.Plus />} onClick={() => setEditing('new')}>Add item</Button>}>
        {list.length === 0 ? (
          <div className="empty">No training items yet.</div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Item</th><th>Mandatory</th><th>Link / file</th><th>Expires</th><th></th></tr></thead>
            <tbody>
              {list.map((t, i) => (
                <tr key={t.id || i}>
                  <td style={{ fontWeight: 500 }}>{t.name}</td>
                  <td>{(t.mandatory === true || t.mandatory === 'TRUE') ? <Badge variant="accent">Mandatory</Badge> : <span className="faint">Optional</span>}</td>
                  <td>{t.link ? <span className="row" style={{ gap: 4 }}><I.Link size={12} /> Attached</span> : <span className="faint">—</span>}</td>
                  <td className="muted">{t.expires || 'Never'}</td>
                  <td style={{ width: 90 }}>
                    <div className="row" style={{ gap: 4 }}>
                      <IconButton icon={I.Edit} onClick={() => setEditing(t)} />
                      <IconButton icon={I.Trash} onClick={() => {
                        if (t.id && confirm(`Remove "${t.name}"?`)) onDeleteTraining?.(t.id);
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {editing && (
        <TrainingFormModal
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (item) => {
            const isNew = editing === 'new';
            const ok = await onSaveTraining?.(item, isNew);
            if (ok !== false) setEditing(null);
          }}
        />
      )}
    </>
  );
};

const TemplatesTab = ({ config, setConfig, onSaveSkill, onSaveTraining }) => {
  const [previewing, setPreviewing] = React.useState(null);
  const [applying, setApplying] = React.useState(false);
  const [done, setDone] = React.useState(null);

  const apply = async (template) => {
    setApplying(true);
    setDone(null);
    let skillsAdded = 0, trainingAdded = 0;
    for (const s of template.skills) {
      const ok = await onSaveSkill?.({ ...s, order: skillsAdded }, true);
      if (ok !== false) skillsAdded++;
    }
    for (const t of template.training) {
      const ok = await onSaveTraining?.({ ...t, order: trainingAdded }, true);
      if (ok !== false) trainingAdded++;
    }
    setConfig(c => ({ ...c, industry: template.id }));
    setApplying(false);
    setPreviewing(null);
    setDone({ name: template.name, skillsAdded, trainingAdded });
    setTimeout(() => setDone(null), 6000);
  };

  return (
    <>
      <Card title="Industry templates" actions={<Badge>{INDUSTRY_TEMPLATES.length} available</Badge>}>
        <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
          Apply a pre-built set of {config.labels.skills.toLowerCase()} and {config.labels.assigned_training.toLowerCase()} to your library. Items are <strong>added to</strong> your existing library — nothing is deleted. You can edit or remove anything after.
        </p>
        {done && (
          <div className="callout" style={{ background: 'var(--good-soft)', borderLeftColor: 'var(--good)', padding: 14, marginBottom: 14, borderRadius: '0 10px 10px 0' }}>
            <strong style={{ color: 'var(--good)' }}>{done.name} applied.</strong>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
              Added {done.skillsAdded} {config.labels.skills.toLowerCase()} · {done.trainingAdded} {config.labels.assigned_training.toLowerCase()} items.
            </div>
          </div>
        )}
        <div className="grid-2" style={{ gap: 12 }}>
          {INDUSTRY_TEMPLATES.filter(t => t.id !== 'blank').map(t => (
            <button key={t.id} className="card tight" onClick={() => setPreviewing(t)} style={{
              cursor: 'pointer', textAlign: 'left', padding: 18,
              borderColor: config.industry === t.id ? 'var(--accent)' : 'var(--border)',
              borderWidth: config.industry === t.id ? 2 : 1,
              background: 'var(--surface)',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ fontSize: 28 }}>{t.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>{t.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{t.blurb}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 'auto' }}>
                {t.skills.length} {config.labels.skills.toLowerCase()} · {t.training.length} {config.labels.assigned_training.toLowerCase()} items
              </div>
              {config.industry === t.id && <Badge variant="accent" style={{ alignSelf: 'flex-start' }}>Current</Badge>}
            </button>
          ))}
        </div>
      </Card>

      {previewing && (
        <TemplatePreviewModal
          template={previewing}
          config={config}
          applying={applying}
          onApply={() => apply(previewing)}
          onClose={() => setPreviewing(null)}
        />
      )}
    </>
  );
};

const TemplatePreviewModal = ({ template, config, applying, onApply, onClose }) => (
  <div className="tour-backdrop" onClick={onClose}>
    <div className="tour-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620, padding: 0 }}>
      <div className="row between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="row" style={{ gap: 12 }}>
          <span style={{ fontSize: 24 }}>{template.icon}</span>
          <div>
            <h3 className="h3" style={{ margin: 0 }}>{template.name}</h3>
            <div className="muted" style={{ fontSize: 12.5 }}>{template.blurb}</div>
          </div>
        </div>
        <IconButton icon={I.X} onClick={onClose} />
      </div>
      <div style={{ padding: 24, maxHeight: 'calc(85vh - 200px)', overflowY: 'auto' }}>
        <div className="grid-2" style={{ gap: 16, alignItems: 'flex-start' }}>
          <Card tight title={`${config.labels.skills} (${template.skills.length})`}>
            <div className="stack-sm" style={{ gap: 4, maxHeight: 280, overflowY: 'auto' }}>
              {template.skills.map((s, i) => (
                <div key={i} className="row" style={{ gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12.5 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{s.name}</div>
                    {s.category && <span className="faint" style={{ fontSize: 11 }}>{s.category}</span>}
                  </div>
                  {s.target != null && <span className="mono faint" style={{ fontSize: 11 }}>{s.target}%</span>}
                </div>
              ))}
            </div>
          </Card>
          <Card tight title={`${config.labels.assigned_training} (${template.training.length})`}>
            <div className="stack-sm" style={{ gap: 4, maxHeight: 280, overflowY: 'auto' }}>
              {template.training.map((t, i) => (
                <div key={i} className="row between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12.5 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{t.name}</div>
                    {t.expires && <span className="faint" style={{ fontSize: 11 }}>Expires every {t.expires}</span>}
                  </div>
                  {t.mandatory && <Badge variant="accent">Mandatory</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <div className="row between" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={applying} onClick={onApply} icon={<I.Plus />}>
          {applying ? 'Adding to your library…' : `Add all (${template.skills.length} + ${template.training.length} items)`}
        </Button>
      </div>
    </div>
  </div>
);

const TrainingFormModal = ({ item, onClose, onSave }) => {
  const isNew = !item;
  const [form, setForm] = React.useState(item || { name: '', category: '', mandatory: false, link: '', expires: '' });
  const [saving, setSaving] = React.useState(false);

  // Coerce boolean for editing
  React.useEffect(() => {
    if (item && typeof item.mandatory === 'string') {
      setForm(f => ({ ...f, mandatory: f.mandatory === 'TRUE' || f.mandatory === true }));
    }
  }, []);

  return (
    <div className="tour-backdrop" onClick={onClose}>
      <div className="tour-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: 0 }}>
        <div className="row between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 className="h3" style={{ margin: 0 }}>{isNew ? 'Add training item' : 'Edit training item'}</h3>
          <IconButton icon={I.X} onClick={onClose} />
        </div>
        <div style={{ padding: 24 }}>
          <div className="stack">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus placeholder="e.g. Food Handler Cert" />
            </Field>
            <Field label="Category" hint="Optional grouping.">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Compliance" />
            </Field>
            <Field label="Link / file URL" hint="Where the training material lives — optional.">
              <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://…" />
            </Field>
            <Field label="Expires" hint="e.g. '12 months', '24 months', or leave blank for never.">
              <Input value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} placeholder="never" />
            </Field>
            <div className="row between" style={{ padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>Mandatory</div>
                <div className="muted" style={{ fontSize: 12 }}>Required for everyone</div>
              </div>
              <Toggle checked={!!form.mandatory} onChange={(v) => setForm({ ...form, mandatory: v })} />
            </div>
          </div>
        </div>
        <div className="row between" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={saving || !form.name.trim()} onClick={async () => { setSaving(true); await onSave(form); setSaving(false); }}>
            {saving ? 'Saving…' : (isNew ? 'Add' : 'Save')}
          </Button>
        </div>
      </div>
    </div>
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
