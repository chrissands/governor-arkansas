/**
 * news block
 *
 * Renders a dynamic news feed from /newsroom/press-releases/query-index.json.
 * Authored block rows set eyebrow text, heading, and optional "view all" link.
 * Falls back to demo content while the query index is being indexed by AEM.
 */

const INDEX_URL = '/news/query-index.json';
const MAX_ITEMS = 2;

const DEMO_NEWS = [
  {
    path: '/newsroom/press-releases/merit-pay-increases',
    title: 'Sanders Announces Merit Pay Increases for State Employees',
    description: 'Governor Sarah Huckabee Sanders announced merit pay increases of up to 5% for eligible state employees, recognizing the dedicated service of Arkansas\'s public workforce.',
    image: 'https://content.da.live/chrissands/governor-arkansas/.index/press-releases-scaled-a27f9032.jpg',
    date: '06-03-2026',
    tags: ['Press Release'],
  },
  {
    path: '/newsroom/press-releases/community-assistance-grant',
    title: 'Applications Open for 2026 Community Assistance Grant Program on July 1',
    description: 'Applications for the Community Assistance Grant Program open July 1, offering funding from $10,000 to $250,000 to eligible nonprofits serving Arkansans in need.',
    image: 'https://content.da.live/chrissands/governor-arkansas/.index/press-releases-scaled-a27f9032.jpg',
    date: '05-28-2026',
    tags: ['Press Release'],
  },
  {
    path: '/newsroom/press-releases/education-freedom-accounts',
    title: 'Governor Sanders Signs Education Freedom Account Expansion',
    description: 'Governor Sanders signed legislation removing income limits from the Education Freedom Account program, making all K-12 students eligible for $6,700 in annual education funds.',
    image: 'https://content.da.live/chrissands/governor-arkansas/.index/press-releases-scaled-a27f9032.jpg',
    date: '05-15-2026',
    tags: ['Press Release'],
  },
];

async function fetchNews() {
  try {
    const resp = await fetch(INDEX_URL);
    if (!resp.ok) return DEMO_NEWS;
    const json = await resp.json();
    return (json.data && json.data.length) ? json.data : DEMO_NEWS;
  } catch {
    return DEMO_NEWS;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function renderCard(item) {
  const date = formatDate(item.date);

  return `
    <a class="news-card" href="${item.path}">
      ${date ? `<div class="news-card-date">${date}</div>` : ''}
      <div class="news-card-body">
        <h3 class="news-card-title">${item.title || item.path}</h3>
        ${item.description ? `<p class="news-card-desc">${item.description}</p>` : ''}
        <span class="news-read-more">read more &gt;</span>
      </div>
    </a>
  `;
}

export default async function decorate(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  let subtitle = '';
  let heading = '';
  let viewAllHref = '';

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const text = cells[0]?.textContent?.trim() || '';
    const link = cells[0]?.querySelector('a');

    if (link && text) {
      viewAllHref = link.href;
    } else if (text) {
      if (!subtitle) {
        subtitle = text;
      } else if (!heading) {
        heading = text;
      }
    }
  });

  el.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'news-header';
  header.innerHTML = `
    ${subtitle ? `<p class="news-eyebrow">${subtitle}</p>` : ''}
    ${heading ? `<h2 class="news-heading">${heading}</h2>` : ''}
  `;
  el.append(header);

  const list = document.createElement('div');
  list.className = 'news-list';
  el.append(list);

  const data = await fetchNews();

  const items = data
    .filter((item) => item.title || item.path)
    .sort((a, b) => {
      const da = new Date(a.date || 0);
      const db = new Date(b.date || 0);
      return db - da;
    })
    .slice(0, MAX_ITEMS);

  if (!items.length) {
    list.innerHTML = '<p class="news-error">No press releases found.</p>';
    return;
  }

  list.innerHTML = items.map(renderCard).join('');

  if (viewAllHref) {
    const cta = document.createElement('div');
    cta.className = 'news-cta';
    cta.innerHTML = `<a class="news-view-all" href="${viewAllHref}">Read All Press Releases</a>`;
    el.append(cta);
  }
}
