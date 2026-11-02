// Server #268: fixed UTC−2, confirmed against the in-game clock by the owner.
export const serverUtcOffsetMinutes = -120;

export function serverClock(now = new Date()) {
  const shifted = new Date(now.getTime() + serverUtcOffsetMinutes * 60_000);
  const iso = shifted.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 19), datetime: `${iso.slice(0, 19)}-02:00` };
}

// Sunday through Saturday, in server time. Source: Dannie's 2026-11-02 bulletin.
export const airshipHours = [19, 19, 7, 19, 7, 19, 7];

// Opponent identity is taken from each complete PHNX row, not older OATH rows.
export const sandstormOpponents = {
  '2026-10-30 18:00': { icon: 'freaks-united', name: '[Fu2] FreaksUnited' },
  '2026-10-30 09:00': { icon: 'cabbage-carnage', name: '[CBG] CabbageCarnage' },
  '2026-10-23 18:00': { icon: 'family', name: '[NEBA] Family' },
  '2026-10-23 09:00': { icon: 'razor-edge', name: '[RAZ] RazorEdge' },
  '2026-10-16 18:00': { icon: 'family', name: '[NEBA] Family' },
  '2026-10-16 09:00': { icon: 'iron-veil', name: '[OATH] IronVeil' },
  '2026-10-09 18:00': { icon: 'pal-runner', name: '[PLR] PalRunner' },
  '2026-10-09 09:00': { icon: 'avalanche', name: '[AVAL] Avalanche' },
};

export function nextAirship(now = new Date()) {
  const serverNow = new Date(now.getTime() + serverUtcOffsetMinutes * 60_000);
  for (let days = 0; days <= 7; days++) {
    const day = new Date(Date.UTC(serverNow.getUTCFullYear(), serverNow.getUTCMonth(), serverNow.getUTCDate() + days));
    const departure = new Date(day.getTime() + airshipHours[day.getUTCDay()] * 3_600_000 - serverUtcOffsetMinutes * 60_000);
    if (departure >= now) return departure;
  }
}

export function countdownUntil(departure, now = new Date()) {
  const seconds = Math.max(0, Math.ceil((departure.getTime() - now.getTime()) / 1000));
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
}

// Dated screenshot schedule, November 2026 context. No recurrence inferred.
export const datedEvents = [
  { date: '2026-10-31', type: 'arctic-showdown', title: 'Arctic Showdown · registration', time: null },
  ...Array.from({ length: 7 }, (_, index) => ({ date: `2026-11-${String(index + 2).padStart(2, '0')}`, type: 'arctic-showdown', title: `Arctic Showdown · Round ${index + 1}`, time: null })),
  ...['Round of 16', 'Quarter-finals', 'Semi-finals', 'Finals'].map((stage, index) => ({ date: `2026-11-${String(index + 9).padStart(2, '0')}`, type: 'arctic-showdown', title: `Arctic Showdown · ${stage}`, time: null })),
  ...[4, 7, 11, 14, 18, 21, 25].map(day => ({ date: `2026-11-${String(day).padStart(2, '0')}`, type: 'ember-wars', title: 'Ember Wars · battle day', time: null })),
  { date: '2026-11-03', type: 'guild-hunt', title: 'Guild Hunt · Flapnir (Flappy)', time: '22:00' },
  ...[5, 6, 7].map(day => ({ date: `2026-11-0${day}`, type: 'sandstorm-scuffle', title: 'Sandstorm Scuffle · event window', time: null })),
];

export function calendarEvents(year, month) {
  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 0 || month > 11) throw new RangeError('Invalid calendar month');
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const events = datedEvents.filter(event => event.date.startsWith(prefix)).map(event => ({ ...event }));
  for (let day = 1; day <= days; day++) {
    const weekday = new Date(Date.UTC(year, month, day)).getUTCDay();
    events.push({ date: `${prefix}-${String(day).padStart(2, '0')}`, type: 'airship', title: 'Guild Airship', time: `${String(airshipHours[weekday]).padStart(2, '0')}:00` });
  }
  return events.map(event => ({ ...event, datetime: event.time ? `${event.date}T${event.time}:00-02:00` : null })).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '') || a.title.localeCompare(b.title));
}

