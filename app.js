// app.js
const $ = (sel) => document.querySelector(sel);

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function pad2(n){ return String(n).padStart(2, "0"); }

function isoFromParts(y,m,d){ // m is 0-11
  return `${y}-${pad2(m+1)}-${pad2(d)}`;
}

function toISODate(dateObj){
  return isoFromParts(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
}

function dateAtNoon(y,m,d){
  return new Date(y, m, d, 12, 0, 0);
}

function startOfMonth(y,m){ return new Date(y, m, 1); }
function endOfMonth(y,m){ return new Date(y, m + 1, 0); }

function buildOneOffMap(){
  const map = new Map();
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

  // Recurring rules
  const dow = d.getDay();
  (window.RULES || []).forEach(rule => {
    if(rule?.dow === dow){
      out.push({
        date: iso,
        type: rule.type || "life",
        emoji: rule.emoji || "",
        title: rule.title || "—",
        recurring: true
      });
    }
  });

  // One-off events
  const ones = oneOffMap.get(iso) || [];
  ones.forEach(e => out.push({ ...e, recurring:false }));

  // Sort: deadlines first
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

// ----- Notes storage (per device) -----
const NOTES_KEY = "planner_notes_v1";
function loadAllNotes(){
  try{
    return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
  }catch{
    return {};
  }
}
function saveAllNotes(obj){
  localStorage.setItem(NOTES_KEY, JSON.stringify(obj));
}

function formatSideLabel(iso){
  // iso: YYYY-MM-DD
  const [y,mm,dd] = iso.split("-").map(Number);
  const d = new Date(y, mm-1, dd, 12, 0, 0);
  return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} (${DOW[d.getDay()]})`;
}

// ----- Calendar state -----
let viewYear = 2026;
let viewMonth = 0; // January
let selectedISO = null;

function renderMonth(y, m){
  const grid = $("#grid");
  const monthLabel = $("#monthLabel");
  const oneOffMap = buildOneOffMap();

  monthLabel.textContent = `${monthNames[m]} ${y}`;
  grid.innerHTML = "";

  const first = startOfMonth(y, m);
  const last = endOfMonth(y, m);

  const leading = first.getDay(); // 0=Sun
  const totalCells = 42; // 6-week grid
  const start = dateAtNoon(y, m, 1 - leading);

  // today ISO (based on device clock)
  const todayISO = toISODate(new Date());

  for(let i=0; i<totalCells; i++){
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const inMonth = d.getMonth() === m;
    const iso = toISODate(d);

    const cell = document.createElement("div");
    cell.className = "cell" + (inMonth ? "" : " muted");

    if(iso === todayISO) cell.classList.add("today");
    if(selectedISO && iso === selectedISO) cell.classList.add("selected");

    const dateRow = document.createElement("div");
    dateRow.className = "dateRow";

    const dayNum = document.createElement("div");
    dayNum.className = "dayNum";
    dayNum.textContent = d.getDate();

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = inMonth ? "" : monthNames[d.getMonth()].slice(0,3);

    dateRow.appendChild(dayNum);
    dateRow.appendChild(badge);

    const items = document.createElement("div");
    items.className = "items";

    const evs = eventsForDate(d, oneOffMap);
    evs.forEach(ev => {
      const div = document.createElement("div");
      div.className = `item ${ev.type || "life"}`;
      div.textContent = `${ev.emoji ? ev.emoji + " " : ""}${ev.title}`;
      items.appendChild(div);
    });

    cell.appendChild(dateRow);
    cell.appendChild(items);

    // Click to select day + open notes
    cell.addEventListener("click", () => {
      selectDay(iso);
      // re-render to show selected outline
      renderMonth(viewYear, viewMonth);
    });

    grid.appendChild(cell);
  }
}

function selectDay(iso){
  selectedISO = iso;
  const label = $("#selectedDateLabel");
  const notesBox = $("#notesBox");

  label.textContent = formatSideLabel(iso);

  const all = loadAllNotes();
  notesBox.value = all[iso] || "";

  notesBox.focus();
}

// Auto-save notes as you type
function bindNotes(){
  const notesBox = $("#notesBox");
  notesBox.addEventListener("input", () => {
    if(!selectedISO) return;
    const all = loadAllNotes();
    all[selectedISO] = notesBox.value;
    saveAllNotes(all);
  });

  $("#clearNotesBtn").addEventListener("click", () => {
    if(!selectedISO) return;
    const all = loadAllNotes();
    delete all[selectedISO];
    saveAllNotes(all);
    notesBox.value = "";
  });
}

function init(){
  // Buttons
  $("#prevBtn").addEventListener("click", () => {
    viewMonth -= 1;
    if(viewMonth < 0){ viewMonth = 11; viewYear -= 1; }
    renderMonth(viewYear, viewMonth);
  });

  $("#nextBtn").addEventListener("click", () => {
    viewMonth += 1;
    if(viewMonth > 11){ viewMonth = 0; viewYear += 1; }
    renderMonth(viewYear, viewMonth);
  });

  $("#printBtn").addEventListener("click", () => {
    window.print();
  });

  bindNotes();

  // Default view: January 2026
  renderMonth(viewYear, viewMonth);

  // Default select "today" if it's within the view month; otherwise select Jan 1
  const today = new Date();
  const todayISO = toISODate(today);
  const inView = (today.getFullYear() === viewYear && today.getMonth() === viewMonth);
  selectDay(inView ? todayISO : isoFromParts(viewYear, viewMonth, 1));
}

init();
