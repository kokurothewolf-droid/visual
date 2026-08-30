// icons.jsx — consistent line-art icon set
// Style: 32×32 viewBox, 2px stroke, currentColor, rounded line caps/joins.

const __iconProps = {
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

// Brand mark — three soft horizontal lines like a tide / day pages
const IconBrand = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M6 11 Q 11 8 16 11 T 26 11" />
    <path d="M6 16 Q 11 13 16 16 T 26 16" />
    <path d="M6 21 Q 11 18 16 21 T 26 21" />
  </svg>
);

// Nav icons --------------------------------------------------------------
const IconHome = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M5 14 L16 5 L27 14 V25 a2 2 0 0 1 -2 2 H7 a2 2 0 0 1 -2 -2 Z" />
    <path d="M13 27 V19 h6 v8" />
  </svg>
);
const IconTemplates = (p) => (
  <svg {...__iconProps} {...p}>
    <rect x="5" y="5" width="9" height="9" rx="2" />
    <rect x="18" y="5" width="9" height="9" rx="2" />
    <rect x="5" y="18" width="9" height="9" rx="2" />
    <rect x="18" y="18" width="9" height="9" rx="2" />
  </svg>
);
const IconLibrary = (p) => (
  <svg {...__iconProps} {...p}>
    <rect x="5" y="6" width="22" height="20" rx="2" />
    <path d="M10 6 V26" />
    <path d="M16 6 V26" />
    <path d="M22 6 V26" />
  </svg>
);
const IconKids = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="11" cy="11" r="3.5" />
    <circle cx="21" cy="11" r="3.5" />
    <path d="M5 25 c0-4 3-7 6-7 s6 3 6 7" />
    <path d="M15 25 c0-4 3-7 6-7 s6 3 6 7" />
  </svg>
);
const IconShared = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="16" cy="11" r="4" />
    <path d="M7 26 c0-5 4-9 9-9 s9 4 9 9" />
  </svg>
);
const IconSettings = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="16" cy="16" r="3" />
    <path d="M16 4 v3 M16 25 v3 M4 16 h3 M25 16 h3 M7.5 7.5 l2.1 2.1 M22.4 22.4 l2.1 2.1 M7.5 24.5 l2.1 -2.1 M22.4 9.6 l2.1 -2.1" />
  </svg>
);
const IconHelp = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="16" cy="16" r="11" />
    <path d="M12.5 12.5 a3.5 3.5 0 1 1 4.5 3.4 c-1 .3 -1 1.1 -1 2.1" />
    <circle cx="16" cy="22" r=".5" fill="currentColor" />
  </svg>
);