export const emberWars = {
  sections: [
    { title: 'Before the event', steps: ['Read the current event rules, objectives, stage, and participation requirements in-game.', 'Check guild announcements: are we attacking or defending, where are we meeting, and who is leading?', 'Prepare your strongest available combat team and check healing capacity and supplies. Avoid spending scarce resources without a plan.', 'Ask leadership whether you need to relocate; do not use a teleport blindly.', 'Confirm the start time in-game and aim to be online 10–15 minutes early.'] },
    { title: 'During the event', steps: ['Follow the designated caller and stay with your assigned group.', 'Focus the called objective instead of chasing individual enemies.', 'Watch guild chat for changes. Report location, what is happening, and what help is needed.', 'If you keep losing fights, stop and ask for another assignment rather than repeatedly taking losses.'] },
    { title: 'If we are attacking', steps: ['Wait for the coordinated push.', 'Move toward the target leadership identifies.', 'Do not split off for solo fights or assume the nearest enemy is the priority.'] },
    { title: 'If we are defending', steps: ['Be in position before fighting begins.', 'Protect the assigned objective and respond to calls for help.', 'Do not chase enemies away from the area you are meant to defend.'] },
    { title: 'New or lower-power player?', steps: ['Ask for a suitable support assignment. Staying with the group, watching approaches, and reporting enemy movement are useful contributions.', 'Not sure what to do? Ask: “I am new to Ember Wars. Where should I go, and what should I focus on?”'] },
  ],
  resources: [
    { title: 'Ember Wars beginner guide', source: 'Ploto Palmon · YouTube', url: 'https://www.youtube.com/watch?v=ibQBx_N3aUg' },
    { title: 'Defense gameplay: S57 vs S58', source: 'YouTube · gameplay example, not PHNX instructions', url: 'https://www.youtube.com/watch?v=SQzDmpKztQI' },
    { title: 'Attack gameplay: against S60', source: 'YouTube · gameplay example, not PHNX instructions', url: 'https://www.youtube.com/watch?v=t_c0iZNEioo' },
    { title: 'Community discussion: preparing for Ember Wars', source: 'Reddit · player advice', url: 'https://www.reddit.com/r/PalmonSurvival/comments/1nf1rgi/ember_wars/' },
  ],
};

export const priorities = [
  { id: 'generator', title: 'Check your generator', detail: 'Review fuel and heat needs in-game before heading out.', tag: 'SURVIVAL', icon: '◈' },
  { id: 'coal', title: 'Plan your coal reserves', detail: 'Check current supplies and coordinate gathering with the guild.', tag: 'RESOURCES', icon: '⬡' },
  { id: 'rally', title: 'Get rally-ready', detail: 'Check officer instructions and prepare your available team.', tag: 'GUILD PLAY', icon: '⚑' },
];
export const guides = [
  { id: 'cold', category: 'SURVIVAL', title: 'Keep the cold outside.', description: 'A simple starting point for generator checks and blizzard preparation.', icon: '❄', steps: ['Check the current weather and warnings in-game.', 'Review generator fuel and your current heating needs.', 'Check cold resistance on the relevant in-game screens.', 'Ask an officer about priorities before spending scarce supplies.'] },
  { id: 'coal', category: 'RESOURCES', title: 'Make every coal count.', description: 'Plan supplies together. Keep your guild ready for what comes next.', icon: '⬡', steps: ['Check your current coal reserves and consumption in-game.', 'Confirm gathering and mine objectives with an officer.', 'Review brick-kiln costs before committing resources.', 'Recheck supplies after weather or building changes.'] },
  { id: 'rally', category: 'GUILD PLAY', title: 'Stronger, together.', description: 'A quick rally-prep checklist for showing up ready to help.', icon: '⚑', steps: ['Confirm the event time and organizer in your guild channel.', 'Read the assigned objective and role.', 'Check your team and available resources in-game.', 'Let the organizer know if your availability changes.'] },
];
export function loadState(storage) {
  try {
    const data = JSON.parse(storage.getItem('phnx-v1') || '{}');
    return {
      completed: Array.isArray(data.completed) ? [...new Set(data.completed.filter(id => priorities.some(p => p.id === id)))] : [],
      day: typeof data.day === 'string' ? data.day : '',
    };
  } catch { return { completed: [], day: '' }; }
}
