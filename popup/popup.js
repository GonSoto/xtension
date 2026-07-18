// Popup: renders the toggle list from a config array and syncs each switch
// with chrome.storage.sync. The content script listens for changes and applies
// them live.
const SECTIONS = [
  {
    title: 'Home',
    items: [
      ['hideFeed', 'Hide home timeline', 'Replaces the feed with a calm placeholder'],
      ['followingOnly', 'Default to "Following" tab', 'Auto-switches away from the algorithmic feed'],
      ['hideForYouTab', 'Hide "For You" tab', '']
    ]
  },
  {
    title: 'Right sidebar',
    items: [
      ['hideSidebar', 'Hide entire sidebar', 'Trends, suggestions, search — all of it'],
      ['hideTrends', 'Hide trends', '"What’s happening" card'],
      ['hideWhoToFollow', 'Hide "Who to follow"', 'Sidebar cards and inline feed suggestions'],
      ['hidePremium', 'Hide Premium upsells', '']
    ]
  },
  {
    title: 'Left navigation',
    items: [
      ['hideNavExplore', 'Hide Explore', ''],
      ['hideNavCommunities', 'Hide Communities', ''],
      ['hideNavGrok', 'Hide Grok', 'Everywhere: nav, buttons, drawer'],
      ['hideNavPremium', 'Hide Premium & Verified Orgs', ''],
      ['hideNavJobs', 'Hide Jobs', ''],
      ['hideBadges', 'Hide notification badges', 'Also strips the "(3)" count from the tab title']
    ]
  },
  {
    title: 'Content',
    items: [
      ['hideAds', 'Hide ads', 'Promoted posts in every timeline'],
      ['hideDiscoverMore', 'Hide "Discover more"', 'Algorithmic suggestions under posts'],
      ['hideMetrics', 'Hide engagement counts', 'Replies, reposts, likes, views'],
      ['hideDMDrawer', 'Hide message drawer', 'The floating DM bar, bottom-right'],
      ['blockExplore', 'Block Explore page', 'Redirects /explore back to home']
    ]
  }
];

const list = document.getElementById('list');
const master = document.getElementById('master');

function buildRow(key, label, hint) {
  const row = document.createElement('label');
  row.className = 'row';

  const labels = document.createElement('span');
  labels.className = 'labels';
  const labelEl = document.createElement('span');
  labelEl.className = 'label';
  labelEl.textContent = label;
  labels.appendChild(labelEl);
  if (hint) {
    const hintEl = document.createElement('span');
    hintEl.className = 'hint';
    hintEl.textContent = hint;
    labels.appendChild(hintEl);
  }

  const sw = document.createElement('span');
  sw.className = 'switch';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.dataset.key = key;
  const slider = document.createElement('span');
  slider.className = 'slider';
  sw.appendChild(input);
  sw.appendChild(slider);

  input.addEventListener('change', () => {
    chrome.storage.sync.set({ [key]: input.checked });
  });

  row.appendChild(labels);
  row.appendChild(sw);
  return row;
}

for (const section of SECTIONS) {
  const title = document.createElement('div');
  title.className = 'section-title';
  title.textContent = section.title;
  list.appendChild(title);
  for (const [key, label, hint] of section.items) {
    list.appendChild(buildRow(key, label, hint));
  }
}

master.addEventListener('change', () => {
  chrome.storage.sync.set({ enabled: master.checked });
  list.classList.toggle('off', !master.checked);
});

chrome.storage.sync.get(DX_DEFAULTS, (settings) => {
  master.checked = settings.enabled;
  list.classList.toggle('off', !settings.enabled);
  for (const input of list.querySelectorAll('input[data-key]')) {
    input.checked = !!settings[input.dataset.key];
  }
});