// UI / action icons -----------------------------------------------------
const IconPlus = (p) => (<svg {...__iconProps} {...p}><path d="M16 7 V25 M7 16 H25" /></svg>);
const IconCheck = (p) => (<svg {...__iconProps} {...p}><path d="M6 17 L13 24 L26 9" /></svg>);
const IconClose = (p) => (<svg {...__iconProps} {...p}><path d="M8 8 L24 24 M24 8 L8 24" /></svg>);
const IconArrowL = (p) => (<svg {...__iconProps} {...p}><path d="M19 7 L10 16 L19 25" /></svg>);
const IconArrowR = (p) => (<svg {...__iconProps} {...p}><path d="M13 7 L22 16 L13 25" /></svg>);
const IconChevD = (p) => (<svg {...__iconProps} {...p}><path d="M7 12 L16 21 L25 12" /></svg>);
const IconSearch = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="14" cy="14" r="8" />
    <path d="M20 20 L26 26" />
  </svg>
);
const IconShare = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="8" cy="16" r="3" />
    <circle cx="24" cy="8" r="3" />
    <circle cx="24" cy="24" r="3" />
    <path d="M10.6 14.6 L21.4 9.4 M10.6 17.4 L21.4 22.6" />
  </svg>
);
const IconPrint = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M9 10 V5 h14 v5" />
    <rect x="5" y="10" width="22" height="11" rx="2" />
    <rect x="9" y="18" width="14" height="9" rx="1" />
    <circle cx="22" cy="14" r=".8" fill="currentColor" />
  </svg>
);
const IconPlay = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M10 7 L24 16 L10 25 Z" fill="currentColor" stroke="none" />
  </svg>
);
const IconPause = (p) => (
  <svg {...__iconProps} {...p}>
    <rect x="9" y="7" width="4" height="18" rx="1" fill="currentColor" stroke="none" />
    <rect x="19" y="7" width="4" height="18" rx="1" fill="currentColor" stroke="none" />
  </svg>
);
const IconSparkle = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M16 6 L18 13 L25 15 L18 17 L16 24 L14 17 L7 15 L14 13 Z" />
    <path d="M25 6 L26 9 L29 10 L26 11 L25 14 L24 11 L21 10 L24 9 Z" />
  </svg>
);
const IconImage = (p) => (
  <svg {...__iconProps} {...p}>
    <rect x="5" y="6" width="22" height="20" rx="2" />
    <circle cx="12" cy="13" r="2" />
    <path d="M5 22 L12 16 L18 21 L22 18 L27 23" />
  </svg>
);
const IconText = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M7 9 V7 h18 v2" />
    <path d="M16 7 V25" />
    <path d="M12 25 h8" />
  </svg>
);
const IconClock = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="16" cy="16" r="11" />
    <path d="M16 10 V16 L21 19" />
  </svg>
);
const IconSpeaker = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M6 13 V19 H10 L17 25 V7 L10 13 Z" />
    <path d="M21 12 c2 2 2 6 0 8" />
    <path d="M24 9 c4 4 4 10 0 14" />
  </svg>
);
const IconTrash = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M6 9 H26" />
    <path d="M12 9 V6 a1 1 0 0 1 1 -1 h6 a1 1 0 0 1 1 1 V9" />
    <path d="M8 9 V26 a1 1 0 0 0 1 1 H23 a1 1 0 0 0 1 -1 V9" />
    <path d="M13 13 V23 M19 13 V23" />
  </svg>
);
const IconCopy = (p) => (
  <svg {...__iconProps} {...p}>
    <rect x="10" y="10" width="16" height="18" rx="2" />
    <path d="M6 22 V6 a1 1 0 0 1 1 -1 H20 a1 1 0 0 1 1 1 V8" />
  </svg>
);
const IconReorder = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="12" cy="9" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="20" cy="9" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="20" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="23" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="20" cy="23" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const IconHeart = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M16 26 C 6 19 5 12 10 9 C 13.5 7 16 10 16 12 C 16 10 18.5 7 22 9 C 27 12 26 19 16 26 Z" />
  </svg>
);
const IconGrid = (p) => (
  <svg {...__iconProps} {...p}>
    <rect x="5" y="5" width="9" height="9" rx="1.5" />
    <rect x="18" y="5" width="9" height="9" rx="1.5" />
    <rect x="5" y="18" width="9" height="9" rx="1.5" />
    <rect x="18" y="18" width="9" height="9" rx="1.5" />
  </svg>
);
const IconList = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M11 8 H27 M11 16 H27 M11 24 H27" />
    <circle cx="6" cy="8" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="6" cy="16" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="6" cy="24" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

