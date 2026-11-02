import { priorities, guides, loadState, emberWars, serverClock, nextAirship, countdownUntil, calendarEvents, sandstormOpponents } from './lib.js';

const $ = selector => document.querySelector(selector);
// Decorative artwork: the adjacent headings already identify each event.
const eventArtwork = [
  ['airship', '.airship-panel, #guild-schedule article:first-child'],
  ['guild-hunt', '.notice-panel, #guild-schedule article:last-child'],
  ['ember-wars', '#ember-wars-view .ember-intro, [aria-labelledby="ember-callout-title"]'],
  ['arctic-showdown', '#arctic-showdown-view .ember-intro'],
  ['sandstorm-scuffle', '#sandstorm-scuffle-view .ember-intro, [aria-labelledby="sandstorm-callout-title"]'],
  ['guild-duel', '#guild-duel-view .ember-intro'],
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
const state = loadState(storage);
const day = new Date().toLocaleDateString('en-CA');
if (state.day !== day) { state.completed = []; state.day = day; }
const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
$('#today').textContent = dateFormat.format(new Date());

const localClockFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const localDateFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
$('#local-clock-zone').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
const departureFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short' });
const serverDepartureFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Etc/GMT+2' });
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
  if (clock.date !== calendarDay) { calendarDay = clock.date; renderCalendar(); }
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
function renderProgress() {
  const count = state.completed.length;
  $('#priority-count').textContent = `${count} / ${priorities.length}`;
  $('#progress-fill').style.width = `${count / priorities.length * 100}%`;
  $('#progress-text').textContent = count === priorities.length ? 'All checked off. Looking out for the guild starts with you.' : 'Small steps make a big difference.';
}
$('#priorities').innerHTML = priorities.map(p => `<label class="priority"><span class="priority-icon">${p.icon}</span><span class="priority-copy"><strong>${p.title}</strong><span>${p.detail}</span></span><input type="checkbox" value="${p.id}" ${state.completed.includes(p.id) ? 'checked' : ''}><span class="checkmark" aria-hidden="true"></span></label>`).join('');
$('#priorities').addEventListener('change', event => {
  const { value, checked } = event.target;
  state.completed = checked ? [...new Set([...state.completed, value])] : state.completed.filter(id => id !== value);
  save(); renderProgress();
});
renderProgress();

function guideCards(items) {
  return items.map(g => `<button class="guide-card ${g.id}" data-guide="${g.id}"><span class="guide-category">${g.category} <span>↗</span></span><span class="guide-art" aria-hidden="true">${g.icon}</span><strong>${g.title}</strong><span class="guide-description">${g.description}</span><span class="guide-bottom">4-STEP CHECKLIST <span>UNVERIFIED</span></span></button>`).join('');
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
  source.textContent = `${resource.source} · opens in a new tab`;
  item.append(link, source);
  return item;
}));
$('#guide-preview').innerHTML = guideCards(guides);
$('#guide-list').innerHTML = guideCards(guides);
$('#playbook-list').innerHTML = guideCards(guides.filter(g => g.id !== 'cold'));
$('#guide-search').addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  const filtered = guides.filter(g => `${g.category} ${g.title} ${g.description} ${g.steps.join(' ')}`.toLowerCase().includes(query));
  $('#guide-list').innerHTML = guideCards(filtered);
  $('#no-guides').hidden = filtered.length > 0;
});
document.addEventListener('click', event => {
  const guideButton = event.target.closest('[data-guide]');
  if (guideButton) {
    const guide = guides.find(g => g.id === guideButton.dataset.guide);
    $('#dialog-title').textContent = guide.title;
    $('#dialog-description').textContent = guide.description;
    $('#dialog-steps').replaceChildren(...guide.steps.map(step => { const li = document.createElement('li'); li.textContent = step; return li; }));
    $('#guide-dialog').showModal();
  }
});
$('#close-dialog').onclick = $('#done-dialog').onclick = () => $('#guide-dialog').close();
const pages = {
  dashboard: ['Overview', 'From the frost, we rise.', 'One guild. One fire. A rising phoenix in a frozen world.'],
  guides: ['Survival guides', 'Knowledge keeps us warm.', 'Practical starter checklists for the road ahead.'],
  calendar: ['Guild calendar', 'Better, when we’re together.', 'The guild schedule, with your next Airship departure in server and local time.'],
  playbooks: ['Guild playbooks', 'One guild. One direction.', 'Simple preparation for coordinated guild play.'],
  'guild-duel': ['Guild Duel', 'Prepare today. Score together.', 'PHNX Day 1 missions, guild reminders, and the reported mount-feed technique.'],
  'ember-wars': ['Ember Wars', 'One guild. One fire.', 'A beginner’s guide to preparing, coordinating, and helping PHNX.'],
  'arctic-showdown': ['Arctic Showdown', 'Every attack is a team decision.', 'PHNX target guidance, a preparation checklist, and resources for Arctic Showdown.'],
  'sandstorm-scuffle': ['Sandstorm Scuffle', 'Rise through the sandstorm.', 'The confirmed event window, signup information, and recorded PHNX results.'],
  community: ['Community guidelines', 'Respect. Show up. Rise together.', 'PHNX guild expectations, activity rules, accountability, and server #268 policy.'],
};
function navigate() {
  const page = Object.hasOwn(pages, location.hash.slice(1)) ? location.hash.slice(1) : 'dashboard';
  document.querySelectorAll('.view').forEach(view => { view.hidden = view.id !== `${page}-view`; });
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const [name, heading, subheading] = pages[page];
  $('#page-name').textContent = name; $('#heading').textContent = heading; $('#subheading').textContent = subheading;
  document.title = `${name} · Rising Phoenix · PHNX`;
}
window.addEventListener('hashchange', navigate);
navigate();
