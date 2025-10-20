// EDAD-601 Random Selector Widget (high-contrast version)
(function(){
  const STORAGE_KEY = "edad601_roster_remaining_v1";

  const FULL_ROSTER = [
    { name: "Faria", role: "TA" },
    { name: "Kacy", role: "Student" },
    { name: "Ethan", role: "Student" },
    { name: "Jason", role: "Student" },
    { name: "Taylor D", role: "Student" },
    { name: "Walid", role: "Student" },
    { name: "Jene", role: "Student" },
    { name: "Patricia", role: "Student" },
    { name: "Taylor H", role: "Student" },
    { name: "Pamela", role: "Student" },
    { name: "Mengxiang", role: "Student" },
    { name: "Masha", role: "Student" },
    { name: "Yoon", role: "Student" },
    { name: "Kayla", role: "Student" },
    { name: "Sandra", role: "Student" },
    { name: "Savannah", role: "Student" },
    { name: "Simon", role: "Student" },
    { name: "Becca", role: "Student" },
    { name: "Christine", role: "Teacher" },
    { name: "Jantsen", role: "Student" },
    { name: "Alfredo", role: "Student" },
    { name: "Winn", role: "Student" }
  ];


  function getRemaining(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...FULL_ROSTER];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [...FULL_ROSTER];
      return parsed.filter(x => x && typeof x.name === "string");
    } catch(e){
      return [...FULL_ROSTER];
    }
  }

  function setRemaining(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

  function reset(){
    const fresh = [...FULL_ROSTER];
    setRemaining(fresh);
    return fresh;
  }

  function drawOne(){
    const rem = getRemaining();
    if (rem.length === 0) return null;
    const idx = Math.floor(Math.random() * rem.length);
    const picked = rem.splice(idx, 1)[0];
    setRemaining(rem);
    return { picked, remaining: rem };
  }

  // Render widget if container exists
  function renderWidget(){
    const el = document.querySelector(".edad-selector-widget");
    if (!el) return;
    el.innerHTML = `
      <div class="edad-card" role="group" aria-label="EDAD-601 Random Selector">
        <div class="edad-header">
          <strong>EDAD-601 Random Selector</strong>
          <span class="edad-pill" aria-hidden="true">no replacement</span>
        </div>
        <div class="edad-row">
          <button class="edad-btn" id="edad-pick" aria-label="Pick a random person">Pick someone</button>
          <button class="edad-btn ghost" id="edad-reset" aria-label="Reset roster">Reset roster</button>
        </div>
        <div class="edad-output" id="edad-output" aria-live="polite">Press "Pick someone" to choose.</div>
        <div class="edad-meta" id="edad-meta"></div>
      </div>
      <style>
        /* Card + layout */
        .edad-card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin:12px 0}
        .edad-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
        .edad-pill{margin-left:auto;font-size:12px;padding:2px 8px;border-radius:999px;background:#eef2ff;border:1px solid #c7d2fe}

        .edad-row{display:flex;gap:10px;margin:8px 0;flex-wrap:wrap}
        .edad-output{font-size:1.1rem;margin-top:8px;color:#111827;font-weight:600}
        .edad-meta{font-size:0.95rem;color:#111827;margin-top:4px;font-weight:500}

        /* High-contrast buttons */
        .edad-btn{
          cursor:pointer;
          border:1px solid #1f2937;    /* gray-800 */
          border-radius:8px;
          padding:8px 12px;
          background:#1f2937;          /* gray-800 */
          color:#ffffff;
          font-weight:700;
        }
        .edad-btn:hover{ background:#111827; border-color:#111827; }
        .edad-btn:focus{ outline:2px solid #93c5fd; outline-offset:2px; } /* light blue focus ring */

        /* Specific actions */
        #edad-pick{ background:#2563eb; border-color:#1d4ed8; }            /* blue-600 */
        #edad-pick:hover{ background:#1d4ed8; border-color:#1d4ed8; }
        #edad-reset{ background:#6b7280; border-color:#4b5563; }           /* gray-500 */
        #edad-reset:hover{ background:#4b5563; border-color:#4b5563; }
      </style>
    `;

    const out = el.querySelector("#edad-output");
    const meta = el.querySelector("#edad-meta");
    function updateMeta(){
      const rem = getRemaining();
      meta.textContent = `Remaining: ${rem.length}/${FULL_ROSTER.length}`;
    }
    updateMeta();

    el.querySelector("#edad-pick").addEventListener("click", () => {
      const res = drawOne();
      if (!res){
        out.textContent = "Roster empty. Click Reset to refill.";
        updateMeta();
        return;
      }
      const { picked } = res;
      out.textContent = `${picked.name}`;
      updateMeta();
    });

    el.querySelector("#edad-reset").addEventListener("click", () => {
      reset();
      out.textContent = "Roster reset. Ready to pick.";
      updateMeta();
    });
  }

  if (getRemaining().length === 0){ reset(); }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", renderWidget);
  } else {
    renderWidget();
  }
})();
