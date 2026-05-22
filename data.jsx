// data.jsx — sample content for the prototype

const CATEGORIES = {
  routine: { id: 'routine', label: 'Routines',    bg: 'var(--cat-routine-bg)', ink: 'var(--cat-routine)', dot: 'var(--cat-routine)' },
  hygiene: { id: 'hygiene', label: 'Self-care',   bg: 'var(--cat-hygiene-bg)', ink: 'var(--cat-hygiene)', dot: 'var(--cat-hygiene)' },
  school:  { id: 'school',  label: 'School',      bg: 'var(--cat-school-bg)',  ink: 'var(--cat-school)',  dot: 'var(--cat-school)'  },
  social:  { id: 'social',  label: 'Social',      bg: 'var(--cat-social-bg)',  ink: 'var(--cat-social)',  dot: 'var(--cat-social)'  },
  food:    { id: 'food',    label: 'Mealtime',    bg: 'var(--cat-food-bg)',    ink: 'var(--cat-food)',    dot: 'var(--cat-food)'    },
  calm:    { id: 'calm',    label: 'Transitions', bg: 'var(--cat-calm-bg)',    ink: 'var(--cat-calm)',    dot: 'var(--cat-calm)'    },
};

// The demo template — populated into the Builder by default.
const MORNING_ROUTINE = {
  id: 'morning',
  title: 'Morning Routine',
  subtitle: 'For Sam · School day · 8 steps',
  category: 'routine',
  schedule: 'Weekdays · starts 7:00 AM',
  steps: [
    { id: 's1', icon: 'sun',      title: 'Wake up',         time: '7:00',  duration: 5,  category: 'routine', note: 'Open the curtains and stretch.' },
    { id: 's2', icon: 'bathroom', title: 'Use the bathroom',time: '7:05',  duration: 5,  category: 'hygiene', note: 'Flush and wash hands after.' },
    { id: 's3', icon: 'tooth',    title: 'Brush teeth',     time: '7:10',  duration: 3,  category: 'hygiene', note: 'Two minutes — hum the song.' },
    { id: 's4', icon: 'shirt',    title: 'Get dressed',     time: '7:15',  duration: 10, category: 'routine', note: 'Clothes are laid out on the chair.' },
    { id: 's5', icon: 'bowl',     title: 'Eat breakfast',   time: '7:25',  duration: 15, category: 'food',    note: 'Choice: cereal or toast.' },
    { id: 's6', icon: 'backpack', title: 'Pack backpack',   time: '7:40',  duration: 5,  category: 'school',  note: 'Check: folder, water, snack.' },
    { id: 's7', icon: 'shoe',     title: 'Put on shoes',    time: '7:45',  duration: 3,  category: 'routine', note: 'Velcro first, then the other.' },
    { id: 's8', icon: 'wave',     title: 'Hug & go',        time: '7:50',  duration: 2,  category: 'social',  note: 'Big hug. See you at 3!' },
  ],
};

