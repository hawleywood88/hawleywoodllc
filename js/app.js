const STATUS_STYLES = {
  'In Development': 'bg-mustard/15 text-mustard border-mustard/30',
  'Beta': 'bg-burnt/15 text-burnt border-burnt/30',
  'Coming Soon': 'bg-cerulean/15 text-cerulean border-cerulean/30'
};

async function loadApps() {
  const res = await fetch('data/apps.json');
  const data = await res.json();
  renderActiveApp(data.activeApp);
  renderPipeline(data.pipeline);
}

function renderActiveApp(app) {
  const el = document.getElementById('active-app');
  el.innerHTML = `
    <div class="order-2 md:order-1 flex justify-center">
      <div class="relative w-64">
        <div class="absolute -left-[3px] top-24 w-[3px] h-8 bg-slate-700 rounded-l"></div>
        <div class="absolute -left-[3px] top-36 w-[3px] h-12 bg-slate-700 rounded-l"></div>
        <div class="absolute -right-[3px] top-28 w-[3px] h-16 bg-slate-700 rounded-r"></div>
        <div class="relative rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-black/50 ring-1 ring-white/10 overflow-hidden">
          <div class="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full z-10"></div>
          <img src="${app.screenshot}" alt="${app.name} screenshot" class="w-full h-auto block">
        </div>
      </div>
    </div>
    <div class="order-1 md:order-2">
      <div class="flex items-center gap-4 mb-4">
        <img src="${app.icon}" alt="${app.name} icon" class="w-14 h-14 rounded-2xl shadow-lg">
        <div>
          <h3 class="text-2xl font-bold">${app.name}</h3>
          <p class="text-cerulean text-sm font-medium">${app.tagline}</p>
        </div>
      </div>
      <p class="text-slate-300 mb-6 leading-relaxed">${app.summary}</p>
      <ul class="grid sm:grid-cols-2 gap-2 mb-8">
        ${app.features.map(f => `
          <li class="flex items-start gap-2 text-sm text-slate-300">
            <span class="text-cerulean mt-0.5">✓</span><span>${f}</span>
          </li>`).join('')}
      </ul>
      <div class="flex flex-wrap gap-4">
        <a href="${app.appStoreUrl}" target="_blank" rel="noopener" class="inline-block">
          <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" class="h-12">
        </a>
        <a href="${app.playStoreUrl}" target="_blank" rel="noopener" class="inline-block">
          <img src="assets/google-play-badge.svg" alt="Get it on Google Play" class="h-12">
        </a>
      </div>
    </div>
  `;
}

function renderPipeline(apps) {
  const section = document.getElementById('pipeline');
  document.querySelectorAll('a[href="#pipeline"]').forEach(link => {
    link.classList.toggle('hidden', !apps.length);
  });
  if (!apps.length) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');

  const grid = document.getElementById('pipeline-grid');
  grid.innerHTML = apps.map(app => `
    <div class="flex-none w-72 sm:w-80 snap-start bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[app.status] || 'bg-white/10 text-slate-300 border-white/20'}">${app.status}</span>
        <span class="text-xs text-slate-500">${app.category}</span>
      </div>
      <h3 class="text-lg font-bold mb-2">${app.name}</h3>
      <p class="text-sm text-slate-400 flex-1 mb-4">${app.summary}</p>
      ${app.notify ? `
        <form class="notify-form flex gap-2" data-app="${app.id}" data-notify-url="${app.notifyUrl || ''}">
          <input type="email" name="email" required placeholder="you@email.com"
            class="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-cerulean">
          <input type="hidden" name="app" value="${app.name}">
          <button type="submit" class="bg-cerulean hover:bg-cerulean-dark transition text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap">Notify Me</button>
        </form>
        <p class="notify-thanks hidden text-xs mt-2">Thanks! We'll email you at launch.</p>
      ` : ''}
    </div>
  `).join('');

  grid.querySelectorAll('.notify-form').forEach(form => {
    form.addEventListener('submit', onNotifySubmit);
  });

  updatePipelineAlignment();
  window.addEventListener('resize', updatePipelineAlignment);
}

function updatePipelineAlignment() {
  const grid = document.getElementById('pipeline-grid');
  const overflowing = grid.scrollWidth > grid.clientWidth + 1;
  grid.classList.toggle('justify-center', !overflowing);
  grid.classList.toggle('justify-start', overflowing);
}

// ponytail: no notifyUrl set for an app falls back to localStorage only —
// nobody receives it. Set a Formspree endpoint per app in admin.html to
// actually collect signups.
async function onNotifySubmit(e) {
  e.preventDefault();
  const form = e.target;
  const thanks = form.nextElementSibling;
  const endpoint = form.dataset.notifyUrl;

  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      if (!res.ok) throw new Error('Formspree request failed');
    } catch (err) {
      thanks.textContent = "Something went wrong — try again?";
      thanks.classList.remove('hidden', 'text-emerald-400');
      thanks.classList.add('text-burnt');
      return;
    }
  } else {
    const email = form.querySelector('input[type=email]').value;
    const key = `notify:${form.dataset.app}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push(email);
    localStorage.setItem(key, JSON.stringify(list));
  }

  thanks.textContent = "Thanks! We'll email you at launch.";
  thanks.classList.remove('hidden', 'text-burnt');
  thanks.classList.add('text-emerald-400');
  form.classList.add('hidden');
}

loadApps();
