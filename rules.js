// rules.js
// dow: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
window.RULES = [
  { dow: 0, type: "meal",  emoji: "🍱", title: "Meal prep" },
  { dow: 2, type: "meal",  emoji: "🍱", title: "Meal prep" },

  { dow: 1, type: "studio", emoji: "🎧", title: "Whittier studio" },
  { dow: 3, type: "studio", emoji: "🎧", title: "Whittier studio (day off)" },

  { dow: 4, type: "admin", emoji: "🖥️", title: "Verre admin catch-up" },
  { dow: 5, type: "admin", emoji: "🖥️", title: "Verre admin catch-up" },

  { dow: 6, type: "life", emoji: "🎤", title: "Live rehearsal" },

  // Optional scene nights
  { dow: 4, type: "life", emoji: "🌙", title: "Club night (optional)" },
  { dow: 0, type: "life", emoji: "🌙", title: "Club night (optional)" },
];
