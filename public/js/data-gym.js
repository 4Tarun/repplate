// Exercise library with beginner how-to notes.
// log: 'weight' (kg + reps), 'reps' (bodyweight, optional kg), 'time' (seconds), 'assist' (assist kg, lower = stronger)
export const EXERCISES = {
  leg_press: {
    name: 'Leg Press', kind: 'Machine', muscles: 'Thighs, glutes', log: 'weight',
    how: [
      'Sit with your back and head flat on the pad. Feet shoulder-width apart in the middle of the platform.',
      'Push the platform up slightly and turn the side safety handles out to unlock it.',
      'Lower slowly until your knees are at about 90°, then push back up through your heels.',
      'At the end, lock the safety handles back before getting out.'
    ],
    avoid: 'Locking your knees straight at the top, or letting your lower back lift off the seat.',
    start: 'Start with 20–40 kg on the machine and add weight once 12 reps feel easy.'
  },
  chest_press: {
    name: 'Chest Press Machine', kind: 'Machine', muscles: 'Chest, shoulders, triceps', log: 'weight',
    how: [
      'Adjust the seat so the handles are level with the middle of your chest.',
      'Sit tall, back against the pad, grip the handles.',
      'Push forward until arms are almost straight, then return slowly over 2–3 seconds.'
    ],
    avoid: 'Shrugging shoulders up to your ears or arching your back off the pad.',
    start: 'Pick a pin weight you can push 12 times with 2 reps left in the tank (often 10–20 kg).'
  },
  lat_pulldown: {
    name: 'Lat Pulldown', kind: 'Cable machine', muscles: 'Back (lats), biceps', log: 'weight',
    how: [
      'Set the thigh pad so your legs are locked in snugly.',
      'Hold the long bar a little wider than shoulders, palms facing away.',
      'Lean back slightly and pull the bar to your upper chest, squeezing shoulder blades down.',
      'Let the bar rise slowly until arms are straight.'
    ],
    avoid: 'Pulling the bar behind your neck, or swinging your body to move the weight.',
    start: 'Start around 20–30 kg.'
  },
  leg_curl: {
    name: 'Seated Leg Curl', kind: 'Machine', muscles: 'Hamstrings (back of thigh)', log: 'weight',
    how: [
      'Adjust the back rest so your knees line up with the machine\'s pivot point.',
      'Place the pad just above your heels and lower the thigh pad onto your legs.',
      'Curl your heels down and back under the seat, then return slowly.'
    ],
    avoid: 'Letting the weight slam back. Control the way up.',
    start: 'Start with 10–20 kg.'
  },
  db_shoulder_press: {
    name: 'Dumbbell Shoulder Press', kind: 'Dumbbells', muscles: 'Shoulders, triceps', log: 'weight',
    how: [
      'Sit on a bench set upright (90°), a dumbbell in each hand at shoulder height, palms forward.',
      'Press both dumbbells up until arms are nearly straight overhead.',
      'Lower slowly back to shoulder height.'
    ],
    avoid: 'Arching your lower back hard. Keep your back against the bench.',
    start: 'Log the weight of ONE dumbbell. Start with 5–7.5 kg each.'
  },
  plank: {
    name: 'Plank', kind: 'Bodyweight', muscles: 'Core', log: 'time',
    how: [
      'Forearms on the floor, elbows under shoulders.',
      'Step feet back so your body is a straight line from head to heels.',
      'Squeeze your glutes and belly and hold. Breathe normally.'
    ],
    avoid: 'Hips sagging down or sticking up high.',
    start: 'Hold 20–30 seconds. Add 5–10 seconds each week.'
  },
  goblet_squat: {
    name: 'Goblet Squat', kind: 'Dumbbell', muscles: 'Thighs, glutes, core', log: 'weight',
    how: [
      'Hold one dumbbell vertically against your chest with both hands.',
      'Feet shoulder-width, toes slightly out.',
      'Sit down between your heels, chest up, until thighs are about parallel to the floor.',
      'Stand back up by pushing through the whole foot.'
    ],
    avoid: 'Heels lifting or knees collapsing inwards.',
    start: 'Start with 8–12 kg. Bodyweight only is fine for the first week.'
  },
  seated_row: {
    name: 'Seated Cable Row', kind: 'Cable machine', muscles: 'Mid back, biceps', log: 'weight',
    how: [
      'Sit with feet on the foot plates, knees slightly bent, hold the V-handle.',
      'Sit tall, then pull the handle to your belly button, elbows close to your body.',
      'Squeeze your shoulder blades together, then let arms extend slowly.'
    ],
    avoid: 'Rocking far back and forth to move the weight.',
    start: 'Start around 20–30 kg.'
  },
  incline_db_press: {
    name: 'Incline Dumbbell Press', kind: 'Dumbbells', muscles: 'Upper chest, shoulders', log: 'weight',
    how: [
      'Set the bench to a low incline (about 30°).',
      'Sit back with a dumbbell on each thigh, then lie back and bring them to chest level.',
      'Press up until arms are straight, dumbbells close together, then lower slowly.'
    ],
    avoid: 'Dropping the dumbbells too low or bouncing them.',
    start: 'Log the weight of ONE dumbbell. Start with 7.5–10 kg each.'
  },
  leg_extension: {
    name: 'Leg Extension', kind: 'Machine', muscles: 'Front of thigh (quads)', log: 'weight',
    how: [
      'Adjust the back rest so your knees line up with the machine\'s pivot point.',
      'Place the pad on the front of your lower shins.',
      'Straighten your legs, pause for a second at the top, then lower slowly.'
    ],
    avoid: 'Kicking the weight up fast. Move slowly.',
    start: 'Start with 10–20 kg.'
  },
  db_curl: {
    name: 'Dumbbell Biceps Curl', kind: 'Dumbbells', muscles: 'Biceps', log: 'weight',
    how: [
      'Stand tall, a dumbbell in each hand, palms facing forward.',
      'Keeping elbows pinned to your sides, curl the dumbbells up.',
      'Lower slowly until arms are straight.'
    ],
    avoid: 'Swinging your body or moving the elbows forward.',
    start: 'Log ONE dumbbell. Start with 5–7.5 kg each.'
  },
  triceps_pushdown: {
    name: 'Triceps Pushdown', kind: 'Cable machine', muscles: 'Triceps (back of arm)', log: 'weight',
    how: [
      'Attach a rope or straight bar to the high pulley.',
      'Stand close, elbows tucked at your sides.',
      'Push down until arms are straight, then let it come up to chest level slowly.'
    ],
    avoid: 'Elbows flaring out or leaning your body weight over the bar.',
    start: 'Start with 10–15 kg.'
  },
  db_rdl: {
    name: 'Dumbbell Romanian Deadlift', kind: 'Dumbbells', muscles: 'Hamstrings, glutes, lower back', log: 'weight',
    how: [
      'Stand holding dumbbells in front of your thighs, knees slightly bent.',
      'Push your hips back and slide the dumbbells down your legs, keeping your back flat.',
      'Stop when you feel a stretch behind your thighs (around mid-shin), then stand up by pushing hips forward.'
    ],
    avoid: 'Rounding your back. If it rounds, you have gone too low.',
    start: 'Log ONE dumbbell. Start with 7.5–10 kg each.'
  },
  machine_shoulder_press: {
    name: 'Shoulder Press Machine', kind: 'Machine', muscles: 'Shoulders, triceps', log: 'weight',
    how: [
      'Adjust the seat so the handles start at shoulder level.',
      'Back flat on the pad, press up until arms are nearly straight.',
      'Lower slowly to the start.'
    ],
    avoid: 'Locking out hard or arching your back.',
    start: 'Start with 10–20 kg.'
  },
  assisted_pullup: {
    name: 'Assisted Pull-up Machine', kind: 'Machine', muscles: 'Back, biceps', log: 'assist',
    how: [
      'Choose the assist weight on the stack. MORE weight = MORE help (easier).',
      'Kneel or stand on the platform, grip the handles wider than shoulders.',
      'Pull your chest up towards the bar, then lower slowly.'
    ],
    avoid: 'Dropping fast at the bottom.',
    start: 'Start with 30–40 kg assist. Log the assist weight: going LOWER over time is progress. No machine? Do Lat Pulldown instead.'
  },
  pec_deck: {
    name: 'Pec Deck (Chest Fly Machine)', kind: 'Machine', muscles: 'Chest', log: 'weight',
    how: [
      'Adjust the seat so the handles are at chest height.',
      'With a slight bend in your elbows, bring the handles together in front of your chest.',
      'Open your arms slowly until you feel a light chest stretch.'
    ],
    avoid: 'Letting the handles go too far behind you.',
    start: 'Start with 10–20 kg.'
  },
  lunges: {
    name: 'Walking Lunges', kind: 'Bodyweight / dumbbells', muscles: 'Thighs, glutes, balance', log: 'reps',
    how: [
      'Stand tall. Take a long step forward.',
      'Lower until both knees are around 90°, back knee just above the floor.',
      'Push off the front foot and step through into the next lunge.'
    ],
    avoid: 'Front knee caving in. Take a longer step if your knee goes far past your toes.',
    start: 'Bodyweight first (reps = per leg). Hold light dumbbells later; log one dumbbell\'s weight.'
  },
  dead_bug: {
    name: 'Dead Bug', kind: 'Bodyweight', muscles: 'Core', log: 'reps',
    how: [
      'Lie on your back, arms pointing at the ceiling, knees bent at 90° above your hips.',
      'Press your lower back into the floor.',
      'Slowly lower your opposite arm and leg towards the floor, return, then switch sides.'
    ],
    avoid: 'Lower back lifting off the floor.',
    start: '8–10 reps per side. Weight column not needed.'
  },
  face_pull: {
    name: 'Cable Face Pull', kind: 'Cable machine', muscles: 'Rear shoulders, upper back', log: 'weight',
    how: [
      'Set a rope on the pulley at face height.',
      'Hold the rope ends, step back, and pull the rope towards your forehead, elbows high.',
      'Pull the rope apart at the end, then return slowly.'
    ],
    avoid: 'Using too much weight and leaning back.',
    start: 'Start light, 5–10 kg.'
  },
  calf_raise: {
    name: 'Calf Raise', kind: 'Machine / bodyweight', muscles: 'Calves', log: 'weight',
    how: [
      'Stand with the balls of your feet on a step or the machine platform.',
      'Rise up onto your toes as high as you can, pause for a second.',
      'Lower your heels slowly below the step for a stretch.'
    ],
    avoid: 'Bouncing quickly. Slow and full range works best.',
    start: 'Bodyweight or the machine\'s lightest setting.'
  }
};

