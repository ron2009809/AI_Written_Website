(function () {
  'use strict';

  // ── Data ──────────────────────────────────────────────
  const REPOS = [
    { name: 'rag-app', desc: 'Retrieval-Augmented Generation pipeline with vector search and LLM integration.', lang: 'Python', langClass: 'python', stars: 24, updated: '2 hours ago', public: true },
    { name: 'ai-portfolio', desc: 'Personal portfolio site — first AI written website.', lang: 'HTML', langClass: 'html', stars: 16, updated: 'Yesterday', public: true },
    { name: 'ml-toolkit', desc: 'Machine learning utilities for data preprocessing and model training.', lang: 'Python', langClass: 'python', stars: 9, updated: '3 days ago', public: true },
    { name: 'chat-api', desc: 'RESTful API for real-time chat with WebSocket support.', lang: 'JavaScript', langClass: 'js', stars: 7, updated: '5 days ago', public: true },
    { name: 'dev-notes', desc: 'Personal developer notes and cheat sheets.', lang: 'Markdown', langClass: 'html', stars: 3, updated: '1 week ago', public: true },
    { name: 'go-microservice', desc: 'Lightweight Go microservice template with Docker support.', lang: 'Go', langClass: 'go', stars: 5, updated: '2 weeks ago', public: true },
    { name: 'react-dashboard', desc: 'Admin dashboard built with React and TypeScript.', lang: 'TypeScript', langClass: 'ts', stars: 12, updated: '3 weeks ago', public: true },
    { name: 'data-viz', desc: 'Interactive data visualization library.', lang: 'JavaScript', langClass: 'js', stars: 8, updated: '1 month ago', public: false },
    { name: 'api-gateway', desc: 'API gateway with rate limiting and auth middleware.', lang: 'Go', langClass: 'go', stars: 6, updated: '1 month ago', public: true },
    { name: 'test-utils', desc: 'Testing utilities for Python projects.', lang: 'Python', langClass: 'python', stars: 4, updated: '2 months ago', public: true },
    { name: 'dotfiles', desc: 'Personal configuration files and shell scripts.', lang: 'Shell', langClass: 'js', stars: 2, updated: '3 months ago', public: true },
    { name: 'learning-rust', desc: 'Rust learning exercises and small projects.', lang: 'Rust', langClass: 'python', stars: 1, updated: '4 months ago', public: true },
  ];

  const STARRED = [
    { owner: 'langchain-ai', name: 'langchain', desc: 'Build context-aware reasoning applications', stars: 98000 },
    { owner: 'openai', name: 'openai-python', desc: 'The official Python library for the OpenAI API', stars: 24000 },
    { owner: 'vercel', name: 'next.js', desc: 'The React Framework for the Web', stars: 130000 },
    { owner: 'facebook', name: 'react', desc: 'The library for web and native user interfaces', stars: 230000 },
    { owner: 'torvalds', name: 'linux', desc: 'Linux kernel source tree', stars: 180000 },
  ];

  const EXTRA_ACTIVITIES = [
    { type: 'push', repo: 'ml-toolkit', branch: 'dev', msg: 'refactor: simplify data loader module', time: '4 days ago' },
    { type: 'star', target: 'vercel/next.js', time: '5 days ago' },
    { type: 'fork', repo: 'awesome-python', time: '1 week ago' },
    { type: 'issue', repo: 'chat-api', num: 7, title: 'Add rate limiting middleware', time: '1 week ago' },
  ];

  // ── DOM refs ──────────────────────────────────────────
  const followBtn = document.getElementById('followBtn');
  const followerCount = document.getElementById('followerCount');
  const activityFeed = document.getElementById('activityFeed');
  const loadMoreBtn = document.getElementById('loadMoreActivity');
  const contributionGraph = document.getElementById('contributionGraph');
  const repoList = document.getElementById('repoList');
  const starredList = document.getElementById('starredList');
  const tooltip = document.getElementById('achievementTooltip');
  const tooltipTitle = document.getElementById('tooltipTitle');
  const tooltipDesc = document.getElementById('tooltipDesc');
  const toast = document.getElementById('toast');

  let following = false;
  let activityLoaded = false;

  // ── Toast ─────────────────────────────────────────────
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
  }

  // ── Follow button ─────────────────────────────────────
  followBtn.addEventListener('click', () => {
    following = !following;
    followBtn.textContent = following ? 'Unfollow' : 'Follow';
    followBtn.classList.toggle('following', following);
    const count = parseInt(followerCount.textContent, 10);
    followerCount.textContent = following ? count + 1 : count - 1;
    showToast(following ? 'You are now following ron809' : 'You unfollowed ron809');
  });

  // ── Tab switching ─────────────────────────────────────
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const target = tab.dataset.tab;

      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById('panel-' + target).classList.add('active');
    });
  });

  // ── Star buttons ──────────────────────────────────────
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const starred = btn.classList.toggle('starred');
      btn.innerHTML = starred
        ? '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.751.751 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg> Starred'
        : '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.751.751 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg> Star';
      const repoName = btn.closest('.repo-card')?.querySelector('.repo-name')?.textContent || 'repository';
      showToast(starred ? `Starred ${repoName}` : `Unstarred ${repoName}`);
    });
  });

  // ── Achievement tooltips ──────────────────────────────
  function bindTooltip(el) {
    el.addEventListener('mouseenter', e => {
      const title = el.dataset.title;
      const desc = el.dataset.desc;
      if (!title) return;
      tooltipTitle.textContent = title;
      tooltipDesc.textContent = desc || '';
      tooltip.hidden = false;
      positionTooltip(e);
    });
    el.addEventListener('mousemove', positionTooltip);
    el.addEventListener('mouseleave', () => { tooltip.hidden = true; });
  }

  function positionTooltip(e) {
    const x = e.clientX + 12;
    const y = e.clientY + 12;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  document.querySelectorAll('.achievement-badge').forEach(bindTooltip);

  // ── Contribution graph ────────────────────────────────
  function buildContributionGraph() {
    const weeks = 52;
    const days = 7;
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < days; d++) {
        const cell = document.createElement('div');
        const level = Math.random() < 0.25 ? 0 : Math.floor(Math.random() * 4) + 1;
        cell.className = 'contrib-cell contrib-' + level;
        cell.title = `${Math.floor(Math.random() * 12)} contributions on a day`;
        cell.addEventListener('click', () => {
          showToast(cell.title);
        });
        contributionGraph.appendChild(cell);
      }
    }
  }

  // ── Render repo list ──────────────────────────────────
  function renderRepoList(filter = '') {
    repoList.innerHTML = '';
    const q = filter.toLowerCase();
    REPOS.filter(r => !q || r.name.includes(q) || r.desc.toLowerCase().includes(q))
      .forEach(repo => {
        const item = document.createElement('div');
        item.className = 'repo-list-item';
        item.innerHTML = `
          <div class="repo-list-header">
            <a href="#" class="repo-name">${repo.name}</a>
            ${repo.public ? '<span class="repo-badge">Public</span>' : '<span class="repo-badge">Private</span>'}
          </div>
          <p class="repo-desc">${repo.desc}</p>
          <div class="repo-meta">
            <span class="lang"><span class="lang-dot ${repo.langClass}"></span> ${repo.lang}</span>
            <span>★ ${repo.stars}</span>
            <span>Updated ${repo.updated}</span>
          </div>`;
        repoList.appendChild(item);
      });
  }

  // ── Render starred list ───────────────────────────────
  function renderStarredList() {
    starredList.innerHTML = '';
    STARRED.forEach(repo => {
      const item = document.createElement('div');
      item.className = 'starred-item';
      item.innerHTML = `
        <h4><a href="#">${repo.owner}/${repo.name}</a></h4>
        <p>${repo.desc}</p>
        <div class="repo-meta"><span>★ ${repo.stars.toLocaleString()}</span></div>`;
      starredList.appendChild(item);
    });
  }

  // ── Load more activity ────────────────────────────────
  loadMoreBtn.addEventListener('click', () => {
    if (activityLoaded) {
      showToast('No more activity to show');
      return;
    }
    activityLoaded = true;
    EXTRA_ACTIVITIES.forEach(act => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      let body = '';
      if (act.type === 'push') {
        body = `<p><strong>ron809</strong> pushed to <a href="#">${act.branch}</a> at <a href="#">${act.repo}</a></p>
                <code class="commit-msg">${act.msg}</code>`;
      } else if (act.type === 'star') {
        body = `<p><strong>ron809</strong> starred <a href="#">${act.target}</a></p>`;
      } else if (act.type === 'fork') {
        body = `<p><strong>ron809</strong> forked <a href="#">${act.repo}</a></p>`;
      } else if (act.type === 'issue') {
        body = `<p><strong>ron809</strong> opened issue <a href="#">#${act.num}</a> in <a href="#">${act.repo}</a></p>
                <code class="commit-msg">${act.title}</code>`;
      }
      item.innerHTML = `
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=ron809" alt="" class="activity-avatar" />
        <div class="activity-body">${body}<time>${act.time}</time></div>`;
      activityFeed.appendChild(item);
    });
    loadMoreBtn.textContent = 'End of activity';
    showToast('Loaded more activity');
  });

  // ── Repo search ───────────────────────────────────────
  const repoSearch = document.querySelector('.repo-search');
  if (repoSearch) {
    repoSearch.addEventListener('input', e => renderRepoList(e.target.value));
  }

  // ── Header search shortcut ────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      document.querySelector('.header-search input')?.focus();
    }
  });

  // ── Generic link feedback ─────────────────────────────
  document.querySelectorAll('.btn-primary, .empty-state .btn-primary').forEach(btn => {
    btn.addEventListener('click', () => showToast('Feature coming soon!'));
  });

  document.querySelectorAll('.header-actions .icon-btn').forEach(btn => {
    btn.addEventListener('click', () => showToast('Notifications panel — coming soon'));
  });

  // ── Init ──────────────────────────────────────────────
  buildContributionGraph();
  renderRepoList();
  renderStarredList();
})();
