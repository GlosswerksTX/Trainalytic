/* ============================================================
   App shell — routing, state, mounts everything
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "demoStart": "dashboard",
  "showSampleData": true
}/*EDITMODE-END*/;

const App = () => {
  // ---- Persistent state ----
  const [config, setConfig] = React.useState(() => ({ ...SAMPLE_CONFIG }));
  const [trainees, setTrainees] = React.useState(SAMPLE_TRAINEES);
  const [trainers, setTrainers] = React.useState(SAMPLE_TRAINERS);
  const [skills, setSkills] = React.useState([]);
  const [trainingItems, setTrainingItems] = React.useState([]);
  const [rawSheet, setRawSheet] = React.useState(null); // {config:[], trainees:[], scores:[]...}
  const [page, setPage] = React.useState('home');
  const [openTrainee, setOpenTrainee] = React.useState(null);
  const [contextArg, setContextArg] = React.useState(null);
  const [showWizard, setShowWizard] = React.useState(false);
  const [wizardConfig, setWizardConfig] = React.useState(null);
  const [showTour, setShowTour] = React.useState(false);

  // Pulse Check IQ seller-brand state
  const [pcWelcomeOpen, setPcWelcomeOpen] = React.useState(false);
  const [pcConnectOpen, setPcConnectOpen] = React.useState(false);
  const [demoMode, setDemoMode] = React.useState(() => !SheetAPI.isConnected());
  const [demoBannerDismissed, setDemoBannerDismissed] = React.useState(false);
  const [sheetUrl, setSheetUrl] = React.useState(() => SheetAPI.getUrl());

  // Load state
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState(null);
  const [toast, setToast] = React.useState(null); // { type, text }

  const showToast = React.useCallback((text, type = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ---- Load from sheet ----
  const loadFromSheet = React.useCallback(async () => {
    if (!SheetAPI.isConnected()) return;
    setLoading(true);
    setLoadError(null);
    try {
      const raw = await SheetAPI.readAll();
      setRawSheet(raw);
      // Merge config into state
      const sheetConfig = Transformers.configFromRows(raw.config || []);
      setConfig(c => ({ ...c, ...sheetConfig }));
      // Joined trainees
      const tns = Transformers.joinTraineeData(raw);
      setTrainees(tns);
      setTrainers(Transformers.trainersFromRaw(raw));
      setSkills((raw.skills || []).map(s => ({ ...s, target: Number(s.target) || 90 })));
      setTrainingItems(raw.training || []);
      setDemoMode(false);
    } catch (err) {
      console.error('Load failed:', err);
      setLoadError(err.message);
      // Stay in demo mode so the UI is still usable
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: if a URL is stored, try to load
  React.useEffect(() => { loadFromSheet(); }, [loadFromSheet]);

  // ---- Tweaks panel (designer-side) ----
  const { tweaks, setTweak } = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : { tweaks: TWEAK_DEFAULTS, setTweak: () => {} };

  // ---- Theme application ----
  React.useEffect(() => {
    document.documentElement.setAttribute('data-palette', config.palette);
    document.documentElement.setAttribute('data-fonts', config.fonts);
    document.documentElement.setAttribute('data-theme', config.theme);
    document.documentElement.setAttribute('data-density', config.density);
  }, [config.palette, config.fonts, config.theme, config.density]);

  // ---- Daily entry save handler ----
  const randId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
  const nowIso = () => new Date().toISOString();
  const today = () => new Date().toISOString().slice(0, 10);

  const onSaveDailyEntry = React.useCallback(async (entry) => {
    // entry = { traineeId, date, shift, evaluatorId, scores, skillNotes, notPerformed, trainingCompleted, overallNote, flag }
    if (!SheetAPI.isConnected()) {
      showToast('Demo mode — connect your Google Sheet to actually save entries.', 'info');
      return;
    }
    try {
      // Build score rows — one per skill
      const scoreRows = [];
      // Need skill id by name (skills come from sheet)
      const skillByName = Object.fromEntries((skills || []).map(s => [s.name, s]));
      for (const [skillName, value] of Object.entries(entry.scores || {})) {
        const skill = skillByName[skillName];
        if (!skill) continue;
        scoreRows.push({
          id: randId('sc'),
          traineeId: entry.traineeId,
          skillId: skill.id,
          score: value == null ? '' : value,
          notPerformed: !!entry.notPerformed?.[skillName],
          note: entry.skillNotes?.[skillName] || '',
          date: entry.date || today(),
          shift: entry.shift || '',
          evaluatorId: entry.evaluatorId || '',
          createdAt: nowIso(),
        });
      }
      // Add not-performed-only entries (skills with no score but marked NP)
      for (const [skillName, np] of Object.entries(entry.notPerformed || {})) {
        if (!np) continue;
        if (entry.scores?.[skillName] != null) continue; // already added above
        const skill = skillByName[skillName];
        if (!skill) continue;
        scoreRows.push({
          id: randId('sc'),
          traineeId: entry.traineeId,
          skillId: skill.id,
          score: '',
          notPerformed: true,
          note: entry.skillNotes?.[skillName] || '',
          date: entry.date || today(),
          shift: entry.shift || '',
          evaluatorId: entry.evaluatorId || '',
          createdAt: nowIso(),
        });
      }

      const writes = [];
      if (scoreRows.length) writes.push(SheetAPI.append('scores', scoreRows));

      // Overall note
      if (entry.overallNote && entry.overallNote.trim()) {
        writes.push(SheetAPI.append('notes', [{
          id: randId('n'),
          traineeId: entry.traineeId,
          text: entry.overallNote.trim(),
          author: 'You',
          date: entry.date || today(),
          createdAt: nowIso(),
        }]));
      }

      // Flag
      if (entry.flag && entry.flag.text) {
        writes.push(SheetAPI.append('flags', [{
          id: randId('f'),
          traineeId: entry.traineeId,
          kind: entry.flag.kind || 'other',
          severity: entry.flag.severity || 'watch',
          text: entry.flag.text,
          date: entry.date || today(),
          resolvedAt: '',
          resolvedBy: '',
          resolution: '',
        }]));
      }

      await Promise.all(writes);
      showToast(`Saved ${scoreRows.length} score${scoreRows.length === 1 ? '' : 's'} to your sheet.`, 'good');
      // Reload to reflect the new data
      await loadFromSheet();
    } catch (err) {
      console.error(err);
      showToast(`Save failed: ${err.message}`, 'error');
    }
  }, [skills, loadFromSheet, showToast]);

  // ---- Trainee / Trainer / Flag write handlers ----
  const onSaveTrainee = React.useCallback(async (trainee, isNew) => {
    if (!SheetAPI.isConnected()) {
      showToast('Connect your sheet first to save trainees.', 'info');
      return false;
    }
    try {
      const row = {
        id: trainee.id || randId('t'),
        name: trainee.name,
        position: trainee.position || '',
        startDate: trainee.startDate || today(),
        pathDays: trainee.pathDays || config.defaultPathDays || 60,
        status: trainee.status || 'on-track',
        trainerId: trainee.trainerId || '',
        quals: JSON.stringify(trainee.quals || []),
        archived: trainee.archived ? 'TRUE' : 'FALSE',
      };
      if (isNew) await SheetAPI.append('trainees', [row]);
      else await SheetAPI.update('trainees', row);
      showToast(isNew ? 'Trainee added.' : 'Trainee updated.', 'good');
      await loadFromSheet();
      return true;
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error');
      return false;
    }
  }, [config.defaultPathDays, loadFromSheet, showToast]);

  const onSaveTrainer = React.useCallback(async (trainer, isNew) => {
    if (!SheetAPI.isConnected()) {
      showToast('Connect your sheet first to save trainers.', 'info');
      return false;
    }
    try {
      const row = {
        id: trainer.id || randId('r'),
        name: trainer.name,
        role: trainer.role || '',
        email: trainer.email || '',
        phone: trainer.phone || '',
        joinedAt: trainer.joinedAt || today(),
        canScore: trainer.canScore ? 'TRUE' : 'FALSE',
        assignedTo: JSON.stringify(trainer.assignedTo || []),
        archived: trainer.archived ? 'TRUE' : 'FALSE',
      };
      if (isNew) await SheetAPI.append('trainers', [row]);
      else await SheetAPI.update('trainers', row);
      showToast(isNew ? 'Trainer added.' : 'Trainer updated.', 'good');
      await loadFromSheet();
      return true;
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error');
      return false;
    }
  }, [loadFromSheet, showToast]);

  const onArchiveTrainee = React.useCallback(async (traineeId) => {
    if (!SheetAPI.isConnected()) {
      showToast('Connect your sheet first.', 'info');
      return;
    }
    try {
      await SheetAPI.update('trainees', { id: traineeId, archived: 'TRUE', status: 'graduated' });
      showToast('Trainee archived.', 'good');
      await loadFromSheet();
    } catch (err) {
      showToast(`Archive failed: ${err.message}`, 'error');
    }
  }, [loadFromSheet, showToast]);

  const onResolveFlag = React.useCallback(async (flagId, resolution = 'Resolved') => {
    if (!SheetAPI.isConnected()) {
      showToast('Connect your sheet first.', 'info');
      return;
    }
    try {
      await SheetAPI.update('flags', {
        id: flagId,
        resolvedAt: nowIso(),
        resolvedBy: 'You',
        resolution,
      });
      showToast('Flag resolved.', 'good');
      await loadFromSheet();
    } catch (err) {
      showToast(`Update failed: ${err.message}`, 'error');
    }
  }, [loadFromSheet, showToast]);

  // ---- Skill / Training write handlers ----
  const onSaveSkill = React.useCallback(async (skill, isNew) => {
    if (!SheetAPI.isConnected()) {
      showToast('Connect your sheet first.', 'info');
      return false;
    }
    try {
      const row = {
        id: skill.id || randId('s'),
        name: skill.name,
        category: skill.category || '',
        blurb: skill.blurb || '',
        target: skill.target ?? 90,
        order: skill.order ?? 0,
        archived: skill.archived ? 'TRUE' : 'FALSE',
      };
      if (isNew) await SheetAPI.append('skills', [row]);
      else await SheetAPI.update('skills', row);
      showToast(isNew ? 'Skill added.' : 'Skill updated.', 'good');
      await loadFromSheet();
      return true;
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error');
      return false;
    }
  }, [loadFromSheet, showToast]);

  const onDeleteSkill = React.useCallback(async (skillId) => {
    if (!SheetAPI.isConnected()) return;
    try {
      await SheetAPI.remove('skills', skillId);
      showToast('Skill removed.', 'good');
      await loadFromSheet();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }, [loadFromSheet, showToast]);

  const onSaveTraining = React.useCallback(async (item, isNew) => {
    if (!SheetAPI.isConnected()) {
      showToast('Connect your sheet first.', 'info');
      return false;
    }
    try {
      const row = {
        id: item.id || randId('tr'),
        name: item.name,
        category: item.category || '',
        mandatory: item.mandatory ? 'TRUE' : 'FALSE',
        link: item.link || '',
        expires: item.expires || '',
        order: item.order ?? 0,
        archived: item.archived ? 'TRUE' : 'FALSE',
      };
      if (isNew) await SheetAPI.append('training', [row]);
      else await SheetAPI.update('training', row);
      showToast(isNew ? 'Training item added.' : 'Training item updated.', 'good');
      await loadFromSheet();
      return true;
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error');
      return false;
    }
  }, [loadFromSheet, showToast]);

  const onDeleteTraining = React.useCallback(async (id) => {
    if (!SheetAPI.isConnected()) return;
    try {
      await SheetAPI.remove('training', id);
      showToast('Training item removed.', 'good');
      await loadFromSheet();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }, [loadFromSheet, showToast]);

  // ---- Config auto-save (debounced) ----
  const configSaveTimer = React.useRef(null);
  const initialMountRef = React.useRef(true);
  React.useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    if (!SheetAPI.isConnected()) return;
    if (configSaveTimer.current) clearTimeout(configSaveTimer.current);
    configSaveTimer.current = setTimeout(async () => {
      try {
        const rows = Transformers.rowsFromConfig(config);
        await SheetAPI._post({ action: 'write', sheet: 'config', rows });
      } catch (err) {
        console.error('Config save failed:', err);
        // Don't toast every keystroke — just log
      }
    }, 1200);
    return () => { if (configSaveTimer.current) clearTimeout(configSaveTimer.current); };
  }, [config]);

  // ---- Navigation helpers ----
  const navigate = (p, args) => {
    setPage(p);
    setOpenTrainee(null);
    setContextArg(args || null);
    if (p === 'setup') {
      // Launch wizard with fresh state
      setWizardConfig({ ...BLANK_CONFIG });
      setShowWizard(true);
      return;
    }
  };

  const onOpenTrainee = (id) => {
    setPage('trainees');
    setOpenTrainee(id);
  };

  // ---- Wizard finish handler ----
  const onWizardFinish = async ({ config: newConfig, skills: wizardSkills, training: wizardTraining, addedTrainees, loadSamples }) => {
    setConfig({ ...newConfig });

    if (SheetAPI.isConnected()) {
      // Write skills, training, and (if any) added trainees to the sheet
      try {
        const skillRows = (wizardSkills || []).filter(s => s.name).map((s, i) => ({
          id: randId('s'),
          name: s.name,
          category: s.category || '',
          blurb: s.blurb || '',
          target: s.target ?? 90,
          order: i,
          archived: 'FALSE',
        }));
        const trainingRows = (wizardTraining || []).filter(t => t.name).map((t, i) => ({
          id: randId('tr'),
          name: t.name,
          category: t.category || '',
          mandatory: t.mandatory ? 'TRUE' : 'FALSE',
          link: t.link ? (typeof t.link === 'string' ? t.link : '') : '',
          expires: t.expires || '',
          order: i,
          archived: 'FALSE',
        }));
        const traineeRows = (addedTrainees || []).filter(t => t.name).map(t => ({
          id: randId('t'),
          name: t.name,
          position: t.position || '',
          startDate: t.startDate || today(),
          pathDays: newConfig.defaultPathDays || 60,
          status: 'on-track',
          trainerId: '',
          quals: '[]',
          archived: 'FALSE',
        }));
        const writes = [];
        if (skillRows.length) writes.push(SheetAPI._post({ action: 'write', sheet: 'skills', rows: skillRows }));
        if (trainingRows.length) writes.push(SheetAPI._post({ action: 'write', sheet: 'training', rows: trainingRows }));
        if (traineeRows.length) writes.push(SheetAPI.append('trainees', traineeRows));
        await Promise.all(writes);
        await loadFromSheet();
        showToast(`Setup saved · ${skillRows.length} skills, ${trainingRows.length} training items, ${traineeRows.length} trainees written.`, 'good');
      } catch (err) {
        showToast(`Setup partly saved — ${err.message}`, 'error');
      }
    } else {
      // Demo mode: just populate in-memory state
      if (loadSamples) {
        setTrainees(SAMPLE_TRAINEES);
      } else {
        const synth = (addedTrainees || []).filter(t => t.name).map((t, i) => ({
          id: 'new' + i,
          name: t.name,
          position: t.position || '—',
          startDate: t.startDate || new Date().toISOString().slice(0, 10),
          pathDays: newConfig.defaultPathDays,
          daysIn: 0,
          status: 'on-track',
          trainer: 'You',
          scores: {},
          trend: {},
          quals: [],
          trainingDone: 0,
          trainingTotal: (wizardTraining || []).length,
          redFlags: [],
          notes: [],
        }));
        setTrainees(synth);
      }
    }
    setShowWizard(false);
    setPage('home');
    setShowTour(true);
  };

  const redFlagCount = trainees.reduce((acc, t) => acc + (t.redFlags?.length || 0), 0);

  // ---- Render ----
  const trainee = openTrainee ? trainees.find(t => t.id === openTrainee) : null;

  const titleFor = (p) => {
    if (trainee) return trainee.name;
    return ({
      home: 'Home',
      daily: 'Daily Entry',
      trainees: config.labels.trainees,
      trainers: config.labels.trainers,
      skills: config.labels.skills,
      training: config.labels.assigned_training,
      scorecards: config.labels.scorecards,
      ai: 'AI Summary',
      settings: 'Settings',
    })[p] || '';
  };

  // ---- Tweaks Panel ----
  const TweaksPanelComp = window.TweaksPanel;
  const TweakSection = window.TweakSection;
  const TweakRadio = window.TweakRadio;
  const TweakSelect = window.TweakSelect;
  const TweakColor = window.TweakColor;
  const TweakToggle = window.TweakToggle;
  const TweakButton = window.TweakButton;

  // get tpl skills for trainee detail
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry) || INDUSTRY_TEMPLATES[0];

  return (
    <>
      {pcWelcomeOpen && (
        <PulseCheckWelcome
          onExplore={() => setPcWelcomeOpen(false)}
          onConnect={() => { setPcWelcomeOpen(false); setPcConnectOpen(true); }}
        />
      )}
      {pcConnectOpen && (
        <ConnectSheetModal
          onClose={() => setPcConnectOpen(false)}
          onConnect={async (url) => {
            const validationErr = SheetAPI.validateUrl(url);
            if (validationErr) {
              showToast(validationErr, 'error');
              return;
            }
            setLoading(true);
            const test = await SheetAPI.testConnection(url);
            if (!test.ok) {
              showToast(`Connection failed: ${test.error}`, 'error');
              setLoading(false);
              return;
            }
            SheetAPI.setUrl(url);
            setSheetUrl(url);
            setPcConnectOpen(false);
            await loadFromSheet();
            showToast(`Connected · ${test.counts.trainees || 0} trainees loaded`, 'good');
          }}
        />
      )}

      {showWizard && (
        <SetupWizard
          config={wizardConfig}
          setConfig={(updater) => setWizardConfig(typeof updater === 'function' ? updater(wizardConfig) : updater)}
          onFinish={onWizardFinish}
          onExit={() => { setShowWizard(false); }}
        />
      )}

      <div className="app">
        <Sidebar config={config} page={page} onNavigate={navigate} redFlagCount={redFlagCount} />
        <div className="app-main">
          {loading && (
            <div style={{
              padding: '10px 24px',
              background: 'var(--accent-soft)', color: 'var(--accent-ink)',
              fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                width: 12, height: 12, border: '2px solid currentColor',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              Reading your Google Sheet…
            </div>
          )}
          {loadError && !loading && (
            <div className="row" style={{
              padding: '10px 24px', background: 'var(--danger-soft)', color: 'var(--danger)',
              fontSize: 13, fontWeight: 500, gap: 10,
            }}>
              <I.X size={14} />
              <span>Couldn't read your sheet: {loadError}</span>
              <Button size="sm" variant="ghost" onClick={loadFromSheet} style={{ marginLeft: 'auto' }}>Retry</Button>
              <Button size="sm" variant="ghost" onClick={() => { SheetAPI.clearUrl(); setSheetUrl(null); setLoadError(null); setDemoMode(true); }}>Disconnect</Button>
            </div>
          )}
          {demoMode && !demoBannerDismissed && !loading && !loadError && (
            <DemoBanner
              onSetUp={() => setPcConnectOpen(true)}
              onDismiss={() => setDemoBannerDismissed(true)}
            />
          )}
          <TopBar title={titleFor(page)} config={config} setConfig={setConfig} actions={
            <>
              {!demoMode && (
                <Button size="sm" variant="ghost" icon={<I.Refresh />} onClick={loadFromSheet} title="Reload from sheet">Refresh</Button>
              )}
              {page === 'home' && (
                <Button size="sm" variant="ghost" icon={<I.Calendar />}>Last 7 days</Button>
              )}
            </>
          } />
          <div className="app-body">
            <div className="app-body-inner">
              {page === 'home' && <HomePage config={config} trainees={trainees} onNavigate={navigate} onOpenTrainee={onOpenTrainee} />}
              {page === 'trainees' && !trainee && <TraineesPage config={config} trainees={trainees} trainers={trainers} onOpenTrainee={onOpenTrainee} onSaveTrainee={onSaveTrainee} />}
              {page === 'trainees' && trainee && <TraineeDetail config={config} trainee={trainee} allSkills={skills.length ? skills : tpl.skills} onBack={() => setOpenTrainee(null)} onNavigate={navigate} onResolveFlag={onResolveFlag} onArchive={onArchiveTrainee} rawFlags={rawSheet?.flags || []} />}
              {page === 'trainers' && <TrainersPage config={config} trainers={trainers} trainees={trainees} onOpenTrainee={onOpenTrainee} onSaveTrainer={onSaveTrainer} />}
              {page === 'skills' && <SkillsPage config={config} />}
              {page === 'training' && <TrainingPage config={config} />}
              {page === 'scorecards' && <ScorecardsPage config={config} trainees={trainees} />}
              {page === 'ai' && <AiSummaryPage config={config} trainees={trainees} contextArg={contextArg} />}
              {page === 'daily' && <DailyEntryPage config={config} trainees={trainees} skills={skills} trainingItems={trainingItems} contextArg={contextArg} onNavigate={navigate} onSaveEntry={onSaveDailyEntry} />}
              {page === 'settings' && <SettingsPage config={config} setConfig={setConfig} skills={skills} trainingItems={trainingItems} onSaveSkill={onSaveSkill} onDeleteSkill={onDeleteSkill} onSaveTraining={onSaveTraining} onDeleteTraining={onDeleteTraining} onRunSetup={() => navigate('setup')} onDisconnect={() => { SheetAPI.clearUrl(); setSheetUrl(null); setDemoMode(true); setLoadError(null); showToast('Disconnected. Your sheet is untouched.', 'info'); setConfig(c => ({ ...c, ...SAMPLE_CONFIG })); setTrainees(SAMPLE_TRAINEES); setTrainers(SAMPLE_TRAINERS); }} sheetUrl={sheetUrl} />}
            </div>
          </div>
        </div>
      </div>

      {showTour && <Tour onDone={() => setShowTour(false)} />}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type || ''}`}>
          {toast.type === 'good' && <I.Check className="toast-icon" stroke={2.5} />}
          {toast.type === 'error' && <I.X className="toast-icon" stroke={2.5} />}
          <span>{toast.text}</span>
        </div>
      )}

      {TweaksPanelComp && (
        <TweaksPanelComp title="Tweaks">
          <TweakSection title="Designer shortcuts">
            <TweakButton onClick={() => setPcWelcomeOpen(true)}>
              Show Pulse Check IQ welcome
            </TweakButton>
            <TweakButton onClick={() => setPcConnectOpen(true)}>
              Show Connect Sheet modal
            </TweakButton>
            <TweakButton onClick={() => { setDemoMode(true); setDemoBannerDismissed(false); }}>
              Restore demo banner
            </TweakButton>
            <TweakButton onClick={() => { setWizardConfig({ ...BLANK_CONFIG }); setShowWizard(true); }}>
              Launch setup wizard
            </TweakButton>
            <TweakButton onClick={() => setShowTour(true)}>Replay product tour</TweakButton>
            <TweakButton onClick={() => navigate('home')}>Reset to Home</TweakButton>
          </TweakSection>

          <TweakSection title="Visual theme (mirrors Settings)">
            <TweakRadio label="Theme" value={config.theme} options={['light', 'dark']} onChange={(v) => setConfig(c => ({ ...c, theme: v }))} />
            <TweakRadio label="Density" value={config.density} options={['comfortable', 'compact']} onChange={(v) => setConfig(c => ({ ...c, density: v }))} />
            <TweakSelect label="Palette" value={config.palette} options={['sage', 'indigo', 'ocean', 'terracotta', 'rose', 'butter', 'plum', 'charcoal']} onChange={(v) => setConfig(c => ({ ...c, palette: v }))} />
            <TweakSelect label="Type pairing" value={config.fonts} options={['modern', 'classic', 'friendly', 'editorial']} onChange={(v) => setConfig(c => ({ ...c, fonts: v }))} />
            <TweakSelect label="Rating format" value={config.ratingFormat} options={['percent', 'stars', 'passfail']} onChange={(v) => setConfig(c => ({ ...c, ratingFormat: v }))} />
          </TweakSection>

          <TweakSection title="Customer simulation">
            <TweakSelect label="Industry template" value={config.industry} options={INDUSTRY_TEMPLATES.map(t => t.id)} onChange={(v) => setConfig(c => ({ ...c, industry: v }))} />
            <TweakToggle label="Show sample data" checked={trainees.length > 0} onChange={(v) => setTrainees(v ? SAMPLE_TRAINEES : [])} />
          </TweakSection>
        </TweaksPanelComp>
      )}
    </>
  );
};

/* ---- Skills/Training/Scorecards mini-pages ---- */
const SkillsPage = ({ config }) => {
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry) || INDUSTRY_TEMPLATES[0];
  const cats = [...new Set(tpl.skills.map(s => s.category))];
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h1">{config.labels.skills}</h1>
          <div className="subtitle">{tpl.skills.length} {config.labels.skills.toLowerCase()} across {cats.length} categories</div>
        </div>
        <div className="page-header-actions">
          <Button icon={<I.Plus />} variant="primary">Add {config.labels.skill.toLowerCase()}</Button>
        </div>
      </div>
      <div className="stack">
        {cats.map(cat => (
          <Card key={cat} title={cat}>
            <table className="tbl">
              <thead><tr><th>{config.labels.skill}</th><th>Description</th><th>Target</th><th>Avg across {config.labels.trainees.toLowerCase()}</th></tr></thead>
              <tbody>
                {tpl.skills.filter(s => s.category === cat).map((s, i) => {
                  const scores = SAMPLE_TRAINEES.map(t => t.scores[s.name]).filter(v => v != null);
                  const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : null;
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td className="muted">{s.blurb || '—'}</td>
                      <td className="mono">{s.target}%</td>
                      <td style={{ width: 200 }}>
                        {avg != null ? (
                          <div className="row" style={{ gap: 10 }}>
                            <Bar value={avg} warn={avg < s.target} />
                            <span className="mono tnum" style={{ fontWeight: 600 }}>{avg}%</span>
                          </div>
                        ) : <span className="faint">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </>
  );
};

const TrainingPage = ({ config }) => {
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry) || INDUSTRY_TEMPLATES[0];
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h1">{config.labels.assigned_training}</h1>
          <div className="subtitle">Modules, SOPs, and instructor-led sessions</div>
        </div>
        <Button icon={<I.Plus />} variant="primary">Add item</Button>
      </div>
      <Card>
        <div className="stack" style={{ gap: 8 }}>
          {tpl.training.map((t, i) => (
            <div key={i} className="row" style={{ gap: 14, padding: 16, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elevated)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <I.Book size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="row" style={{ gap: 8 }}>
                  <div style={{ fontWeight: 500 }}>{t.name}</div>
                  {t.mandatory && <Badge variant="accent">Mandatory</Badge>}
                  {t.expires && <Badge>Expires {t.expires}</Badge>}
                </div>
                <div className="muted row" style={{ fontSize: 12, marginTop: 4, gap: 14 }}>
                  <span>{Math.floor(Math.random() * 5) + 1} {config.labels.trainees.toLowerCase()} assigned</span>
                  {t.link && <span className="row" style={{ gap: 4 }}><I.Link size={11} /> Material attached</span>}
                </div>
              </div>
              <IconButton icon={I.Edit} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
};

const ScorecardsPage = ({ config, trainees }) => {
  const tpl = INDUSTRY_TEMPLATES.find(t => t.id === config.industry) || INDUSTRY_TEMPLATES[0];
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h1">{config.labels.scorecards}</h1>
          <div className="subtitle">All {config.labels.skills.toLowerCase()} across all {config.labels.trainees.toLowerCase()} · last 7 days</div>
        </div>
        <Select style={{ width: 180 }}><option>Last 7 days</option><option>Last 30 days</option><option>Lifetime</option></Select>
      </div>
      <Card>
        <table className="tbl">
          <thead>
            <tr>
              <th>{config.labels.trainee}</th>
              {tpl.skills.slice(0, 6).map(s => <th key={s.name} style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11.5 }}>{s.name}</th>)}
              <th>Avg</th>
            </tr>
          </thead>
          <tbody>
            {trainees.map(t => {
              const scores = Object.values(t.scores).filter(v => v != null);
              const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : null;
              return (
                <tr key={t.id}>
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      <Avatar name={t.name} size="sm" />
                      <span style={{ fontWeight: 500 }}>{t.name}</span>
                    </div>
                  </td>
                  {tpl.skills.slice(0, 6).map(s => (
                    <td key={s.name}><ScoreDisplay value={t.scores[s.name]} format={config.ratingFormat} target={s.target} /></td>
                  ))}
                  <td><ScoreDisplay value={avg} format={config.ratingFormat} target={85} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
};

// Mount
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
