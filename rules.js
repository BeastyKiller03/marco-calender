// rules.js
// dow: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
window.RULES = [
  // Meal prep
  { dow: 0, type: "meal",  title: "Meal prep (Sun)" },
  { dow: 2, type: "meal",  title: "Meal prep (Tue)" },

  // Studio days
  { dow: 1, type: "studio", title: "Whittier studio" },
  { dow: 3, type: "studio", title: "Whittier studio (day off)" },

  // Verre admin catch-up
  { dow: 4, type: "admin", title: "Verre admin catch-up" },
  { dow: 5, type: "admin", title: "Verre admin catch-up" },

  // Rehearsal day (you can change this to any day)
  { dow: 2, type: "life", title: "Live rehearsal (short run-through)" },

  // Optional: club planning / scene nights (you mentioned Thu + Sun)
  { dow: 4, type: "life", title: "Club night / scene research (optional)" },
  { dow: 0, type: "life", title: "Club night / scene research (optional)" },
];
