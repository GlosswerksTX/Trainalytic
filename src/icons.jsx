/* Icons — minimal stroke set, lucide-style */
const Icon = ({ d, size = 16, stroke = 2, fill = 'none', ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d}
  </svg>
);

const I = {
  Home:      (p) => <Icon {...p} d={<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>} />,
  Users:     (p) => <Icon {...p} d={<><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><circle cx="17" cy="9" r="2.5" /><path d="M15 20c0-2.5 2-4 4-4" /></>} />,
  Award:    (p) => <Icon {...p} d={<><circle cx="12" cy="9" r="5" /><path d="M9 13.5L7 21l5-3 5 3-2-7.5" /></>} />,
  Book:     (p) => <Icon {...p} d={<><path d="M4 4h11a4 4 0 014 4v12H8a4 4 0 01-4-4V4z" /><path d="M4 16a4 4 0 014-4h11" /></>} />,
  Sparkle:  (p) => <Icon {...p} d={<><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z" /><path d="M19 17l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" /></>} />,
  Settings: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" /></>} />,
  Plus:     (p) => <Icon {...p} d={<><path d="M12 5v14M5 12h14" /></>} />,
  Search:   (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>} />,
  Bell:     (p) => <Icon {...p} d={<><path d="M6 8a6 6 0 0112 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10 21a2 2 0 004 0" /></>} />,
  Sun:      (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>} />,
  Moon:     (p) => <Icon {...p} d={<><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></>} />,
  Mail:     (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>} />,
  Download: (p) => <Icon {...p} d={<><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></>} />,
  Check:    (p) => <Icon {...p} d={<><path d="M5 12l5 5L20 7" /></>} />,
  X:        (p) => <Icon {...p} d={<><path d="M6 6l12 12M18 6L6 18" /></>} />,
  Chevron:  (p) => <Icon {...p} d={<><path d="M9 6l6 6-6 6" /></>} />,
  ChevronL: (p) => <Icon {...p} d={<><path d="M15 6l-6 6 6 6" /></>} />,
  ChevronD: (p) => <Icon {...p} d={<><path d="M6 9l6 6 6-6" /></>} />,
  Flag:     (p) => <Icon {...p} d={<><path d="M4 21V4h12l-2 4 2 4H4" /></>} />,
  Star:     (p) => <Icon {...p} d={<path d="M12 3l2.8 5.8L21 10l-4.5 4.4L17.6 21 12 17.8 6.4 21l1.1-6.6L3 10l6.2-1.2z" />} />,
  StarFilled: (p) => <Icon {...p} fill="currentColor" d={<path d="M12 3l2.8 5.8L21 10l-4.5 4.4L17.6 21 12 17.8 6.4 21l1.1-6.6L3 10l6.2-1.2z" />} />,
  ArrowUp:  (p) => <Icon {...p} d={<><path d="M12 19V5M5 12l7-7 7 7" /></>} />,
  ArrowDown:(p) => <Icon {...p} d={<><path d="M12 5v14M5 12l7 7 7-7" /></>} />,
  Minus:    (p) => <Icon {...p} d={<><path d="M5 12h14" /></>} />,
  Calendar: (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>} />,
  Clock:    (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>} />,
  Trash:    (p) => <Icon {...p} d={<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>} />,
  Edit:     (p) => <Icon {...p} d={<><path d="M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3z" /></>} />,
  Upload:   (p) => <Icon {...p} d={<><path d="M12 15V3" /><path d="M7 8l5-5 5 5" /><path d="M5 21h14" /></>} />,
  Filter:   (p) => <Icon {...p} d={<><path d="M3 5h18l-7 9v6l-4-2v-4z" /></>} />,
  Dots:     (p) => <Icon {...p} d={<><circle cx="6" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="18" cy="12" r="1" /></>} />,
  Link:     (p) => <Icon {...p} d={<><path d="M10 14a4 4 0 005.7 0l3.6-3.6a4 4 0 00-5.7-5.7L13 6.1" /><path d="M14 10a4 4 0 00-5.7 0l-3.6 3.6a4 4 0 005.7 5.7L11 17.9" /></>} />,
  File:     (p) => <Icon {...p} d={<><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" /><path d="M14 3v6h6" /></>} />,
  Layers:   (p) => <Icon {...p} d={<><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 12l9 5 9-5" /><path d="M3 17l9 5 9-5" /></>} />,
  Target:   (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></>} />,
  Building: (p) => <Icon {...p} d={<><path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" /></>} />,
  Palette:  (p) => <Icon {...p} d={<><path d="M12 3a9 9 0 100 18c1 0 2-1 2-2s-1-2-1-3 1-2 2-2h2a4 4 0 004-4 9 9 0 00-9-7z" /><circle cx="7.5" cy="11" r="1" fill="currentColor" /><circle cx="9" cy="7" r="1" fill="currentColor" /><circle cx="14" cy="6" r="1" fill="currentColor" /><circle cx="17.5" cy="10" r="1" fill="currentColor" /></>} />,
  Type:     (p) => <Icon {...p} d={<><path d="M4 7V5h16v2M9 5v14M15 5v14M7 19h4M13 19h4" /></>} />,
  Google:   (p) => <Icon {...p} stroke="0" fill="currentColor" d={<path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-.9 2.4-2 3.1v2.6h3.2c1.9-1.7 3-4.3 3-7.5z M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0012 22z M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3a10 10 0 000 9.2L6.4 14z M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 003 7.4l3.4 2.6c.8-2.3 3-4 5.6-4z" />} />,
  Eye:      (p) => <Icon {...p} d={<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>} />,
  Refresh:  (p) => <Icon {...p} d={<><path d="M21 12a9 9 0 11-3-6.7L21 8" /><path d="M21 3v5h-5" /></>} />,
  PieChart: (p) => <Icon {...p} d={<><path d="M12 3v9l8 4a9 9 0 11-8-13z" /></>} />,
  BarChart: (p) => <Icon {...p} d={<><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></>} />,
  Trend:    (p) => <Icon {...p} d={<><path d="M3 17l6-6 4 4 8-9" /><path d="M14 6h7v7" /></>} />,
  Help:     (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 015 0c0 2-2.5 2-2.5 4" /><circle cx="12" cy="17" r="0.5" fill="currentColor" /></>} />,
  Move:     (p) => <Icon {...p} d={<><circle cx="9" cy="8" r="1" fill="currentColor" /><circle cx="15" cy="8" r="1" fill="currentColor" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /><circle cx="9" cy="16" r="1" fill="currentColor" /><circle cx="15" cy="16" r="1" fill="currentColor" /></>} />,
  Logout:   (p) => <Icon {...p} d={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>} />,
  Coach:    (p) => <Icon {...p} d={<><circle cx="12" cy="7" r="3.5" /><path d="M5 21c0-4 3.5-6 7-6s7 2 7 6" /><path d="M18 8l1.5 1.5L22 7" /></>} />,
};

Object.assign(window, { Icon, I });