// Plans. items: [exerciseId, sets, reps text]
export const PLANS = {
  fb3: {
    name: 'Beginner Full Body · 3 days/week',
    short: 'Full Body 3×',
    perWeek: 3,
    suggested: 'Mon · Wed · Fri',
    order: ['A', 'B', 'C'],
    days: {
      A: { title: 'Full Body A', items: [['leg_press', 3, '10–12'], ['chest_press', 3, '10–12'], ['lat_pulldown', 3, '10–12'], ['leg_curl', 2, '12–15'], ['db_shoulder_press', 2, '10–12'], ['plank', 2, '20–40s']] },
      B: { title: 'Full Body B', items: [['goblet_squat', 3, '10–12'], ['seated_row', 3, '10–12'], ['incline_db_press', 3, '10–12'], ['leg_extension', 2, '12–15'], ['db_curl', 2, '10–12'], ['triceps_pushdown', 2, '10–12']] },
      C: { title: 'Full Body C', items: [['db_rdl', 3, '10–12'], ['machine_shoulder_press', 3, '10–12'], ['assisted_pullup', 3, '8–10'], ['pec_deck', 2, '12–15'], ['lunges', 2, '8–10'], ['dead_bug', 2, '8–10']] }
    }
  },
  ul4: {
    name: 'Upper / Lower · 4 days/week (after 8–12 weeks)',
    short: 'Upper/Lower 4×',
    perWeek: 4,
    suggested: 'Mon · Tue · Thu · Fri',
    order: ['U1', 'L1', 'U2', 'L2'],
    days: {
      U1: { title: 'Upper 1', items: [['chest_press', 3, '8–10'], ['lat_pulldown', 3, '8–10'], ['db_shoulder_press', 3, '8–10'], ['seated_row', 3, '10–12'], ['db_curl', 2, '10–12'], ['triceps_pushdown', 2, '10–12']] },
      L1: { title: 'Lower 1', items: [['leg_press', 4, '8–10'], ['db_rdl', 3, '8–10'], ['leg_curl', 3, '10–12'], ['leg_extension', 2, '12–15'], ['calf_raise', 3, '12–15'], ['plank', 2, '30–45s']] },
      U2: { title: 'Upper 2', items: [['incline_db_press', 3, '8–10'], ['assisted_pullup', 3, '6–8'], ['machine_shoulder_press', 3, '10–12'], ['pec_deck', 2, '12–15'], ['face_pull', 2, '12–15'], ['db_curl', 2, '10–12']] },
      L2: { title: 'Lower 2', items: [['goblet_squat', 4, '8–10'], ['lunges', 3, '8–10'], ['leg_curl', 3, '10–12'], ['calf_raise', 3, '12–15'], ['dead_bug', 2, '8–10'], ['leg_extension', 2, '12–15']] }
    }
  }
};