// Activity / story-step icons (the "PECS-style" library) ----------------
// All 32×32, line-art, drawn to feel consistent in weight.
const IconBed = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M4 23 V11 M4 23 H28 V17 H4" />
    <path d="M28 23 V14 a2 2 0 0 0 -2 -2 H13" />
    <circle cx="10" cy="15" r="2.5" />
  </svg>
);
const IconSun = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="16" cy="16" r="5" />
    <path d="M16 4 V7 M16 25 V28 M4 16 H7 M25 16 H28 M7.5 7.5 L9.5 9.5 M22.5 22.5 L24.5 24.5 M7.5 24.5 L9.5 22.5 M22.5 9.5 L24.5 7.5" />
  </svg>
);
const IconBathroom = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M8 6 H24" />
    <path d="M10 6 V14 H22 V6" />
    <path d="M8 14 H24 V20 a2 2 0 0 1 -2 2 H10 a2 2 0 0 1 -2 -2 Z" />
    <path d="M13 22 L11 27 M19 22 L21 27" />
  </svg>
);
const IconTooth = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M5 17 L18 9 L24 16 L13 23 Z" />
    <path d="M22 14 L28 11" />
    <path d="M9 19 L13 17" />
  </svg>
);
const IconShirt = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M11 6 L7 9 L4 14 L8 17 L10 14 V26 a1 1 0 0 0 1 1 H21 a1 1 0 0 0 1 -1 V14 L24 17 L28 14 L25 9 L21 6" />
    <path d="M11 6 C 12 9 14 10 16 10 C 18 10 20 9 21 6" />
  </svg>
);
const IconBowl = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M4 15 H28 a0 0 0 0 1 0 0 C28 22 22 26 16 26 S 4 22 4 15 Z" />
    <path d="M9 11 C 9 8 11 7 13 8" />
    <path d="M15 9 C 15 6 17 5 19 6" />
    <path d="M21 12 C 21 10 22 9 24 10" />
  </svg>
);
const IconBackpack = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M9 11 V26 a1 1 0 0 0 1 1 H22 a1 1 0 0 0 1 -1 V11" />
    <path d="M9 11 C 9 8 11 6 16 6 S 23 8 23 11" />
    <rect x="12" y="14" width="8" height="6" rx="1" />
    <path d="M12 22 H20" />
  </svg>
);
const IconShoe = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M4 22 H27 a1 1 0 0 0 1 -1 V19 C 28 16 24 15 21 13 L17 10 H7 V20" />
    <path d="M4 20 V22" />
    <path d="M11 14 L11 18 M14 14 L14 18 M17 14 L18 18" />
  </svg>
);
const IconWave = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M11 26 L11 14 C 11 12.5 13 12.5 13 14 V18" />
    <path d="M13 14 V12 C 13 10.5 15 10.5 15 12 V18" />
    <path d="M15 12 V10 C 15 8.5 17 8.5 17 10 V18" />
    <path d="M17 12 V11 C 17 9.5 19 9.5 19 11 V18" />
    <path d="M11 19 C 9 19 8 21 9 23 L13 27 H21 a3 3 0 0 0 3 -3 V14" />
  </svg>
);
const IconBook = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M5 7 C 9 6 13 6 16 8 C 19 6 23 6 27 7 V25 C 23 24 19 24 16 26 C 13 24 9 24 5 25 Z" />
    <path d="M16 8 V26" />
  </svg>
);
const IconBus = (p) => (
  <svg {...__iconProps} {...p}>
    <rect x="4" y="7" width="22" height="15" rx="2" />
    <path d="M4 16 H26" />
    <path d="M8 11 H12 M16 11 H22" />
    <circle cx="9" cy="24" r="2" />
    <circle cx="21" cy="24" r="2" />
    <path d="M26 13 H28 V18 H26" />
  </svg>
);
const IconWash = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M16 4 C 12 9 9 13 9 17 a7 7 0 0 0 14 0 C 23 13 20 9 16 4 Z" />
    <path d="M13 18 C 13 20 14 22 16 22" />
  </svg>
);
const IconBath = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M4 15 H28 V20 a3 3 0 0 1 -3 3 H7 a3 3 0 0 1 -3 -3 Z" />
    <path d="M9 15 V8 a2 2 0 0 1 2 -2 h3 a2 2 0 0 1 2 2 V11" />
    <path d="M7 23 L6 27 M25 23 L26 27" />
  </svg>
);
const IconPencil = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M22 5 L27 10 L11 26 H6 V21 Z" />
    <path d="M18 9 L23 14" />
  </svg>
);
const IconCalm = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="16" cy="16" r="11" />
    <path d="M11 14 c1 -1 2 -1 3 0" />
    <path d="M18 14 c1 -1 2 -1 3 0" />
    <path d="M11 21 c2 1.5 8 1.5 10 0" />
  </svg>
);
const IconCar = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M4 19 V14 L7 9 H25 L28 14 V19 H4 Z" />
    <path d="M4 14 H28" />
    <circle cx="9" cy="22" r="2" />
    <circle cx="23" cy="22" r="2" />
  </svg>
);
const IconCup = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M7 9 H23 V20 a4 4 0 0 1 -4 4 H11 a4 4 0 0 1 -4 -4 Z" />
    <path d="M23 12 H26 a3 3 0 0 1 0 6 H23" />
    <path d="M11 5 C 12 7 11 8 12 9" />
    <path d="M15 5 C 16 7 15 8 16 9" />
  </svg>
);
const IconHand = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M10 18 V9 C 10 7.5 12 7.5 12 9 V14" />
    <path d="M12 13 V7 C 12 5.5 14 5.5 14 7 V14" />
    <path d="M14 13 V8 C 14 6.5 16 6.5 16 8 V14" />
    <path d="M16 13 V10 C 16 8.5 18 8.5 18 10 V18" />
    <path d="M10 17 C 7 17 6 19 7 21 L11 27 H17 a3 3 0 0 0 3 -3 V13" />
  </svg>
);
const IconStar = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M16 5 L19.5 12 L27 13.2 L21.5 18.4 L23 26 L16 22.3 L9 26 L10.5 18.4 L5 13.2 L12.5 12 Z" />
  </svg>
);

