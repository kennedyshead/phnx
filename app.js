import { checklistStatus, searchEntries, prioritiesForDate, duelWeekdayPlan, guides, loadState, emberWars, eventBeginners, upcomingBeginnerEvents, serverClock, nextAirship, countdownUntil, calendarEvents, upcomingTimedEvents, sandstormOpponents, serverTimeOnDate, nextWeeklyServerTime, eventPages, eventLandingTimer, seasons, preparationSeason, availableGuides, referenceSeason } from './lib.js?v=77877883489ce84854b5';

const $ = selector => document.querySelector(selector);
// CSS follows the OS even before JavaScript loads. Only an explicit choice is saved.
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
let themePreference = null;
try {
  const saved = localStorage.getItem('phnx-theme');
  if (saved === 'light' || saved === 'dark') themePreference = saved;
} catch { /* The theme still works when browser storage is unavailable. */ }
function icon(name) {
  const paths = {
    moon: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
    sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    external: 'M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5',
    players: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M13 3.1a4 4 0 0 1 0 7.8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    officers: 'm12 3 9 4v5c0 5-9 9-9 9s-9-4-9-9V7l9-4Zm-4 9 3 3 5-6',
    checklist: 'm3 6 2 2 3-4m3 2h10M3 13l2 2 3-4m3 2h10M3 20l2 2 3-4m3 2h10',
    calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
    book: 'M12 5v16M3 3l9 2 9-2v16l-9 2-9-2V3Z',
    home: 'm3 10 9-7 9 7v11h-7v-7h-4v7H3V10Z',
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
  svg.classList.add('ui-icon');
  const path = document.createElementNS(svg.namespaceURI, 'path'); path.setAttribute('d', paths[name] || paths.arrow);
  svg.append(path); return svg;
}
function applyTheme() {
  if (themePreference) document.documentElement.dataset.theme = themePreference;
  else delete document.documentElement.dataset.theme;
  const dark = themePreference ? themePreference === 'dark' : systemTheme.matches;
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  $('#theme-toggle').replaceChildren(icon(dark ? 'sun' : 'moon'));
  $('#theme-toggle').setAttribute('aria-label', label);
  $('#theme-toggle').title = label;
  document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
    meta.content = dark ? '#1e1e2e' : '#eff1f5';
  });
}
function chooseTheme(preference) {
  themePreference = preference;
  try {
    if (preference) localStorage.setItem('phnx-theme', preference);
    else localStorage.removeItem('phnx-theme');
  } catch { /* Keep the selected theme in memory for this tab. */ }
  applyTheme();
}
$('#theme-toggle').addEventListener('click', () => chooseTheme((themePreference ? themePreference === 'dark' : systemTheme.matches) ? 'light' : 'dark'));
systemTheme.addEventListener('change', applyTheme);
window.addEventListener('storage', event => {
  if (event.key !== 'phnx-theme' && event.key !== null) return;
  themePreference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
  applyTheme();
});
applyTheme();
let seasonKey = null;
for (const [type, event] of Object.entries(eventPages)) {
  let parent = $(`nav a[data-page="${type}"]`);
  if (!parent) {
    parent = document.createElement('a'); parent.href = `#${type}`; parent.dataset.page = type;
    const icon = document.createElement('img'); icon.src = `./assets/events/${type}.webp`;
    icon.className = 'nav-event-icon'; icon.width = icon.height = 24; icon.alt = '';
    parent.append(icon, event.name); $('nav a[data-page="guild-duel"]').before(parent);
  }
  let submenu = document.getElementById(parent.getAttribute('aria-controls'));
  if (!submenu) {
    submenu = document.createElement('div'); submenu.id = `${type}-submenu`;
    submenu.className = 'nav-submenu'; submenu.hidden = true;
    submenu.setAttribute('role', 'group'); submenu.setAttribute('aria-label', `${event.name} pages`);
    for (const [id, name] of [[event.players, 'Players'], [event.officers, 'Officers & callers']]) {
      const link = document.createElement('a'); link.href = `#${id}`; link.dataset.page = id; link.textContent = name;
      submenu.append(link);
    }
    parent.after(submenu); parent.setAttribute('aria-controls', submenu.id);
  }
  parent.setAttribute('aria-expanded', 'false');
  for (const node of [parent, submenu, ...submenu.children, ...[type, event.players, event.officers].map(id => $(`#${id}-view`))]) node.dataset.event = type;
  const landing = $(`#${type}-view`);
  const intro = landing.querySelector('.ember-intro');
  const links = landing.querySelector(`a[href="#${event.players}"]`).closest('p');
  links.classList.add('event-page-links');
  if (!intro.contains(links)) intro.append(links);
}
// One event identity follows its navigation, static panels and dynamic entries.
const eventSurfaces = {
  airship: '.airship-panel, #guild-schedule article:first-child',
  'guild-hunt': '.notice-panel, #guild-schedule article:last-child',
  'ember-wars': '#ember-wars-view, [aria-labelledby="ember-callout-title"], nav a[href="#ember-wars"]',
  'arctic-showdown': '#arctic-showdown-view, nav a[href="#arctic-showdown"]',
  'sandstorm-scuffle': '#sandstorm-scuffle-view, #sandstorm-players-view, #sandstorm-officers-view, [aria-labelledby="sandstorm-callout-title"], nav a[href="#sandstorm-scuffle"], #sandstorm-submenu, #sandstorm-submenu a',
  'guild-duel': '#guild-duel-view, #guild-duel-players-view, #guild-duel-officers-view, nav a[href="#guild-duel"], #duel-submenu, #duel-submenu a',
};
for (const [event, selector] of Object.entries(eventSurfaces)) {
  document.querySelectorAll(selector).forEach(node => { node.dataset.event = event; });
}
// Decorative artwork: the adjacent headings already identify each event.
const eventArtwork = [
  ['airship', '.airship-panel, #guild-schedule article:first-child'],
  ['guild-hunt', '.notice-panel, #guild-schedule article:last-child'],
  ['ember-wars', '[aria-labelledby="ember-callout-title"]'],
  ['sandstorm-scuffle', '[aria-labelledby="sandstorm-callout-title"]'],
  ...Object.entries(eventPages).map(([type, event]) => [type, [type, event.players, event.officers].map(id => `#${id}-view .ember-intro`).join(', ')]),
];
for (const [event, selector] of eventArtwork) {
  document.querySelectorAll(selector).forEach(container => {
    const image = document.createElement('img');
    image.src = `./assets/events/${event}.webp`;
    image.alt = '';
    image.width = image.height = 64;
    image.className = 'event-art';
    image.decoding = 'async';
    container.prepend(image);
  });
}
let storage;
function resultImage(name, className, width, height) {
  const image = document.createElement('img');
  image.src = `./assets/results/${name}.webp`;
  image.alt = '';
  image.width = width; image.height = height;
  image.className = className;
  image.loading = 'lazy';
  return image;
}
$('.results-table').setAttribute('role', 'table');
document.querySelectorAll('.results-table thead, .results-table tbody').forEach(group => group.setAttribute('role', 'rowgroup'));
document.querySelectorAll('.results-table thead tr').forEach(row => row.setAttribute('role', 'row'));
document.querySelectorAll('.results-table thead th').forEach(cell => cell.setAttribute('role', 'columnheader'));
document.querySelectorAll('.results-table tbody tr').forEach(row => {
  const [date, squad, ours, theirs, result] = row.children;
  const opponent = sandstormOpponents[date.textContent.trim()];
  if (!opponent) return;
  row.setAttribute('role', 'row');
  [...row.children].forEach((cell, index) => cell.setAttribute('role', index === 0 ? 'rowheader' : 'cell'));
  row.classList.add('match-result');
  row.classList.add(result.textContent === 'Win' ? 'match-win' : 'match-loss');
  const ourScore = document.createElement('strong');
  ourScore.textContent = ours.textContent;
  const ourName = document.createElement('span');
  ourName.className = 'result-guild'; ourName.textContent = '[PHNX] Rising Phoenix';
  ours.replaceChildren(resultImage('phnx', 'result-banner', 56, 64), ourScore, ourName);
  const opponentScore = document.createElement('strong');
  opponentScore.textContent = theirs.textContent;
  const opponentName = document.createElement('span');
  opponentName.className = 'result-guild'; opponentName.textContent = opponent.name;
  theirs.replaceChildren(resultImage(opponent.icon, 'result-banner', 56, 64), opponentScore, opponentName);
  squad.prepend(resultImage('versus', 'result-versus', 48, 56));
  const squadLabel = document.createElement('span');
  squadLabel.textContent = `PHNX Squad ${squad.lastChild.textContent}`;
  squad.replaceChildren(squad.firstChild, squadLabel);
  if (result.textContent === 'Win') result.prepend(resultImage('win', 'result-win-art', 86, 34));
});
try { storage = window.localStorage; } catch { /* Private browser settings can disable storage. */ }
const checklistNow = new Date();
const state = loadState(storage, checklistNow);
let activePriorities = prioritiesForDate(checklistNow);
let checklistSignature = '';
const day = serverClock(checklistNow).date;
if (state.day !== day) { state.completed = []; state.day = day; }
const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
$('#today').textContent = dateFormat.format(new Date());

const localClockFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const localDateFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
$('#local-clock-zone').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
const departureFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short' });
const serverDepartureFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Etc/GMT+2' });
function updateEventCountdown(node, now) {
  const start = new Date(node.dataset.eventCountdown);
  node.hidden = Boolean(node.closest('#calendar-view')) && serverClock(start).date !== serverClock(now).date;
  const passed = start < now;
  node.querySelector('.countdown-label').textContent = passed ? 'Check in-game' : 'Starts in';
  node.querySelector('.countdown-value').textContent = passed ? 'Start time passed' : countdownUntil(start, now);
  node.classList.toggle('is-past', passed);
}
function eventCountdownNode(datetime) {
  const node = document.createElement('span');
  node.className = 'event-countdown';
  node.dataset.eventCountdown = datetime;
  const label = document.createElement('span'); label.className = 'countdown-label';
  const value = document.createElement('strong'); value.className = 'countdown-value';
  node.append(label, value);
  updateEventCountdown(node, new Date());
  return node;
}
function renderLandingTimers(now) {
  for (const type of Object.keys(eventPages)) {
    const timer = eventLandingTimer(type, now);
    const intro = $(`#${type}-view > .ember-intro`);
    let panel = intro.querySelector('.event-landing-timer');
    if (!panel) {
      panel = document.createElement('div'); panel.className = 'event-landing-timer';
      intro.querySelector('h2').after(panel);
    }
    const key = JSON.stringify(timer);
    if (panel.dataset.key !== key) {
      panel.dataset.key = key;
      const label = document.createElement('p'); label.className = 'eyebrow'; label.textContent = timer.label;
      const value = document.createElement('strong'); value.className = 'landing-countdown-value';
      const times = document.createElement('p'); times.className = 'small';
      if (timer.datetime) {
        const time = document.createElement('time'); time.dateTime = timer.datetime;
        time.textContent = `${serverDepartureFormat.format(new Date(timer.datetime))} server · ${departureFormat.format(new Date(timer.datetime))} local`;
        times.append(time);
      } else value.textContent = 'Time to be confirmed';
      const note = document.createElement('p'); note.className = 'small muted'; note.textContent = timer.note;
      panel.replaceChildren(label, value, times, note);
    }
    if (timer.datetime) panel.querySelector('.landing-countdown-value').textContent = countdownUntil(new Date(timer.datetime), now);
  }
}
document.querySelectorAll('[data-local-time]').forEach(node => node.after(eventCountdownNode(node.dataset.localTime)));
const upcomingSection = document.createElement('section');
upcomingSection.className = 'upcoming-events';
upcomingSection.setAttribute('aria-labelledby', 'upcoming-title');
$('.hero').after(upcomingSection);
let upcomingKey = '';
function renderUpcomingEvents(now) {
  const events = upcomingTimedEvents(now);
  const key = events.map(event => event.datetime).join('|');
  if (key === upcomingKey) return;
  upcomingKey = key;
  const heading = document.createElement('h2'); heading.id = 'upcoming-title'; heading.textContent = 'Next up · guild countdowns';
  const cards = document.createElement('div'); cards.className = 'upcoming-grid';
  for (const event of events) {
    const card = document.createElement('article'); card.className = 'upcoming-card ember-panel';
    card.dataset.event = event.type;
    const title = document.createElement('h3');
    const link = document.createElement('a'); link.href = `#${event.type}`; link.textContent = event.title;
    title.append(link);
    const countdown = eventCountdownNode(event.datetime);
    const times = document.createElement('dl'); times.className = 'departure-times';
    for (const [label, text] of [['Server time', `${serverDepartureFormat.format(new Date(event.datetime))} · UTC−2`], ['Your local time', departureFormat.format(new Date(event.datetime))]]) {
      const group = document.createElement('div');
      const term = document.createElement('dt'); term.textContent = label;
      const description = document.createElement('dd');
      const time = document.createElement('time'); time.dateTime = event.datetime; time.textContent = text;
      description.append(time); group.append(term, description); times.append(group);
    }
    const source = document.createElement('p'); source.className = 'timing-source';
    source.textContent = event.type === 'ember-wars' ? '13:30 announced · server time (UTC−2).' : event.type === 'guild-hunt' ? 'In-game schedule · 3 November at 22:00 server.' : event.type === 'arctic-showdown' ? 'In-game practice schedule · battle 10:00–23:00 server time (UTC−2). Later rounds depend on qualification.' : 'Dannie’s 2 November guild bulletin.';
    card.append(title, countdown, times, source); cards.append(card);
  }
  const note = document.createElement('p'); note.className = 'small muted'; note.textContent = 'Based on supplied schedules, not a live game feed. Check the latest in-game bulletin for changes. Events without a start time remain in the calendar.';
  upcomingSection.replaceChildren(heading, cards, note);
}
// Both destinations use this exact renderer and the same eventBeginners record.
function beginnerCard(type) {
  const guide = eventBeginners[type];
  const card = document.createElement('article');
  card.className = 'ember-panel beginner-card'; card.dataset.event = type;
  const content = document.createElement('div'); content.className = 'beginner-content';
  const tag = document.createElement('p'); tag.className = 'eyebrow'; tag.textContent = `${guide.name} · NEW PLAYERS`;
  const heading = document.createElement('h3'); heading.textContent = guide.title;
  content.append(tag, heading);
  for (const [title, items] of [[guide.tipsTitle || 'Starter tips', guide.tips], [guide.rulesTitle || 'Guild guidance', guide.rules]]) {
    if (!items.length) continue;
    const label = document.createElement('h4'); label.textContent = title;
    const list = document.createElement('ul');
    for (const text of items) { const item = document.createElement('li'); item.textContent = text; list.append(item); }
    content.append(label, list);
  }
  const caution = document.createElement('p'); caution.className = 'small muted'; caution.textContent = guide.caution;
  content.append(caution); card.append(content);
  return card;
}
document.querySelectorAll('[data-beginner-event]').forEach(node => {
  node.replaceChildren(beginnerCard(node.dataset.beginnerEvent));
});
// One task catalog drives both the weekday checklist and the detailed Duel guide.
for (const [weekday, plan] of Object.entries(duelWeekdayPlan)) {
  const card = document.createElement('details'); card.className = 'ember-panel';
  card.dataset.duelDay = plan.day;
  const summary = document.createElement('summary');
  summary.textContent = `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekday]} · ${plan.theme}`;
  const list = document.createElement('ul');
  for (const [, title, detail] of plan.tasks) {
    const item = document.createElement('li');
    const label = document.createElement('strong'); label.textContent = title;
    item.append(label, ` — ${detail}`); list.append(item);
  }
  const advice = document.createElement('p'); advice.textContent = plan.advice;
  card.append(summary, list, advice);
  if (plan.source) {
    const source = document.createElement('p'); source.className = 'small muted'; source.textContent = plan.source;
    card.append(source);
  }
  $('#duel-days').append(card);
}
// Retire the old disclosure markup without copying its content or losing IDs.
// Every guide panel is now an ordinary visible section with a real heading.
for (const disclosure of document.querySelectorAll('details')) {
  const panel = document.createElement('section');
  for (const attribute of disclosure.attributes) if (attribute.name !== 'open') panel.setAttribute(attribute.name, attribute.value);
  const summary = disclosure.querySelector(':scope > summary');
  if (summary) {
    const heading = document.createElement('h3');
    if (summary.id) heading.id = summary.id;
    heading.append(...summary.childNodes); summary.replaceWith(heading);
  }
  panel.append(...disclosure.childNodes); disclosure.replaceWith(panel);
}
let beginnerKey = null;
function renderBeginnerEvents(now) {
  const events = upcomingBeginnerEvents(now);
  const key = events.map(event => `${event.type}:${event.datetime}`).join('|');
  if (key === beginnerKey) return;
  beginnerKey = key;
  const cards = events.map(event => {
    const card = beginnerCard(event.type);
    const timing = document.createElement('p'); timing.className = 'beginner-timing';
    const time = document.createElement('time'); time.dateTime = event.datetime;
    time.textContent = `${serverDepartureFormat.format(new Date(event.datetime))} server · ${departureFormat.format(new Date(event.datetime))} local`;
    timing.append('Next confirmed start: ', time);
    if (event.type === 'ember-wars') timing.append(' · Server time (UTC−2).');
    const link = document.createElement('a'); link.href = eventBeginners[event.type].href; link.textContent = `Full ${eventBeginners[event.type].name} guide`;
    styleActionLink(link);
    card.prepend(timing); card.append(link);
    return card;
  });
  $('#beginner-events').replaceChildren(...cards);
  $('#upcoming-beginners').hidden = cards.length === 0;
}
function updateLocalTimes(now) {
  document.querySelectorAll('[data-local-time]').forEach(node => {
    node.textContent = ` · ${departureFormat.format(new Date(node.dataset.localTime))} local`;
  });
  document.querySelectorAll('[data-local-schedule]').forEach(node => {
    const time = node.dataset.localSchedule;
    if (node.dataset.weekdays) {
      const next = nextWeeklyServerTime(time, node.dataset.weekdays.split(',').map(Number), now);
      node.textContent = ` Next occurrence: ${departureFormat.format(next)} local.`;
    } else {
      const date = serverClock(now).date;
      node.textContent = ` (${departureFormat.format(serverTimeOnDate(date, time))} local; conversion for server date ${date}, not a confirmed hunt)`;
    }
  });
}
let calendarDay = serverClock().date;
let calendarYear = Number(calendarDay.slice(0, 4));
let calendarMonth = Number(calendarDay.slice(5, 7)) - 1;
function renderCalendar() {
  const filter = $('#calendar-filter').value;
  const events = calendarEvents(calendarYear, calendarMonth).filter(event => filter === 'all' || event.type === filter);
  const first = new Date(Date.UTC(calendarYear, calendarMonth, 1));
  $('#calendar-month-title').textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first);
  $('#calendar-prev').disabled = calendarYear === 2000 && calendarMonth === 0;
  $('#calendar-next').disabled = calendarYear === 2100 && calendarMonth === 11;
  const cells = [];
  for (let index = 0; index < (first.getUTCDay() + 6) % 7; index++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-blank';
    blank.setAttribute('aria-hidden', 'true');
    cells.push(blank);
  }
  const days = new Date(Date.UTC(calendarYear, calendarMonth + 1, 0)).getUTCDate();
  for (let day = 1; day <= days; day++) {
    const date = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cell = document.createElement('section');
    cell.className = `calendar-day${date === calendarDay ? ' is-today' : ''}`;
    const heading = document.createElement('h3');
    const dateNode = document.createElement('time');
    dateNode.dateTime = date;
    dateNode.textContent = String(day);
    if (date === calendarDay) dateNode.setAttribute('aria-current', 'date');
    heading.append(dateNode);
    const accessibleDate = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
    cell.setAttribute('aria-label', accessibleDate);
    const mobileDay = document.createElement('span');
    mobileDay.className = 'calendar-mobile-date';
    mobileDay.textContent = accessibleDate;
    heading.append(mobileDay);
    cell.append(heading);
    const list = document.createElement('ul');
    const dayEvents = events.filter(event => event.date === date);
    for (const event of dayEvents) {
      const item = document.createElement('li');
      item.dataset.event = event.type;
      const image = document.createElement('img');
      image.src = `./assets/events/${event.type}.webp`;
      image.alt = '';
      image.width = image.height = 24;
      image.loading = 'lazy';
      const title = document.createElement('strong');
      title.textContent = event.title;
      const details = document.createElement('span');
      if (event.datetime) {
        const time = document.createElement('time');
        time.dateTime = event.datetime;
        time.textContent = `${event.time} server · ${departureFormat.format(new Date(event.datetime))} local`;
        details.append(time);
        if (event.date === calendarDay) details.append(eventCountdownNode(event.datetime));
      } else details.textContent = 'Time not supplied';
      item.append(image, title, details);
      list.append(item);
    }
    if (dayEvents.length) cell.append(list);
    else {
      const empty = document.createElement('p');
      empty.className = 'small muted';
      empty.textContent = 'No listed events';
      cell.append(empty);
    }
    cells.push(cell);
  }
  $('#calendar-days').replaceChildren(...cells);
  $('#calendar-summary').textContent = `${events.length} listed events. Only Airships repeat automatically; other events appear on confirmed dates only.`;
}
function changeMonth(delta) {
  const next = new Date(Date.UTC(calendarYear, calendarMonth + delta, 1));
  if (next.getUTCFullYear() < 2000 || next.getUTCFullYear() > 2100) return;
  calendarYear = next.getUTCFullYear(); calendarMonth = next.getUTCMonth(); renderCalendar();
}
$('#calendar-prev').addEventListener('click', () => changeMonth(-1));
$('#calendar-next').addEventListener('click', () => changeMonth(1));
$('#calendar-today').addEventListener('click', () => {
  calendarDay = serverClock().date;
  calendarYear = Number(calendarDay.slice(0, 4)); calendarMonth = Number(calendarDay.slice(5, 7)) - 1; renderCalendar();
});
$('#calendar-filter').addEventListener('change', renderCalendar);
renderCalendar();
function updateAirship(now) {
  const departure = nextAirship(now);
  document.querySelectorAll('[data-airship-countdown]').forEach(node => { node.textContent = countdownUntil(departure, now); });
  const calendarPanel = $('#calendar-view .airship-panel');
  const isToday = serverClock(departure).date === serverClock(now).date;
  calendarPanel.querySelector('[data-airship-countdown]').hidden = !isToday;
  calendarPanel.querySelector('.eyebrow').hidden = !isToday;
  document.querySelectorAll('[data-airship-server]').forEach(node => {
    node.textContent = `${serverDepartureFormat.format(departure)} · UTC−2`;
    node.dateTime = departure.toISOString();
  });
  document.querySelectorAll('[data-airship-local]').forEach(node => {
    node.textContent = departureFormat.format(departure);
    node.dateTime = departure.toISOString();
  });
}
function updateClocks() {
  const now = new Date();
  const clock = serverClock(now);
  $('#server-clock').textContent = clock.time;
  $('#server-clock').dateTime = clock.datetime;
  $('#server-clock-date').textContent = clock.date;
  $('#local-clock').textContent = localClockFormat.format(now);
  $('#local-clock').dateTime = now.toISOString();
  $('#local-clock-date').textContent = localDateFormat.format(now);
  $('#today').textContent = dateFormat.format(now);
  updateAirship(now);
  updateLocalTimes(now);
  renderUpcomingEvents(now);
  renderLandingTimers(now);
  renderSeasonGuidance(now);
  renderBeginnerEvents(now);
  if (state.day !== clock.date) {
    state.day = clock.date;
    state.completed = [];
    activePriorities = prioritiesForDate(now);
    save();
    renderChecklist();
    renderProgress();
  }
  if (clock.date !== calendarDay) { calendarDay = clock.date; renderCalendar(); }
  const signature = activePriorities.map(item => checklistStatus(item, state.completed, now)).join('|');
  if (signature !== checklistSignature) { renderChecklist(now); renderProgress(now); }
  document.querySelectorAll('[data-event-countdown]').forEach(node => updateEventCountdown(node, now));
}
updateClocks();
setInterval(updateClocks, 1000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateClocks();
});

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $('#toast').classList.remove('visible'), 4000);
}
function save() {
  try { storage.setItem('phnx-v1', JSON.stringify(state)); }
  catch { toast('Browser storage is unavailable. Changes will last for this visit only.'); }
}
function renderProgress(now = new Date()) {
  const count = state.completed.length;
  const failed = activePriorities.filter(item => checklistStatus(item, state.completed, now) === 'failed').length;
  $('#priority-count').textContent = `${count} / ${activePriorities.length}`;
  $('#progress-fill').style.width = `${count / activePriorities.length * 100}%`;
  $('#progress-text').textContent = failed ? `${count} done · ${failed} failed · ${activePriorities.length - count - failed} remaining. Expand “Done and failed” to review or correct an item.` : count === activePriorities.length ? 'All checked off. Looking out for the guild starts with you.' : 'Small steps make a big difference.';
}
function renderChecklist(now = new Date()) {
  const previous = $('#checklist-finished');
  const wasOpen = previous?.dataset.day === state.day && previous.open;
  const focusedValue = $('#priorities input:focus')?.value;
  const summaryFocused = document.activeElement === $('#checklist-finished summary');
  const statuses = new Map(activePriorities.map(item => [item.id, checklistStatus(item, state.completed, now)]));
  checklistSignature = [...statuses.values()].join('|');
  const weekday = new Date(`${state.day}T12:00:00Z`).getUTCDay();
  const plan = duelWeekdayPlan[weekday];
  const summary = document.createElement('p');
  summary.id = 'priority-day';
  summary.className = 'small muted';
  const weekdayName = new Intl.DateTimeFormat(undefined, { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${state.day}T12:00:00Z`));
  summary.textContent = `${weekdayName} · ${state.day} server date${plan ? ` · Duel Day ${plan.day}: ${plan.theme}` : ''}. Weekday preparation plan, not live game status. Confirm the active Duel theme before spending. Unchecked timed items fail after their scheduled start; this is checklist status, not an in-game result. Expand “Done and failed” to review or correct an item. Resets at server midnight.`;
  const nodes = [summary];
  const done = activePriorities.filter(item => statuses.get(item.id) === 'done');
  const failed = activePriorities.filter(item => statuses.get(item.id) === 'failed');
  const finished = document.createElement('details'); finished.id = 'checklist-finished';
  finished.dataset.day = state.day; finished.open = Boolean(wasOpen);
  const finishedSummary = document.createElement('summary'); finishedSummary.id = 'checklist-finished-title';
  finished.setAttribute('aria-labelledby', finishedSummary.id);
  finishedSummary.textContent = `Done and failed · ${done.length} done · ${failed.length} failed`;
  finished.append(finishedSummary);
  for (const [group, title, items] of [
    ['today', 'For today', activePriorities.filter(item => item.group === 'today' && statuses.get(item.id) === 'pending')],
    ['everyday', 'Everyday essentials', activePriorities.filter(item => item.group === 'everyday' && statuses.get(item.id) === 'pending')],
    ['finished', 'Done and failed', [...done, ...failed]],
  ]) {
    if (!items.length) continue;
    const heading = document.createElement('h3');
    heading.className = 'priority-group-title';
    heading.textContent = title;
    if (group !== 'finished') nodes.push(heading);
    for (const item of items) {
      const label = document.createElement('label');
      label.className = 'priority';
      label.dataset.status = statuses.get(item.id);
      if (item.eventType) label.dataset.event = item.eventType;
      const icon = document.createElement('span');
      icon.className = 'priority-icon'; icon.textContent = item.icon; icon.setAttribute('aria-hidden', 'true');
      const copy = document.createElement('span'); copy.className = 'priority-copy';
      const title = document.createElement('strong'); title.textContent = item.title; title.id = `priority-title-${item.id}`;
      const detail = document.createElement('span'); detail.textContent = item.detail; detail.id = `priority-detail-${item.id}`;
      const tag = document.createElement('span'); tag.className = 'priority-tag'; tag.textContent = item.tag;
      copy.append(title, tag, detail);
      if (statuses.get(item.id) !== 'pending') {
        const status = document.createElement('span'); status.className = 'checklist-status'; status.id = `priority-status-${item.id}`;
        status.textContent = statuses.get(item.id) === 'done' ? 'Done' : 'Failed · scheduled start passed without being checked off';
        copy.append(status);
      }
      if (item.datetime) {
        const time = document.createElement('time');
        time.dateTime = item.datetime;
        time.textContent = `${item.time} server · ${departureFormat.format(new Date(item.datetime))} local`;
        copy.append(time);
        if (statuses.get(item.id) === 'pending') copy.append(eventCountdownNode(item.datetime));
      } else if (item.group === 'today' && item.id.startsWith('event-')) {
        const unknown = document.createElement('span'); unknown.textContent = 'Start time not supplied; check in-game.'; copy.append(unknown);
      }
      const input = document.createElement('input'); input.type = 'checkbox'; input.value = item.id; input.checked = state.completed.includes(item.id);
      input.setAttribute('aria-labelledby', title.id);
      input.setAttribute('aria-describedby', `${detail.id}${statuses.get(item.id) === 'pending' ? '' : ` priority-status-${item.id}`}`);
      const checkmark = document.createElement('span'); checkmark.className = 'checkmark'; checkmark.setAttribute('aria-hidden', 'true');
      label.append(icon, copy, input, checkmark);
      if (group === 'finished') finished.append(label);
      else nodes.push(label);
    }
  }
  if (done.length + failed.length) nodes.push(finished);
  $('#priorities').replaceChildren(...nodes);
  if (focusedValue) {
    const moved = [...$('#priorities').querySelectorAll('input')].find(input => input.value === focusedValue);
    if (moved?.closest('#checklist-finished') && !finished.open) finishedSummary.focus();
    else moved?.focus();
  } else if (summaryFocused && finished.isConnected) finishedSummary.focus();
}
renderChecklist();
$('#priorities').addEventListener('change', event => {
  const { value, checked } = event.target;
  state.completed = checked ? [...new Set([...state.completed, value])] : state.completed.filter(id => id !== value);
  save(); renderChecklist(); renderProgress();
});
renderProgress();

function guideCards(items) {
  return items.map(g => `<button class="guide-card ${g.id}" data-guide="${g.id}"><span class="guide-category">${g.category} <span>→</span></span><span class="guide-art" aria-hidden="true">${g.icon}</span><strong>${g.title}</strong><span class="guide-description">${g.description}</span><span class="guide-bottom"><span class="card-action">Open checklist ${icon('arrow').outerHTML}</span><span>4-STEP CHECKLIST · UNVERIFIED</span></span></button>`).join('');
}
function renderSeasonGuidance(now) {
  const season = preparationSeason(now);
  const reference = referenceSeason(now);
  const key = JSON.stringify({ season, reference });
  if (seasonKey === key) return;
  seasonKey = key;
  document.querySelectorAll('[data-season-link]').forEach(link => { link.hidden = !season; });
  $('#season-preview').hidden = !season;
  $('#season-guides').hidden = !reference;
  $('#season-unavailable').hidden = Boolean(reference);
  $('#season-context').textContent = season ? `${season.name} · starts ${serverDepartureFormat.format(new Date(season.startsAt))} server / ${departureFormat.format(new Date(season.startsAt))} local. Starter suggestions, not verified mechanics; check current in-game rules and costs.` : reference ? `${reference.name} · Current season reference. You can read these starter tips anytime; check current in-game rules and costs.` : 'Season starter guidance appears during the seven days before a confirmed season start.';
  $('#guide-search').value = '';
  const items = reference ? guides.filter(guide => reference.guideIds.includes(guide.id)) : [];
  $('#guide-list').innerHTML = guideCards(items);
  $('#guide-preview').innerHTML = season ? guideCards(items) : '';
  $('#no-guides').hidden = true;
  const dialog = $('#guide-dialog');
  if (dialog.open && !availableGuides(now).some(guide => guide.id === dialog.dataset.guideId) && !(!$('#seasons-view').hidden && reference?.guideIds.includes(dialog.dataset.guideId))) dialog.close();
  if ($('#site-search').value.trim()) $('#site-search').dispatchEvent(new Event('input'));
}
$('#ember-sections').replaceChildren(...emberWars.sections.map(section => {
  const article = document.createElement('article');
  article.className = 'ember-panel';
  const heading = document.createElement('h3');
  heading.textContent = section.title;
  const list = document.createElement('ul');
  list.replaceChildren(...section.steps.map(step => {
    const item = document.createElement('li');
    item.textContent = step;
    return item;
  }));
  article.append(heading, list);
  return article;
}));
$('#ember-resources').replaceChildren(...emberWars.resources.map(resource => {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = resource.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = `${resource.title} ↗`;
  const source = document.createElement('span');
  source.textContent = resource.source;
  item.append(link, source);
  return item;
}));
$('#playbook-list').innerHTML = guideCards(guides.filter(guide => !seasons.some(season => season.guideIds.includes(guide.id))));
// External resources stay alongside their subject, with destination and tab behavior
// visible on every link. Never embed or automatically fetch third-party resources.
for (const link of document.querySelectorAll('a[href^="https://"]')) {
  link.classList.add('external-link');
  const label = document.createElement('span'); label.className = 'external-title';
  label.textContent = link.textContent.replace(/\s*↗\s*$/, '');
  const context = document.createElement('small'); context.className = 'external-destination';
  context.textContent = `${new URL(link.href).hostname.replace(/^www\./, '')} · opens in a new tab`;
  link.target = '_blank'; link.rel = 'noopener noreferrer';
  link.replaceChildren(icon('external'), label);
  link.after(context);
}
for (const [page, name] of Object.entries({ dashboard: 'home', 'new-to-game': 'checklist', seasons: 'book', calendar: 'calendar', playbooks: 'book', community: 'officers' })) {
  const marker = $(`nav a[data-page="${page}"] > span`);
  if (marker) marker.replaceWith(icon(name));
}
// One action-button presentation for standalone links inside panels. Real inline
// prose links and links outside panels remain text; navigation remains an anchor.
function styleActionLink(link) {
  const external = link.classList.contains('external-link');
  const label = document.createElement('span'); label.className = 'action-label';
  label.textContent = link.textContent.replace(/\s*[↗→]\s*$/, '').trim();
  link.classList.remove('text-link', 'light'); link.classList.add('button', 'primary');
  link.replaceChildren(label, icon(external ? 'external' : 'arrow'));
}
const actionPanels = '.ember-intro,.ember-panel,.notice-panel,.ember-callout,.beginner-card';
for (const link of document.querySelectorAll('.view a.text-link,.view a.button,.view a.external-link')) {
  const panel = link.closest(actionPanels);
  const paragraph = link.closest('p');
  // A paragraph containing only links/separators is an action row, not prose.
  const actionRow = paragraph && [...paragraph.childNodes].every(node => node.nodeType === Node.TEXT_NODE ? /^[\s·]*$/.test(node.textContent) : node.matches('a'));
  if (!link.matches('.button') && (!panel || (paragraph && !actionRow))) continue;
  styleActionLink(link);
  if (actionRow) {
    paragraph.classList.add('card-actions');
    [...paragraph.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
  }
}
// Whole-card links/buttons keep a single interactive element. Their footer action
// is a styled span, never an invalid nested button or second focus stop.
for (const footer of document.querySelectorAll('a.guide-card .guide-bottom')) {
  const action = document.createElement('span'); action.className = 'card-action';
  action.append('Open playbook', icon('arrow'));
  footer.replaceChildren(action);
}
for (const card of document.querySelectorAll('#playbooks-view a.guide-card[data-event]')) {
  const image = document.createElement('img'); image.className = 'playbook-art'; image.alt = '';
  image.width = image.height = 44; image.src = `./assets/events/${card.dataset.event}.webp`;
  card.prepend(image);
}
// Internal navigation uses a straight arrow, reserving the out-of-site mark for resources.
const internalText = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (internalText.nextNode()) {
  const node = internalText.currentNode;
  if (node.parentElement.closest('a[href^="#"], [data-guide]')) node.textContent = node.textContent.replaceAll('↗', '→');
}
$('#guide-search').addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  const season = referenceSeason();
  const filtered = guides.filter(g => season?.guideIds.includes(g.id) && `${g.category} ${g.title} ${g.description} ${g.steps.join(' ')}`.toLowerCase().includes(query));
  $('#guide-list').innerHTML = guideCards(filtered);
  $('#no-guides').hidden = filtered.length > 0;
});
document.addEventListener('click', event => {
  const guideButton = event.target.closest('[data-guide]');
  if (guideButton) {
    const manualReference = guideButton.closest('#seasons-view:not([hidden])') && referenceSeason()?.guideIds.includes(guideButton.dataset.guide);
    const guide = (manualReference ? guides : availableGuides()).find(g => g.id === guideButton.dataset.guide);
    if (!guide) return;
    $('#guide-dialog').dataset.guideId = guide.id;
    $('#dialog-title').textContent = guide.title;
    $('#dialog-description').textContent = guide.description;
    $('#dialog-steps').replaceChildren(...guide.steps.map(step => { const li = document.createElement('li'); li.textContent = step; return li; }));
    $('#guide-dialog').showModal();
  }
});
$('#close-dialog').onclick = $('#done-dialog').onclick = () => $('#guide-dialog').close();
const pages = {
  dashboard: ['Overview', 'From the frost, we rise.', 'One guild. One fire. A rising phoenix in a frozen world.'],
  'new-to-game': ['New to the game', 'A strong start, together.', 'Your daily checklist, everyday essentials, and starter guides for life with PHNX.'],
  seasons: ['Seasons', 'Ready for a new chapter.', 'Starter guidance for the seven days before a confirmed season start.'],
  calendar: ['Guild calendar', 'Better, when we’re together.', 'The guild schedule, with your next Airship departure in server and local time.'],
  playbooks: ['Guild playbooks', 'One guild. One direction.', 'Simple preparation for coordinated guild play.'],
  'guild-duel': ['Guild Duel', 'PHNX, week after week.', 'A home for future Duel results and the archived matchup snapshot.'],
  'guild-duel-players': ['Guild Duel · Players', 'Save for the right day.', 'Six themed days, resource planning, rewards and Raid safety.'],
  'guild-duel-officers': ['Guild Duel · Officers & callers', 'Raid together. Defend together.', 'Officer raid coordination, defence coverage and weekly priorities.'],
  'ember-wars': ['Ember Wars', 'One guild. One fire.', 'A beginner’s guide to preparing, coordinating, and helping PHNX.'],
  'arctic-showdown': ['Arctic Showdown', 'Every attack is a team decision.', 'PHNX target guidance, a preparation checklist, and resources for Arctic Showdown.'],
  'sandstorm-scuffle': ['Sandstorm Scuffle', 'PHNX in the sandstorm.', 'Our latest recorded matches, scores and victories.'],
  'sandstorm-players': ['Sandstorm · Players', 'Play your part. Hold your ground.', 'Your match checklist, signup, personal rewards and player guidance.'],
  'sandstorm-officers': ['Sandstorm · Officers & callers', 'Call the play. Lead together.', 'Roster planning, structure priorities and scoring reference.'],
  community: ['Community guidelines', 'Respect. Show up. Rise together.', 'PHNX guild expectations, activity rules, accountability, and server #268 policy.'],
};
for (const [type, event] of Object.entries(eventPages)) {
  pages[type] ||= [event.name, 'One guild. One direction.', 'Event timing, overview and recorded PHNX updates.'];
  pages[event.players] ||= [`${event.name} · Players`, 'Show up ready.', 'Player preparation and guild guidance.'];
  pages[event.officers] ||= [`${event.name} · Officers & callers`, 'Lead together.', 'Organizer coordination and caller guidance.'];
}
function navigate() {
  const requested = location.hash.slice(1) === 'guides' ? 'seasons' : location.hash.slice(1);
  const page = Object.hasOwn(pages, requested) ? requested : 'dashboard';
  document.querySelectorAll('.view').forEach(view => { view.hidden = view.id !== `${page}-view`; });
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  for (const [type, event] of Object.entries(eventPages)) {
    const active = [type, event.players, event.officers].includes(page);
    const parent = $(`nav a[data-page="${type}"]`);
    document.getElementById(parent.getAttribute('aria-controls')).hidden = !active;
    parent.setAttribute('aria-expanded', String(active));
  }
  const [name, heading, subheading] = pages[page];
  $('#page-name').textContent = name; $('#heading').textContent = heading; $('#subheading').textContent = subheading;
  document.title = `${name} · Rising Phoenix · PHNX`;
}
window.addEventListener('hashchange', navigate);
navigate();

// Search only local published content, including views that are currently hidden.
// Read on demand so calendar/checklist results reflect the currently rendered day.
$('#site-search').addEventListener('input', event => {
  const query = event.target.value;
  const entries = Object.entries(pages).filter(([id]) => id !== 'seasons' || preparationSeason()).map(([id, [title, heading, description]]) => {
    const content = $(`#${id}-view`).cloneNode(true);
    content.querySelectorAll('.event-countdown, .event-landing-timer, .airship-countdown, .upcoming-events, [data-guide], input, select, button').forEach(node => node.remove());
    return { id, title, text: `${heading} ${description} ${content.textContent}`.replace(/\s+/g, ' ').trim() };
  });
  entries.push(...availableGuides().map(guide => ({ id: guide.id, title: guide.title, text: `${guide.category} ${guide.description} ${guide.steps.join(' ')}`, guide: true })));
  const matches = searchEntries(entries, query);
  $('#site-search-feedback').hidden = !query.trim();
  const results = $('#site-search-results');
  results.replaceChildren(...matches.map(entry => {
    const item = document.createElement('li');
    const link = document.createElement(entry.guide ? 'button' : 'a');
    link.textContent = entry.title;
    if (entry.guide) {
      link.type = 'button';
      link.dataset.guide = entry.id;
    } else {
      link.href = `#${entry.id}`;
      link.addEventListener('click', () => {
        location.hash = entry.id;
        navigate();
        $('#site-search-feedback').hidden = true;
        $('#main').focus();
      });
    }
    const snippet = document.createElement('p');
    snippet.textContent = `${entry.guide ? 'Guide' : 'Page'} · ${entry.snippet}`;
    item.append(link, snippet);
    return item;
  }));
  results.hidden = matches.length === 0;
  $('#site-search-status').textContent = query.trim() ? (matches.length ? `${matches.length} results. Choose a page or guide below.` : 'No matches. Try an event name, “shield”, “mount” or “rules”.') : '';
});
$('#site-search').addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.target.value = '';
    event.target.dispatchEvent(new Event('input'));
  }
});
$('#site-search').addEventListener('focus', () => {
  $('#site-search-feedback').hidden = !$('#site-search').value.trim();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-search')) $('#site-search-feedback').hidden = true;
});