export const BASICS = [
  'Warm up 5 minutes on the treadmill or cycle, then do 1 light set of the first exercise.',
  'Rest 1–2 minutes between sets (ACSM guidance for 8–12 rep training).',
  'Lift with control: about 1–2 seconds up and 1–2 seconds down.',
  'Pick a weight where the last 2 reps are hard but your form stays clean.',
  'When every set reaches the top of the rep range, add 2–10% weight next time (ACSM). The app suggests the exact number.',
  'Weeks 1–4 build technique; from week 5 the app adds a set to each exercise; every 8th week is a lighter deload week.',
  'Not sure how a machine adjusts? Ask the gym trainer once. Most gyms are happy to show you.',
  'Missed a day? Just do the next workout in order.'
];

// Lower-body moves get bigger jumps (5%), upper-body smaller (2.5%)
export const LOWER = new Set(['leg_press', 'leg_curl', 'goblet_squat', 'leg_extension', 'db_rdl', 'lunges', 'calf_raise']);
// Compound moves get warm-up sets when they come first
export const COMPOUND = new Set(['leg_press', 'chest_press', 'lat_pulldown', 'goblet_squat', 'seated_row', 'incline_db_press', 'db_rdl', 'machine_shoulder_press', 'db_shoulder_press']);

// YouTube search phrases for the "Watch how" button (one per exercise)
export const VIDEO_Q = {
  leg_press: 'leg press machine how to proper form beginners',
  chest_press: 'seated chest press machine how to proper form',
  lat_pulldown: 'lat pulldown how to proper form beginners',
  leg_curl: 'seated leg curl machine how to proper form',
  db_shoulder_press: 'seated dumbbell shoulder press proper form',
  plank: 'how to do a plank correctly beginners',
  goblet_squat: 'goblet squat how to proper form beginners',
  seated_row: 'seated cable row how to proper form',
  incline_db_press: 'incline dumbbell press how to proper form',
  leg_extension: 'leg extension machine how to proper form',
  db_curl: 'dumbbell bicep curl proper form beginners',
  triceps_pushdown: 'cable triceps pushdown proper form',
  db_rdl: 'dumbbell romanian deadlift how to proper form',
  machine_shoulder_press: 'shoulder press machine how to proper form',
  assisted_pullup: 'assisted pull up machine how to use',
  pec_deck: 'pec deck machine chest fly proper form',
  lunges: 'walking lunges how to proper form beginners',
  dead_bug: 'dead bug exercise how to proper form',
  face_pull: 'cable face pull how to proper form',
  calf_raise: 'standing calf raise proper form'
};