// Map a string id to a component so data can reference icons by name.
const ICON_MAP = {
  bed: IconBed, sun: IconSun, bathroom: IconBathroom, tooth: IconTooth,
  shirt: IconShirt, bowl: IconBowl, backpack: IconBackpack, shoe: IconShoe,
  wave: IconWave, book: IconBook, bus: IconBus, wash: IconWash, bath: IconBath,
  pencil: IconPencil, calm: IconCalm, car: IconCar, cup: IconCup, hand: IconHand,
  star: IconStar, heart: IconHeart, clock: IconClock, image: IconImage,
};

// Streak / accessibility / utility icons ---------------------------------
const IconFlame = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M16 4 C 20 10 24 13 24 19 a8 8 0 0 1 -16 0 C 8 14 11 12 12 9 C 12.5 12 14 13 14.5 11 C 15 9 13 7 16 4 Z" />
  </svg>
);
const IconScan = (p) => (
  <svg {...__iconProps} {...p}>
    <circle cx="16" cy="16" r="9" />
    <circle cx="16" cy="16" r="3" fill="currentColor" stroke="none" />
    <path d="M16 2 V6 M16 26 V30 M2 16 H6 M26 16 H30" />
  </svg>
);
const IconCalendar = (p) => (
  <svg {...__iconProps} {...p}>
    <rect x="5" y="7" width="22" height="20" rx="2" />
    <path d="M5 13 H27" />
    <path d="M11 4 V9 M21 4 V9" />
  </svg>
);
const IconBell = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M9 13 a7 7 0 1 1 14 0 c0 5 2 7 2 7 H7 s2 -2 2 -7" />
    <path d="M13 24 a3 3 0 0 0 6 0" />
  </svg>
);
const IconDownload = (p) => (
  <svg {...__iconProps} {...p}>
    <path d="M16 5 V20 M10 15 L16 21 L22 15" />
    <path d="M6 25 H26" />
  </svg>
);

const Icon = ({ name, ...rest }) => {
  const C = ICON_MAP[name] || IconImage;
  return <C {...rest} />;
};

Object.assign(window, {
  Icon, ICON_MAP,
  IconBrand, IconHome, IconTemplates, IconLibrary, IconKids, IconShared,
  IconSettings, IconHelp,
  IconPlus, IconCheck, IconClose, IconArrowL, IconArrowR, IconChevD,
  IconSearch, IconShare, IconPrint, IconPlay, IconPause, IconSparkle,
  IconImage, IconText, IconClock, IconSpeaker, IconTrash, IconCopy,
  IconReorder, IconHeart, IconGrid, IconList, IconStar,
  IconFlame, IconScan, IconCalendar, IconBell, IconDownload,
});