const TEMPLATES = [
  { id: 'morning',   title: 'Morning Routine',   steps: 8, category: 'routine',  description: 'Wake-up through out-the-door.', icons: ['sun','tooth','shirt','bowl','backpack','wave'] },
  { id: 'bedtime',   title: 'Bedtime Routine',   steps: 6, category: 'routine',  description: 'Wind-down to lights out.',   icons: ['bath','tooth','shirt','book','bed','star'] },
  { id: 'shower',    title: 'Shower Steps',      steps: 7, category: 'hygiene',  description: 'Each step of a shower in order.', icons: ['bath','wash','wash','wash','wash','shirt'] },
  { id: 'school',    title: 'School Day',        steps: 9, category: 'school',   description: 'Arrival through dismissal.',  icons: ['bus','backpack','book','pencil','bowl','star'] },
  { id: 'haircut',   title: 'Getting a Haircut', steps: 8, category: 'social',   description: 'A social story for visits to the salon.', icons: ['car','hand','heart','star','calm','wave'] },
  { id: 'dentist',   title: 'Dentist Visit',     steps: 7, category: 'social',   description: 'What to expect at the dentist.', icons: ['car','book','tooth','hand','star','heart'] },
  { id: 'mealtime',  title: 'Trying New Food',   steps: 5, category: 'food',     description: 'Look, smell, lick, bite, chew.', icons: ['bowl','cup','heart','star','hand'] },
  { id: 'handwash',  title: 'Washing Hands',     steps: 6, category: 'hygiene',  description: 'A 20-second hand-washing routine.', icons: ['hand','cup','wash','hand','hand','star'] },
  { id: 'firstthen', title: 'First / Then Board',steps: 2, category: 'calm',     description: 'A two-step \"first → then\" board.', icons: ['pencil','star'] },
  { id: 'feelings',  title: 'Big Feelings',      steps: 5, category: 'calm',     description: 'Notice, name, breathe, choose, settle.', icons: ['calm','heart','wave','hand','star'] },
  { id: 'playdate',  title: 'Playdate Plan',     steps: 6, category: 'social',   description: 'Arrive, greet, choose, share, snack, goodbye.', icons: ['hand','heart','book','bowl','wave','star'] },
  { id: 'arrival',   title: 'Arrival at School', steps: 5, category: 'school',   description: 'Bus → cubby → seat → calm → ready.', icons: ['bus','backpack','pencil','calm','star'] },
];

const RECENT_BOARDS = [
  { id: 'a', title: 'Morning Routine — Sam',   stepsDone: 5, stepsTotal: 8, category: 'routine', lastUsed: 'Today, 7:48 AM', shared: ['M','D'] },
  { id: 'b', title: 'After-school Wind-down',  stepsDone: 0, stepsTotal: 6, category: 'calm',    lastUsed: 'Yesterday',     shared: ['M','D','G'] },
  { id: 'c', title: 'Trying New Foods',        stepsDone: 2, stepsTotal: 5, category: 'food',    lastUsed: '3 days ago',    shared: ['M']     },
  { id: 'd', title: 'Visiting Grandma\u2019s', stepsDone: 0, stepsTotal: 7, category: 'social',  lastUsed: 'Last week',     shared: ['M','D'] },
];

// A small selection of activity tiles the user can drag onto the canvas
const STEP_LIBRARY = [
  { id: 'sun',      label: 'Wake up',        category: 'routine' },
  { id: 'bed',      label: 'Bedtime',        category: 'routine' },
  { id: 'bathroom', label: 'Bathroom',       category: 'hygiene' },
  { id: 'tooth',    label: 'Brush teeth',    category: 'hygiene' },
  { id: 'bath',     label: 'Bath / Shower',  category: 'hygiene' },
  { id: 'wash',     label: 'Wash hands',     category: 'hygiene' },
  { id: 'shirt',    label: 'Get dressed',    category: 'routine' },
  { id: 'shoe',     label: 'Shoes on',       category: 'routine' },
  { id: 'bowl',     label: 'Eat a meal',     category: 'food'    },
  { id: 'cup',      label: 'Drink',          category: 'food'    },
  { id: 'backpack', label: 'Pack bag',       category: 'school'  },
  { id: 'book',     label: 'Read',           category: 'school'  },
  { id: 'pencil',   label: 'Schoolwork',     category: 'school'  },
  { id: 'bus',      label: 'Bus / school',   category: 'school'  },
  { id: 'car',      label: 'Car ride',       category: 'school'  },
  { id: 'wave',     label: 'Hello / Bye',    category: 'social'  },
  { id: 'hand',     label: 'Ask for help',   category: 'social'  },
  { id: 'heart',    label: 'I love you',     category: 'social'  },
  { id: 'calm',     label: 'Take a breath',  category: 'calm'    },
  { id: 'star',     label: 'All done!',      category: 'calm'    },
];

Object.assign(window, {
  CATEGORIES, MORNING_ROUTINE, TEMPLATES, RECENT_BOARDS, STEP_LIBRARY,
});
