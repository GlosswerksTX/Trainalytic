/* ============================================================
   Sidebar + Topbar chrome
   ============================================================ */

const Sidebar = ({ config, page, onNavigate, redFlagCount }) => {
  const L = config.labels;
  const enabled = config.enabledSections;

  const items = [
    { id: 'home', label: 'Home', icon: I.Home, show: true },
    { id: 'daily', label: 'Daily Entry', icon: I.Edit, show: true },
    { id: 'trainees', label: L.trainees, icon: I.Users, show: enabled.trainees, badge: SAMPLE_TRAINEES.length },
    { id: 'trainers', label: L.trainers, icon: I.Coach, show: true },
    { id: 'skills', label: L.skills, icon: I.Award, show: enabled.skills },
    { id: 'training', label: L.assigned_training, icon: I.Book, show: enabled.assigned_training },
    { id: 'scorecards', label: L.scorecards, icon: I.Target, show: enabled.scorecards },
    { id: 'ai', label: 'AI Summary', icon: I.Sparkle, show: enabled.ai_summary },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">{config.businessName ? config.businessName[0] : 'R'}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="brand-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {config.businessName || 'Your Business'}
          </div>
          <div className="brand-meta">OJT Dashboard</div>
        </div>
      </div>

      <div className="nav-section">
        {items.filter(i => i.show).map(item => (
          <div
            key={item.id}
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon />
            <span>{item.label}</span>
            {item.id === 'home' && redFlagCount > 0 && (
              <span className="nav-badge danger">{redFlagCount}</span>
            )}
          </div>
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-label">Workspace</div>
        <div
          className={`nav-item ${page === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <I.Settings />
          <span>Settings</span>
        </div>
      </div>

      <div className="sidebar-foot">
        <div
          className="nav-item"
          onClick={() => onNavigate('setup')}
        >
          <I.Refresh />
          <span>Re-run setup</span>
        </div>
        <div className="nav-item">
          <I.Help />
          <span>Help & Docs</span>
        </div>
        <div style={{ padding: '12px 8px 4px' }}>
          <PoweredByPulseCheck />
        </div>
      </div>
    </aside>
  );
};

const TopBar = ({ title, subtitle, config, setConfig, actions }) => (
  <div className="topbar">
    <div style={{ minWidth: 0 }}>
      <div className="topbar-title">{title}</div>
      {subtitle && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{subtitle}</div>}
    </div>
    <div className="topbar-spacer" />
    <div className="topbar-actions">
      {actions}
      <IconButton icon={config.theme === 'dark' ? I.Sun : I.Moon} onClick={() => setConfig(c => ({ ...c, theme: c.theme === 'dark' ? 'light' : 'dark' }))} />
      <IconButton icon={I.Bell} />
      <Avatar name="You" />
    </div>
  </div>
);

Object.assign(window, { Sidebar, TopBar });
