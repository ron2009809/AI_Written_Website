/* ConnectHub — Client-side database (localStorage) */
const DB = (() => {
  const KEY = 'connecthub_db_v1';
  const SESSION_KEY = 'connecthub_session';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function uid() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function hashPassword(pw) {
    let h = 0;
    for (let i = 0; i < pw.length; i++) h = ((h << 5) - h + pw.charCodeAt(i)) | 0;
    return 'h_' + Math.abs(h).toString(36) + '_' + pw.length;
  }

  function seed() {
    const u1 = uid(), u2 = uid(), u3 = uid(), u4 = uid();
    const now = Date.now();
    const data = {
      users: [
        { id: u1, email: 'demo@connecthub.app', name: 'Alex Morgan', username: 'alexm', phone: '+1 555-0101', password: hashPassword('demo1234'), bio: 'Photographer & traveler 🌍', avatar: '', coverImage: '', isPrivate: false, language: 'en', theme: 'light', totalLikes: 142, createdAt: now - 86400000 * 30 },
        { id: u2, email: 'sam@connecthub.app', name: 'Sam Chen', username: 'samchen', phone: '+1 555-0102', password: hashPassword('demo1234'), bio: 'Tech & coffee ☕', avatar: '', coverImage: '', isPrivate: false, language: 'en', theme: 'light', totalLikes: 89, createdAt: now - 86400000 * 20 },
        { id: u3, email: 'jordan@connecthub.app', name: 'Jordan Lee', username: 'jlee', phone: '+1 555-0103', password: hashPassword('demo1234'), bio: 'Fitness & lifestyle', avatar: '', coverImage: '', isPrivate: true, language: 'en', theme: 'dark', totalLikes: 256, createdAt: now - 86400000 * 15 },
        { id: u4, email: 'taylor@connecthub.app', name: 'Taylor Kim', username: 'tkim', phone: '+1 555-0104', password: hashPassword('demo1234'), bio: 'Music producer 🎵', avatar: '', coverImage: '', isPrivate: false, language: 'en', theme: 'light', totalLikes: 178, createdAt: now - 86400000 * 10 }
      ],
      posts: [],
      comments: [],
      likes: [],
      followers: [
        { id: uid(), followerId: u1, followingId: u2, status: 'accepted', createdAt: now - 86400000 * 5 },
        { id: uid(), followerId: u2, followingId: u1, status: 'accepted', createdAt: now - 86400000 * 5 },
        { id: uid(), followerId: u1, followingId: u3, status: 'accepted', createdAt: now - 86400000 * 3 },
        { id: uid(), followerId: u3, followingId: u1, status: 'accepted', createdAt: now - 86400000 * 3 },
        { id: uid(), followerId: u2, followingId: u3, status: 'accepted', createdAt: now - 86400000 * 2 },
        { id: uid(), followerId: u4, followingId: u1, status: 'accepted', createdAt: now - 86400000 },
        { id: uid(), followerId: u1, followingId: u4, status: 'accepted', createdAt: now - 86400000 }
      ],
      messages: [
        { id: uid(), fromId: u2, toId: u1, text: 'Hey! Loved your latest post 📸', type: 'text', read: false, createdAt: now - 3600000 },
        { id: uid(), fromId: u3, toId: u1, text: 'Want to collaborate on a project?', type: 'text', read: true, createdAt: now - 7200000 },
        { id: uid(), fromId: u4, toId: u1, text: 'Check out this video!', type: 'text', read: false, createdAt: now - 1800000 }
      ],
      savedPosts: [],
      notifications: [
        { id: uid(), userId: u1, type: 'like', fromUserId: u2, postId: null, read: false, createdAt: now - 600000 },
        { id: uid(), userId: u1, type: 'comment', fromUserId: u3, postId: null, read: false, createdAt: now - 1200000 },
        { id: uid(), userId: u1, type: 'follow', fromUserId: u4, postId: null, read: true, createdAt: now - 86400000 }
      ],
      profileViews: [
        { id: uid(), viewerId: u2, profileUserId: u1, createdAt: now - 3600000 },
        { id: uid(), viewerId: u3, profileUserId: u1, createdAt: now - 7200000 },
        { id: uid(), viewerId: u4, profileUserId: u1, createdAt: now - 1800000 }
      ],
      stories: [],
      verificationCodes: {}
    };

    const samplePosts = [
      { userId: u1, type: 'photo', caption: 'Golden hour in the city 🌅', mediaUrl: 'https://picsum.photos/seed/ch1/800/800' },
      { userId: u2, type: 'photo', caption: 'New workspace setup!', mediaUrl: 'https://picsum.photos/seed/ch2/800/600' },
      { userId: u3, type: 'video', caption: 'Morning workout routine 💪', mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { userId: u4, type: 'photo', caption: 'Studio session today 🎧', mediaUrl: 'https://picsum.photos/seed/ch4/800/800' },
      { userId: u1, type: 'photo', caption: 'Weekend vibes', mediaUrl: 'https://picsum.photos/seed/ch5/800/600' },
      { userId: u2, type: 'video', caption: 'Quick coding tip', mediaUrl: 'https://www.w3schools.com/html/movie.mp4' }
    ];

    samplePosts.forEach((p, i) => {
      const postId = uid();
      data.posts.push({ id: postId, ...p, createdAt: now - 86400000 * (6 - i) });
      if (i < 3) {
        data.likes.push({ id: uid(), postId, userId: u2 });
        data.likes.push({ id: uid(), postId, userId: u3 });
      }
      if (i === 0) {
        data.comments.push({ id: uid(), postId, userId: u2, text: 'Amazing shot!', createdAt: now - 3600000 });
        data.comments.push({ id: uid(), postId, userId: u3, text: 'Where is this?', createdAt: now - 1800000 });
        data.notifications[0].postId = postId;
        data.notifications[1].postId = postId;
      }
    });

    data.stories = [
      { id: uid(), userId: u2, mediaUrl: 'https://picsum.photos/seed/st1/400/700', createdAt: now - 3600000, expiresAt: now + 86400000 },
      { id: uid(), userId: u3, mediaUrl: 'https://picsum.photos/seed/st2/400/700', createdAt: now - 7200000, expiresAt: now + 86400000 },
      { id: uid(), userId: u4, mediaUrl: 'https://picsum.photos/seed/st3/400/700', createdAt: now - 1800000, expiresAt: now + 86400000 }
    ];

    save(data);
    return data;
  }

  function getDB() {
    return load() || seed();
  }

  function getUser(id) {
    return getDB().users.find(u => u.id === id) || null;
  }

  function getUserByUsername(username) {
    return getDB().users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  function getUserByEmail(email) {
    return getDB().users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  function getCurrentUser() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    return getUser(session);
  }

  function setCurrentUser(userId) {
    if (userId) localStorage.setItem(SESSION_KEY, userId);
    else localStorage.removeItem(SESSION_KEY);
  }

  function createUser({ email, name, username, phone, password }) {
    const db = getDB();
    if (getUserByEmail(email)) return { error: 'email_taken' };
    if (getUserByUsername(username)) return { error: 'username_taken' };
    const user = {
      id: uid(), email, name, username, phone,
      password: hashPassword(password), bio: '', avatar: '', coverImage: '',
      isPrivate: false, language: 'en', theme: 'light', totalLikes: 0,
      createdAt: Date.now()
    };
    db.users.push(user);
    save(db);
    return { user };
  }

  function updateUser(userId, updates) {
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    const allowed = ['name', 'username', 'bio', 'email', 'phone', 'avatar', 'coverImage', 'isPrivate', 'language', 'theme', 'password', 'totalLikes'];
    allowed.forEach(k => { if (updates[k] !== undefined) db.users[idx][k] = updates[k]; });
    save(db);
    return db.users[idx];
  }

  function authenticate(emailOrUsername, password) {
    const db = getDB();
    const hash = hashPassword(password);
    const user = db.users.find(u =>
      (u.email.toLowerCase() === emailOrUsername.toLowerCase() || u.username.toLowerCase() === emailOrUsername.toLowerCase()) &&
      u.password === hash
    );
    return user || null;
  }

  function getPosts(filterFn) {
    const db = getDB();
    let posts = [...db.posts].sort((a, b) => b.createdAt - a.createdAt);
    if (filterFn) posts = posts.filter(filterFn);
    return posts;
  }

  function getVisiblePosts(viewerId) {
    const db = getDB();
    return getPosts(post => {
      const author = getUser(post.userId);
      if (!author) return false;
      if (post.userId === viewerId) return true;
      if (!author.isPrivate) return true;
      return isFollowing(viewerId, post.userId);
    });
  }

  function getFriendPosts(userId) {
    const friends = getFriends(userId);
    const friendIds = new Set(friends.map(f => f.id));
    return getPosts(p => friendIds.has(p.userId) || p.userId === userId);
  }

  function createPost(userId, { type, mediaUrl, caption }) {
    const db = getDB();
    const post = { id: uid(), userId, type, mediaUrl, caption: caption || '', createdAt: Date.now() };
    db.posts.unshift(post);
    save(db);
    return post;
  }

  function updatePost(postId, userId, updates) {
    const db = getDB();
    const post = db.posts.find(p => p.id === postId && p.userId === userId);
    if (!post) return null;
    if (updates.caption !== undefined) post.caption = updates.caption;
    save(db);
    return post;
  }

  function deletePost(postId, userId) {
    const db = getDB();
    const idx = db.posts.findIndex(p => p.id === postId && p.userId === userId);
    if (idx === -1) return false;
    db.posts.splice(idx, 1);
    db.comments = db.comments.filter(c => c.postId !== postId);
    db.likes = db.likes.filter(l => l.postId !== postId);
    db.savedPosts = db.savedPosts.filter(s => s.postId !== postId);
    save(db);
    return true;
  }

  function toggleLike(postId, userId) {
    const db = getDB();
    const existing = db.likes.findIndex(l => l.postId === postId && l.userId === userId);
    const post = db.posts.find(p => p.id === postId);
    if (existing >= 0) {
      db.likes.splice(existing, 1);
      if (post) {
        const author = getUser(post.userId);
        if (author && author.totalLikes > 0) author.totalLikes--;
      }
    } else {
      db.likes.push({ id: uid(), postId, userId });
      if (post) {
        addNotification(post.userId, 'like', userId, postId);
        const author = getUser(post.userId);
        if (author) author.totalLikes = (author.totalLikes || 0) + 1;
      }
    }
    save(db);
    return !existing;
  }

  function isLiked(postId, userId) {
    return getDB().likes.some(l => l.postId === postId && l.userId === userId);
  }

  function getLikeCount(postId) {
    return getDB().likes.filter(l => l.postId === postId).length;
  }

  function addComment(postId, userId, text) {
    const db = getDB();
    const post = db.posts.find(p => p.id === postId);
    if (!post) return null;
    const comment = { id: uid(), postId, userId, text, createdAt: Date.now() };
    db.comments.push(comment);
    addNotification(post.userId, 'comment', userId, postId);
    save(db);
    return comment;
  }

  function getComments(postId) {
    return getDB().comments.filter(c => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt);
  }

  function isFollowing(followerId, followingId) {
    return getDB().followers.some(f =>
      f.followerId === followerId && f.followingId === followingId && f.status === 'accepted'
    );
  }

  function hasPendingRequest(followerId, followingId) {
    return getDB().followers.some(f =>
      f.followerId === followerId && f.followingId === followingId && f.status === 'pending'
    );
  }

  function toggleFollow(followerId, followingId) {
    if (followerId === followingId) return 'self';
    const db = getDB();
    const target = getUser(followingId);
    const existing = db.followers.find(f => f.followerId === followerId && f.followingId === followingId);

    if (existing) {
      db.followers = db.followers.filter(f => f.id !== existing.id);
      save(db);
      return 'unfollowed';
    }

    const status = target?.isPrivate ? 'pending' : 'accepted';
    db.followers.push({ id: uid(), followerId, followingId, status, createdAt: Date.now() });
    if (status === 'accepted') addNotification(followingId, 'follow', followerId);
    else addNotification(followingId, 'follow_request', followerId);
    save(db);
    return status === 'pending' ? 'requested' : 'followed';
  }

  function acceptFollowRequest(userId, followerId) {
    const db = getDB();
    const req = db.followers.find(f => f.followerId === followerId && f.followingId === userId && f.status === 'pending');
    if (!req) return false;
    req.status = 'accepted';
    addNotification(followerId, 'follow_accepted', userId);
    save(db);
    return true;
  }

  function getFollowers(userId) {
    const db = getDB();
    return db.followers.filter(f => f.followingId === userId && f.status === 'accepted')
      .map(f => getUser(f.followerId)).filter(Boolean);
  }

  function getFollowing(userId) {
    const db = getDB();
    return db.followers.filter(f => f.followerId === userId && f.status === 'accepted')
      .map(f => getUser(f.followingId)).filter(Boolean);
  }

  function getFriends(userId) {
    const following = new Set(getFollowing(userId).map(u => u.id));
    return getFollowers(userId).filter(u => following.has(u.id));
  }

  function getFollowerCount(userId) {
    return getDB().followers.filter(f => f.followingId === userId && f.status === 'accepted').length;
  }

  function getFollowingCount(userId) {
    return getDB().followers.filter(f => f.followerId === userId && f.status === 'accepted').length;
  }

  function getPendingRequests(userId) {
    const db = getDB();
    return db.followers.filter(f => f.followingId === userId && f.status === 'pending')
      .map(f => getUser(f.followerId)).filter(Boolean);
  }

  function addNotification(userId, type, fromUserId, postId) {
    const db = getDB();
    if (userId === fromUserId) return;
    db.notifications.unshift({
      id: uid(), userId, type, fromUserId, postId: postId || null,
      read: false, createdAt: Date.now()
    });
    save(db);
  }

  function getNotifications(userId) {
    return getDB().notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  function markNotificationsRead(userId) {
    const db = getDB();
    db.notifications.filter(n => n.userId === userId).forEach(n => { n.read = true; });
    save(db);
  }

  function sendMessage(fromId, toId, text, type = 'text', postId = null) {
    const db = getDB();
    const msg = { id: uid(), fromId, toId, text, type, postId, read: false, createdAt: Date.now() };
    db.messages.push(msg);
    save(db);
    return msg;
  }

  function getConversations(userId) {
    const db = getDB();
    const msgs = db.messages.filter(m => m.fromId === userId || m.toId === userId);
    const partners = new Map();
    msgs.forEach(m => {
      const partnerId = m.fromId === userId ? m.toId : m.fromId;
      if (!partners.has(partnerId) || partners.get(partnerId).createdAt < m.createdAt) {
        partners.set(partnerId, m);
      }
    });
    return [...partners.entries()].map(([partnerId, lastMsg]) => ({
      partner: getUser(partnerId), lastMsg
    })).sort((a, b) => b.lastMsg.createdAt - a.lastMsg.createdAt);
  }

  function getMessages(userId, partnerId) {
    return getDB().messages
      .filter(m => (m.fromId === userId && m.toId === partnerId) || (m.fromId === partnerId && m.toId === userId))
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  function markMessagesRead(userId, partnerId) {
    const db = getDB();
    db.messages.filter(m => m.fromId === partnerId && m.toId === userId).forEach(m => { m.read = true; });
    save(db);
  }

  function toggleSavePost(userId, postId) {
    const db = getDB();
    const existing = db.savedPosts.findIndex(s => s.userId === userId && s.postId === postId);
    if (existing >= 0) {
      db.savedPosts.splice(existing, 1);
      save(db);
      return false;
    }
    db.savedPosts.push({ id: uid(), userId, postId });
    save(db);
    return true;
  }

  function isSaved(userId, postId) {
    return getDB().savedPosts.some(s => s.userId === userId && s.postId === postId);
  }

  function getSavedPosts(userId) {
    return getDB().savedPosts.filter(s => s.userId === userId)
      .map(s => getDB().posts.find(p => p.id === s.postId)).filter(Boolean);
  }

  function getLikedPosts(userId) {
    const likedIds = getDB().likes.filter(l => l.userId === userId).map(l => l.postId);
    return getDB().posts.filter(p => likedIds.includes(p.id));
  }

  function recordProfileView(viewerId, profileUserId) {
    if (viewerId === profileUserId) return;
    const db = getDB();
    db.profileViews.push({ id: uid(), viewerId, profileUserId, createdAt: Date.now() });
    save(db);
  }

  function getProfileViews(profileUserId) {
    const db = getDB();
    const views = db.profileViews.filter(v => v.profileUserId === profileUserId);
    const unique = new Map();
    views.sort((a, b) => b.createdAt - a.createdAt).forEach(v => {
      if (!unique.has(v.viewerId)) unique.set(v.viewerId, v);
    });
    return [...unique.values()].map(v => ({ viewer: getUser(v.viewerId), viewedAt: v.createdAt }));
  }

  function getActiveStories(userId) {
    const now = Date.now();
    const friends = getFriends(userId);
    const friendIds = new Set([...friends.map(f => f.id), userId]);
    return getDB().stories.filter(s => s.expiresAt > now && friendIds.has(s.userId));
  }

  function createStory(userId, mediaUrl) {
    const db = getDB();
    const story = { id: uid(), userId, mediaUrl, createdAt: Date.now(), expiresAt: Date.now() + 86400000 };
    db.stories.push(story);
    save(db);
    return story;
  }

  function generateVerificationCode(identifier) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const db = getDB();
    db.verificationCodes[identifier] = { code, expiresAt: Date.now() + 600000 };
    save(db);
    return code;
  }

  function verifyCode(identifier, code) {
    const db = getDB();
    const entry = db.verificationCodes[identifier];
    if (!entry || entry.code !== code || entry.expiresAt < Date.now()) return false;
    delete db.verificationCodes[identifier];
    save(db);
    return true;
  }

  function search(query, userId) {
    const q = query.toLowerCase().trim();
    if (!q) return { users: [], posts: [] };
    const db = getDB();
    const users = db.users.filter(u =>
      u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q)
    ).slice(0, 10);
    const posts = getVisiblePosts(userId).filter(p =>
      p.caption.toLowerCase().includes(q)
    ).slice(0, 10);
    return { users, posts };
  }

  function avatarUrl(user) {
    if (user?.avatar) return user.avatar;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.username || 'user')}`;
  }

  return {
    uid, hashPassword, getDB, getUser, getUserByUsername, getUserByEmail,
    getCurrentUser, setCurrentUser, createUser, updateUser, authenticate,
    getPosts, getVisiblePosts, getFriendPosts, createPost, updatePost, deletePost,
    toggleLike, isLiked, getLikeCount, addComment, getComments,
    isFollowing, hasPendingRequest, toggleFollow, acceptFollowRequest,
    getFollowers, getFollowing, getFriends, getFollowerCount, getFollowingCount,
    getPendingRequests, getNotifications, markNotificationsRead,
    sendMessage, getConversations, getMessages, markMessagesRead,
    toggleSavePost, isSaved, getSavedPosts, getLikedPosts,
    recordProfileView, getProfileViews, getActiveStories, createStory,
    generateVerificationCode, verifyCode, search, avatarUrl, addNotification
  };
})();
