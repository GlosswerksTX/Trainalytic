/* ============================================================
   Trainers / Evaluators page
   ============================================================ */

const TrainersPage = ({ config, trainers, trainees, onOpenTrainee, onSaveTrainer }) => {
  const L = config.labels;
  const [openModal, setOpenModal] = React.useState(null); // 'add' | trainer obj | null

  const totalEvals = trainers.reduce((a, t) => a + t.evals30d, 0);
  const assigned = trainers.reduce((a, t) => a + t.assignedTo.length, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h1">{L.trainers}</h1>
          <div className="subtitle">
            {trainers.length} on the team · {assigned} {L.trainees.toLowerCase()} actively assigned · {totalEvals} evaluations in the last 30 days
          </div>
        </div>
        <div className="page-header-actions">
          <Button icon={<I.Download />}>Export</Button>
          <Button variant="primary" icon={<I.Plus />} onClick={() => setOpenModal('add')}>Add {L.trainer.toLowerCase()}</Button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard label={`${L.trainers} on the team`} value={trainers.length} sub={`${trainers.filter(t => t.canScore).length} can score`} />
        <StatCard label="Evals last 30 days" value={totalEvals} sub="across all evaluators" trend="up" trendValue="+12%" />
        <StatCard label={`${L.trainees} assigned`} value={assigned} sub={`${trainees.length - assigned} unassigned`} tone={trainees.length - assigned > 0 ? 'warn' : ''} />
        <StatCard label="Most active" value={trainers.reduce((a, b) => a.evals30d > b.evals30d ? a : b).name.split(' ')[0]} sub={trainers.reduce((a, b) => a.evals30d > b.evals30d ? a : b).evals30d + ' evals'} />
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {trainers.map(t => {
          const tneeList = trainees.filter(tn => t.assignedTo.includes(tn.id));
          return (
            <Card key={t.id} tight onClick={() => setOpenModal(t)} style={{ cursor: 'pointer', transition: 'border-color .15s' }}>
              <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: t.color, color: 'white',
                  display: 'grid', placeItems: 'center',
                  fontWeight: 600, fontSize: 18, flexShrink: 0,
                  fontFamily: 'var(--font-display)',
                }}>{t.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 8, marginBottom: 2 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</div>
                    {t.isYou && <Badge variant="accent">You</Badge>}
                  </div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{t.role}</div>
                  <div className="row" style={{ gap: 14, marginTop: 10 }}>
                    <div>
                      <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Assigned</div>
                      <div className="mono" style={{ fontWeight: 600, fontSize: 14 }}>{t.assignedTo.length}</div>
                    </div>
                    <div>
                      <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Evals (30d)</div>
                      <div className="mono" style={{ fontWeight: 600, fontSize: 14 }}>{t.evals30d}</div>
                    </div>
                    <div>
                      <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last active</div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{t.lastActive}</div>
                    </div>
                  </div>
                </div>
                <IconButton icon={I.Dots} onClick={(e) => { e.stopPropagation(); setOpenModal(t); }} />
              </div>

              {tneeList.length > 0 && (
                <>
                  <div className="divider" style={{ margin: '14px 0 10px' }}></div>
                  <div className="faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Assigned {L.trainees.toLowerCase()}</div>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    {tneeList.map(tn => (
                      <div key={tn.id} className="chip" onClick={(e) => { e.stopPropagation(); onOpenTrainee(tn.id); }} style={{ paddingLeft: 4 }}>
                        <Avatar name={tn.name} size="sm" />
                        {tn.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {openModal && (
        <TrainerModal
          trainer={openModal === 'add' ? null : openModal}
          trainees={trainees}
          L={L}
          onClose={() => setOpenModal(null)}
          onSave={onSaveTrainer}
        />
      )}
    </>
  );
};

const TrainerModal = ({ trainer, trainees, L, onClose, onSave }) => {
  const isNew = !trainer;
  const [form, setForm] = React.useState(trainer || {
    name: '', role: '', email: '', phone: '', location: '',
    canScore: true, assignedTo: [],
  });
  const [saving, setSaving] = React.useState(false);

  const toggleAssigned = (id) => {
    setForm(f => ({
      ...f,
      assignedTo: f.assignedTo.includes(id)
        ? f.assignedTo.filter(x => x !== id)
        : [...f.assignedTo, id],
    }));
  };

  return (
    <div className="tour-backdrop" onClick={onClose}>
      <div className="tour-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560, padding: 0 }}>
        <div className="row between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div className="row" style={{ gap: 12 }}>
            {!isNew && (
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: trainer.color, color: 'white',
                display: 'grid', placeItems: 'center',
                fontWeight: 600, fontSize: 16, fontFamily: 'var(--font-display)',
              }}>{trainer.avatar}</div>
            )}
            <div>
              <h3 className="h3" style={{ margin: 0 }}>{isNew ? `Add ${L.trainer.toLowerCase()}` : trainer.name}</h3>
              {!isNew && <div className="muted" style={{ fontSize: 12.5 }}>{trainer.role}</div>}
            </div>
          </div>
          <IconButton icon={I.X} onClick={onClose} />
        </div>

        <div style={{ padding: 24, maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
          <div className="stack">
            <div className="grid-2">
              <Field label="Name">
                <Input value={form.name} placeholder="Full name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Role / title">
                <Input value={form.role} placeholder="e.g. Shift Lead" onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Phone (optional)">
                <Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
            </div>

            <div className="row between" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elevated)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>Can score {L.scorecards.toLowerCase()}</div>
                <div className="muted" style={{ fontSize: 12 }}>Anyone with access can score by default — turn off for view-only roles.</div>
              </div>
              <Toggle checked={form.canScore} onChange={(v) => setForm({ ...form, canScore: v })} />
            </div>

            <Field label={`Assigned ${L.trainees.toLowerCase()}`} hint={`${form.assignedTo.length} assigned — a ${L.trainee.toLowerCase()} can have multiple ${L.trainers.toLowerCase()}.`}>
              <div className="stack-sm" style={{ gap: 4 }}>
                {trainees.map(tn => (
                  <label key={tn.id} className="row" style={{
                    gap: 10, padding: 8, borderRadius: 8, cursor: 'pointer',
                    background: form.assignedTo.includes(tn.id) ? 'var(--accent-soft)' : 'transparent',
                  }}>
                    <span className={`checkbox ${form.assignedTo.includes(tn.id) ? 'checked' : ''}`} onClick={(e) => { e.preventDefault(); toggleAssigned(tn.id); }}></span>
                    <Avatar name={tn.name} size="sm" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{tn.name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{tn.position} · Day {tn.daysIn} of {tn.pathDays}</div>
                    </div>
                    <StatusBadge status={tn.status} />
                  </label>
                ))}
              </div>
            </Field>

            {!isNew && (
              <Card tight title="Activity (last 30 days)" style={{ background: 'var(--bg-elevated)' }}>
                <div className="grid-3">
                  <div className="kv"><div className="k">Evaluations</div><div className="v mono" style={{ fontWeight: 600 }}>{trainer.evals30d}</div></div>
                  <div className="kv"><div className="k">Joined</div><div className="v">{fmtDateShort(trainer.joinedAt)}</div></div>
                  <div className="kv"><div className="k">Last active</div><div className="v">{trainer.lastActive}</div></div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="row between" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          {!isNew && !trainer.isYou ? (
            <Button variant="ghost" style={{ color: 'var(--danger)' }} icon={<I.Trash />}>Remove from team</Button>
          ) : <span />}
          <div className="row" style={{ gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" disabled={saving || !form.name?.trim()} onClick={async () => {
              if (!onSave) { onClose(); return; }
              setSaving(true);
              const ok = await onSave(form, isNew);
              setSaving(false);
              if (ok !== false) onClose();
            }}>{saving ? 'Saving…' : isNew ? 'Add to team' : 'Save changes'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { TrainersPage });
