// app.js
const $ = (sel) => document.querySelector(sel);

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function pad2(n){ return String(n).padStart(2, "0"); }

function toISODate(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

function startOfMonth(year, monthIndex){
  return new Date(year, monthIndex, 1);
}

function endOfMonth(year, monthIndex){
  return new Date(year, monthIndex + 1, 0);
}

// Create a date at local noon to avoid timezone edge weirdness
function dateAtNoon(year, monthIndex, day){
  return new Date(year, monthIndex, day, 12, 0, 0);
}

function buildMap(){
  const map = new Map();

  // One-off events by date
  (window.EVENTS || []).forEach(ev => {
    if(!ev?.date) return;
    if(!map.has(ev.date)) map.set(ev.date, []);
    map.get(ev.date).push(ev);
  });

  return map;
}

function eventsForDate(d, oneOffMap){
  const iso = toISODate(d);
  const out = [];

  // Add recurring rules
  const dow = d.getDay(); // 0=Sun
  (window.RULES || []).forEach(rule => {
    if(rule?.dow === dow){
      out.push({ date: iso, type: rule.type || "life", title: rule.title || "—", recurring:true });
    }
  });

  // Add one-off events
  const ones = oneOffMap.get(iso) || [];
  ones.forEach(e => out.push({ ...e, recurring:false }));

  // Small sort: deadlines first, then studio/admin/meal/life
  const rank = (t) => ({
    deadline: 1,
    studio: 2,
    admin: 3,
    meal: 4,
    life: 5
  }[t] ?? 9);

  out.sort((a,b) => rank(a.type) - rank(b.type));
  return out;
}

function renderMonth(year, monthIndex){
  const grid = $("#grid");
  const label = $("#monthLabel");
  const oneOffMap = buildMap();

  label.textContent = `${monthNames[monthIndex]} ${year}`;
  grid.innerHTML = "";

  const first = startOfMonth(year, monthIndex);
  const last = endOfMonth(year, monthIndex);

  // We show a Sun-Sat grid. Determine how many "leading" days from previous month.
  const leading = first.getDay(); // 0=Sun, 4=Thu, etc.

  // Total cells: 6 weeks = 42 is standard and simple
  const totalCells = 42;

  // Starting date is first minus leading days
  const start = dateAtNoon(year, monthIndex, 1 - leading);

  for(let i=0; i<totalCells; i++){
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const inMonth = d.getMonth() === monthIndex;
    const iso = toISODate(d);

    const cell = document.createElement("div");
    cell.className = "cell" + (inMonth ? "" : " muted");

    const dateRow = document.createElement("div");
    dateRow.className = "dateRow";

    const dayNum = document.createElement("div");
    dayNum.className = "dayNum";
    dayNum.textContent = d.getDate();

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = inMonth ? "" : `${monthNames[d.getMonth()].slice(0,3)}`;

    dateRow.appendChild(dayNum);
    dateRow.appendChild(badge);

    const items = document.createElement("div");
    items.className = "items";

    const evs = eventsForDate(d, oneOffMap);
    evs.forEach(ev => {
      const div = document.createElement("div");
      div.className = `item ${ev.type || "life"}`;
      div.textContent = ev.title;
      items.appendChild(div);
    });

    cell.appendChild(dateRow);
    cell.appendChild(items);

    // Optional: click-to-copy ISO date (nice for adding events quickly)
    cell.title = iso;

    grid.appendChild(cell);
  }
}

function init(){
  // Default to Jan 2026 (your request)
  let viewYear = 2026;
  let viewMonth = 0; // January

  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");

  const rerender = () => renderMonth(viewYear, viewMonth);

  prevBtn.addEventListener("click", () => {
    viewMonth -= 1;
    if(viewMonth < 0){ viewMonth = 11; viewYear -= 1; }
    rerender();
  });

  nextBtn.addEventListener("click", () => {
    viewMonth += 1;
    if(viewMonth > 11){ viewMonth = 0; viewYear += 1; }
    rerender();
  });

  rerender();
}

init();
