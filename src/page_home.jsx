/* ============================================================
   Home Page — overview, red flags, weekly activity, quick actions
   ============================================================ */

const HomePage = ({ config, trainees, onNavigate, onOpenTrainee }) => {
  const L = config.labels;
  const flagged = trainees.filter(t => t.redFlags && t.redFlags.length > 0);
  const allFlags = trainees.flatMap(t => (t.redFlags || []).map(f => ({ ...f, trainee: t })));
  const onTrack = trainees.filter(t => t.status === 'on-track' || t.status === 'graduating').length;
  const avgScore = (() => {
    const vals = trainees.flatMap(t => Object.values(t.scores).filter(v => v != null));
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  })();
  const graduating = trainees.filter(t => t.status === 'graduating');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">{today}</div>
          <h1 className="h1" style={{ marginTop: 8 }}>Today at {config.businessName}</h1>
          <div className="subtitle">
            {trainees.length} {L.trainees.toLowerCase()} in training · {flagged.length} need attention · {graduating.length} ready to graduate
          </div>
        </div>
        <div className="page-header-actions">
          <Button icon={<I.Edit />} onClick={() => onNavigate('daily')}>New evaluation</Button>
          <Button variant="primary" icon={<I.Sparkle />} onClick={() => onNavigate('ai')}>Generate AI summary</Button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard label={L.trainees + ' active'} value={trainees.length} sub="across all paths" />
        <StatCard label="On track" value={onTrack} sub={`${Math.round(onTrack/trainees.length*100)}% of roster`} tone="good" />
        <StatCard label="Avg score (7-day)" value={avgScore + '%'} sub="all skills" trend="up" trendValue="+3" />
        <StatCard label="Red flags" value={allFlags.length} sub={`across ${flagged.length} ${L.trainees.toLowerCase()}`} tone={allFlags.length > 0 ? 'danger' : ''} />
      </div>

      {/* Red flags + Weekly activity */}
      <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card
          title={
            <span>
              <I.Flag size={16} style={{ display: 'inline-block', marginRight: 8, color: 'var(--danger)', verticalAlign: 'text-bottom' }} />
              Red flags & escalations
            </span>
          }
          actions={<Badge variant="danger">{allFlags.length}</Badge>}
        >
          {allFlags.length === 0 ? (
            <div className="empty">No active flags. 🎉</div>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {allFlags.map((f, i) => (
                <div key={i} className={`flag-card ${f.severity === 'med' ? 'warn' : ''}`}>
                  <I.Flag />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                      <button className="pointer" onClick={() => onOpenTrainee(f.trainee.id)} style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink-strong)', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
                        {f.trainee.name}
                      </button>
                      <span className="muted" style={{ fontSize: 12 }}>· {f.trainee.position}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--ink-faint)' }}>{fmtDateShort(f.date)}</span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>{f.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Evaluations this week" actions={
          <div className="row" style={{ gap: 4 }}>
            <IconButton icon={I.BarChart} active />
            <IconButton icon={I.PieChart} />
            <IconButton icon={I.Trend} />
          </div>
        }>
          <div className="row between" style={{ marginBottom: 4 }}>
            <div>
              <div className="muted" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Week of May 11</div>
              <div className="h2" style={{ margin: '4px 0 0' }}>55<span className="muted" style={{ fontSize: 16, fontWeight: 400 }}> evals</span></div>
            </div>
            <Badge variant="good"><I.ArrowUp size={11} /> +18%</Badge>
          </div>
          <div className="chart-bars">
            {SAMPLE_WEEKLY_ACTIVITY.map((d, i) => {
              const max = Math.max(...SAMPLE_WEEKLY_ACTIVITY.map(x => x.evals));
              const h = d.evals === 0 ? 4 : (d.evals / max) * 100;
              return (
                <div key={i} className={`chart-bar ${d.evals === 0 ? 'muted' : ''}`} style={{ height: h + '%' }}>
                  {d.evals > 0 && d.evals}
                </div>
              );
            })}
          </div>
          <div className="chart-labels">
            {SAMPLE_WEEKLY_ACTIVITY.map(d => <span key={d.day}>{d.day}</span>)}
          </div>
        </Card>
      </div>

      {/* Trainees snapshot */}
      <Card
        title={`${L.trainees} snapshot`}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('trainees')}>View all <I.Chevron size={12} /></Button>
            <Button size="sm" variant="primary" icon={<I.Plus />}>Add {L.trainee.toLowerCase()}</Button>
          </>
        }
      >
        <table className="tbl">
          <thead>
            <tr>
              <th>{L.trainee}</th>
              <th>Status</th>
              <th>Days in</th>
              <th>{L.training_path}</th>
              <th>Avg score</th>
              <th>{L.trainer}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trainees.slice(0, 5).map(t => {
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
                  <td className="mono">{t.daysIn} / {t.pathDays}</td>
                  <td style={{ width: 140 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <Bar value={pathPct} danger={t.status === 'flagged'} warn={t.status === 'behind'} />
                      <span className="mono faint" style={{ fontSize: 12, minWidth: 30 }}>{pathPct}%</span>
                    </div>
                  </td>
                  <td>
                    {avg != null ? <ScoreDisplay value={avg} format={config.ratingFormat} target={85} /> : <span className="faint">—</span>}
                  </td>
                  <td><span className="muted">{t.trainer}</span></td>
                  <td><I.Chevron size={14} className="faint" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Bottom row: graduating + quick actions */}
      <div className="grid-2" style={{ marginTop: 24 }}>
        <Card title="Ready to graduate">
          {graduating.length === 0 ? (
            <div className="empty" style={{ padding: 20 }}>No one's quite there yet. Keep going.</div>
          ) : (
            graduating.map(t => (
              <div key={t.id} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="row" style={{ gap: 10 }}>
                  <Avatar name={t.name} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{t.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{t.daysIn} days · {t.quals.length} certs earned</div>
                  </div>
                </div>
                <Button size="sm" variant="accent">Mark graduated</Button>
              </div>
            ))
          )}
        </Card>

        <Card title="Today's quick actions">
          <div className="stack-sm">
            <QuickAction icon={I.Edit} title="Fill out today's evaluation form" desc="3 trainees on shift" onClick={() => onNavigate('daily')} />
            <QuickAction icon={I.Mail} title="Email weekly summaries" desc="5 ready to send" onClick={() => onNavigate('ai')} />
            <QuickAction icon={I.Calendar} title="Schedule instructor session" desc="Espresso Bar 101 — Sam, Riley" />
            <QuickAction icon={I.Book} title={`Review ${L.assigned_training.toLowerCase()}`} desc="2 expiring within 30 days" onClick={() => onNavigate('training')} />
          </div>
        </Card>
      </div>
    </>
  );
};

const StatCard = ({ label, value, sub, tone, trend, trendValue }) => (
  <div className="card tight" style={{ padding: 16 }}>
    <div className="row between">
      <div className="muted" style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
      {trend && <Badge variant={trend === 'up' ? 'good' : 'danger'}>{trend === 'up' ? <I.ArrowUp size={10} /> : <I.ArrowDown size={10} />} {trendValue}</Badge>}
    </div>
    <div className="h2" style={{ margin: '8px 0 4px', color: tone === 'danger' ? 'var(--danger)' : tone === 'good' ? 'var(--good)' : 'var(--ink-strong)' }}>{value}</div>
    <div className="muted" style={{ fontSize: 12 }}>{sub}</div>
  </div>
);

const QuickAction = ({ icon: IconComp, title, desc, onClick }) => (
  <button onClick={onClick} className="row" style={{
    padding: 12, gap: 12, width: '100%', textAlign: 'left',
    border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)',
    cursor: 'pointer', transition: 'background .12s',
  }}
  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-alt)'}
  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
  >
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <IconComp size={15} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{title}</div>
      <div className="muted" style={{ fontSize: 12 }}>{desc}</div>
    </div>
    <I.Chevron size={14} className="faint" />
  </button>
);

Object.assign(window, { HomePage });
