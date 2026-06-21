/* ConnectHub — Main Application */
const App = {
  state: {
    lang: 'en',
    theme: 'light',
    page: 'home',
    user: null,
    chatPartner: null,
    uploadData: null,
    profileTab: 'posts',
    viewingUserId: null,
    selectedPostId: null,
    notifPanelOpen: false
  },

  init() {
    const user = DB.getCurrentUser();
    if (user) {
      this.state.user = user;
      this.state.lang = user.language || 'en';
      this.state.theme = user.theme || 'light';
      this.showApp();
    } else {
      this.showAuth();
    }
    this.applyTheme();
    this.bindEvents();
    this.applyI18n();
  },

  showAuth() {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('bottom-nav').hidden = true;
    this.closeSettings();
  },

  showApp() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    document.getElementById('bottom-nav').hidden = false;
    this.renderPage(this.state.page);
    this.updateMsgBadge();
  },

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.state.theme);
  },

  applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = t(key);
    });
    const titles = { home: 'home', friends: 'friends', upload: 'upload', messages: 'messages', profile: 'profile' };
    const pt = document.getElementById('page-title');
    if (pt && titles[this.state.page]) pt.textContent = t(titles[this.state.page]);
    document.getElementById('brand-name').textContent = t('appName');
    document.getElementById('tab-login').textContent = t('login');
    document.getElementById('tab-signup').textContent = t('signup');
    document.getElementById('login-btn').textContent = t('loginBtn');
    document.getElementById('signup-btn').textContent = t('signupBtn');
    const signupNotice = document.getElementById('signup-notice');
    if (signupNotice) signupNotice.textContent = t('signupVerifyNotice');
    document.getElementById('upload-title').textContent = t('uploadMedia');
    document.getElementById('select-file-btn').textContent = t('selectFile');
    document.getElementById('publish-btn').textContent = t('publish');
    document.getElementById('notif-bar-text').textContent = t('notifications');
    const settingsTitle = document.getElementById('settings-title');
    if (settingsTitle && !document.getElementById('settings-overlay').hidden) {
      settingsTitle.textContent = t('settings');
    }
    const msgHeading = document.getElementById('messages-heading');
    if (msgHeading) msgHeading.textContent = t('messages');
    document.getElementById('edit-profile-btn').textContent = t('editProfile');
    document.getElementById('search-input').placeholder = t('search');
    document.getElementById('chat-input').placeholder = t('typeMessage');
    document.getElementById('chat-send').textContent = t('send');
  },

  toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
  },

  bindEvents() {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.auth + '-form').classList.add('active');
        document.getElementById('auth-error').hidden = true;
        const success = document.getElementById('auth-success');
        if (success) success.hidden = true;
      });
    });

    document.getElementById('login-form').addEventListener('submit', e => {
      e.preventDefault();
      const id = document.getElementById('login-id').value.trim();
      const pw = document.getElementById('login-password').value;
      const user = DB.authenticate(id, pw);
      if (!user) {
        this.showAuthError(t('loginError'));
        return;
      }
      DB.setCurrentUser(user.id);
      this.state.user = user;
      this.state.lang = user.language || 'en';
      this.state.theme = user.theme || 'light';
      this.applyTheme();
      this.applyI18n();
      this.showApp();
    });

    document.getElementById('signup-form').addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value.trim();
      const name = document.getElementById('signup-name').value.trim();
      const username = document.getElementById('signup-username').value.trim();
      const phone = document.getElementById('signup-phone').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPw = document.getElementById('signup-confirm').value;
      if (!email || !name || !username || !phone || !password) {
        this.showAuthError(t('signupError'));
        return;
      }
      if (password !== confirmPw) {
        this.showAuthError(t('passwordMismatch'));
        return;
      }
      if (!window.confirm(t('signupConfirm') + '\n\n' + t('signupVerifyNotice'))) return;

      const result = DB.createUser({ email, name, username, phone, password });
      if (result.error === 'email_taken') { this.showAuthError(t('emailTaken')); return; }
      if (result.error === 'username_taken') { this.showAuthError(t('usernameTaken')); return; }

      document.getElementById('signup-form').reset();
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      document.getElementById('tab-login').classList.add('active');
      document.getElementById('login-form').classList.add('active');
      document.getElementById('login-id').value = username;
      document.getElementById('login-password').value = '';
      this.showAuthSuccess(t('signupSuccess'));
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        this.renderPage(page);
      });
    });

    document.getElementById('search-close')?.addEventListener('click', () => {
      document.getElementById('search-overlay').hidden = true;
    });

    document.getElementById('search-input')?.addEventListener('input', e => {
      this.renderSearch(e.target.value);
    });

    document.getElementById('select-file-btn').addEventListener('click', () => {
      document.getElementById('upload-file').click();
    });

    document.getElementById('upload-file').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        this.state.uploadData = { url: ev.target.result, type: file.type.startsWith('video/') ? 'video' : 'photo' };
        const preview = document.getElementById('upload-preview');
        preview.innerHTML = this.state.uploadData.type === 'video'
          ? `<video src="${ev.target.result}" controls></video>`
          : `<img src="${ev.target.result}" alt="Preview" />`;
        document.getElementById('publish-btn').disabled = false;
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('publish-btn').addEventListener('click', () => {
      if (!this.state.uploadData) return;
      const caption = document.getElementById('upload-caption').value.trim();
      DB.createPost(this.state.user.id, {
        type: this.state.uploadData.type,
        mediaUrl: this.state.uploadData.url,
        caption
      });
      this.state.uploadData = null;
      document.getElementById('upload-preview').innerHTML = '<span class="upload-placeholder">📷</span>';
      document.getElementById('upload-caption').value = '';
      document.getElementById('upload-file').value = '';
      document.getElementById('publish-btn').disabled = true;
      this.toast(t('uploadSuccess'));
      this.renderPage('home');
      document.querySelector('[data-page="home"]').click();
    });

    document.getElementById('chat-back').addEventListener('click', () => {
      document.getElementById('chat-overlay').hidden = true;
      this.state.chatPartner = null;
    });

    document.getElementById('chat-send').addEventListener('click', () => this.sendChatMessage());
    document.getElementById('chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.sendChatMessage();
    });

    document.getElementById('edit-profile-btn').addEventListener('click', () => this.showEditProfile());
    document.getElementById('btn-settings').addEventListener('click', () => this.showSettings());
    document.getElementById('btn-views').addEventListener('click', () => this.showProfileViews());

    document.getElementById('avatar-input').addEventListener('change', e => this.handleImageUpload(e, 'avatar'));
    document.getElementById('cover-upload-btn').addEventListener('click', () => {
      document.getElementById('cover-input').click();
    });
    document.getElementById('cover-input').addEventListener('change', e => this.handleImageUpload(e, 'coverImage'));

    document.getElementById('stat-followers-btn').addEventListener('click', () => this.showFollowList('followers'));
    document.getElementById('stat-following-btn').addEventListener('click', () => this.showFollowList('following'));

    document.getElementById('notif-bar').addEventListener('click', () => this.toggleNotificationsPanel());

    document.querySelectorAll('.profile-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.state.profileTab = tab.dataset.ptab;
        this.state.selectedPostId = null;
        this.renderProfileGrid();
      });
    });

    document.getElementById('user-profile-back').addEventListener('click', () => {
      document.getElementById('user-profile-overlay').hidden = true;
    });

    document.getElementById('story-close').addEventListener('click', () => {
      document.getElementById('story-overlay').hidden = true;
    });

    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target.id === 'modal-overlay') this.closeModal();
    });

    document.getElementById('settings-close').addEventListener('click', () => this.closeSettings());

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (!document.getElementById('settings-overlay').hidden) this.closeSettings();
        else if (!document.getElementById('modal-overlay').hidden) this.closeModal();
      }
    });
  },

  showAuthError(msg) {
    const el = document.getElementById('auth-error');
    el.textContent = msg;
    el.hidden = false;
    const success = document.getElementById('auth-success');
    if (success) success.hidden = true;
  },

  showAuthSuccess(msg) {
    const el = document.getElementById('auth-success');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    document.getElementById('auth-error').hidden = true;
  },

  renderPage(page) {
    this.state.page = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page)?.classList.add('active');

    const titles = { home: 'home', friends: 'friends', upload: 'upload', messages: 'messages', profile: 'profile' };
    document.getElementById('page-title').textContent = t(titles[page] || 'home');

    const actions = document.getElementById('header-actions');
    actions.innerHTML = '';
    if (page === 'home') {
      actions.innerHTML = `<button class="icon-btn" id="search-btn" aria-label="Search">🔍</button>`;
      document.getElementById('search-btn').addEventListener('click', () => {
        document.getElementById('search-overlay').hidden = false;
        document.getElementById('search-input').focus();
      });
    }

    if (page === 'home') this.renderHomeFeed();
    else if (page === 'friends') this.renderFriendsPage();
    else if (page === 'messages') this.renderMessagesPage();
    else if (page === 'profile') this.renderProfilePage();
  },

  renderHomeFeed() {
    const feed = document.getElementById('home-feed');
    const posts = DB.getVisiblePosts(this.state.user.id);
    feed.innerHTML = posts.length ? posts.map(p => this.renderPostCard(p)).join('') : `<div class="empty">${t('noPosts')}</div>`;
    this.bindPostEvents(feed);
  },

  renderFriendsPage() {
    const storiesEl = document.getElementById('friends-stories');
    const stories = DB.getActiveStories(this.state.user.id);
    storiesEl.innerHTML = `<div class="stories-scroll">${stories.map(s => {
      const u = DB.getUser(s.userId);
      return `<button class="story-item" data-story="${s.mediaUrl}">
        <img src="${DB.avatarUrl(u)}" alt="${u?.username}" /><span>${u?.username}</span>
      </button>`;
    }).join('')}</div>`;

    storiesEl.querySelectorAll('.story-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('story-image').src = btn.dataset.story;
        document.getElementById('story-overlay').hidden = false;
      });
    });

    const feed = document.getElementById('friends-feed');
    const posts = DB.getFriendPosts(this.state.user.id);
    feed.innerHTML = posts.length ? posts.map(p => this.renderPostCard(p)).join('') : `<div class="empty">${t('noPosts')}</div>`;
    this.bindPostEvents(feed);
  },

  renderMessagesPage() {
    const stories = DB.getActiveStories(this.state.user.id);
    document.getElementById('msg-stories').innerHTML = `<div class="stories-scroll">${stories.map(s => {
      const u = DB.getUser(s.userId);
      return `<button class="story-item" data-story="${s.mediaUrl}" data-user="${s.userId}">
        <img src="${DB.avatarUrl(u)}" alt="" /><span>${u?.username}</span>
      </button>`;
    }).join('')}</div>`;

    document.getElementById('msg-stories').querySelectorAll('.story-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('story-image').src = btn.dataset.story;
        document.getElementById('story-overlay').hidden = false;
      });
    });

    const notifs = DB.getNotifications(this.state.user.id);
    const preview = notifs[0];
    const previewEl = document.getElementById('notif-bar-preview');
    if (preview) {
      const from = DB.getUser(preview.fromUserId);
      previewEl.textContent = `${from?.username || ''} · ${this.timeAgo(preview.createdAt)}`;
    } else {
      previewEl.textContent = t('noResults');
    }

    document.getElementById('notifications-list').innerHTML = notifs.slice(0, 20).map(n => {
      const from = DB.getUser(n.fromUserId);
      let text = '';
      if (n.type === 'like') text = `<strong>${from?.username}</strong> ${t('likedYourPost')}`;
      else if (n.type === 'comment') text = `<strong>${from?.username}</strong> ${t('commentedOnPost')}`;
      else if (n.type === 'follow') text = `<strong>${from?.username}</strong> ${t('startedFollowing')}`;
      else if (n.type === 'follow_request') text = `<strong>${from?.username}</strong> ${t('requestedToFollow')} <button class="btn-sm accept-req" data-user="${n.fromUserId}">${t('accept')}</button>`;
      else text = `<strong>${from?.username}</strong> ${n.type}`;
      return `<div class="notif-item ${n.read ? '' : 'unread'}">${text}<time>${this.timeAgo(n.createdAt)}</time></div>`;
    }).join('') || `<div class="empty">${t('noResults')}</div>`;

    document.querySelectorAll('.accept-req').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        DB.acceptFollowRequest(this.state.user.id, btn.dataset.user);
        this.renderMessagesPage();
        this.toast(t('acceptedFollow'));
      });
    });

    if (this.state.notifPanelOpen) {
      DB.markNotificationsRead(this.state.user.id);
    }

    const convos = DB.getConversations(this.state.user.id);
    document.getElementById('conversations-list').innerHTML = convos.map(c => `
      <button class="convo-item" data-partner="${c.partner.id}">
        <img src="${DB.avatarUrl(c.partner)}" alt="" />
        <div class="convo-info">
          <strong>${c.partner.name}</strong>
          <span>${c.lastMsg.text}</span>
        </div>
        <time>${this.timeAgo(c.lastMsg.createdAt)}</time>
      </button>`).join('') || `<div class="empty">${t('noMessages')}</div>`;

    document.querySelectorAll('.convo-item').forEach(btn => {
      btn.addEventListener('click', () => this.openChat(btn.dataset.partner));
    });

    this.updateMsgBadge();
  },

  toggleNotificationsPanel() {
    this.state.notifPanelOpen = !this.state.notifPanelOpen;
    const panel = document.getElementById('notifications-panel');
    const bar = document.getElementById('notif-bar');
    panel.hidden = !this.state.notifPanelOpen;
    bar.classList.toggle('open', this.state.notifPanelOpen);
    if (this.state.notifPanelOpen) {
      DB.markNotificationsRead(this.state.user.id);
      this.renderMessagesPage();
    }
  },

  openChat(partnerId) {
    const partner = DB.getUser(partnerId);
    if (!partner) return;
    this.state.chatPartner = partnerId;
    document.getElementById('chat-avatar').src = DB.avatarUrl(partner);
    document.getElementById('chat-name').textContent = partner.name;
    document.getElementById('chat-overlay').hidden = false;
    DB.markMessagesRead(this.state.user.id, partnerId);
    this.renderChatMessages();
  },

  renderChatMessages() {
    const msgs = DB.getMessages(this.state.user.id, this.state.chatPartner);
    document.getElementById('chat-messages').innerHTML = msgs.map(m => {
      const mine = m.fromId === this.state.user.id;
      return `<div class="chat-bubble ${mine ? 'mine' : 'theirs'}">${this.escapeHtml(m.text)}</div>`;
    }).join('');
    const el = document.getElementById('chat-messages');
    el.scrollTop = el.scrollHeight;
  },

  sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !this.state.chatPartner) return;
    DB.sendMessage(this.state.user.id, this.state.chatPartner, text);
    input.value = '';
    this.renderChatMessages();
  },

  updateMsgBadge() {
    const unread = DB.getDB().messages.filter(m => m.toId === this.state.user?.id && !m.read).length;
    const badge = document.getElementById('msg-badge');
    if (unread > 0) { badge.textContent = unread; badge.hidden = false; }
    else badge.hidden = true;
  },

  renderProfilePage() {
    const user = DB.getUser(this.state.user.id);
    this.state.user = user;
    document.getElementById('profile-avatar').src = DB.avatarUrl(user);
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-username').textContent = '@' + user.username;
    document.getElementById('profile-bio').textContent = user.bio || '';
    document.getElementById('stat-posts').textContent = DB.getPosts(p => p.userId === user.id).length;
    document.getElementById('stat-followers').textContent = DB.getFollowerCount(user.id);
    document.getElementById('stat-following').textContent = DB.getFollowingCount(user.id);
    document.getElementById('stat-likes').textContent = user.totalLikes || 0;

    const cover = document.getElementById('profile-cover');
    if (user.coverImage) cover.style.backgroundImage = `url(${user.coverImage})`;
    else cover.style.backgroundImage = 'linear-gradient(135deg, #6366f1, #a855f7)';

    this.renderProfileGrid();
  },

  renderProfileGrid() {
    const user = this.state.user;
    let items = [];
    if (this.state.profileTab === 'posts') items = DB.getPosts(p => p.userId === user.id);
    else if (this.state.profileTab === 'saved') items = DB.getSavedPosts(user.id);
    else items = DB.getLikedPosts(user.id);

    const grid = document.getElementById('profile-grid');
    const detail = document.getElementById('profile-post-detail');
    const content = document.querySelector('.profile-content');

    if (!items.length) {
      grid.innerHTML = `<div class="empty">${t('noPosts')}</div>`;
      detail.hidden = true;
      content?.classList.remove('has-detail');
      return;
    }

    grid.innerHTML = items.map(p => `<button type="button" class="grid-item ${this.state.selectedPostId === p.id ? 'active' : ''}" data-post="${p.id}">
        ${p.type === 'video' ? `<video src="${p.mediaUrl}" muted></video>` : `<img src="${p.mediaUrl}" alt="" />`}
      </button>`).join('');

    grid.querySelectorAll('.grid-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.selectedPostId = btn.dataset.post;
        this.renderProfileGrid();
      });
    });

    if (this.state.selectedPostId) {
      const post = items.find(p => p.id === this.state.selectedPostId) || items[0];
      if (post) {
        detail.hidden = false;
        detail.innerHTML = this.renderPostCard(post);
        content?.classList.add('has-detail');
        this.bindPostEvents(detail);
      }
    } else {
      detail.hidden = true;
      content?.classList.remove('has-detail');
    }
  },

  renderPostCard(post) {
    const author = DB.getUser(post.userId);
    const liked = DB.isLiked(post.id, this.state.user.id);
    const likeCount = DB.getLikeCount(post.id);
    const comments = DB.getComments(post.id);
    const isOwner = post.userId === this.state.user.id;
    const following = DB.isFollowing(this.state.user.id, post.userId);
    const pending = DB.hasPendingRequest(this.state.user.id, post.userId);

    return `<article class="post-card" data-post-id="${post.id}">
      <header class="post-header">
        <button class="post-author" data-user="${post.userId}">
          <img src="${DB.avatarUrl(author)}" alt="" />
          <div><strong>${this.escapeHtml(author?.name)}</strong><span>@${author?.username}</span></div>
        </button>
        ${!isOwner ? `<button class="btn-sm follow-btn ${following ? 'following' : ''}" data-follow="${post.userId}">
          ${pending ? t('requested') : following ? t('unfollow') : t('follow')}
        </button>` : ''}
      </header>
      <div class="post-media">
        ${post.type === 'video'
          ? `<video src="${post.mediaUrl}" controls playsinline></video>`
          : `<img src="${post.mediaUrl}" alt="${this.escapeHtml(post.caption)}" loading="lazy" />`}
      </div>
      <div class="post-actions">
        <button class="action-btn like-btn ${liked ? 'active' : ''}" data-like="${post.id}">${liked ? '❤' : '🤍'} ${likeCount}</button>
        <button class="action-btn comment-btn" data-comment="${post.id}">💬 ${comments.length}</button>
        <button class="action-btn share-btn" data-share="${post.id}">↗ ${t('share')}</button>
        <button class="action-btn save-btn ${DB.isSaved(this.state.user.id, post.id) ? 'active' : ''}" data-save="${post.id}">🔖</button>
        ${isOwner ? `<button class="action-btn edit-btn" data-edit="${post.id}">✏</button>` : ''}
        ${isOwner ? `<button class="action-btn delete-btn" data-delete="${post.id}">🗑</button>` : ''}
      </div>
      <p class="post-caption"><strong>${author?.username}</strong> ${this.escapeHtml(post.caption)}</p>
      <div class="post-comments" id="comments-${post.id}">
        ${comments.slice(-2).map(c => {
          const u = DB.getUser(c.userId);
          return `<p><strong>${u?.username}</strong> ${this.escapeHtml(c.text)}</p>`;
        }).join('')}
      </div>
    </article>`;
  },

  bindPostEvents(container) {
    container.querySelectorAll('.post-author').forEach(btn => {
      btn.addEventListener('click', () => this.showUserProfile(btn.dataset.user));
    });

    container.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DB.toggleLike(btn.dataset.like, this.state.user.id);
        if (this.state.page === 'profile') this.renderProfileGrid();
        else this.renderPage(this.state.page);
      });
    });

    container.querySelectorAll('.comment-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showCommentModal(btn.dataset.comment));
    });

    container.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = window.location.href + '#post-' + btn.dataset.share;
        navigator.clipboard?.writeText(url);
        this.toast(t('linkCopied'));
      });
    });

    container.querySelectorAll('.save-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DB.toggleSavePost(this.state.user.id, btn.dataset.save);
        if (this.state.page === 'profile') this.renderProfileGrid();
        else this.renderPage(this.state.page);
      });
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showEditCaption(btn.dataset.edit));
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.confirm(t('delete') + '?')) {
          DB.deletePost(btn.dataset.delete, this.state.user.id);
          this.toast(t('postDeleted'));
          if (this.state.selectedPostId === btn.dataset.delete) this.state.selectedPostId = null;
          if (this.state.page === 'profile') {
            this.renderProfilePage();
          } else {
            this.renderPage(this.state.page);
          }
        }
      });
    });

    container.querySelectorAll('.follow-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = DB.toggleFollow(this.state.user.id, btn.dataset.follow);
        this.renderPage(this.state.page);
        if (result === 'followed') this.toast(t('follow'));
        else if (result === 'requested') this.toast(t('requested'));
      });
    });
  },

  showCommentModal(postId) {
    this.showModal(`
      <textarea id="modal-comment" rows="3" placeholder="${t('comment')}..."></textarea>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" id="modal-cancel-comment">${t('cancel')}</button>
        <button type="button" class="btn btn-primary" id="submit-comment">${t('send')}</button>
      </div>`, t('comment'));
    document.getElementById('modal-cancel-comment').addEventListener('click', () => this.closeModal());
    document.getElementById('submit-comment').addEventListener('click', () => {
      const text = document.getElementById('modal-comment').value.trim();
      if (text) {
        DB.addComment(postId, this.state.user.id, text);
        this.closeModal();
        if (this.state.page === 'profile') this.renderProfileGrid();
        else this.renderPage(this.state.page);
      }
    });
  },

  showEditCaption(postId) {
    const post = DB.getDB().posts.find(p => p.id === postId);
    this.showModal(`
      <textarea id="modal-caption" rows="3">${this.escapeHtml(post?.caption || '')}</textarea>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" id="modal-cancel-caption">${t('cancel')}</button>
        <button type="button" class="btn btn-primary" id="save-caption">${t('save')}</button>
      </div>`, t('editCaption'));
    document.getElementById('modal-cancel-caption').addEventListener('click', () => this.closeModal());
    document.getElementById('save-caption').addEventListener('click', () => {
      DB.updatePost(postId, this.state.user.id, { caption: document.getElementById('modal-caption').value.trim() });
      this.closeModal();
      this.toast(t('postUpdated'));
      if (this.state.page === 'profile') this.renderProfileGrid();
      else this.renderPage(this.state.page);
    });
  },

  showUserProfile(userId) {
    if (userId === this.state.user.id) {
      document.querySelector('[data-page="profile"]').click();
      return;
    }
    DB.recordProfileView(this.state.user.id, userId);
    const user = DB.getUser(userId);
    const following = DB.isFollowing(this.state.user.id, userId);
    const pending = DB.hasPendingRequest(this.state.user.id, userId);
    const canSee = !user.isPrivate || following || userId === this.state.user.id;
    const posts = canSee ? DB.getPosts(p => p.userId === userId) : [];

    document.getElementById('user-profile-title').textContent = user.name;
    document.getElementById('user-profile-content').innerHTML = `
      <div class="user-profile-header">
        <img src="${DB.avatarUrl(user)}" alt="" class="up-avatar" />
        <h2>${this.escapeHtml(user.name)}</h2>
        <p class="muted">@${user.username}</p>
        <p>${this.escapeHtml(user.bio || '')}</p>
        <div class="profile-stats">
          <div><strong>${posts.length}</strong> ${t('posts')}</div>
          <div><strong>${DB.getFollowerCount(userId)}</strong> ${t('followers')}</div>
          <div><strong>${DB.getFollowingCount(userId)}</strong> ${t('followingLabel')}</div>
        </div>
        <button class="btn btn-primary follow-user-btn" data-user="${userId}">
          ${pending ? t('requested') : following ? t('unfollow') : t('follow')}
        </button>
        <button class="btn btn-outline msg-user-btn" data-user="${userId}">${t('messages')}</button>
      </div>
      <div class="feed">${canSee ? posts.map(p => this.renderPostCard(p)).join('') : `<div class="empty">${t('privatePostHidden')}</div>`}</div>`;

    document.getElementById('user-profile-overlay').hidden = false;

    document.querySelector('.follow-user-btn')?.addEventListener('click', e => {
      DB.toggleFollow(this.state.user.id, e.target.dataset.user);
      this.showUserProfile(userId);
    });
    document.querySelector('.msg-user-btn')?.addEventListener('click', () => {
      document.getElementById('user-profile-overlay').hidden = true;
      document.querySelector('[data-page="messages"]').click();
      this.openChat(userId);
    });
    this.bindPostEvents(document.getElementById('user-profile-content'));
  },

  renderSearch(query) {
    const results = DB.search(query, this.state.user.id);
    const el = document.getElementById('search-results');
    if (!query.trim()) { el.innerHTML = ''; return; }

    el.innerHTML = `
      <h4>${t('searchResults')}</h4>
      ${results.users.length ? `<div class="search-section"><h5>Users</h5>${results.users.map(u => `
        <button class="search-user" data-user="${u.id}">
          <img src="${DB.avatarUrl(u)}" alt="" /><span>${u.name} @${u.username}</span>
        </button>`).join('')}</div>` : ''}
      ${results.posts.length ? `<div class="search-section"><h5>${t('posts')}</h5>${results.posts.map(p => {
        const u = DB.getUser(p.userId);
        return `<div class="search-post"><img src="${p.type === 'video' ? DB.avatarUrl(u) : p.mediaUrl}" alt="" /><span>${u?.username}: ${this.escapeHtml(p.caption)}</span></div>`;
      }).join('')}</div>` : ''}
      ${!results.users.length && !results.posts.length ? `<div class="empty">${t('noResults')}</div>` : ''}`;

    el.querySelectorAll('.search-user').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('search-overlay').hidden = true;
        this.showUserProfile(btn.dataset.user);
      });
    });
  },

  showEditProfile() {
    const u = this.state.user;
    this.showModal(`
      <div class="field"><label>${t('name')}</label><input id="ep-name" value="${this.escapeHtml(u.name)}" /></div>
      <div class="field"><label>${t('username')}</label><input id="ep-username" value="${this.escapeHtml(u.username)}" /></div>
      <div class="field"><label>${t('bio')}</label><textarea id="ep-bio" rows="2">${this.escapeHtml(u.bio || '')}</textarea></div>
      <div class="field"><label>${t('email')}</label><input id="ep-email" type="email" value="${this.escapeHtml(u.email)}" /></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" id="modal-cancel-profile">${t('cancel')}</button>
        <button type="button" class="btn btn-primary" id="save-profile">${t('save')}</button>
      </div>`, t('editProfile'));
    document.getElementById('modal-cancel-profile').addEventListener('click', () => this.closeModal());
    document.getElementById('save-profile').addEventListener('click', () => {
      const username = document.getElementById('ep-username').value.trim();
      if (DB.getUserByUsername(username) && username !== u.username) {
        this.toast(t('usernameTaken'));
        return;
      }
      DB.updateUser(u.id, {
        name: document.getElementById('ep-name').value.trim(),
        username,
        bio: document.getElementById('ep-bio').value.trim(),
        email: document.getElementById('ep-email').value.trim()
      });
      this.state.user = DB.getUser(u.id);
      this.closeModal();
      this.renderProfilePage();
      this.toast(t('save'));
    });
  },

  showSettings() {
    const u = DB.getUser(this.state.user.id);
    this.state.user = u;
    document.getElementById('settings-title').textContent = t('settings');

    const langs = [
      { code: 'en', label: 'English' },
      { code: 'zh', label: '中文简体' },
      { code: 'ko', label: '한국어' },
      { code: 'ja', label: '日本語' },
      { code: 'es', label: 'Español' },
      { code: 'fr', label: 'Français' }
    ];

    document.getElementById('settings-body').innerHTML = `
      <div class="settings-group">
        <label>${t('language')}</label>
        <div class="lang-grid" id="lang-grid">
          ${langs.map(l => `
            <button type="button" class="lang-btn ${u.language === l.code ? 'active' : ''}" data-lang="${l.code}">${l.label}</button>
          `).join('')}
        </div>
      </div>
      <div class="settings-group">
        <label>${t('theme')} 🌙</label>
        <div class="theme-toggle">
          <button type="button" class="btn ${u.theme === 'light' ? 'btn-primary' : 'btn-outline'}" data-theme="light">${t('bright')}</button>
          <button type="button" class="btn ${u.theme === 'dark' ? 'btn-primary' : 'btn-outline'}" data-theme="dark">${t('dark')}</button>
        </div>
      </div>
      <div class="settings-group">
        <button type="button" class="private-toggle-row ${u.isPrivate ? 'active' : ''}" id="private-toggle-btn">
          <div class="private-toggle-label">
            <strong>🔒 ${t('privateAccount')}</strong>
            <p class="muted small">${t('lockDesc')}</p>
            <p class="muted small">${t('followRequestDesc')}</p>
          </div>
          <span class="toggle-indicator">${u.isPrivate ? 'ON' : 'OFF'}</span>
        </button>
      </div>
      <div class="settings-group">
        <label>${t('changePassword')}</label>
        <input id="pw-identifier" placeholder="${t('enterEmailOrPhone')}" />
        <button type="button" class="btn btn-outline btn-block" id="send-code">${t('sendCode')}</button>
        <input id="pw-code" placeholder="${t('verificationCode')}" />
        <input id="pw-new" type="password" placeholder="${t('newPassword')}" />
        <button type="button" class="btn btn-primary btn-block" id="change-pw">${t('verifyAndChange')}</button>
      </div>
      <button type="button" class="btn btn-outline btn-block logout-btn">${t('logout')}</button>`;

    document.getElementById('settings-overlay').hidden = false;
    document.body.style.overflow = 'hidden';

    document.querySelectorAll('#settings-body [data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.theme = btn.dataset.theme;
        DB.updateUser(u.id, { theme: btn.dataset.theme });
        this.applyTheme();
        this.showSettings();
      });
    });

    document.querySelectorAll('#settings-body .lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        this.state.lang = lang;
        DB.updateUser(u.id, { language: lang });
        this.state.user = DB.getUser(u.id);
        this.applyI18n();
        this.renderPage(this.state.page);
        this.showSettings();
        this.toast(t('save'));
      });
    });

    document.getElementById('private-toggle-btn').addEventListener('click', () => {
      const updated = DB.getUser(u.id);
      const newVal = !updated.isPrivate;
      DB.updateUser(u.id, { isPrivate: newVal });
      this.state.user = DB.getUser(u.id);
      this.showSettings();
      this.toast(newVal ? t('privateAccount') + ': ON' : t('privateAccount') + ': OFF');
    });

    document.getElementById('send-code').addEventListener('click', () => {
      const id = document.getElementById('pw-identifier').value.trim();
      if (!id) return;
      const code = DB.generateVerificationCode(id);
      alert(`${t('verificationCode')}: ${code}`);
      this.toast(t('codeSent'));
    });

    document.getElementById('change-pw').addEventListener('click', () => {
      const id = document.getElementById('pw-identifier').value.trim();
      const code = document.getElementById('pw-code').value.trim();
      const newPw = document.getElementById('pw-new').value;
      if (!DB.verifyCode(id, code)) { this.toast(t('invalidCode')); return; }
      if (!newPw || newPw.length < 6) return;
      DB.updateUser(u.id, { password: DB.hashPassword(newPw) });
      this.toast(t('passwordChanged'));
    });

    document.querySelector('.logout-btn').addEventListener('click', () => {
      DB.setCurrentUser(null);
      this.state.user = null;
      this.closeSettings();
      this.showAuth();
    });
  },

  closeSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = '';
  },

  showFollowList(type) {
    const users = type === 'followers'
      ? DB.getFollowers(this.state.user.id)
      : DB.getFollowing(this.state.user.id);
    const title = type === 'followers' ? t('followers') : t('followingLabel');
    this.showModal(`
      <div class="user-list">
        ${users.length ? users.map(u => `
          <button type="button" class="user-list-item" data-user="${u.id}">
            <img src="${DB.avatarUrl(u)}" alt="" />
            <div><strong>${this.escapeHtml(u.name)}</strong><span class="muted"> @${u.username}</span></div>
          </button>`).join('') : `<div class="empty">${t('noResults')}</div>`}
      </div>`, title);

    document.querySelectorAll('.user-list-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal();
        this.showUserProfile(btn.dataset.user);
      });
    });
  },

  showProfileViews() {
    const views = DB.getProfileViews(this.state.user.id);
    this.showModal(`
      <div class="views-list">
        ${views.length ? views.map(v => `
          <div class="view-item">
            <img src="${DB.avatarUrl(v.viewer)}" alt="" />
            <span><strong>${v.viewer?.name}</strong> ${t('viewedYourProfile')}</span>
            <time>${this.timeAgo(v.viewedAt)}</time>
          </div>`).join('') : `<div class="empty">${t('noResults')}</div>`}
      </div>`, '👣 ' + t('profileViews'));
  },

  handleImageUpload(e, field) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      DB.updateUser(this.state.user.id, { [field]: ev.target.result });
      this.state.user = DB.getUser(this.state.user.id);
      this.renderProfilePage();
    };
    reader.readAsDataURL(file);
  },

  showModal(html, title) {
    const modalTitle = title || '';
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <h3>${modalTitle}</h3>
        <button type="button" class="modal-close" id="modal-close-btn" aria-label="Close">✕</button>
      </div>
      <div class="modal-body">${html}</div>`;
    document.getElementById('modal-overlay').hidden = false;
    const closeBtn = document.getElementById('modal-close-btn');
    closeBtn.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      this.closeModal();
    };
    document.getElementById('modal-content').onclick = e => e.stopPropagation();
  },

  closeModal() {
    document.getElementById('modal-overlay').hidden = true;
  },

  escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  },

  timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return mins + 'm';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h';
    return Math.floor(hrs / 24) + 'd';
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
