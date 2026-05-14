/* ============================================================
   SheetAPI — talks to the buyer's Apps Script Web App
   - Reads/writes all 8 tabs
   - URL stored in localStorage (per browser)
   - Transforms raw sheet rows into the dashboard's expected shapes
   ============================================================ */

const SHEET_URL_KEY = 'pulseCheck_sheetUrl';
const SHEET_CONFIG_KEY = 'pulseCheck_cachedConfig';

const SheetAPI = {
  // ---- URL persistence ----
  getUrl: () => {
    try { return localStorage.getItem(SHEET_URL_KEY) || null; } catch (_) { return null; }
  },
  setUrl: (u) => {
    try { localStorage.setItem(SHEET_URL_KEY, u); } catch (_) {}
  },
  clearUrl: () => {
    try {
      localStorage.removeItem(SHEET_URL_KEY);
      localStorage.removeItem(SHEET_CONFIG_KEY);
    } catch (_) {}
  },
  isConnected: () => !!SheetAPI.getUrl(),

  // ---- Low-level fetch helpers ----
  _get: async (params = {}) => {
    const url = SheetAPI.getUrl();
    if (!url) throw new Error('No sheet connected');
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${url}?${qs}`, { method: 'GET', redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Unknown error');
    return data;
  },

  // Use text/plain to avoid CORS preflight — Apps Script reads e.postData.contents
  _post: async (body) => {
    const url = SheetAPI.getUrl();
    if (!url) throw new Error('No sheet connected');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Write failed');
    return data;
  },

  // ---- Public API ----
  ping: async () => SheetAPI._get({ action: 'ping' }),

  readAll: async () => {
    const r = await SheetAPI._get({ action: 'readall' });
    return r.data;
  },

  read: async (sheet) => {
    const r = await SheetAPI._get({ action: 'read', sheet });
    return r.data;
  },

  append: async (sheet, rows) => SheetAPI._post({ action: 'append', sheet, rows }),
  update: async (sheet, row, idColumn = 'id') => SheetAPI._post({ action: 'update', sheet, row, idColumn }),
  remove: async (sheet, id, idColumn = 'id') => SheetAPI._post({ action: 'delete', sheet, id, idColumn }),

  // ---- Validation ----
  validateUrl: (u) => {
    if (!u || !u.trim()) return 'Paste your Apps Script Web App URL';
    const trimmed = u.trim();
    if (!/^https:\/\/script\.google\.com\//.test(trimmed)) {
      return 'URL should start with https://script.google.com/';
    }
    if (!/\/exec$/.test(trimmed)) {
      return 'URL should end in /exec (you may have copied the editor URL)';
    }
    return null;
  },

  // Test connection by pinging + counting rows
  testConnection: async (url) => {
    const tempUrl = SheetAPI.getUrl();
    SheetAPI.setUrl(url);
    try {
      await SheetAPI.ping();
      const data = await SheetAPI.readAll();
      return { ok: true, counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])) };
    } catch (err) {
      // restore previous
      if (tempUrl) SheetAPI.setUrl(tempUrl); else SheetAPI.clearUrl();
      return { ok: false, error: err.message };
    }
  },
};

/* ============================================================
   Transformers — flatten/join sheet data into dashboard shapes
   ============================================================ */

const Transformers = {
  // Apps Script auto-parses JSON-looking cells; safety pass for any that came back as strings
  safeParse: (v) => {
    if (typeof v !== 'string') return v;
    if (v.startsWith('{') || v.startsWith('[')) {
      try { return JSON.parse(v); } catch (_) { return v; }
    }
    return v;
  },

  // config tab key/value rows → flat config object, merged into BLANK_CONFIG defaults
  configFromRows: (rows) => {
    const out = {};
    for (const r of rows) {
      out[r.key] = Transformers.safeParse(r.value);
    }
    // Coerce booleans that came back as strings
    const boolKeys = ['sequentialTraining', 'setupComplete'];
    for (const k of boolKeys) {
      if (typeof out[k] === 'string') out[k] = out[k].toLowerCase() === 'true';
    }
    if (typeof out.defaultPathDays === 'string') out.defaultPathDays = Number(out.defaultPathDays) || 60;
    return out;
  },

  // Pack a config object back into key/value rows for the sheet
  rowsFromConfig: (config) => {
    const keep = [
      'businessName', 'industry', 'palette', 'fonts', 'theme', 'density',
      'ratingFormat', 'defaultPathDays', 'sequentialTraining',
      'labels', 'enabledSections', 'aiSummary', 'notifications', 'integrations', 'setupComplete',
    ];
    return keep.filter(k => config[k] !== undefined).map(k => ({
      key: k,
      value: typeof config[k] === 'object' && config[k] !== null
        ? JSON.stringify(config[k])
        : config[k],
    }));
  },

  // Join scores/notes/flags/trainers onto each trainee row
  joinTraineeData: (raw) => {
    const skills = (raw.skills || []).map(s => ({ ...s, target: Number(s.target) || 90 }));
    return (raw.trainees || []).map(t => {
      const myScores = (raw.scores || []).filter(s => String(s.traineeId) === String(t.id));
      const myNotes = (raw.notes || []).filter(n => String(n.traineeId) === String(t.id));
      const myFlags = (raw.flags || []).filter(f => String(f.traineeId) === String(t.id) && !f.resolvedAt);
      const myTrainer = (raw.trainers || []).find(tr => String(tr.id) === String(t.trainerId));

      // Group scores by skillId
      const bySkill = {};
      for (const s of myScores) {
        if (!bySkill[s.skillId]) bySkill[s.skillId] = [];
        bySkill[s.skillId].push(s);
      }

      const scoresByName = {};
      const trendByName = {};
      for (const skill of skills) {
        const entries = (bySkill[skill.id] || [])
          .filter(s => !(s.notPerformed === true || s.notPerformed === 'TRUE'))
          .filter(s => s.score !== '' && s.score != null);
        if (!entries.length) {
          scoresByName[skill.name] = null;
          continue;
        }
        // Sort by date
        entries.sort((a, b) => String(a.date).localeCompare(String(b.date)));
        const vals = entries.map(e => Number(e.score));
        const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        scoresByName[skill.name] = avg;
        // Trend: compare second half avg to first half
        if (vals.length >= 4) {
          const mid = Math.floor(vals.length / 2);
          const first = vals.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
          const second = vals.slice(mid).reduce((a, b) => a + b, 0) / (vals.length - mid);
          if (second > first + 2) trendByName[skill.name] = 'up';
          else if (second < first - 2) trendByName[skill.name] = 'down';
          else trendByName[skill.name] = 'flat';
        } else {
          trendByName[skill.name] = 'flat';
        }
      }

      const start = t.startDate ? new Date(t.startDate) : new Date();
      const daysIn = Math.max(0, Math.round((Date.now() - start.getTime()) / 86400000));
      const pathDays = Number(t.pathDays) || 60;

      const quals = Transformers.safeParse(t.quals) || [];

      return {
        id: t.id,
        name: t.name,
        position: t.position || '—',
        startDate: t.startDate,
        pathDays,
        daysIn,
        status: t.status || 'on-track',
        trainer: myTrainer ? myTrainer.name : '—',
        trainerId: t.trainerId,
        scores: scoresByName,
        trend: trendByName,
        quals: Array.isArray(quals) ? quals : [],
        trainingDone: 0,
        trainingTotal: (raw.training || []).length,
        redFlags: myFlags.map(f => ({ kind: f.kind, severity: f.severity, text: f.text, date: f.date })),
        notes: myNotes
          .sort((a, b) => String(b.date).localeCompare(String(a.date)))
          .map(n => ({ date: n.date, author: n.author, text: n.text })),
      };
    });
  },

  // Trainers as-is, with assignedTo parsed
  trainersFromRaw: (raw) => (raw.trainers || []).map(t => ({
    ...t,
    assignedTo: Array.isArray(t.assignedTo) ? t.assignedTo : (Transformers.safeParse(t.assignedTo) || []),
    canScore: t.canScore === true || t.canScore === 'TRUE',
    isYou: /owner/i.test(t.role || '') || /^you/i.test(t.name || ''),
    avatar: (t.name || '').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase(),
    color: t.color || `oklch(0.6 0.1 ${(t.name || '').charCodeAt(0) * 7 % 360})`,
    evals30d: Number(t.evals30d) || 0,
    lastActive: t.lastActive || '—',
  })),
};

Object.assign(window, { SheetAPI, Transformers, SHEET_URL_KEY });
