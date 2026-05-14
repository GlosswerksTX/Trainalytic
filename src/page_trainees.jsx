/* ============================================================
   Trainees — list + detail
   ============================================================ */

const TraineesPage = ({ config, trainees, trainers, onOpenTrainee, onSaveTrainee }) => {
  const L = config.labels;
  const [filter, setFilter] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [addOpen, setAddOpen] = React.useState(false);

  const filtered = trainees.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h1">{L.trainees}</h1>
          <div className="subtitle">{trainees.length} active · roster across all paths</div>
        </div>
        <div className="page-header-actions">
          <Button icon={<I.Download />}>Export CSV</Button>
          <Button variant="primary" icon={<I.Plus />} onClick={() => setAddOpen(true)}>Add {L.trainee.toLowerCase()}</Button>
        </div>
      </div>

      {addOpen && (
        <TraineeFormModal
          trainers={trainers}
          L={L}
          defaultPathDays={config.defaultPathDays || 60}
          onClose={() => setAddOpen(false)}
          onSave={async (t) => {
            const ok = await onSaveTrainee?.(t, true);
            if (ok !== false) setAddOpen(false);
          }}
        />
      )}

      <Card>
        <div className="row" style={{ gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <I.Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)' }} />
            <Input placeholder={`Search ${L.trainees.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 34 }} />
          </div>
          <div className="row" style={{ gap: 4 }}>
            {['all', 'on-track', 'behind', 'flagged', 'graduating'].map(f => (
              <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>{L.trainee}</th>
              <th>Status</th>
              <th>Start date</th>
              <th>Time in {L.training_path.toLowerCase()}</th>
              <th>Path progress</th>
              <th>Avg score</th>
              <th>{L.qualifications}</th>
              <th>{L.trainer}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const scores = Object.values(t.scores).filter(v => v != null);
              const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : null;
              const pathPct = Math.min(100, Math.round((t.daysIn / t.pathDays) * 100));
              return (
                <tr key={t.id} className="clickable" onClick={() => onOpenTrainee(t.id)}>
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      <Avatar name={t.name} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{t.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{t.position}</div>
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="mono muted" style={{ fontSize: 12.5 }}>{fmtDateShort(t.startDate)}</td>
                  <td className="mono">{t.daysIn} / {t.pathDays} days</td>
                  <td style={{ width: 160 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <Bar value={pathPct} danger={t.status === 'flagged'} warn={t.status === 'behind'} />
                      <span className="mono faint" style={{ fontSize: 12, minWidth: 30 }}>{pathPct}%</span>
                    </div>
                  </td>
                  <td>{avg != null ? <ScoreDisplay value={avg} format={config.ratingFormat} target={85} /> : <span className="faint">—</span>}</td>
                  <td><span className="mono" style={{ fontSize: 12.5 }}>{t.quals.length}</span></td>
                  <td><span className="muted">{t.trainer}</span></td>
                  <td>
                    {t.redFlags?.length > 0 && <I.Flag size={14} style={{ color: 'var(--danger)' }} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
};

/* ---- Trainee detail ---- */
const TraineeDetail = ({ config, trainee, allSkills, onBack, onNavigate, onResolveFlag, onArchive, rawFlags }) => {
  const [tab, setTab] = React.useState('overview');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const L = config.labels;
  const t = trainee;
  const scores = Object.values(t.scores).filter(v => v != null);
  const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : null;
  const pathPct = Math.min(100, Math.round((t.daysIn / t.pathDays) * 100));

  // Look up live flag IDs (current trainee.redFlags doesn't carry the id back from the join)
  const myFlags = (rawFlags || []).filter(f => String(f.traineeId) === String(t.id) && !f.resolvedAt);

  return (
    <>
      <div className="row" style={{ marginBottom: 16 }}>
        <Button variant="ghost" icon={<I.ChevronL />} onClick={onBack}>Back to {L.trainees.toLowerCase()}</Button>
      </div>

      <div className="page-header">
        <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
          <Avatar name={t.name} size="xl" />
          <div>
            <h1 className="h1">{t.name}</h1>
            <div className="subtitle row" style={{ gap: 12 }}>
              <span>{t.position}</span>
              <span>·</span>
              <span>Started {fmtDate(t.startDate)}</span>
              <span>·</span>
              <span>{L.trainer}: {t.trainer}</span>
              <StatusBadge status={t.status} />
            </div>
          </div>
        </div>
        <div className="page-header-actions">
          <div style={{ position: 'relative' }}>
            <Button icon={<I.Dots />} onClick={() => setMenuOpen(v => !v)}>More</Button>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: 4, minWidth: 200, zIndex: 30,
                boxShadow: 'var(--shadow-lg)',
              }}>
                <div className="nav-item" onClick={() => setMenuOpen(false)}>
                  <I.Edit /> <span>Edit profile</span>
                </div>
                <div className="nav-item" onClick={() => { setMenuOpen(false); onNavigate('daily', { traineeId: t.id }); }}>
                  <I.Plus /> <span>Score now</span>
                </div>
                <div className="divider" style={{ margin: '4px 0' }}></div>
                <div className="nav-item" style={{ color: 'var(--danger)' }} onClick={() => {
                  setMenuOpen(false);
                  if (confirm(`Archive ${t.name}? Their history stays in your sheet — they just stop appearing in the active roster.`)) {
                    onArchive?.(t.id);
                    onBack();
                  }
                }}>
                  <I.Trash /> <span>Archive trainee</span>
                </div>
              </div>
            )}
          </div>
          <Button variant="primary" icon={<I.Sparkle />} onClick={() => onNavigate('ai', { traineeId: t.id })}>AI summary</Button>
        </div>
      </div>

      {myFlags.length > 0 && (
        <div className="stack" style={{ marginBottom: 20 }}>
          {myFlags.map((f, i) => (
            <div key={f.id || i} className={`flag-card ${f.severity === 'watch' ? 'warn' : ''}`}>
              <I.Flag />
              <div style={{ flex: 1 }}>
                <div className="row between" style={{ marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                    {f.severity === 'high' ? 'Red flag' : 'Watch item'}
                    <span className="badge" style={{ marginLeft: 8, fontSize: 10.5 }}>{f.kind}</span>
                  </div>
                  <span className="faint" style={{ fontSize: 11.5 }}>{fmtDateShort(f.date)}</span>
                </div>
                <div style={{ fontSize: 13.5 }}>{f.text}</div>
                <div className="row" style={{ gap: 6, marginTop: 8 }}>
                  <Button size="sm" onClick={() => onResolveFlag?.(f.id)}>Resolve</Button>
                  <Button size="sm" variant="ghost">Add note</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="tabs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'scorecard', label: L.scorecards },
          { id: 'training', label: L.assigned_training },
          { id: 'notes', label: 'Notes & journal' },
        ].map(x => (
          <div key={x.id} className={`tab ${tab === x.id ? 'active' : ''}`} onClick={() => setTab(x.id)}>{x.label}</div>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          <Card title={`${L.training_path} progress`}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <div className="muted" style={{ fontSize: 13 }}>Day {t.daysIn} of {t.pathDays}</div>
              <div className="mono" style={{ fontWeight: 600 }}>{pathPct}%</div>
            </div>
            <Bar value={pathPct} thick danger={t.status === 'flagged'} warn={t.status === 'behind'} />
            <div className="row" style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-faint)' }}>
              <span>{fmtDateShort(t.startDate)}</span>
              <span style={{ marginLeft: 'auto' }}>Estimated completion {fmtDateShort(new Date(new Date(t.startDate).getTime() + t.pathDays * 86400000).toISOString())}</span>
            </div>

            <div className="hr"></div>

            <div className="h3" style={{ fontSize: 14, marginBottom: 12 }}>{L.scorecards} (top skills)</div>
            <div className="stack" style={{ gap: 8 }}>
              {Object.entries(t.scores).slice(0, 5).map(([skill, v]) => (
                <div key={skill} className="row" style={{ gap: 10 }}>
                  <div style={{ flex: 1, fontSize: 13 }}>{skill}</div>
                  <div style={{ width: 140 }}>
                    {v != null ? <Bar value={v} danger={v < 75} warn={v < 85} /> : <span className="faint mono" style={{ fontSize: 12 }}>Not yet evaluated</span>}
                  </div>
                  <div style={{ width: 60, textAlign: 'right' }}>
                    {v != null ? (
                      <span className="mono" style={{ fontWeight: 600 }}>{v}% <Trend dir={t.trend[skill] || 'flat'} /></span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Quick facts">
            <div className="stack">
              <div className="kv">
                <div className="k">Position</div>
                <div className="v">{t.position}</div>
              </div>
              <div className="kv">
                <div className="k">Start date</div>
                <div className="v">{fmtDate(t.startDate)}</div>
              </div>
              <div className="kv">
                <div className="k">{L.trainer}</div>
                <div className="v">{t.trainer}</div>
              </div>
              <div className="kv">
                <div className="k">Average score</div>
                <div className="v">{avg != null ? <ScoreDisplay value={avg} format={config.ratingFormat} target={85} size="lg" /> : '—'}</div>
              </div>
              <div className="kv">
                <div className="k">{L.qualifications}</div>
                <div className="v" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {t.quals.map(q => <Badge key={q} variant="accent">{q}</Badge>)}
                </div>
              </div>
              <div className="kv">
                <div className="k">{L.assigned_training}</div>
                <div className="v"><span className="mono">{t.trainingDone}</span> of <span className="mono">{t.trainingTotal}</span> complete</div>
              </div>
            </div>
          </Card>

          <Card title="Recent notes" actions={<Button size="sm" variant="ghost" onClick={() => setTab('notes')}>View all <I.Chevron size={12} /></Button>}>
            {t.notes.length === 0 ? (
              <div className="empty" style={{ padding: 20 }}>No notes yet.</div>
            ) : (
              <div className="stack">
                {t.notes.slice(0, 3).map((n, i) => (
                  <div key={i} style={{ padding: 12, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div className="row between" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{n.author}</span>
                      <span className="faint" style={{ fontSize: 11.5 }}>{fmtDateShort(n.date)}</span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{n.text}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title={`Marked ${'"not performed"'} today`}>
            <div className="empty" style={{ padding: 20 }}>Nothing flagged today.</div>
          </Card>
        </div>
      )}

      {tab === 'scorecard' && (
        <Card title={`${L.scorecards} — average over selected range`} actions={
          <div className="row" style={{ gap: 6 }}>
            <Select style={{ width: 'auto' }}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Lifetime</option>
              <option>Custom range…</option>
            </Select>
          </div>
        }>
          <table className="tbl">
            <thead>
              <tr>
                <th>{L.skill}</th>
                <th>Category</th>
                <th>Score</th>
                <th>Target</th>
                <th>Trend</th>
                <th>Last scored</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(t.scores).map(([skill, v]) => {
                const def = allSkills.find(s => s.name === skill);
                const target = def?.target || 90;
                return (
                  <tr key={skill}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{skill}</div>
                      {def?.blurb && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{def.blurb}</div>}
                    </td>
                    <td><span className="badge">{def?.category || '—'}</span></td>
                    <td style={{ width: 220 }}>
                      {v != null ? (
                        <div className="row" style={{ gap: 10 }}>
                          <Bar value={v} danger={v < target - 10} warn={v < target} />
                          <span className="mono tnum" style={{ fontWeight: 600, minWidth: 36, textAlign: 'right' }}>{v}%</span>
                        </div>
                      ) : <span className="faint">Not yet evaluated</span>}
                    </td>
                    <td><span className="mono muted">{target}%</span></td>
                    <td>{v != null ? <Trend dir={t.trend[skill] || 'flat'} /> : '—'}</td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{v != null ? 'May 12' : '—'}</td>
                    <td><Button size="sm" variant="ghost" onClick={() => onNavigate('daily', { traineeId: t.id })}>Score</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'training' && (
        <Card title={L.assigned_training}>
          <div className="stack" style={{ gap: 8 }}>
            {INDUSTRY_TEMPLATES[0].training.map((tr, i) => {
              const done = i < t.trainingDone;
              return (
                <div key={i} className="row" style={{ gap: 12, padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elevated)' }}>
                  <div className={`checkbox lg ${done ? 'checked' : ''}`}></div>
                  <div style={{ flex: 1 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <div style={{ fontWeight: 500 }}>{tr.name}</div>
                      {tr.mandatory && <Badge variant="accent">Mandatory</Badge>}
                      {tr.expires && <Badge>Expires every {tr.expires}</Badge>}
                    </div>
                    {tr.link && <div className="muted row" style={{ fontSize: 12, marginTop: 4, gap: 4 }}><I.Link size={11} /> Link to training material</div>}
                  </div>
                  <div style={{ width: 100, textAlign: 'right' }}>
                    {done ? <Badge variant="good"><I.Check size={11} /> Done</Badge> : <Badge>Not started</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === 'notes' && (
        <Card title="Notes & journal" actions={<Button size="sm" variant="primary" icon={<I.Plus />}>Add note</Button>}>
          <Textarea placeholder="Leave a note about today…" style={{ marginBottom: 16 }} />
          {t.notes.length === 0 ? (
            <div className="empty">No notes yet. Use this for gray-area situations or coaching context.</div>
          ) : (
            <div className="stack">
              {t.notes.map((n, i) => (
                <div key={i} style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div className="row between" style={{ marginBottom: 6 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <Avatar name={n.author} size="sm" />
                      <span style={{ fontWeight: 500, fontSize: 13.5 }}>{n.author}</span>
                    </div>
                    <span className="faint" style={{ fontSize: 11.5 }}>{fmtDate(n.date)}</span>
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{n.text}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </>
  );
};

Object.assign(window, { TraineesPage, TraineeDetail });

/* ---- Add/Edit Trainee Modal ---- */
const TraineeFormModal = ({ trainee, trainers, L, defaultPathDays, onClose, onSave }) => {
  const isNew = !trainee;
  const [form, setForm] = React.useState(trainee || {
    name: '', position: '', startDate: new Date().toISOString().slice(0, 10),
    pathDays: defaultPathDays, status: 'on-track', trainerId: trainers?.[0]?.id || '',
  });
  const [saving, setSaving] = React.useState(false);

  return (
    <div className="tour-backdrop" onClick={onClose}>
      <div className="tour-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: 0 }}>
        <div className="row between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 className="h3" style={{ margin: 0 }}>{isNew ? `Add ${L.trainee.toLowerCase()}` : 'Edit profile'}</h3>
          <IconButton icon={I.X} onClick={onClose} />
        </div>

        <div style={{ padding: 24 }}>
          <div className="stack">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus placeholder="Full name" />
            </Field>
            <Field label="Position">
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Barista" />
            </Field>
            <div className="grid-2">
              <Field label="Start date">
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </Field>
              <Field label="Path length (days)">
                <Input type="number" value={form.pathDays} onChange={(e) => setForm({ ...form, pathDays: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label={`Assigned ${L.trainer.toLowerCase()}`}>
              <Select value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}>
                <option value="">— None —</option>
                {(trainers || []).map(tr => <option key={tr.id} value={tr.id}>{tr.name}</option>)}
              </Select>
            </Field>
          </div>
        </div>

        <div className="row between" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={saving || !form.name.trim()} onClick={async () => {
            if (!onSave) { onClose(); return; }
            setSaving(true);
            await onSave(form);
            setSaving(false);
          }}>{saving ? 'Saving…' : (isNew ? `Add ${L.trainee.toLowerCase()}` : 'Save changes')}</Button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { TraineeFormModal });
