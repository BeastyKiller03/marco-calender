const CAL = document.getElementById("calendar");

const month = 0; // 0 = January
const year = 2026;

const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function iso(d){
  const pad = n => String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function eventsFor(dayISO){
  return (window.EVENTS || []).filter(e => e.date === dayISO);
}

function build(){
  CAL.innerHTML = "";

  // Day-of-week headers
  for (const label of DOW){
    const el = document.createElement("div");
    el.className = "dow";
    el.textContent = label;
    CAL.appendChild(el);
  }

  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);

  // Leading blanks
  for (let i=0; i<first.getDay(); i++){
    const blank = document.createElement("div");
    blank.className = "day out";
    blank.innerHTML = `<div class="date"><div class="num"></div><div class="small"></div></div>`;
    CAL.appendChild(blank);
  }

  // Days in month
  for (let day=1; day<=last.getDate(); day++){
    const d = new Date(year, month, day);
    const dayISO = iso(d);
    const items = eventsFor(dayISO);

    const box = document.createElement("div");
    box.className = "day";

    const itemsHTML = items.map(it =>
      `<div class="item ${it.type}">${it.title}</div>`
    ).join("");

    box.innerHTML = `
      <div class="date">
        <div class="num">${day}</div>
        <div class="small">${DOW[d.getDay()]}</div>
      </div>
      <div class="items">
        ${itemsHTML || `<div class="small">—</div>`}
      </div>
    `;

    CAL.appendChild(box);
  }
}

build();
