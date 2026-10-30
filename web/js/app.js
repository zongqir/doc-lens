// doc-lens: 极简纯原生双端技术文档与 Markdown 实时投影器 (Modern Pro Edition v2.2.0 Ultra Fast)
(function() {
  'use strict';

  const SVG_ICONS = {
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    folderOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="2" y1="10" x2="22" y2="10"></line></svg>',
    repo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>',
    markdown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="13" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
    copy: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    sun: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    sparkles: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
    link: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
    star: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    starFilled: '<svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    chevronRight: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
    chevronDown: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    properties: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    headphones: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',
    mindmap: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9.5" width="5" height="5" rx="1.5"></rect><rect x="16" y="3.5" width="5" height="4" rx="1"></rect><rect x="16" y="10" width="5" height="4" rx="1"></rect><rect x="16" y="16.5" width="5" height="4" rx="1"></rect><path d="M8 12h8"></path><path d="M8 12c2.8 0 4.2-6.5 8-6.5"></path><path d="M8 12c2.8 0 4.2 6.5 8 6.5"></path></svg>',
    share: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>'
  };

  const ALERT_ICONS = {
    note: '<svg class="alert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    tip: '<svg class="alert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>',
    important: '<svg class="alert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    warning: '<svg class="alert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    caution: '<svg class="alert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
  };

  const ALERT_CONFIG = {
    note: { label: '说明', tag: 'NOTE' },
    tip: { label: '提示', tag: 'TIP' },
    important: { label: '重点', tag: 'IMPORTANT' },
    warning: { label: '注意', tag: 'WARNING' },
    caution: { label: '警告', tag: 'CAUTION' }
  };

  const state = {
    authenticated: false,
    repos: [],
    currentRepo: null,
    currentPath: '',
    currentDoc: null,
    treeData: null,
    repoTreeCache: new Map(),
    theme: getStoredTheme(),
    tasks: [],
    activeTaskId: null,
    taskLogTimer: null,
    filterFavoritesOnly: false,
    activeSidebarTab: 'tree',
    searchModalMode: 'title',
    searchModalResults: [],
    searchModalSelectedIndex: -1,
    isShareMode: false,
    shareId: null,
    sharePasscode: '',
    currentShareDoc: null,
    allShares: [],
    sharesFilter: { status: 'all', repo: '', search: '' }
  };

  const mermaidStore = new Map();
  const el = {};
  let mermaidObserver = null;
  let scrollSpyObserver = null;
  let searchDebounceTimer = null;
  let modalSearchDebounceTimer = null;

  function getStoredTheme() {
    try {
      return localStorage.getItem('doc_lens_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) {
      return 'dark';
    }
  }

  // 跨平台与跨网络协议(HTTP/HTTPS)剪贴板复制工具，含移动端/局域网降级支持
  async function copyTextToClipboard(text) {
    if (!text) return false;
    // 优先尝试标准 Clipboard API（仅在 HTTPS 或 localhost 等安全上下文生效）
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        // Fallback below
      }
    }
    // 降级方案：创建不可见 textarea 使用 document.execCommand('copy')，兼容 HTTP 局域网及各类移动端浏览器
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.width = '2em';
      ta.style.height = '2em';
      ta.style.padding = '0';
      ta.style.border = 'none';
      ta.style.outline = 'none';
      ta.style.boxShadow = 'none';
      ta.style.background = 'transparent';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      const successful = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!successful;
    } catch (err) {
      return false;
    }
  }

  document.addEventListener('DOMContentLoaded', initApp);

  async function initApp() {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('doc_lens_expanded_dirs_')) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}

    if ('scrollRestoration' in history) {
      try { history.scrollRestoration = 'manual'; } catch (e) {}
    }

    bindDOMElements();
    applyTheme(state.theme);
    initFontPreferences();
    initMarkdownParser();
    initMermaid();
    initMermaidLightboxEvents();
    initTocLevelControl();
    bindGlobalKeybindings();
    initAudioPlayer();
    initFabDragAndPosition();

    initSidebarTabs();
    renderRecentReads();
    renderFavorites();

    window.addEventListener('popstate', () => {
      const sm = window.location.pathname.match(/^\/(s|share)\/([a-zA-Z0-9_-]+)\/?$/);
      if (sm) {
        state.isShareMode = true;
        state.shareId = sm[2];
        document.body.classList.add('is-share-mode');
        if (el.sharedBadge) el.sharedBadge.style.display = 'inline-flex';
        if (el.sharedHomeBtn) el.sharedHomeBtn.style.display = 'inline-flex';
        loadSharedDoc(sm[2]);
      } else {
        if (state.isShareMode) {
          state.isShareMode = false;
          state.shareId = null;
          document.body.classList.remove('is-share-mode');
          if (el.sharedBadge) el.sharedBadge.style.display = 'none';
          if (el.sharedHomeBtn) el.sharedHomeBtn.style.display = 'none';
        }
        routeTo(window.location.pathname, false);
      }
    });

    // 检查是否为对外公开分享专属链接 (/s/:id 或 /share/:id)
    const initPath = window.location.pathname;
    const shareMatch = initPath.match(/^\/(s|share)\/([a-zA-Z0-9_-]+)\/?$/);
    if (shareMatch) {
      state.isShareMode = true;
      state.shareId = shareMatch[2];
      document.body.classList.add('is-share-mode');
      if (el.sharedBadge) el.sharedBadge.style.display = 'inline-flex';
      if (el.sharedHomeBtn) el.sharedHomeBtn.style.display = 'inline-flex';
      await loadSharedDoc(state.shareId);
      return;
    }

    await Promise.all([checkAuth(), loadRepos()]);

    if (state.authenticated) {
      loadAllShares(); // 异步预加载公开链接数据与更新 Header 角标
      const initPath = window.location.pathname;
      if (initPath && initPath !== '/') {
        await routeTo(initPath, false);
      } else if (state.repos.length > 0) {
        const savedRepoId = localStorage.getItem('doc_lens_last_repo');
        const defaultRepo = state.repos.find(r => r.ID === savedRepoId) || state.repos.find(r => r.ID === 'world_lens') || state.repos[0];
        await selectRepo(defaultRepo.ID, true);
        if (window.location.pathname === '/' || window.location.pathname === defaultRepo.RoutePrefix) {
          const lastDoc = localStorage.getItem('doc_lens_last_active_' + defaultRepo.ID);
          if (!lastDoc) {
            renderWelcomeDashboard();
          }
        }
      }
    }
  }

  function bindDOMElements() {
    el.themeBtn = document.getElementById('themeBtn');
    el.menuBtn = document.getElementById('menuBtn');
    el.sidebar = document.getElementById('sidebar');
    el.sidebarOverlay = document.getElementById('sidebarOverlay');
    el.closeSidebarBtn = document.getElementById('closeSidebarBtn');
    el.repoSelect = document.getElementById('repoSelect');
    el.searchInput = document.getElementById('searchInput');
    el.clearSearchBtn = document.getElementById('clearSearchBtn');
    el.quickSearchBtn = document.getElementById('quickSearchBtn');

    el.searchModal = document.getElementById('searchModal');
    el.modalSearchInput = document.getElementById('modalSearchInput');
    el.modalSearchClearBtn = document.getElementById('modalSearchClearBtn');
    el.searchTabTitle = document.getElementById('searchTabTitle');
    el.searchTabContent = document.getElementById('searchTabContent');
    el.modalSearchScope = document.getElementById('modalSearchScope');
    el.modalSearchResults = document.getElementById('modalSearchResults');
    el.modalSearchCount = document.getElementById('modalSearchCount');
    el.fileTree = document.getElementById('fileTree');
    el.treeFileCount = document.getElementById('treeFileCount');
    el.treeFileCountBadge = document.getElementById('treeFileCountBadge');
    el.collapseAllBtn = document.getElementById('collapseAllBtn');
    el.refreshTreeBtn = document.getElementById('refreshTreeBtn');
    el.filterFavBtn = document.getElementById('filterFavBtn');
    el.headerBreadcrumbs = document.getElementById('headerBreadcrumbs');

    el.headerFavorites = document.getElementById('headerFavorites');
    el.favoritesList = document.getElementById('favoritesList');
    el.favoritesCountBadge = document.getElementById('favoritesCountBadge');

    el.headerRecentReads = document.getElementById('headerRecentReads');
    el.clearRecentReadsBtn = document.getElementById('clearRecentReadsBtn');
    el.headerRecentCreated = document.getElementById('headerRecentCreated');
    el.refreshRecentCreatedBtn = document.getElementById('refreshRecentCreatedBtn');
    el.headerFileTree = document.getElementById('headerFileTree');

    el.contentArea = document.getElementById('contentArea');
    el.articleHeader = document.getElementById('articleHeader');
    el.articlePath = document.getElementById('articlePath');
    el.articleTypePill = document.getElementById('articleTypePill');
    el.articleMeta = document.getElementById('articleMeta');
    el.articleActions = document.getElementById('articleActions');
    el.articleBody = document.getElementById('articleBody');
    el.docPagination = document.getElementById('docPagination');

    el.tocList = document.getElementById('tocList');
    el.mobileTocList = document.getElementById('mobileTocList');
    el.tocLevelCtrl = document.getElementById('tocLevelCtrl');
    el.mobileTocLevelCtrl = document.getElementById('mobileTocLevelCtrl');
    el.fabTocBtn = document.getElementById('fabTocBtn');
    el.fabAiBtn = document.getElementById('fabAiBtn');
    el.fabContainer = document.getElementById('fabContainer');
    el.mobileMindmapBtn = document.getElementById('mobileMindmapBtn');
    el.mobileTocModal = document.getElementById('mobileTocModal');
    el.copyOriginDocLinkBtn = document.getElementById('copyOriginDocLinkBtn');
    el.copyOriginLinkText = document.getElementById('copyOriginLinkText');

    el.loginModal = document.getElementById('loginModal');
    el.loginForm = document.getElementById('loginForm');
    el.loginPass = document.getElementById('loginPass');
    el.loginError = document.getElementById('loginError');

    el.aiTaskBtn = document.getElementById('aiTaskBtn');
    el.taskCenterModal = document.getElementById('taskCenterModal');
    el.taskList = document.getElementById('taskList');
    el.taskLogArea = document.getElementById('taskLogArea');
    el.activeTaskMeta = document.getElementById('activeTaskMeta');
    el.activeTaskActions = document.getElementById('activeTaskActions');
    el.refreshTasksBtn = document.getElementById('refreshTasksBtn');
    el.taskRunningDot = document.getElementById('taskRunningDot');

    el.aiDraftBtn = document.getElementById('aiDraftBtn');
    el.aiDraftModal = document.getElementById('aiDraftModal');
    el.aiDraftForm = document.getElementById('aiDraftForm');
    el.draftRepo = document.getElementById('draftRepo');
    el.draftRepoPicker = document.getElementById('draftRepoPicker');
    el.draftRepoTriggerBtn = document.getElementById('draftRepoTriggerBtn');
    el.draftRepoMenu = document.getElementById('draftRepoMenu');
    el.draftRepoMenuList = document.getElementById('draftRepoMenuList');
    el.draftRepoSelectedName = document.getElementById('draftRepoSelectedName');
    el.draftRepoSelectedPrefix = document.getElementById('draftRepoSelectedPrefix');
    el.draftRepoSelectedDesc = document.getElementById('draftRepoSelectedDesc');
    el.draftRepoCount = document.getElementById('draftRepoCount');
    el.draftPrompt = document.getElementById('draftPrompt');
    el.draftTargetFile = document.getElementById('draftTargetFile');
    el.draftTaskType = document.getElementById('draftTaskType');
    el.draftDocContextGroup = document.getElementById('draftDocContextGroup');
    el.draftDocContextPath = document.getElementById('draftDocContextPath');
    el.clearDraftContextBtn = document.getElementById('clearDraftContextBtn');

    // 分享功能相关 DOM 元素 (单卡片一体化无缝修改模型)
    el.shareDocModal = document.getElementById('shareDocModal');
    el.shareModalDocTitle = document.getElementById('shareModalDocTitle');
    el.shareModalDocPath = document.getElementById('shareModalDocPath');

    el.shareActivePanel = document.getElementById('shareActivePanel');
    el.shareActiveStatusWrap = document.getElementById('shareActiveStatusWrap');
    el.shareLiveDot = document.getElementById('shareLiveDot');
    el.shareLiveText = document.getElementById('shareLiveText');
    el.shareActiveUrlInput = document.getElementById('shareActiveUrlInput');
    el.mainCopyShareBtn = document.getElementById('mainCopyShareBtn');
    el.shareViewCounter = document.getElementById('shareViewCounter');
    el.toggleShareStateBtn = document.getElementById('toggleShareStateBtn');
    el.revokeActiveShareBtn = document.getElementById('revokeActiveShareBtn');

    el.activeShareExpireSelect = document.getElementById('activeShareExpireSelect');
    el.activeShareExpireDesc = document.getElementById('activeShareExpireDesc');
    el.activeSharePassDesc = document.getElementById('activeSharePassDesc');
    el.activeShareEditPassToggle = document.getElementById('activeShareEditPassToggle');
    el.activeSharePassDrawer = document.getElementById('activeSharePassDrawer');
    el.activeSharePassInput = document.getElementById('activeSharePassInput');
    el.activeShareDiceBtn = document.getElementById('activeShareDiceBtn');
    el.activeShareSavePassBtn = document.getElementById('activeShareSavePassBtn');
    el.activeShareRemovePassBtn = document.getElementById('activeShareRemovePassBtn');
    el.activeShareClosePassBtn = document.getElementById('activeShareClosePassBtn');

    el.shareCreatePanel = document.getElementById('shareCreatePanel');
    el.newShareExpireSelect = document.getElementById('newShareExpireSelect');
    el.newShareEnablePass = document.getElementById('newShareEnablePass');
    el.newSharePassWrap = document.getElementById('newSharePassWrap');
    el.newSharePassInput = document.getElementById('newSharePassInput');
    el.newShareDiceBtn = document.getElementById('newShareDiceBtn');
    el.startShareBtn = document.getElementById('startShareBtn');

    // 全局公开链接管理弹窗
    el.sharesHubBtn = document.getElementById('sharesHubBtn');
    el.sharesCountBadge = document.getElementById('sharesCountBadge');
    el.sharesHubModal = document.getElementById('sharesHubModal');
    el.sharesListContainer = document.getElementById('sharesListContainer');
    el.sharesSearchInput = document.getElementById('sharesSearchInput');
    el.sharesClearSearchBtn = document.getElementById('sharesClearSearchBtn');
    el.sharesRepoFilter = document.getElementById('sharesRepoFilter');
    el.sharesStatusFilter = document.getElementById('sharesStatusFilter');
    el.refreshSharesBtn = document.getElementById('refreshSharesBtn');

    el.sharePasscodeModal = document.getElementById('sharePasscodeModal');
    el.sharePasscodeForm = document.getElementById('sharePasscodeForm');
    el.guestPasscodeInput = document.getElementById('guestPasscodeInput');
    el.sharePasscodeError = document.getElementById('sharePasscodeError');
    el.sharePasscodePromptText = document.getElementById('sharePasscodePromptText');

    el.sharedBadge = document.getElementById('sharedBadge');
    el.sharedHomeBtn = document.getElementById('sharedHomeBtn');

    if (el.mainCopyShareBtn) {
      el.mainCopyShareBtn.addEventListener('click', copyMainShareUrl);
    }

    if (el.toggleShareStateBtn) {
      el.toggleShareStateBtn.addEventListener('click', toggleCurrentDocShareState);
    }

    if (el.revokeActiveShareBtn) {
      el.revokeActiveShareBtn.addEventListener('click', revokeCurrentActiveShare);
    }

    if (el.sharesHubBtn) {
      el.sharesHubBtn.addEventListener('click', () => openSharesHub());
    }

    if (el.activeShareExpireSelect) {
      el.activeShareExpireSelect.addEventListener('change', handleActiveExpireChange);
    }

    if (el.activeShareEditPassToggle) {
      el.activeShareEditPassToggle.addEventListener('click', () => {
        if (!el.activeSharePassDrawer) return;
        const isHidden = el.activeSharePassDrawer.style.display === 'none';
        el.activeSharePassDrawer.style.display = isHidden ? 'block' : 'none';
        if (isHidden && el.activeSharePassInput) {
          if (!el.activeSharePassInput.value) {
            el.activeSharePassInput.value = generateRandomPasscode();
          }
          el.activeSharePassInput.focus();
        }
      });
    }

    if (el.activeShareDiceBtn) {
      el.activeShareDiceBtn.addEventListener('click', () => {
        if (el.activeSharePassInput) el.activeSharePassInput.value = generateRandomPasscode();
      });
    }

    if (el.activeShareSavePassBtn) {
      el.activeShareSavePassBtn.addEventListener('click', handleActiveSavePasscode);
    }

    if (el.activeShareRemovePassBtn) {
      el.activeShareRemovePassBtn.addEventListener('click', handleActiveRemovePasscode);
    }

    if (el.activeShareClosePassBtn) {
      el.activeShareClosePassBtn.addEventListener('click', () => {
        if (el.activeSharePassDrawer) el.activeSharePassDrawer.style.display = 'none';
      });
    }

    if (el.newShareEnablePass) {
      el.newShareEnablePass.addEventListener('change', () => {
        if (el.newShareEnablePass.checked) {
          if (el.newSharePassWrap) el.newSharePassWrap.style.display = 'flex';
          if (el.newSharePassInput && !el.newSharePassInput.value) {
            el.newSharePassInput.value = generateRandomPasscode();
          }
        } else {
          if (el.newSharePassWrap) el.newSharePassWrap.style.display = 'none';
        }
      });
    }

    if (el.newShareDiceBtn) {
      el.newShareDiceBtn.addEventListener('click', () => {
        if (el.newSharePassInput) el.newSharePassInput.value = generateRandomPasscode();
      });
    }

    if (el.startShareBtn) {
      el.startShareBtn.addEventListener('click', handleStartShare);
    }

    if (el.sharePasscodeForm) {
      el.sharePasscodeForm.addEventListener('submit', handleGuestPasscodeSubmit);
    }

    // 事件绑定
    if (el.themeBtn) el.themeBtn.addEventListener('click', toggleTheme);
    if (el.menuBtn) el.menuBtn.addEventListener('click', toggleMobileSidebar);
    if (el.sidebarOverlay) el.sidebarOverlay.addEventListener('click', closeMobileSidebar);
    if (el.closeSidebarBtn) el.closeSidebarBtn.addEventListener('click', closeMobileSidebar);

    const repoSwitcherBtn = document.getElementById('repoSwitcherBtn');
    const repoDropdownMenu = document.getElementById('repoDropdownMenu');
    if (repoSwitcherBtn && repoDropdownMenu) {
      repoSwitcherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleRepoDropdown();
      });

      document.addEventListener('click', (e) => {
        if (!repoDropdownMenu.contains(e.target) && e.target !== repoSwitcherBtn && !repoSwitcherBtn.contains(e.target)) {
          closeRepoDropdown();
        }
      });
    }

    if (el.fabTocBtn) {
      el.fabTocBtn.addEventListener('click', () => {
        if (fabJustDragged) return;
        openModal(el.mobileTocModal);
      });
    }
    if (el.fabAiBtn) {
      el.fabAiBtn.addEventListener('click', (e) => {
        if (fabJustDragged || state.isShareMode) return;
        e.preventDefault();
        e.stopPropagation();
        openAiTaskModal({
          doc: state.currentDoc || null,
          defaultAction: state.currentDoc ? 'append' : 'new'
        });
      });
    }
    if (el.mobileMindmapBtn) {
      el.mobileMindmapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (el.mobileTocModal) closeModal(el.mobileTocModal);
        if (state.currentDoc) {
          openDocMindmap(state.currentDoc);
        }
      });
    }
    if (el.copyOriginDocLinkBtn) {
      el.copyOriginDocLinkBtn.addEventListener('click', async () => {
        await copyTextToClipboard(window.location.href);
        const originalText = el.copyOriginLinkText ? el.copyOriginLinkText.textContent : '复制原链接';
        if (el.copyOriginLinkText) el.copyOriginLinkText.textContent = '已复制！';
        el.copyOriginDocLinkBtn.style.color = '#10b981';
        setTimeout(() => {
          if (el.copyOriginLinkText) el.copyOriginLinkText.textContent = originalText;
          el.copyOriginDocLinkBtn.style.color = '';
        }, 2000);
      });
    }
    if (el.loginForm) el.loginForm.addEventListener('submit', handleLoginSubmit);
    if (el.repoSelect) el.repoSelect.addEventListener('change', (e) => selectRepo(e.target.value));
    if (el.searchInput) el.searchInput.addEventListener('input', onSearchInput);
    if (el.clearSearchBtn) el.clearSearchBtn.addEventListener('click', clearSearch);
    if (el.quickSearchBtn) {
      el.quickSearchBtn.addEventListener('click', () => {
        openQuickSearchModal();
      });
    }

    if (el.modalSearchInput) {
      el.modalSearchInput.addEventListener('input', onModalSearchInput);
      el.modalSearchInput.addEventListener('keydown', onModalSearchKeydown);
    }
    if (el.modalSearchClearBtn) {
      el.modalSearchClearBtn.addEventListener('click', clearModalSearch);
    }
    if (el.searchTabTitle) {
      el.searchTabTitle.addEventListener('click', () => switchSearchMode('title'));
    }
    if (el.searchTabContent) {
      el.searchTabContent.addEventListener('click', () => switchSearchMode('content'));
    }
    if (el.modalSearchScope) {
      el.modalSearchScope.addEventListener('change', () => triggerModalSearch(true));
    }
    if (el.modalSearchResults) {
      el.modalSearchResults.addEventListener('touchmove', () => {
        if (el.modalSearchInput) el.modalSearchInput.blur();
      }, { passive: true });
    }

    const mindmapFitBtn = document.getElementById('mindmapFitBtn');
    if (mindmapFitBtn) {
      mindmapFitBtn.addEventListener('click', () => {
        if (currentMarkmapInstance) currentMarkmapInstance.fit();
      });
    }

    const mindmapBackBtn = document.getElementById('mindmapBackBtn');
    if (mindmapBackBtn) {
      mindmapBackBtn.addEventListener('click', () => {
        if (mindmapDrillStack && mindmapDrillStack.length > 1) {
          mindmapDrillStack.pop();
          hideFocusPill();
          renderCurrentMindmapView();
        }
      });
    }

    const mindmapPill = document.getElementById('mindmapFocusPill');
    if (mindmapPill) {
      mindmapPill.addEventListener('mouseenter', () => {
        clearTimeout(pillHideTimeout);
      });
      mindmapPill.addEventListener('mouseleave', () => {
        pillHideTimeout = setTimeout(hideFocusPill, 200);
      });
    }

    const mindmapPillFocusBtn = document.getElementById('mindmapPillFocusBtn');
    if (mindmapPillFocusBtn) {
      mindmapPillFocusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentHoveredNodeDatum) {
          drillIntoNode(currentHoveredNodeDatum);
        }
      });
    }

    const mindmapPillLocateBtn = document.getElementById('mindmapPillLocateBtn');
    if (mindmapPillLocateBtn) {
      mindmapPillLocateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentHoveredNodeDatum) {
          const title = extractNodeTitle(currentHoveredNodeDatum);
          jumpToHeadingInDoc(title);
        }
      });
    }

    document.querySelectorAll('.depth-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = parseInt(btn.getAttribute('data-depth'));
        if (!isNaN(d)) {
          applyMindmapDepth(d);
        }
      });
    });

    window.addEventListener('resize', () => {
      if (currentMarkmapInstance && document.getElementById('mindmapModal')?.classList.contains('open')) {
        currentMarkmapInstance.fit();
      }
    });

    const brandTitle = document.querySelector('.brand-title');
    if (brandTitle) {
      brandTitle.addEventListener('click', (e) => {
        e.preventDefault();
        routeTo('/', true);
      });
    }

    if (el.collapseAllBtn) {
      el.collapseAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        collapseAllTreeNodes();
      });
    }
    if (el.refreshTreeBtn) {
      el.refreshTreeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.currentRepo) loadTree(state.currentRepo.ID, true);
      });
    }
    if (el.filterFavBtn) {
      el.filterFavBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavoritesFilter();
      });
    }

    function toggleSidebarSection(secId) {
      const sec = document.getElementById(secId);
      if (sec) sec.classList.toggle('collapsed');
    }

    if (el.headerFavorites) {
      el.headerFavorites.addEventListener('click', () => {
        const sec = document.getElementById('sectionFavorites');
        if (sec) sec.dataset.userToggled = 'true';
        toggleSidebarSection('sectionFavorites');
      });
    }

    if (el.headerRecentReads) {
      el.headerRecentReads.addEventListener('click', (e) => {
        if (e.target.closest('#clearRecentReadsBtn')) return;
        const sec = document.getElementById('sectionRecentReads');
        if (sec) sec.dataset.userToggled = 'true';
        toggleSidebarSection('sectionRecentReads');
      });
    }
    if (el.clearRecentReadsBtn) {
      el.clearRecentReadsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearRecentReads();
      });
    }

    if (el.headerRecentCreated) {
      el.headerRecentCreated.addEventListener('click', (e) => {
        if (e.target.closest('#refreshRecentCreatedBtn')) return;
        toggleSidebarSection('sectionRecentCreated');
      });
    }
    if (el.refreshRecentCreatedBtn) {
      el.refreshRecentCreatedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.currentRepo) loadRecentCreated(state.currentRepo.ID);
      });
    }

    if (el.headerFileTree) {
      el.headerFileTree.addEventListener('click', (e) => {
        if (e.target.closest('#collapseAllBtn') || e.target.closest('#refreshTreeBtn') || e.target.closest('#filterFavBtn')) return;
        toggleSidebarSection('sectionFileTree');
      });
    }

    const scrollContainer = document.querySelector('.sidebar-scrollable-content');
    if (scrollContainer) {
      let sidebarScrollDebounce = null;
      scrollContainer.addEventListener('scroll', () => {
        if (state.currentRepo) {
          clearTimeout(sidebarScrollDebounce);
          sidebarScrollDebounce = setTimeout(() => {
            try {
              localStorage.setItem('doc_lens_sidebar_scroll_' + state.currentRepo.ID, scrollContainer.scrollTop);
            } catch (e) {}
          }, 100);
        }
      }, { passive: true });
    }

    if (el.aiTaskBtn) el.aiTaskBtn.addEventListener('click', openTaskCenter);
    if (el.aiDraftBtn) {
      el.aiDraftBtn.addEventListener('click', () => {
        openAiTaskModal({ doc: state.currentDoc, defaultAction: 'new' });
      });
    }
    if (el.aiDraftForm) el.aiDraftForm.addEventListener('submit', handleDraftSubmit);
    if (el.refreshTasksBtn) el.refreshTasksBtn.addEventListener('click', loadTasks);

    // AI 任务操作类型切换
    document.querySelectorAll('.task-action-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        setTaskActionType(tab.getAttribute('data-action'));
      });
    });

    if (el.clearDraftContextBtn) {
      el.clearDraftContextBtn.addEventListener('click', clearContextDoc);
    }

    if (el.draftRepoTriggerBtn) {
      el.draftRepoTriggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDraftRepoMenu();
      });
    }

    if (el.draftRepo) {
      el.draftRepo.addEventListener('change', () => {
        syncDraftRepoUI(el.draftRepo.value);
        if (state.draftContextDoc && state.draftContextDoc.repo_id !== el.draftRepo.value) {
          clearContextDoc();
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (el.draftRepoPicker && !el.draftRepoPicker.contains(e.target)) {
        closeDraftRepoMenu();
      }
    });

    if (el.draftPrompt) {
      el.draftPrompt.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (el.aiDraftForm) {
            el.aiDraftForm.requestSubmit();
          }
        }
      });
    }

    // 手机端任务终端 Tab 切换
    document.querySelectorAll('.terminal-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.terminal-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabType = tab.getAttribute('data-tab');
        const layoutBody = document.querySelector('.terminal-layout-body');
        if (layoutBody) {
          layoutBody.classList.toggle('show-log', tabType === 'log');
        }
      });
    });

    // 手机端双悬浮球微交互 (向下翻阅时半透明微缩小避让正文，静止或向上回滚时恢复)
    let lastScrollY = 0;
    el.contentArea.addEventListener('scroll', () => {
      const curY = el.contentArea.scrollTop;
      const isScrolledDown = curY > lastScrollY && curY > 120;
      if (el.fabContainer && !isFabDragging) {
        el.fabContainer.style.opacity = isScrolledDown ? '0.38' : '1';
        el.fabContainer.style.transform = isScrolledDown ? 'scale(0.88)' : 'scale(1)';
      }
      lastScrollY = curY;
    }, { passive: true });

    // 通用模态框关闭与遮罩背景点击过滤
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeAllModals();
        }
      });
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });
  }

  // ==========================================
  // 手机端双悬浮球 (AI创作 + 目录大纲) 拖拽、左右贴边吸附与位置持久化记忆
  // ==========================================
  let isFabDragging = false;
  let fabJustDragged = false;

  function initFabDragAndPosition() {
    const container = el.fabContainer;
    if (!container) return;

    // 1. 恢复之前保存的位置或默认位置
    restoreFabPosition();

    // 2. 屏幕旋转或视口大小改变时自适应保持贴边与垂直比例
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(restoreFabPosition, 100);
    });

    // 3. 拖拽逻辑 (支持触控 Touch 与鼠标 Pointer)
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      isFabDragging = false;
      startX = e.clientX;
      startY = e.clientY;

      const rect = container.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      container.classList.remove('is-snapping');

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    };

    const onPointerMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dist = Math.hypot(dx, dy);

      if (!isFabDragging) {
        if (dist > 6) {
          isFabDragging = true;
          container.classList.add('is-dragging');
          container.classList.remove('is-snapping');
          container.style.opacity = '1';
          container.style.transform = 'scale(1.04)';
          try {
            if (e.pointerId !== undefined && container.setPointerCapture) {
              container.setPointerCapture(e.pointerId);
            }
          } catch (_) {}
        } else {
          return;
        }
      }

      if (e.cancelable) e.preventDefault();

      const btnW = container.offsetWidth || 44;
      const btnH = container.offsetHeight || (state.isShareMode ? 44 : 98);
      const minX = 8;
      const maxX = Math.max(minX, window.innerWidth - btnW - 8);
      const minY = 56;
      const maxY = Math.max(minY, window.innerHeight - btnH - 16);

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      newLeft = Math.max(minX, Math.min(maxX, newLeft));
      newTop = Math.max(minY, Math.min(maxY, newTop));

      container.style.left = `${newLeft}px`;
      container.style.top = `${newTop}px`;
      container.style.right = 'auto';
      container.style.bottom = 'auto';
    };

    const onPointerUp = (e) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      try {
        if (e && e.pointerId !== undefined && container.releasePointerCapture) {
          container.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}

      if (isFabDragging) {
        isFabDragging = false;
        container.classList.remove('is-dragging');
        container.classList.add('is-snapping');
        container.style.transform = 'scale(1)';

        snapToNearestEdgeAndSave();

        fabJustDragged = true;
        setTimeout(() => {
          fabJustDragged = false;
        }, 280);

        setTimeout(() => {
          container.classList.remove('is-snapping');
        }, 360);
      } else {
        container.classList.remove('is-dragging');
        container.style.transform = 'scale(1)';
      }
    };

    container.addEventListener('pointerdown', onPointerDown);

    // 捕获阶段拦截点击，严防拖拽松手时意外触发弹窗
    container.addEventListener('click', (e) => {
      if (fabJustDragged) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }, true);
  }

  function snapToNearestEdgeAndSave() {
    const container = el.fabContainer;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const btnW = rect.width || 44;
    const btnH = rect.height || (state.isShareMode ? 44 : 98);
    const centerX = rect.left + btnW / 2;
    const isLeft = centerX < (window.innerWidth / 2);
    const side = isLeft ? 'left' : 'right';
    const marginX = 14;

    const minY = 56;
    const maxY = Math.max(minY, window.innerHeight - btnH - 20);
    const clampedTop = Math.max(minY, Math.min(maxY, rect.top));

    if (side === 'left') {
      container.style.left = `${marginX}px`;
      container.style.right = 'auto';
    } else {
      container.style.left = `${Math.max(marginX, window.innerWidth - btnW - marginX)}px`;
      container.style.right = 'auto';
    }
    container.style.top = `${clampedTop}px`;
    container.style.bottom = 'auto';

    const verticalRatio = (clampedTop - minY) / Math.max(1, (maxY - minY));
    try {
      localStorage.setItem('doclens_fab_pos', JSON.stringify({
        side: side,
        ratio: Math.max(0, Math.min(1, verticalRatio))
      }));
    } catch (_) {}
  }

  function restoreFabPosition() {
    const container = el.fabContainer;
    if (!container) return;

    let side = 'right';
    let ratio = 0.85;

    try {
      const saved = localStorage.getItem('doclens_fab_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.side === 'left' || parsed.side === 'right') side = parsed.side;
        if (typeof parsed.ratio === 'number' && !isNaN(parsed.ratio)) {
          ratio = Math.max(0, Math.min(1, parsed.ratio));
        }
      }
    } catch (_) {}

    const btnW = container.offsetWidth || 44;
    const btnH = container.offsetHeight || (state.isShareMode ? 44 : 98);
    const marginX = 14;
    const minY = 56;
    const maxY = Math.max(minY, window.innerHeight - btnH - 20);
    const targetTop = minY + ratio * (maxY - minY);

    if (side === 'left') {
      container.style.left = `${marginX}px`;
      container.style.right = 'auto';
    } else {
      container.style.left = `${Math.max(marginX, window.innerWidth - btnW - marginX)}px`;
      container.style.right = 'auto';
    }
    container.style.top = `${Math.max(minY, Math.min(maxY, targetTop))}px`;
    container.style.bottom = 'auto';
  }

  function bindGlobalKeybindings() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
        closeMobileSidebar();
        closeRepoDropdown();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openQuickSearchModal();
      }
    });
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('doc_lens_theme', theme);
    } catch (e) {}

    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark' ? SVG_ICONS.moon : SVG_ICONS.sun;
    }
    if (el.themeBtn) {
      el.themeBtn.innerHTML = theme === 'dark' ? SVG_ICONS.sun : SVG_ICONS.moon;
    }

    document.querySelectorAll('.theme-opt-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });

    if (window.mermaid) {
      initMermaid();
      document.querySelectorAll('.mermaid-wrapper').forEach(wrapper => {
        wrapper.removeAttribute('data-rendered');
        renderSingleMermaidChart(wrapper);
      });
    }

    updateMindmapTheme();
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  // 字体与排版喜好管理
  const FONT_PREF_KEY = 'doc_lens_font_style';
  const FONT_SIZE_KEY = 'doc_lens_font_size';

  function initFontPreferences() {
    let savedFont = 'system';
    let savedSize = window.innerWidth <= 768 ? 15 : 15.5;
    try {
      savedFont = localStorage.getItem(FONT_PREF_KEY) || 'system';
      const storedSize = parseFloat(localStorage.getItem(FONT_SIZE_KEY));
      if (storedSize && !isNaN(storedSize)) {
        savedSize = storedSize;
      }
    } catch (e) {}

    applyFontStyle(savedFont);
    applyFontSize(savedSize);

    const fontBtn = document.getElementById('fontSettingBtn');
    const popover = document.getElementById('fontPopover');
    if (!fontBtn || !popover) return;

    // 同步外观主题按钮的初始激活状态
    popover.querySelectorAll('.theme-opt-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === state.theme);
    });

    fontBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = popover.style.display !== 'none';
      popover.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        ensureLxgwFontLoaded();
        ensurePuhuitiFontLoaded();
        ensureSerifFontLoaded();
      }
    });

    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && e.target !== fontBtn && !fontBtn.contains(e.target)) {
        popover.style.display = 'none';
      }
    });

    popover.querySelectorAll('.theme-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTheme = btn.getAttribute('data-theme');
        if (targetTheme && targetTheme !== state.theme) {
          applyTheme(targetTheme);
        }
      });
    });

    popover.querySelectorAll('.font-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const font = btn.getAttribute('data-font');
        applyFontStyle(font);
      });
    });

    document.getElementById('fontSmallerBtn')?.addEventListener('click', () => {
      let cur = parseFloat(document.documentElement.style.getPropertyValue('--article-font-size')) || (window.innerWidth <= 768 ? 15 : 15.5);
      if (cur > 13.5) {
        cur = Math.round((cur - 0.5) * 10) / 10;
        applyFontSize(cur);
      }
    });

    document.getElementById('fontBiggerBtn')?.addEventListener('click', () => {
      let cur = parseFloat(document.documentElement.style.getPropertyValue('--article-font-size')) || (window.innerWidth <= 768 ? 15 : 15.5);
      if (cur < 20) {
        cur = Math.round((cur + 0.5) * 10) / 10;
        applyFontSize(cur);
      }
    });
  }

  function applyFontStyle(font) {
    if (font === 'wenkai') {
      ensureLxgwFontLoaded();
      document.documentElement.setAttribute('data-font-style', 'wenkai');
    } else if (font === 'puhuiti') {
      ensurePuhuitiFontLoaded();
      document.documentElement.setAttribute('data-font-style', 'puhuiti');
    } else if (font === 'serif') {
      ensureSerifFontLoaded();
      document.documentElement.setAttribute('data-font-style', 'serif');
    } else {
      document.documentElement.setAttribute('data-font-style', 'system');
      font = 'system';
    }
    try {
      localStorage.setItem(FONT_PREF_KEY, font);
    } catch (e) {}

    document.querySelectorAll('.font-opt-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-font') === font);
    });
  }

  function ensureLxgwFontLoaded() {
    if (document.getElementById('lxgwFontLink')) return;
    const link = document.createElement('link');
    link.id = 'lxgwFontLink';
    link.rel = 'stylesheet';
    link.href = '/fonts/lxgw-wenkai/result.css';
    document.head.appendChild(link);
  }

  function ensurePuhuitiFontLoaded() {
    if (document.getElementById('puhuitiFontLink')) return;
    const link = document.createElement('link');
    link.id = 'puhuitiFontLink';
    link.rel = 'stylesheet';
    link.href = '/fonts/alibaba-puhuiti/result.css';
    document.head.appendChild(link);
  }

  function ensureSerifFontLoaded() {
    if (document.getElementById('serifFontLink')) return;
    const link = document.createElement('link');
    link.id = 'serifFontLink';
    link.rel = 'stylesheet';
    link.href = '/fonts/source-han-serif/result.css';
    document.head.appendChild(link);
  }

  function applyFontSize(size) {
    document.documentElement.style.setProperty('--article-font-size', `${size}px`);
    const label = document.getElementById('fontSizeLabel');
    if (label) label.textContent = `${size}px`;
    try {
      localStorage.setItem(FONT_SIZE_KEY, size.toString());
    } catch (e) {}
  }

  function toggleMobileSidebar() {
    el.sidebar.classList.toggle('open');
    el.sidebarOverlay.classList.toggle('open');
    document.body.classList.toggle('modal-open', el.sidebar.classList.contains('open'));
  }

  function openMobileSidebar() {
    el.sidebar.classList.add('open');
    el.sidebarOverlay.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeMobileSidebar() {
    el.sidebar.classList.remove('open');
    el.sidebarOverlay.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  function initSidebarTabs() {
    const navContainer = document.getElementById('sidebarNavTabs');
    if (!navContainer) return;

    const btns = navContainer.querySelectorAll('.nav-tab-item');
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tab = btn.dataset.tab;
        if (tab) switchSidebarTab(tab);
      });
    });

    const savedTab = localStorage.getItem('doc_lens_sidebar_tab') || 'tree';
    switchSidebarTab(savedTab, false);
  }

  function switchSidebarTab(tabName, persist = true) {
    if (!['tree', 'favorites', 'recent'].includes(tabName)) {
      tabName = 'tree';
    }
    state.activeSidebarTab = tabName;
    if (persist) {
      try {
        localStorage.setItem('doc_lens_sidebar_tab', tabName);
      } catch (e) {}
    }

    const navContainer = document.getElementById('sidebarNavTabs');
    if (navContainer) {
      const btns = navContainer.querySelectorAll('.nav-tab-item');
      btns.forEach(btn => {
        const isMatch = btn.dataset.tab === tabName;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
    }

    const scrollContainer = document.querySelector('.sidebar-scrollable-content');
    if (scrollContainer) {
      scrollContainer.dataset.activeTab = tabName;
    }

    if (tabName === 'favorites') {
      renderFavorites();
    } else if (tabName === 'recent') {
      renderRecentReads();
      if (state.currentRepo) {
        loadRecentCreated(state.currentRepo.ID);
      }
    }
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.style.display = '';
    modalEl.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeModal(modalEl) {
    if (modalEl === el.aiDraftModal && typeof closeDraftRepoMenu === 'function') {
      closeDraftRepoMenu();
    }
    modalEl.classList.remove('open');
    if (typeof hideFocusPill === 'function') {
      hideFocusPill();
    }
    if (!document.querySelector('.modal-overlay.open')) {
      document.body.classList.remove('modal-open');
    }
  }

  function closeAllModals() {
    if (typeof closeDraftRepoMenu === 'function') {
      closeDraftRepoMenu();
    }
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    document.body.classList.remove('modal-open');
    if (state.taskLogTimer) {
      clearInterval(state.taskLogTimer);
      state.taskLogTimer = null;
    }
  }

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      state.authenticated = !!data.authenticated;
      if (!state.authenticated) {
        openModal(el.loginModal);
        el.loginPass.focus();
      } else {
        closeModal(el.loginModal);
      }
    } catch (e) {
      openModal(el.loginModal);
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (el.loginError) el.loginError.textContent = '';
    const pass = el.loginPass ? el.loginPass.value.trim() : '';
    if (!pass) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        if (el.loginError) el.loginError.textContent = data.error || '密码授权失败';
        return;
      }
      state.authenticated = true;
      closeModal(el.loginModal);
      if (el.loginPass) el.loginPass.value = '';
      await loadListenQueue();
      await loadRepos();

      const curPath = window.location.pathname;
      if (curPath && curPath !== '/') {
        await routeTo(curPath, false);
      } else if (state.repos.length > 0) {
        await selectRepo(state.repos[0].ID);
        renderWelcomeDashboard();
      }
    } catch (err) {
      if (el.loginError) el.loginError.textContent = '网络通信失败，请检查服务状态';
    }
  }

  async function loadRepos() {
    try {
      if (!state.repos || state.repos.length === 0) {
        try {
          const cached = sessionStorage.getItem('doc_lens_repos_cache');
          if (cached) {
            state.repos = JSON.parse(cached);
            populateRepoSelect();
          }
        } catch (e) {}
      }

      const res = await fetch('/api/repos');
      if (!res.ok) return;
      state.repos = await res.json();
      try {
        sessionStorage.setItem('doc_lens_repos_cache', JSON.stringify(state.repos));
      } catch (e) {}
      populateRepoSelect();
    } catch (e) {
      console.error('Failed to load repositories', e);
    }
  }

  function populateRepoSelect() {
    if (!state.repos) return;
    const curDraftVal = el.draftRepo ? el.draftRepo.value : '';
    if (el.repoSelect) el.repoSelect.innerHTML = '';
    if (el.draftRepo) el.draftRepo.innerHTML = '';

    state.repos.forEach(r => {
      if (el.repoSelect) {
        const opt = document.createElement('option');
        opt.value = r.ID;
        opt.textContent = `${r.Name} (${r.RoutePrefix})`;
        el.repoSelect.appendChild(opt);
      }

      if (el.draftRepo) {
        const dOpt = document.createElement('option');
        dOpt.value = r.ID;
        dOpt.textContent = r.Name;
        el.draftRepo.appendChild(dOpt);
      }
    });

    if (el.draftRepo) {
      if (curDraftVal && state.repos.some(r => r.ID === curDraftVal)) {
        el.draftRepo.value = curDraftVal;
      } else if (state.currentRepo) {
        el.draftRepo.value = state.currentRepo.ID;
      }
      syncDraftRepoUI(el.draftRepo.value);
    }

    renderRepoDropdownMenu();
  }

  function renderRepoDropdownMenu() {
    const menuList = document.getElementById('repoMenuList');
    if (!menuList) return;
    menuList.innerHTML = '';
    state.repos.forEach(r => {
      const isCur = state.currentRepo && state.currentRepo.ID === r.ID;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `repo-menu-item ${isCur ? 'active' : ''}`;
      btn.innerHTML = `
        <div class="repo-item-main">
          <span class="repo-item-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </span>
          <span class="repo-item-name">${escapeHtml(r.Name)}</span>
          <span class="repo-item-prefix">${escapeHtml(r.RoutePrefix || '')}</span>
        </div>
        ${isCur ? '<span class="repo-item-check">✓</span>' : ''}
      `;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeRepoDropdown();
        if (!state.currentRepo || state.currentRepo.ID !== r.ID) {
          selectRepo(r.ID, false);
          routeTo('/' + (r.RoutePrefix || '').replace(/^\/+|\/+$/g, ''), true);
        }
      });
      menuList.appendChild(btn);
    });
  }

  function toggleRepoDropdown() {
    const switcherBtn = document.getElementById('repoSwitcherBtn');
    const dropdownMenu = document.getElementById('repoDropdownMenu');
    if (!switcherBtn || !dropdownMenu) return;
    const isVisible = dropdownMenu.style.display !== 'none';
    dropdownMenu.style.display = isVisible ? 'none' : 'flex';
    switcherBtn.classList.toggle('active', !isVisible);
    switcherBtn.setAttribute('aria-expanded', !isVisible);
  }

  function closeRepoDropdown() {
    const switcherBtn = document.getElementById('repoSwitcherBtn');
    const dropdownMenu = document.getElementById('repoDropdownMenu');
    if (switcherBtn) switcherBtn.classList.remove('active');
    if (dropdownMenu) dropdownMenu.style.display = 'none';
  }

  function findRepoForRoute(urlPath) {
    if (!state.repos || state.repos.length === 0) return null;
    const cleanPath = '/' + urlPath.replace(/^\/+|\/+$/g, '');

    const sorted = [...state.repos].sort((a, b) => (b.RoutePrefix || '').length - (a.RoutePrefix || '').length);
    for (const r of sorted) {
      const prefix = '/' + (r.RoutePrefix || '').replace(/^\/+|\/+$/g, '');
      if (cleanPath === prefix || cleanPath.startsWith(prefix + '/')) {
        return r;
      }
    }
    return state.repos[0];
  }

  // =========================================================================
  // 目录展开状态管理：默认纯净收拢缩进，阅读某篇文章时仅局部展开其祖先路径
  // =========================================================================
  function getExpandedDirs(repoID) {
    // 目录树默认全部收拢折叠，杜绝旧历史缓存导致全盘铺开
    return new Set();
  }

  function saveExpandedDirs(repoID, set) {
    // 不再向持久存储膨胀式累计所有历史目录
  }

  function setDirExpanded(repoID, dirPath, expanded) {
    if (!repoID || !dirPath) return;
    if (!state.expandedDirs) state.expandedDirs = new Set();
    if (expanded) {
      state.expandedDirs.add(dirPath);
    } else {
      state.expandedDirs.delete(dirPath);
    }
  }

  function clearAllExpandedDirs(repoID) {
    state.expandedDirs = new Set();
  }

  function restoreSidebarScroll(repoID) {
    if (!repoID) return;
    try {
      const saved = localStorage.getItem('doc_lens_sidebar_scroll_' + repoID);
      if (saved) {
        const scrollContainer = document.querySelector('.sidebar-scrollable-content');
        if (scrollContainer) {
          requestAnimationFrame(() => {
            scrollContainer.scrollTop = parseInt(saved, 10);
          });
        }
      }
    } catch (e) {}
  }

  async function selectRepo(repoID, restoreLastActive = true) {
    const repo = state.repos.find(r => r.ID === repoID);
    if (!repo) return;
    state.currentRepo = repo;
    // 切换知识库时，目录树重置为纯净收拢缩进状态
    state.expandedDirs = new Set();
    if (el.repoSelect) el.repoSelect.value = repoID;
    const titleEl = document.getElementById('currentRepoName');
    if (titleEl) titleEl.textContent = repo.Name;
    renderRepoDropdownMenu();

    try {
      localStorage.setItem('doc_lens_last_repo', repoID);
    } catch (e) {}

    renderRecentReads();

    // 异步加载并渲染目录树
    loadTree(repoID);
    loadRecentCreated(repoID);

    if (restoreLastActive) {
      const lastDoc = localStorage.getItem('doc_lens_last_active_' + repoID);
      const cleanPrefix = '/' + (repo.RoutePrefix || '').replace(/^\/+|\/+$/g, '');
      if (lastDoc && lastDoc !== '/' && lastDoc !== cleanPrefix) {
        await routeTo(lastDoc, true);
        restoreSidebarScroll(repoID);
        return;
      }
    }

    if (!state.currentDoc || window.location.pathname === '/' || window.location.pathname === (repo.RoutePrefix || '')) {
      renderWelcomeDashboard();
    }

    restoreSidebarScroll(repoID);
  }

  const TREE_STORAGE_PREFIX = 'doc_lens_tree_v3_';

  function getStoredTree(repoID) {
    try {
      const raw = sessionStorage.getItem(TREE_STORAGE_PREFIX + repoID);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data && parsed.ts) {
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  function saveStoredTree(repoID, data) {
    try {
      sessionStorage.setItem(TREE_STORAGE_PREFIX + repoID, JSON.stringify({
        ts: Date.now(),
        data: data
      }));
    } catch (e) {
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(TREE_STORAGE_PREFIX) && k !== (TREE_STORAGE_PREFIX + repoID)) {
            sessionStorage.removeItem(k);
          }
        }
        sessionStorage.setItem(TREE_STORAGE_PREFIX + repoID, JSON.stringify({
          ts: Date.now(),
          data: data
        }));
      } catch (err) {}
    }
  }

  async function loadTree(repoID, forceRefresh = false) {
    state.expandedDirs = getExpandedDirs(repoID);
    if (!state.repoTreeCache) state.repoTreeCache = new Map();

    const applyTreeData = (treeData) => {
      state.treeData = treeData;
      state.repoTreeCache.set(repoID, treeData);
      if (state.filterFavoritesOnly || (el.searchInput && el.searchInput.value.trim())) {
        filterFileTree(el.searchInput ? el.searchInput.value : '');
      } else {
        renderFileTree(state.treeData, el.fileTree);
        updateTreeFileStats(state.treeData);
      }
      renderDocPagination();
      if (!state.currentDoc) {
        renderWelcomeDashboard();
      }
    };

    // 1. 本地/内存层命中：0ms 瞬间秒出（优先即刻渲染缓存，绝不阻塞用户）
    let hasLocalRendered = false;
    if (!forceRefresh) {
      if (state.repoTreeCache.has(repoID)) {
        applyTreeData(state.repoTreeCache.get(repoID));
        hasLocalRendered = true;
      } else {
        const local = getStoredTree(repoID);
        if (local && local.data) {
          applyTreeData(local.data);
          hasLocalRendered = true;
        }
      }
    }

    // 若本地未命中且无缓存，展示轻量加载提示
    if (!hasLocalRendered) {
      el.fileTree.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">加载目录索引...</div>';
    }

    // 3. 网络请求（若已有本地渲染，则为后台静默 stale-while-revalidate，复用正在进行的 in-flight Promise）
    if (!state.inFlightTrees) state.inFlightTrees = new Map();
    if (!forceRefresh && state.inFlightTrees.has(repoID)) {
      try {
        const freshTree = await state.inFlightTrees.get(repoID);
        if (freshTree) applyTreeData(freshTree);
      } catch (e) {}
      return;
    }

    const treePromise = (async () => {
      const res = await fetch(`/api/tree?repo=${encodeURIComponent(repoID)}&refresh=${forceRefresh}`);
      if (res.status === 304 && hasLocalRendered) {
        saveStoredTree(repoID, state.treeData);
        return state.treeData;
      }
      if (!res.ok) throw new Error('Failed to load tree');
      const freshTree = await res.json();
      saveStoredTree(repoID, freshTree);
      return freshTree;
    })().finally(() => {
      state.inFlightTrees.delete(repoID);
    });

    state.inFlightTrees.set(repoID, treePromise);

    try {
      const freshTree = await treePromise;
      if (freshTree) applyTreeData(freshTree);
    } catch (e) {
      if (!hasLocalRendered) {
        el.fileTree.innerHTML = `<div style="padding:16px;color:#ef4444;font-size:12px;">加载失败: ${e.message}</div>`;
      }
    }
  }

  function updateTreeFileStats(rootNode) {
    // 性能优化：按用户反馈移除无意义的递归文件计数，消除数千节点 CPU 遍历开销
  }

  function renderHighlightedText(text, query) {
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
  }

  // 核心优化：按需惰性渲染（Lazy Mounting on Demand）
  // 首屏仅创建直属第一级节点，展开目录时才动态挂载子级，使 DOM 节点从 14 万个暴降到 50 个！
  function renderFileTree(rootNode, container, forceExpand = false, highlightQuery = '') {
    container.innerHTML = '';
    if (!rootNode || !rootNode.children || rootNode.children.length === 0) {
      container.innerHTML = '<div class="section-empty-hint">暂无匹配文档</div>';
      return;
    }
    if (state.currentRepo && !state.expandedDirs) {
      state.expandedDirs = getExpandedDirs(state.currentRepo.ID);
    }
    const fragment = document.createDocumentFragment();
    rootNode.children.forEach(child => {
      fragment.appendChild(createLazyTreeNodeElement(child, state.currentRepo.RoutePrefix, forceExpand, highlightQuery));
    });
    container.appendChild(fragment);

    if (state.currentPath && !highlightQuery) {
      expandPathToNode(state.currentPath);
    }
  }

  function createLazyTreeNodeElement(node, routePrefix, forceExpand = false, highlightQuery = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'tree-item-group';

    let iconSvg = SVG_ICONS.text;
    if (node.is_dir) {
      iconSvg = node.is_repo ? SVG_ICONS.repo : SVG_ICONS.folder;
    } else {
      if (['.md', '.markdown'].includes(node.ext)) iconSvg = SVG_ICONS.markdown;
      else if (['.html', '.htm'].includes(node.ext)) iconSvg = SVG_ICONS.html;
      else if (['.py', '.sh', '.go', '.js', '.ts', '.yaml', '.yml', '.json'].includes(node.ext)) iconSvg = SVG_ICONS.code;
    }

    const cleanPrefix = (routePrefix || '').replace(/\/+$/, '');
    const cleanPath = (node.path || '').replace(/^\/+/, '');
    const fullRoute = `${cleanPrefix}/${cleanPath}`;

    let item;
    if (node.is_dir) {
      // 目录必须为 div，杜绝任何页面跳转与链接误触
      item = document.createElement('div');
      item.className = 'tree-item-row tree-dir-row';
      item.dataset.path = node.path;
      item.dataset.isRepo = node.is_repo ? 'true' : 'false';
      item.setAttribute('role', 'treeitem');
      item.setAttribute('tabindex', '0');

      const isDirFav = !node.is_repo && isDirectoryFavorite(node.path, fullRoute, state.currentRepo?.ID);
      const isExpanded = forceExpand || (!highlightQuery && state.expandedDirs && state.expandedDirs.has(node.path));

      item.innerHTML = `
        <span class="tree-chevron ${isExpanded ? 'open' : ''}">${SVG_ICONS.chevronRight}</span>
        <span class="tree-item-icon">${isExpanded ? SVG_ICONS.folderOpen : iconSvg}</span>
        <span class="tree-item-label" title="${escapeHtml(node.name)}">${renderHighlightedText(node.name, highlightQuery)}</span>
        ${!node.is_repo ? `
        <button class="tree-dir-star-btn ${isDirFav ? 'active' : ''}" title="${isDirFav ? '取消目录书签' : '设为目录书签'}" data-path="${escapeHtml(node.path)}" aria-label="收藏目录">
          ${isDirFav ? SVG_ICONS.starFilled : SVG_ICONS.star}
        </button>
        ` : ''}
      `;

      wrapper.appendChild(item);

      if (!node.is_repo) {
        const starBtn = item.querySelector('.tree-dir-star-btn');
        if (starBtn) {
          starBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDirFavorite(node, routePrefix);
          });
        }
      }

      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children-container';
      childrenContainer.style.display = isExpanded ? 'block' : 'none';
      childrenContainer.dataset.rendered = isExpanded ? 'true' : 'false';
      wrapper.appendChild(childrenContainer);

      const hasChildren = node.children && node.children.length > 0;

      if (isExpanded && hasChildren) {
        const frag = document.createDocumentFragment();
        node.children.forEach(c => {
          frag.appendChild(createLazyTreeNodeElement(c, routePrefix, forceExpand, highlightQuery));
        });
        childrenContainer.appendChild(frag);
      }

      item.addEventListener('click', (e) => {
        if (e.target.closest('.tree-dir-star-btn')) return;
        e.preventDefault();
        e.stopPropagation();

        if (state.currentRepo && node.path) {
          try {
            localStorage.setItem('doc_lens_last_dir_' + state.currentRepo.ID, node.path);
          } catch (err) {}
        }

        if (!hasChildren) {
          childrenContainer.innerHTML = '<div style="padding:4px 10px;font-size:11px;color:var(--text-muted);">(空目录)</div>';
          childrenContainer.style.display = childrenContainer.style.display === 'none' ? 'block' : 'none';
          const chevron = item.querySelector('.tree-chevron');
          if (chevron) chevron.classList.toggle('open', childrenContainer.style.display !== 'none');
          return;
        }

        const isCurrentlyOpen = childrenContainer.style.display !== 'none';
        if (!isCurrentlyOpen && childrenContainer.dataset.rendered !== 'true') {
          // 首次展开时动态挂载子级 DOM，耗时低于 1ms
          const frag = document.createDocumentFragment();
          node.children.forEach(c => {
            frag.appendChild(createLazyTreeNodeElement(c, routePrefix, false, ''));
          });
          childrenContainer.appendChild(frag);
          childrenContainer.dataset.rendered = 'true';
        }

        const willOpen = !isCurrentlyOpen;
        childrenContainer.style.display = willOpen ? 'block' : 'none';
        const chevron = item.querySelector('.tree-chevron');
        if (chevron) chevron.classList.toggle('open', willOpen);
        const iconSpan = item.querySelector('.tree-item-icon');
        if (iconSpan) {
          iconSpan.innerHTML = willOpen ? SVG_ICONS.folderOpen : (node.is_repo ? SVG_ICONS.repo : SVG_ICONS.folder);
        }

        // 核心：记录并持久化该目录的展开/折叠状态
        if (state.currentRepo && node.path) {
          setDirExpanded(state.currentRepo.ID, node.path, willOpen);
        }
      });
    } else {
      // 文件节点：真正可点击与直达的链接
      item = document.createElement('a');
      item.className = 'tree-item-row tree-file-row';
      item.dataset.path = node.path;
      item.href = fullRoute;
      item.setAttribute('role', 'treeitem');

      item.innerHTML = `
        <span class="tree-chevron-spacer"></span>
        <span class="tree-item-icon">${iconSvg}</span>
        <span class="tree-item-label" title="${escapeHtml(node.name)}">${renderHighlightedText(node.name, highlightQuery)}</span>
      `;

      wrapper.appendChild(item);

      item.addEventListener('pointerenter', () => {
        prefetchDocument(fullRoute);
      }, { once: true });

      item.addEventListener('click', (e) => {
        e.preventDefault();
        routeTo(fullRoute, true);
        closeMobileSidebar();
      });
    }

    return wrapper;
  }

  // 递归展开到指定路径的目标节点并高亮
  function expandPathToNode(urlPath) {
    if (!state.currentRepo) return;
    document.querySelectorAll('.tree-item-row.active').forEach(r => r.classList.remove('active'));

    const decoded = decodeURIComponent(urlPath).replace(/\/+$/, '');
    const cleanPrefix = '/' + (state.currentRepo.RoutePrefix || '').replace(/^\/+|\/+$/g, '');
    let relPath = decoded.replace(/^\/+/, '');
    if (decoded.startsWith(cleanPrefix)) {
      relPath = decoded.substring(cleanPrefix.length).replace(/^\/+/, '');
    }

    const segments = relPath.split('/').filter(Boolean);

    for (let i = 0; i < segments.length; i++) {
      const segPath = segments.slice(0, i + 1).join('/');
      const row = el.fileTree.querySelector(`.tree-item-row[data-path="${CSS.escape(segPath)}"]`);
      if (row) {
        const group = row.closest('.tree-item-group');
        const chCont = group ? group.querySelector('.tree-children-container') : null;

        if (i === segments.length - 1) {
          row.classList.add('active');
          try {
            const scrollContainer = row.closest('.sidebar-scrollable-content');
            if (scrollContainer) {
              const rowTop = row.offsetTop;
              const containerHeight = scrollContainer.clientHeight;
              scrollContainer.scrollTo({ top: Math.max(0, rowTop - containerHeight / 2), behavior: 'smooth' });
            }
          } catch (e) {}

          // 如果目标本身就是目录，确保展开显示内部文件并记住展开态
          if (chCont) {
            if (chCont.style.display === 'none') {
              if (chCont.dataset.rendered !== 'true') {
                row.click(); // 触发点击挂载并展开
              } else {
                chCont.style.display = 'block';
                const ch = row.querySelector('.tree-chevron');
                if (ch) ch.classList.add('open');
                const ic = row.querySelector('.tree-item-icon');
                if (ic) ic.innerHTML = SVG_ICONS.folderOpen;
              }
            }
            if (state.currentRepo) setDirExpanded(state.currentRepo.ID, segPath, true);
          }
        } else {
          // 如果是中间目录，触发展开并记录展开态
          if (group && chCont) {
            if (chCont.dataset.rendered !== 'true') {
              row.click(); // 触发点击挂载
            } else {
              chCont.style.display = 'block';
              const ch = row.querySelector('.tree-chevron');
              if (ch) ch.classList.add('open');
              const ic = row.querySelector('.tree-item-icon');
              if (ic) ic.innerHTML = SVG_ICONS.folderOpen;
            }
            if (state.currentRepo) setDirExpanded(state.currentRepo.ID, segPath, true);
          }
        }
      }
    }
  }

  function collapseAllTreeNodes() {
    document.querySelectorAll('.tree-children-container').forEach(c => {
      c.style.display = 'none';
    });
    document.querySelectorAll('.tree-chevron').forEach(ch => {
      ch.classList.remove('open');
    });
    document.querySelectorAll('.tree-dir-row').forEach(row => {
      const iconSpan = row.querySelector('.tree-item-icon');
      if (iconSpan) {
        const isRepo = row.dataset.isRepo === 'true';
        iconSpan.innerHTML = isRepo ? SVG_ICONS.repo : SVG_ICONS.folder;
      }
    });
    if (state.currentRepo) {
      clearAllExpandedDirs(state.currentRepo.ID);
      try {
        localStorage.removeItem('doc_lens_last_dir_' + state.currentRepo.ID);
      } catch (e) {}
    }
  }

  function onSearchInput(e) {
    const q = e.target.value.trim();
    if (el.clearSearchBtn) el.clearSearchBtn.style.display = q ? 'flex' : 'none';
    if (q && state.activeSidebarTab !== 'tree') {
      switchSidebarTab('tree');
    }

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      filterFileTree(q);
    }, 120);
  }

  function clearSearch() {
    el.searchInput.value = '';
    if (el.clearSearchBtn) el.clearSearchBtn.style.display = 'none';
    filterFileTree('');
  }

  function toggleFavoritesFilter() {
    state.filterFavoritesOnly = !state.filterFavoritesOnly;
    if (el.filterFavBtn) {
      el.filterFavBtn.classList.toggle('active-fav-filter', !!state.filterFavoritesOnly);
      el.filterFavBtn.title = state.filterFavoritesOnly ? '已过滤：仅显示收藏文档（点击恢复全库）' : '过滤：仅看已收藏文档';
    }
    filterFileTree(el.searchInput ? el.searchInput.value : '');
  }

  // 内存树高性能过滤：跨越全部节点秒级检索，支持结合「仅看收藏与书签」筛选
  function filterFileTree(query = (el.searchInput ? el.searchInput.value : '')) {
    if (!state.treeData) return;
    const q = (query || '').toLowerCase().trim();
    if (!q && !state.filterFavoritesOnly) {
      renderFileTree(state.treeData, el.fileTree, false, '');
      updateTreeFileStats(state.treeData);
      return;
    }

    const favs = getFavorites();
    const favSet = new Set(favs.map(f => f.path));
    const favFullRouteSet = new Set(favs.map(f => f.fullRoute).filter(Boolean));
    const cleanPrefix = '/' + (state.currentRepo?.RoutePrefix || '').replace(/^\/+|\/+$/g, '');

    function searchSubtree(node) {
      if (!node) return null;

      const cleanPath = (node.path || '').replace(/^\/+/, '');
      const fullRoute = `${cleanPrefix}/${cleanPath}`;
      const isFav = favSet.has(fullRoute) || favSet.has(node.path) || favFullRouteSet.has(fullRoute);

      if (state.filterFavoritesOnly && !node.is_dir && !isFav) {
        return null;
      }

      const nameMatches = !q || (node.name || '').toLowerCase().includes(q);
      const pathMatches = !q || (node.path || '').toLowerCase().includes(q);

      if (!node.is_dir) {
        return (nameMatches || pathMatches) ? { ...node } : null;
      }

      // 目录书签判定：该目录是否被加入书签
      const isDirFav = node.is_dir && (favSet.has(node.path) || favFullRouteSet.has(fullRoute));

      let matchedChildren = [];
      if (node.children) {
        for (const child of node.children) {
          const matchedChild = searchSubtree(child);
          if (matchedChild) matchedChildren.push(matchedChild);
        }
      }

      if (state.filterFavoritesOnly) {
        // 如果目录本身被收藏为书签，且没有关键词搜索，直接保留其全部子项
        if (isDirFav && !q) {
          return {
            ...node,
            children: node.children || []
          };
        }
        if (matchedChildren.length > 0) {
          return {
            ...node,
            children: matchedChildren
          };
        }
        return null;
      }

      if (nameMatches || pathMatches || matchedChildren.length > 0) {
        return {
          ...node,
          children: matchedChildren
        };
      }
      return null;
    }

    const filtered = searchSubtree(state.treeData);
    if (!filtered || !filtered.children || filtered.children.length === 0) {
      const hint = state.filterFavoritesOnly 
        ? '当前知识库暂无匹配的收藏文档或目录书签' 
        : `未找到匹配文档 "${escapeHtml(q)}"`;
      el.fileTree.innerHTML = `<div class="section-empty-hint">${hint}</div>`;
    } else {
      renderFileTree(filtered, el.fileTree, true, q);
      updateTreeFileStats(filtered);
    }
  }

  // 提取当前知识库中按修改/生成时间倒序排列的最新文档
  function extractRecentDocsFromTree(treeData, cleanPrefix, limit = 8) {
    if (!treeData) return [];
    const allDocs = [];

    function walk(node) {
      if (!node) return;
      if (!node.is_dir) {
        const ext = (node.name.split('.').pop() || '').toLowerCase();
        if (['md', 'markdown', 'mdown'].includes(ext)) {
          const rawName = node.name;
          const cleanName = rawName.replace(/\.(md|markdown|mdown)$/i, '');
          const dirPath = node.path ? node.path.split('/').slice(0, -1).join('/') || '/' : '/';
          allDocs.push({
            name: cleanName,
            rawName: rawName,
            path: node.path,
            fullRoute: cleanPrefix + '/' + node.path.replace(/^\/+/, ''),
            modTime: node.mod_time || 0,
            dirPath: dirPath
          });
        }
        return;
      }
      if (node.children) {
        for (const child of node.children) {
          walk(child);
        }
      }
    }

    walk(treeData);
    allDocs.sort((a, b) => (b.modTime || 0) - (a.modTime || 0));
    return allDocs.slice(0, limit);
  }

  // =========================================================================
  // 全局极速搜索模块 (Command Palette & Full-Text Search)
  // =========================================================================
  function openQuickSearchModal(initialQuery = '') {
    if (!el.searchModal) el.searchModal = document.getElementById('searchModal');
    if (!el.modalSearchInput) el.modalSearchInput = document.getElementById('modalSearchInput');
    if (!el.searchModal) return;
    openModal(el.searchModal);

    if (!state.searchModalMode) state.searchModalMode = 'title';
    updateSearchModeUI();

    if (el.modalSearchScope && state.currentRepo) {
      if (!el.modalSearchScope.value) {
        el.modalSearchScope.options[0].textContent = `当前: ${state.currentRepo.Name}`;
      }
    }

    if (initialQuery && el.modalSearchInput) {
      el.modalSearchInput.value = initialQuery;
    }

    setTimeout(() => {
      if (el.modalSearchInput) {
        el.modalSearchInput.focus();
        el.modalSearchInput.select();
      }
    }, 60);

    const q = el.modalSearchInput ? el.modalSearchInput.value.trim() : '';
    if (q) {
      triggerModalSearch(true);
    } else if (!state.searchModalResults || state.searchModalResults.length === 0) {
      renderSearchEmptyState();
    }
  }

  function closeQuickSearchModal() {
    if (el.searchModal) closeModal(el.searchModal);
  }

  function switchSearchMode(mode) {
    if (state.searchModalMode === mode) return;
    state.searchModalMode = mode;
    updateSearchModeUI();
    triggerModalSearch(true);
  }

  function updateSearchModeUI() {
    const isTitle = state.searchModalMode === 'title';
    if (el.searchTabTitle) el.searchTabTitle.classList.toggle('active', isTitle);
    if (el.searchTabContent) el.searchTabContent.classList.toggle('active', !isTitle);

    if (el.modalSearchInput) {
      el.modalSearchInput.placeholder = isTitle
        ? '搜索文档标题、文件名或相对路径 (按 Tab 键切换正文)...'
        : '输入关键词在全文正文中检索细节 (按 Tab 键切换标题)...';
    }
  }

  function onModalSearchInput(e) {
    const q = e.target.value.trim();
    if (el.modalSearchClearBtn) {
      el.modalSearchClearBtn.style.display = q ? 'flex' : 'none';
    }
    clearTimeout(modalSearchDebounceTimer);
    modalSearchDebounceTimer = setTimeout(() => {
      triggerModalSearch();
    }, 180);
  }

  function clearModalSearch() {
    if (el.modalSearchInput) {
      el.modalSearchInput.value = '';
      el.modalSearchInput.focus();
    }
    if (el.modalSearchClearBtn) {
      el.modalSearchClearBtn.style.display = 'none';
    }
    state.searchModalResults = [];
    state.searchModalSelectedIndex = -1;
    renderSearchEmptyState();
  }

  async function triggerModalSearch(immediate = false) {
    const q = el.modalSearchInput ? el.modalSearchInput.value.trim() : '';
    if (!q) {
      state.searchModalResults = [];
      state.searchModalSelectedIndex = -1;
      renderSearchEmptyState();
      return;
    }

    renderSearchLoadingState();

    const scopeVal = el.modalSearchScope ? el.modalSearchScope.value : '';
    const repoParam = scopeVal === 'all' ? 'all' : (state.currentRepo ? state.currentRepo.ID : '');
    const mode = state.searchModalMode || 'title';

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&repo=${encodeURIComponent(repoParam)}&mode=${encodeURIComponent(mode)}&limit=35`);
      if (!res.ok) throw new Error('搜索失败');
      const data = await res.json();
      state.searchModalResults = Array.isArray(data) ? data : [];
      state.searchModalSelectedIndex = state.searchModalResults.length > 0 ? 0 : -1;
      renderSearchResults(state.searchModalResults, q);
    } catch (err) {
      if (el.modalSearchResults) {
        el.modalSearchResults.innerHTML = `
          <div class="search-empty-state">
            <div class="search-empty-text" style="color:var(--danger-color);">检索请求异常</div>
            <div class="search-empty-sub">${escapeHtml(err.message || '网络连接超时')}</div>
          </div>
        `;
      }
    }
  }

  function renderSearchEmptyState() {
    if (!el.modalSearchResults) return;
    if (el.modalSearchCount) el.modalSearchCount.style.display = 'none';

    const cleanPrefix = '/' + (state.currentRepo ? state.currentRepo.RoutePrefix || '' : '').replace(/^\/+|\/+$/g, '');
    const recentDocs = extractRecentDocsFromTree(state.treeData, cleanPrefix, 7);

    if (recentDocs.length > 0) {
      const recentItems = recentDocs.map(d => ({
        repo_id: state.currentRepo?.ID || '',
        repo_name: state.currentRepo?.Name || '',
        path: d.path,
        full_route: d.fullRoute,
        title: d.name,
        ext: '.md',
        mod_time: d.modTime,
        snippet: `⏱️ ${formatTimeAgo(d.modTime * 1000)}`
      }));

      state.searchModalResults = recentItems;
      state.searchModalSelectedIndex = 0;

      const html = recentItems.map((item, idx) => {
        const isSelected = idx === 0;
        return `
          <div class="search-result-item ${isSelected ? 'selected' : ''}" data-index="${idx}">
            <div class="search-item-header">
              <div class="search-item-title-wrap">
                <span class="search-item-icon">${SVG_ICONS.markdown}</span>
                <span>${escapeHtml(item.title)}</span>
              </div>
              <span class="search-item-repo-badge">${escapeHtml(item.snippet)}</span>
            </div>
            <div class="search-item-path">${escapeHtml(item.path)}</div>
          </div>
        `;
      }).join('');

      el.modalSearchResults.innerHTML = `
        <div class="search-modal-recent-header">
          <span>⏱️ 最近生成与更新的文档</span>
          <span class="search-modal-recent-hint">支持 ↑ ↓ 选择，Enter 直接打开</span>
        </div>
        ${html}
      `;

      el.modalSearchResults.querySelectorAll('.search-result-item').forEach(itemEl => {
        const idx = parseInt(itemEl.dataset.index, 10);
        itemEl.addEventListener('click', () => {
          selectSearchResult(state.searchModalResults[idx]);
        });
        itemEl.addEventListener('mouseenter', () => {
          state.searchModalSelectedIndex = idx;
          updateSearchItemSelection();
        });
      });
      return;
    }

    el.modalSearchResults.innerHTML = `
      <div class="search-empty-state">
        <div class="search-empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <div class="search-empty-text">输入关键词即可秒级检索</div>
        <div class="search-empty-sub">支持快速直达文档，或切换「搜正文全文」跨文件透视内容细节</div>
      </div>
    `;
  }

  function renderSearchLoadingState() {
    if (!el.modalSearchResults) return;
    if (el.modalSearchCount) el.modalSearchCount.style.display = 'none';
    el.modalSearchResults.innerHTML = `
      <div class="search-loading-state">
        <div class="mindmap-spinner" style="margin-bottom:12px;"></div>
        <div class="search-empty-text" style="font-weight:normal;color:var(--text-secondary);">正在检索知识库...</div>
      </div>
    `;
  }

  function renderSearchResults(items, query) {
    if (!el.modalSearchResults) return;

    if (!items || items.length === 0) {
      if (el.modalSearchCount) el.modalSearchCount.style.display = 'none';
      const isTitle = state.searchModalMode === 'title';
      el.modalSearchResults.innerHTML = `
        <div class="search-empty-state">
          <div class="search-empty-text">未找到相关${isTitle ? '文档或路径' : '正文内容'}</div>
          <div class="search-empty-sub">
            尝试更换关键词${isTitle ? '，或点击上方「搜正文全文」深入文章内部检索' : '，或切换至「跨全部知识库」扩大范围'}
          </div>
        </div>
      `;
      return;
    }

    if (el.modalSearchCount) {
      el.modalSearchCount.textContent = `找到 ${items.length} 个结果`;
      el.modalSearchCount.style.display = 'block';
    }

    const safeQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const qRegex = new RegExp(`(${safeQ})`, 'gi');

    const html = items.map((item, idx) => {
      const isSelected = idx === state.searchModalSelectedIndex;
      const highlightedTitle = escapeHtml(item.title).replace(qRegex, '<mark class="search-highlight">$1</mark>');
      const highlightedPath = escapeHtml(item.path).replace(qRegex, '<mark class="search-highlight">$1</mark>');
      
      let snippetHtml = '';
      if (item.snippet) {
        const highlightedSnippet = escapeHtml(item.snippet).replace(qRegex, '<mark class="search-highlight">$1</mark>');
        const lineBadge = item.line_number ? `<span style="opacity:0.7;margin-right:6px;font-size:11px;">L${item.line_number}:</span>` : '';
        snippetHtml = `<div class="search-item-snippet">${lineBadge}${highlightedSnippet}</div>`;
      }

      const ext = (item.ext || '').toLowerCase();
      let iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
      if (ext === '.md' || ext === '.markdown') {
        iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>';
      } else if (['.go', '.py', '.js', '.ts', '.sh', '.json', '.sql'].includes(ext)) {
        iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';
      }

      return `
        <div class="search-result-item ${isSelected ? 'selected' : ''}" data-index="${idx}">
          <div class="search-item-header">
            <div class="search-item-title-wrap">
              <span class="search-item-icon">${iconSvg}</span>
              <span>${highlightedTitle}</span>
            </div>
            ${item.repo_name ? `<span class="search-item-repo-badge">${escapeHtml(item.repo_name)}</span>` : ''}
          </div>
          <div class="search-item-path">${highlightedPath}</div>
          ${snippetHtml}
        </div>
      `;
    }).join('');

    el.modalSearchResults.innerHTML = html;

    // 绑定点击与 hover
    el.modalSearchResults.querySelectorAll('.search-result-item').forEach(itemEl => {
      const idx = parseInt(itemEl.dataset.index, 10);
      itemEl.addEventListener('click', () => {
        selectSearchResult(state.searchModalResults[idx]);
      });
      itemEl.addEventListener('mouseenter', () => {
        state.searchModalSelectedIndex = idx;
        updateSearchItemSelection();
      });
    });
  }

  function updateSearchItemSelection() {
    if (!el.modalSearchResults) return;
    const items = el.modalSearchResults.querySelectorAll('.search-result-item');
    items.forEach((itemEl, idx) => {
      const isSel = idx === state.searchModalSelectedIndex;
      itemEl.classList.toggle('selected', isSel);
      if (isSel) {
        itemEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  function selectSearchResult(item) {
    if (!item || !item.full_route) return;
    closeAllModals();
    closeMobileSidebar();
    routeTo(item.full_route);
  }

  function onModalSearchKeydown(e) {
    const results = state.searchModalResults || [];

    if (e.key === 'Tab') {
      e.preventDefault();
      switchSearchMode(state.searchModalMode === 'title' ? 'content' : 'title');
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        state.searchModalSelectedIndex = (state.searchModalSelectedIndex + 1) % results.length;
        updateSearchItemSelection();
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        state.searchModalSelectedIndex = (state.searchModalSelectedIndex - 1 + results.length) % results.length;
        updateSearchItemSelection();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && state.searchModalSelectedIndex >= 0) {
        selectSearchResult(results[state.searchModalSelectedIndex]);
      }
      return;
    }
  }

  // =========================================================================
  // 收藏与书签系统 (Favorites & Directory Bookmarks)
  // =========================================================================
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('doc_lens_favorites') || '[]');
    } catch (e) {
      return [];
    }
  }

  function isFavorite(path) {
    if (!path) return false;
    const favs = getFavorites();
    return favs.some(f => (f.type !== 'dir') && f.path === path);
  }

  function isDirectoryFavorite(path, fullRoute, repoId) {
    if (!path) return false;
    const favs = getFavorites();
    return favs.some(f => f.type === 'dir' && (f.path === path || (fullRoute && f.fullRoute === fullRoute)) && (!repoId || !f.repoId || f.repoId === repoId));
  }

  function toggleFavorite(doc) {
    if (!doc || !doc.path) return;
    try {
      let favs = getFavorites();
      const existingIdx = favs.findIndex(f => (f.type !== 'dir') && f.path === doc.path);
      if (existingIdx >= 0) {
        favs.splice(existingIdx, 1);
      } else {
        const fileName = doc.path.split('/').pop() || doc.path;
        favs.unshift({
          type: 'file',
          path: doc.path,
          name: fileName,
          repoId: state.currentRepo ? state.currentRepo.ID : (doc.repo_id || ''),
          repoName: doc.repo_name || (state.currentRepo ? state.currentRepo.Name : '知识库'),
          timestamp: Date.now()
        });
      }
      localStorage.setItem('doc_lens_favorites', JSON.stringify(favs));
      renderFavorites();
      updateFavoriteButton(doc.path);
      if (state.filterFavoritesOnly) filterFileTree();
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  }

  function toggleDirFavorite(node, routePrefix) {
    if (!node || !node.is_dir) return;
    try {
      let favs = getFavorites();
      const repoId = state.currentRepo ? state.currentRepo.ID : '';
      const repoName = state.currentRepo ? state.currentRepo.Name : '知识库';
      const cleanPrefix = (routePrefix || (state.currentRepo?.RoutePrefix || '')).replace(/\/+$/, '');
      const cleanPath = (node.path || '').replace(/^\/+/, '');
      const fullRoute = `${cleanPrefix}/${cleanPath}`;

      const existingIdx = favs.findIndex(f => f.type === 'dir' && (f.path === node.path || f.fullRoute === fullRoute) && (!repoId || !f.repoId || f.repoId === repoId));
      if (existingIdx >= 0) {
        favs.splice(existingIdx, 1);
      } else {
        favs.unshift({
          type: 'dir',
          path: node.path,
          fullRoute: fullRoute,
          name: node.name,
          repoId: repoId,
          repoName: repoName,
          timestamp: Date.now()
        });
      }
      localStorage.setItem('doc_lens_favorites', JSON.stringify(favs));
      renderFavorites();

      // 同步更新树节点上的五角星图标状态
      if (el.fileTree) {
        const row = el.fileTree.querySelector(`.tree-dir-row[data-path="${CSS.escape(node.path)}"]`);
        if (row) {
          const starBtn = row.querySelector('.tree-dir-star-btn');
          if (starBtn) {
            const isNowFav = existingIdx < 0;
            starBtn.classList.toggle('active', isNowFav);
            starBtn.title = isNowFav ? '取消目录书签' : '设为目录书签';
            starBtn.innerHTML = isNowFav ? SVG_ICONS.starFilled : SVG_ICONS.star;
          }
        }
      }
      if (state.filterFavoritesOnly) filterFileTree();
    } catch (e) {
      console.error('Failed to toggle dir favorite', e);
    }
  }

  function removeFavorite(path) {
    if (!path) return;
    try {
      let favs = getFavorites();
      favs = favs.filter(f => !((f.type !== 'dir') && f.path === path));
      localStorage.setItem('doc_lens_favorites', JSON.stringify(favs));
      renderFavorites();
      if (state.currentDoc && state.currentDoc.path === path) {
        updateFavoriteButton(path);
      }
      if (state.filterFavoritesOnly) filterFileTree();
    } catch (e) {
      console.error('Failed to remove favorite', e);
    }
  }

  function removeDirFavorite(item) {
    try {
      let favs = getFavorites();
      favs = favs.filter(f => !(f.type === 'dir' && (f.path === item.path || f.fullRoute === item.fullRoute) && (!item.repoId || !f.repoId || f.repoId === item.repoId)));
      localStorage.setItem('doc_lens_favorites', JSON.stringify(favs));
      renderFavorites();

      // 同步更新树节点图标
      if (el.fileTree && item.path) {
        const row = el.fileTree.querySelector(`.tree-dir-row[data-path="${CSS.escape(item.path)}"]`);
        if (row) {
          const starBtn = row.querySelector('.tree-dir-star-btn');
          if (starBtn) {
            starBtn.classList.remove('active');
            starBtn.title = '设为目录书签';
            starBtn.innerHTML = SVG_ICONS.star;
          }
        }
      }
      if (state.filterFavoritesOnly) filterFileTree();
    } catch (e) {
      console.error('Failed to remove dir favorite', e);
    }
  }

  async function openBookmarkedDir(item) {
    if (item.repoId && (!state.currentRepo || state.currentRepo.ID !== item.repoId)) {
      await selectRepo(item.repoId, false);
    }
    const targetPath = item.fullRoute || item.path;
    expandPathToNode(targetPath);
    if (state.currentRepo && item.path) {
      setDirExpanded(state.currentRepo.ID, item.path, true);
      try {
        localStorage.setItem('doc_lens_last_dir_' + state.currentRepo.ID, item.path);
      } catch (e) {}
    }
  }

  function updateFavoriteButton(path) {
    const btn = document.getElementById('favoriteBtn');
    if (!btn) return;
    const fav = isFavorite(path);
    if (fav) {
      btn.className = 'btn btn-favorite-active';
      btn.title = '取消收藏';
      btn.innerHTML = `${SVG_ICONS.starFilled} <span class="btn-text-full">已收藏</span><span class="btn-text-short">已收藏</span>`;
    } else {
      btn.className = 'btn';
      btn.title = '收藏此文档';
      btn.innerHTML = `${SVG_ICONS.star} <span class="btn-text-full">收藏</span><span class="btn-text-short">收藏</span>`;
    }
  }

  function renderFavorites() {
    const listEl = document.getElementById('favoritesList');
    const badgeEl = document.getElementById('favoritesCountBadge');
    const tabFavBadge = document.getElementById('tabFavBadge');
    const secEl = document.getElementById('sectionFavorites');
    const favs = getFavorites();

    if (badgeEl) {
      badgeEl.textContent = `${favs.length} 项`;
    }
    if (tabFavBadge) {
      tabFavBadge.textContent = favs.length;
      tabFavBadge.style.display = favs.length > 0 ? 'inline-flex' : 'none';
    }

    if (!listEl) return;

    if (favs.length === 0) {
      if (secEl && !secEl.dataset.userToggled) {
        secEl.classList.add('collapsed');
      }
      listEl.innerHTML = '<div class="section-empty-hint">暂无收藏与书签，可收藏单篇文档或给目录打书签</div>';
      return;
    }

    if (secEl && !secEl.dataset.userToggled) {
      secEl.classList.remove('collapsed');
    }

    listEl.innerHTML = '';
    favs.forEach(item => {
      const isDir = item.type === 'dir';
      const card = document.createElement('a');
      card.className = 'recent-item-card' + (isDir ? ' favorite-dir-card' : '');
      if (!isDir && state.currentPath === item.path) card.classList.add('active');
      card.href = item.fullRoute || item.path;

      const timeAgo = formatTimeAgo(item.timestamp);
      const displaySubtitle = isDir 
        ? `${escapeHtml(item.repoName || '知识库')} · ${escapeHtml(item.path || '')}` 
        : escapeHtml(item.path.split('/').slice(0, -1).join('/') || '/');

      const iconHtml = isDir 
        ? `<div class="recent-item-icon" style="color:#f59e0b;">${SVG_ICONS.folderOpen}</div>`
        : `<div class="recent-item-icon" style="color:#f59e0b;">${SVG_ICONS.starFilled}</div>`;

      const typeBadge = isDir ? `<span class="bookmark-type-pill">目录书签</span>` : '';

      card.innerHTML = `
        ${iconHtml}
        <div class="recent-item-content">
          <div class="recent-item-top">
            <span class="recent-item-title" title="${escapeHtml(item.name)}">
              ${escapeHtml(item.name)}
              ${typeBadge}
            </span>
            <span class="recent-item-time has-unfav">${timeAgo}</span>
            <button class="unfav-btn" title="取消${isDir ? '书签' : '收藏'}" data-path="${escapeHtml(item.path)}">✕</button>
          </div>
          <div class="recent-item-path" title="${displaySubtitle}">${displaySubtitle}</div>
        </div>
      `;

      card.addEventListener('click', async (e) => {
        if (e.target.closest('.unfav-btn')) {
          e.preventDefault();
          e.stopPropagation();
          if (isDir) {
            removeDirFavorite(item);
          } else {
            removeFavorite(item.path);
          }
          return;
        }
        e.preventDefault();
        if (isDir) {
          await openBookmarkedDir(item);
        } else {
          routeTo(item.path, true);
        }
        closeMobileSidebar();
      });

      listEl.appendChild(card);
    });
  }

  // =========================================================================
  // 最近浏览 (Recent Reads) 与最新生成 (Recently Created) 专区逻辑
  // =========================================================================
  function recordRecentRead(doc) {
    if (!doc || !doc.path) return;
    try {
      let recent = JSON.parse(localStorage.getItem('doc_lens_recent_reads') || '[]');
      recent = recent.filter(r => r.path !== doc.path);
      const fileName = doc.path.split('/').pop() || doc.path;
      const repoId = state.currentRepo ? state.currentRepo.ID : (doc.repo_id || '');
      const repoName = doc.repo_name || (state.currentRepo ? state.currentRepo.Name : '知识库');
      recent.unshift({
        path: doc.path,
        name: fileName,
        repoId: repoId,
        repoName: repoName,
        timestamp: Date.now()
      });
      if (recent.length > 50) recent = recent.slice(0, 50);
      localStorage.setItem('doc_lens_recent_reads', JSON.stringify(recent));
      renderRecentReads();
    } catch (e) {}
  }

  function renderRecentReads() {
    const listEl = document.getElementById('recentReadsList');
    const secEl = document.getElementById('sectionRecentReads');
    if (!listEl) return;
    let allRecent = [];
    try {
      allRecent = JSON.parse(localStorage.getItem('doc_lens_recent_reads') || '[]');
    } catch (e) {}

    // 按当前选中仓库进行物理隔离过滤
    const currentRepo = state.currentRepo;
    let recent = allRecent;
    if (currentRepo) {
      recent = allRecent.filter(r => {
        if (r.repoId) return r.repoId === currentRepo.ID;
        // 兼容历史老数据：按路由前缀反查归属仓库
        const matchedRepo = findRepoForRoute(r.path);
        return matchedRepo && matchedRepo.ID === currentRepo.ID;
      });
    }

    if (recent.length === 0) {
      if (secEl && !secEl.dataset.userToggled) {
        secEl.classList.add('collapsed');
      }
      listEl.innerHTML = `<div class="section-empty-hint">${currentRepo ? `「${escapeHtml(currentRepo.Name)}」` : ''}暂无最近阅读记录</div>`;
      return;
    }

    if (secEl && !secEl.dataset.userToggled) {
      secEl.classList.remove('collapsed');
    }

    listEl.innerHTML = '';
    recent.slice(0, 40).forEach(item => {
      const card = document.createElement('a');
      card.className = 'recent-item-card';
      if (state.currentPath === item.path) card.classList.add('active');
      card.href = item.path;

      const timeAgo = formatTimeAgo(item.timestamp);
      const dirPath = item.path.split('/').slice(0, -1).join('/') || '/';

      card.innerHTML = `
        <div class="recent-item-icon">${SVG_ICONS.markdown}</div>
        <div class="recent-item-content">
          <div class="recent-item-top">
            <span class="recent-item-title" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
            <span class="recent-item-time">${timeAgo}</span>
          </div>
          <div class="recent-item-path" title="${escapeHtml(dirPath)}">${escapeHtml(dirPath)}</div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        e.preventDefault();
        routeTo(item.path, true);
        closeMobileSidebar();
      });

      listEl.appendChild(card);
    });
  }

  function clearRecentReads() {
    try {
      if (!state.currentRepo) {
        localStorage.removeItem('doc_lens_recent_reads');
      } else {
        const currentRepoId = state.currentRepo.ID;
        let allRecent = JSON.parse(localStorage.getItem('doc_lens_recent_reads') || '[]');
        allRecent = allRecent.filter(r => {
          if (r.repoId) return r.repoId !== currentRepoId;
          const matchedRepo = findRepoForRoute(r.path);
          return matchedRepo && matchedRepo.ID !== currentRepoId;
        });
        localStorage.setItem('doc_lens_recent_reads', JSON.stringify(allRecent));
      }
    } catch (e) {}
    renderRecentReads();
  }

  async function loadRecentCreated(repoID) {
    const listEl = document.getElementById('recentCreatedList');
    if (!listEl) return;
    listEl.innerHTML = '<div class="section-empty-hint">正在读取最新研报...</div>';

    try {
      const res = await fetch(`/api/recent?repo=${encodeURIComponent(repoID)}&limit=30`);
      if (!res.ok) throw new Error('Failed to load recent files');
      const files = await res.json();
      if (!files || files.length === 0) {
        listEl.innerHTML = '<div class="section-empty-hint">该仓库暂无近期更新文章</div>';
        return;
      }

      listEl.innerHTML = '';
      files.forEach(f => {
        const card = document.createElement('a');
        card.className = 'recent-item-card';
        if (state.currentPath === f.full_route) card.classList.add('active');
        card.href = f.full_route;

        const timeAgo = formatTimeAgo(f.mod_time * 1000);
        const dirPath = f.path.split('/').slice(0, -1).join('/') || '/';

        card.innerHTML = `
          <div class="recent-item-icon">${SVG_ICONS.markdown}</div>
          <div class="recent-item-content">
            <div class="recent-item-top">
              <span class="recent-item-title" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span>
              <span class="recent-item-time">${timeAgo}</span>
            </div>
            <div class="recent-item-path" title="${escapeHtml(dirPath)}">${escapeHtml(dirPath)}</div>
          </div>
        `;

        card.addEventListener('click', (e) => {
          e.preventDefault();
          routeTo(f.full_route, true);
          closeMobileSidebar();
        });

        listEl.appendChild(card);
      });
    } catch (e) {
      listEl.innerHTML = `<div class="section-empty-hint" style="color:#ef4444;">读取失败: ${e.message}</div>`;
    }
  }

  function formatTimeAgo(ms) {
    const diff = Math.floor((Date.now() - ms) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}天前`;
    return new Date(ms).toLocaleDateString([], { month: 'numeric', day: 'numeric' });
  }

  const DOC_STORAGE_PREFIX = 'doc_lens_doc_v2_';

  function getStoredDoc(path) {
    try {
      const raw = sessionStorage.getItem(DOC_STORAGE_PREFIX + path);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data && parsed.ts) {
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  function saveStoredDoc(path, doc) {
    try {
      sessionStorage.setItem(DOC_STORAGE_PREFIX + path, JSON.stringify({
        ts: Date.now(),
        data: doc
      }));
    } catch (e) {
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(DOC_STORAGE_PREFIX) && k !== (DOC_STORAGE_PREFIX + path)) {
            sessionStorage.removeItem(k);
            break;
          }
        }
        sessionStorage.setItem(DOC_STORAGE_PREFIX + path, JSON.stringify({
          ts: Date.now(),
          data: doc
        }));
      } catch (err) {}
    }
  }

  if (!state.inFlightDocs) state.inFlightDocs = new Map();
  if (!state.inFlightTrees) state.inFlightTrees = new Map();

  function invalidateDocCache(path) {
    if (state.docCache) state.docCache.delete(path);
    if (state.inFlightDocs) state.inFlightDocs.delete(path);
    try {
      sessionStorage.removeItem(DOC_STORAGE_PREFIX + path);
    } catch (e) {}
  }

  function fetchDocument(fullRoute) {
    if (!state.inFlightDocs) state.inFlightDocs = new Map();
    if (state.inFlightDocs.has(fullRoute)) {
      return state.inFlightDocs.get(fullRoute);
    }
    const p = fetch(`/api/content?path=${encodeURIComponent(fullRoute)}`)
      .then(async res => {
        if (res.status === 304) {
          return null;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || '文件不存在或读取失败');
        }
        return res.json();
      })
      .finally(() => {
        state.inFlightDocs.delete(fullRoute);
      });
    state.inFlightDocs.set(fullRoute, p);
    return p;
  }

  function prefetchDocument(fullRoute) {
    if (!fullRoute) return;
    if (state.docCache && state.docCache.has(fullRoute)) return;
    const stored = getStoredDoc(fullRoute);
    if (stored) return;
    if (state.inFlightDocs && state.inFlightDocs.has(fullRoute)) return;

    fetchDocument(fullRoute)
      .then(doc => {
        if (doc) {
          if (!state.docCache) state.docCache = new Map();
          state.docCache.set(fullRoute, doc);
          saveStoredDoc(fullRoute, doc);
        }
      })
      .catch(() => {});
  }

  function renderDocumentSkeleton(path, targetRepo) {
    if (el.articleHeader) el.articleHeader.style.display = 'block';
    if (el.articlePath) el.articlePath.textContent = path;
    if (el.articleTypePill) el.articleTypePill.style.display = 'none';
    if (el.articleMeta) {
      el.articleMeta.innerHTML = `<span class="article-meta-item">⏳ 读取中...</span>`;
    }
    if (el.articleActions) el.articleActions.innerHTML = '';
    if (el.tocList) el.tocList.innerHTML = '<div class="section-empty-hint">目录解析中...</div>';
    if (el.mobileTocList) el.mobileTocList.innerHTML = '<div class="section-empty-hint">目录解析中...</div>';
    if (el.docPagination) el.docPagination.style.display = 'none';

    updateBreadcrumbs({
      rel_path: path.replace(targetRepo?.RoutePrefix || '', '').replace(/^\/+/, ''),
      repo_name: targetRepo?.Name || '知识库',
      repo_prefix: targetRepo?.RoutePrefix || ''
    });

    if (el.articleBody) {
      el.articleBody.innerHTML = `
        <div class="article-skeleton">
          <div class="article-skeleton-title"></div>
          <div class="article-skeleton-line short"></div>
          <div class="article-skeleton-line"></div>
          <div class="article-skeleton-line medium"></div>
          <div class="article-skeleton-line"></div>
          <div class="article-skeleton-card"></div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 阅读区滚动复位器：切换文档时坚决瞬间归零至最开头的最初阅读点，杜绝停留在底部的异常
  // =========================================================================
  function resetDocScroll() {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      try { document.activeElement.blur(); } catch (e) {}
    }

    if (el.contentArea) {
      el.contentArea.scrollTop = 0;
      el.contentArea.scrollLeft = 0;
    }
    if (typeof window !== 'undefined') {
      try { window.scrollTo(0, 0); } catch (e) {}
    }
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    const forceTop = () => {
      if (!window.location.hash) {
        if (el.contentArea && el.contentArea.scrollTop !== 0) {
          el.contentArea.scrollTop = 0;
        }
        if (typeof window !== 'undefined' && window.scrollY !== 0) {
          window.scrollTo(0, 0);
        }
        if (document.documentElement && document.documentElement.scrollTop !== 0) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body && document.body.scrollTop !== 0) {
          document.body.scrollTop = 0;
        }
      }
    };

    requestAnimationFrame(() => {
      forceTop();
      requestAnimationFrame(forceTop);
    });
    setTimeout(forceTop, 30);
    setTimeout(forceTop, 100);
    setTimeout(forceTop, 250);
  }

  async function routeTo(urlPath, pushState = true) {
    const decodedPath = decodeURIComponent(urlPath).replace(/\/+$/, '') || '/';
    if (pushState) {
      history.pushState(null, '', decodedPath);
    }
    state.currentPath = decodedPath;

    const targetRepo = findRepoForRoute(decodedPath);
    if (targetRepo && (!state.currentRepo || state.currentRepo.ID !== targetRepo.ID)) {
      state.currentRepo = targetRepo;
      state.expandedDirs = getExpandedDirs(targetRepo.ID);
      if (el.repoSelect) el.repoSelect.value = targetRepo.ID;
      const titleEl = document.getElementById('currentRepoName');
      if (titleEl) titleEl.textContent = targetRepo.Name;
      renderRepoDropdownMenu();
      // 关键优化：目录树并行异步加载，绝不阻塞正文读取
      loadTree(targetRepo.ID);
      loadRecentCreated(targetRepo.ID);
    }

    const cleanPrefix = targetRepo ? '/' + (targetRepo.RoutePrefix || '').replace(/^\/+|\/+$/g, '') : '/';
    if (decodedPath === '/' || decodedPath === cleanPrefix) {
      document.querySelectorAll('.tree-item-row.active').forEach(r => r.classList.remove('active'));
      renderRecentReads();
      renderFavorites();
      renderWelcomeDashboard();
      resetDocScroll();
      return;
    }

    if (targetRepo) {
      try {
        localStorage.setItem('doc_lens_last_active_' + targetRepo.ID, decodedPath);
      } catch (e) {}
    }

    expandPathToNode(decodedPath);
    renderRecentReads();
    renderFavorites();
    restoreSidebarScroll(targetRepo?.ID);

    if (!state.docCache) state.docCache = new Map();

    const applyDocData = (doc) => {
      state.currentDoc = doc;
      state.docCache.set(decodedPath, doc);
      if (state.docCache.size > 50) {
        const firstKey = state.docCache.keys().next().value;
        state.docCache.delete(firstKey);
      }
      renderDocument(doc);
      recordRecentRead(doc);
      resetDocScroll();
    };

    // 1. 内存层命中：0ms 秒开
    if (state.docCache.has(decodedPath)) {
      applyDocData(state.docCache.get(decodedPath));
      return;
    }

    // 2. 本地 SessionStorage 命中：0ms 瞬间秒出
    let hasLocalDoc = false;
    let localDocTs = 0;
    const local = getStoredDoc(decodedPath);
    if (local && local.data) {
      applyDocData(local.data);
      hasLocalDoc = true;
      localDocTs = local.ts;
      // 5 分钟内读过的文章，无需重复发起网络请求
      if (Date.now() - localDocTs < 5 * 60 * 1000) {
        return;
      }
    }

    // 3. 若无本地缓存，立刻渲染轻量骨架屏，杜绝界面冻结停滞卡顿感
    if (!hasLocalDoc) {
      renderDocumentSkeleton(decodedPath, targetRepo);
      resetDocScroll();
    }

    // 4. 网络拉取（若已有本地渲染，则为后台静默 stale-while-revalidate，复用正在进行的 in-flight Promise）
    try {
      const doc = await fetchDocument(decodedPath);
      if (doc) {
        saveStoredDoc(decodedPath, doc);
        applyDocData(doc);
      } else if (hasLocalDoc) {
        saveStoredDoc(decodedPath, state.currentDoc);
      }
    } catch (err) {
      if (!hasLocalDoc) {
        if (targetRepo) {
          try { localStorage.removeItem('doc_lens_last_active_' + targetRepo.ID); } catch (e) {}
        }
        renderErrorDocument(decodedPath, err.message);
        resetDocScroll();
      }
    }
  }

  function renderDocument(doc) {
    if (el.articleHeader) el.articleHeader.style.display = 'block';

    updateBreadcrumbs(doc);

    if (el.articlePath) el.articlePath.textContent = doc.path;
    if (el.articleTypePill) el.articleTypePill.style.display = 'none';

    const dateStr = new Date(doc.mod_time * 1000).toLocaleString('zh-CN', { hour12: false });
    el.articleMeta.innerHTML = `
      <span class="article-meta-item">📅 ${dateStr}</span>
      <span class="article-meta-item">📏 ${doc.lines} 行</span>
      <span class="article-meta-item">🏷️ ${escapeHtml(doc.repo_name)}</span>
    `;

    const fav = isFavorite(doc.path);
    const isMarkdown = doc.type === 'markdown';
    const isAudioPlayingCurrent = audioState.isPlaying && audioState.currentDoc && audioState.currentDoc.path === doc.path;
    el.articleActions.innerHTML = `
      ${isMarkdown ? `
      <button class="btn btn-audio ${isAudioPlayingCurrent ? 'is-playing' : ''}" id="docAudioBtn" title="听文章（冷峻财经 / 智库解说音色）">
        ${SVG_ICONS.headphones}
        <span class="btn-text-full">听文章</span>
        <span class="btn-text-short">听书</span>
      </button>
      <button class="btn" id="addListenQueueBtn" title="加入稍后听，通勤或睡前连续播放">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12V9a8 8 0 0 1 16 0v3"></path><path d="M4 12H3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v-7zM20 12h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2v-7z"></path><line x1="12" y1="12" x2="12" y2="20"></line><line x1="8" y1="16" x2="16" y2="16"></line></svg><span class="btn-text-full">稍后听</span><span class="btn-text-short">稍后听</span>
      </button>
      <button class="btn btn-mindmap" id="docMindmapBtn" title="查看文章思维导图（层级大纲脑图）">
        ${SVG_ICONS.mindmap}
        <span class="btn-text-full">思维导图</span>
        <span class="btn-text-short">导图</span>
      </button>
      <button class="btn btn-history-diff" id="docHistoryDiffBtn" title="查看文档版本章节增量">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 14 14"></polyline>
        </svg>
        <span class="btn-text-full">章节增量</span>
        <span class="btn-text-short">增量</span>
      </button>` : ''}
      <button class="btn ${fav ? 'btn-favorite-active' : ''}" id="favoriteBtn" title="${fav ? '取消收藏' : '收藏此文档'}">
        ${fav ? SVG_ICONS.starFilled : SVG_ICONS.star}
        <span class="btn-text-full">${fav ? '已收藏' : '收藏'}</span>
        <span class="btn-text-short">${fav ? '已收藏' : '收藏'}</span>
      </button>
      <button class="btn" id="copyLinkBtn" title="复制直达链接">
        ${SVG_ICONS.link}
        <span class="btn-text-full">复制链接</span>
        <span class="btn-text-short">链接</span>
      </button>
      <button class="btn btn-share" id="shareDocBtn" title="生成此文档的只读免密分享链接，可安全分享给他人阅读">
        ${SVG_ICONS.share}
        <span class="btn-text-full">分享</span>
        <span class="btn-text-short">分享</span>
      </button>
      <button class="btn" id="aiDocTaskBtn" title="针对当前文章派发 AI 任务（补充、修改、解剖或衍生创作）">
        ${SVG_ICONS.sparkles}
        <span class="btn-text-full">AI 协作</span>
        <span class="btn-text-short">AI</span>
      </button>
    `;

    if (isMarkdown) {
      const audioBtn = document.getElementById('docAudioBtn');
      if (audioBtn) {
        audioBtn.addEventListener('click', () => {
          toggleDocAudio(doc);
        });
      }
      const addListenBtn = document.getElementById('addListenQueueBtn');
      if (addListenBtn) addListenBtn.addEventListener('click', () => addToListenQueue(doc));
      const mindmapBtn = document.getElementById('docMindmapBtn');
      if (mindmapBtn) {
        mindmapBtn.addEventListener('click', () => {
          openDocMindmap(doc);
        });
      }
      const diffBtn = document.getElementById('docHistoryDiffBtn');
      if (diffBtn) {
        diffBtn.addEventListener('click', () => {
          openIncrementalDiffModal(doc);
        });
      }
    }

    if (el.mobileMindmapBtn) {
      el.mobileMindmapBtn.style.display = isMarkdown ? 'inline-flex' : 'none';
    }

    document.getElementById('favoriteBtn').addEventListener('click', () => {
      toggleFavorite(doc);
    });

    document.getElementById('copyLinkBtn').addEventListener('click', async () => {
      await copyTextToClipboard(window.location.href);
      const b = document.getElementById('copyLinkBtn');
      b.classList.add('copy-success');
      b.innerHTML = `${SVG_ICONS.check} <span class="btn-text-full" style="color:#10b981;">已复制</span><span class="btn-text-short" style="color:#10b981;">已复制</span>`;
      setTimeout(() => {
        b.classList.remove('copy-success');
        b.innerHTML = `${SVG_ICONS.link} <span class="btn-text-full">复制链接</span><span class="btn-text-short">链接</span>`;
      }, 2000);
    });

    const shareBtn = document.getElementById('shareDocBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        openShareModal(doc);
      });
    }

    document.getElementById('aiDocTaskBtn').addEventListener('click', () => {
      openAiTaskModal({ doc: doc, defaultAction: 'append' });
    });

    if (doc.type === 'markdown') {
      renderMarkdownDoc(doc.content);
    } else if (doc.type === 'html') {
      renderHtmlDoc(doc.path, doc.content);
    } else {
      renderCodeDoc(doc.content, doc.path);
    }

    renderDocPagination();
    resetDocScroll();
  }

  function cleanDocTitle(name) {
    if (!name) return '';
    return name.replace(/\.(md|markdown|mdown)$/i, '');
  }

  function getFlattenedDocList(rootNode, routePrefix) {
    const docs = [];
    if (!rootNode) return docs;
    const cleanPrefix = '/' + (routePrefix || '').replace(/^\/+|\/+$/g, '');

    function walk(node) {
      if (!node) return;
      if (!node.is_dir) {
        const cleanPath = (node.path || '').replace(/^\/+/, '');
        const fullRoute = cleanPrefix ? `${cleanPrefix}/${cleanPath}` : `/${cleanPath}`;
        docs.push({
          name: node.name,
          path: node.path,
          fullRoute: fullRoute,
          ext: node.ext || ''
        });
        return;
      }
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    }

    if (rootNode.children && Array.isArray(rootNode.children)) {
      rootNode.children.forEach(walk);
    } else if (!rootNode.is_dir) {
      walk(rootNode);
    }
    return docs;
  }

  function updateHeaderPaginationButtons(prevDoc, nextDoc) {
    const oldGroup = document.getElementById('headerDocNavGroup');
    if (oldGroup) oldGroup.remove();

    if (!prevDoc && !nextDoc) return;
    if (!el.articleActions) return;

    const navGroup = document.createElement('div');
    navGroup.className = 'header-doc-nav-group';
    navGroup.id = 'headerDocNavGroup';

    let prevBtnHtml = '';
    if (prevDoc) {
      prevBtnHtml = `
        <button class="btn btn-icon header-nav-btn" id="headerPrevDocBtn" title="上一篇: ${escapeHtml(cleanDocTitle(prevDoc.name))}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span class="header-nav-text">上一篇</span>
        </button>
      `;
    }

    let nextBtnHtml = '';
    if (nextDoc) {
      nextBtnHtml = `
        <button class="btn btn-icon header-nav-btn" id="headerNextDocBtn" title="下一篇: ${escapeHtml(cleanDocTitle(nextDoc.name))}">
          <span class="header-nav-text">下一篇</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      `;
    }

    navGroup.innerHTML = prevBtnHtml + nextBtnHtml;
    el.articleActions.insertBefore(navGroup, el.articleActions.firstChild);

    if (prevDoc) {
      const btn = document.getElementById('headerPrevDocBtn');
      if (btn) {
        btn.addEventListener('pointerenter', () => prefetchDocument(prevDoc.fullRoute), { once: true });
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (document.activeElement) document.activeElement.blur();
          resetDocScroll();
          routeTo(prevDoc.fullRoute, true);
          resetDocScroll();
        });
      }
    }

    if (nextDoc) {
      const btn = document.getElementById('headerNextDocBtn');
      if (btn) {
        btn.addEventListener('pointerenter', () => prefetchDocument(nextDoc.fullRoute), { once: true });
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (document.activeElement) document.activeElement.blur();
          resetDocScroll();
          routeTo(nextDoc.fullRoute, true);
          resetDocScroll();
        });
      }
    }
  }

  async function renderDocPagination() {
    if (!el.docPagination) return;
    if (!state.currentDoc || !state.currentRepo || state.currentPath === '/' || state.currentPath === '/' + (state.currentRepo.RoutePrefix || '').replace(/^\/+|\/+$/g, '')) {
      el.docPagination.style.display = 'none';
      el.docPagination.innerHTML = '';
      updateHeaderPaginationButtons(null, null);
      return;
    }

    const repoId = state.currentRepo.ID;
    let tree = state.treeData;
    if (!tree && state.repoTreeCache && state.repoTreeCache.has(repoId)) {
      tree = state.repoTreeCache.get(repoId);
    }
    // 1. 若当前内存中尚未加载树，从 SessionStorage 或异步加载中获取，绝不草率退出
    if (!tree) {
      const local = getStoredTree(repoId);
      if (local && local.data) {
        tree = local.data;
        state.treeData = tree;
      }
    }
    if (!tree && typeof loadTree === 'function') {
      try {
        await loadTree(repoId);
        tree = state.treeData;
      } catch (e) {}
    }
    if (!tree) {
      el.docPagination.style.display = 'none';
      return;
    }

    const docs = getFlattenedDocList(tree, state.currentRepo.RoutePrefix);
    if (!docs || docs.length <= 1) {
      el.docPagination.style.display = 'none';
      el.docPagination.innerHTML = '';
      updateHeaderPaginationButtons(null, null);
      return;
    }

    // 2. 全向归一化路径比对器，支持各种 URL、相对路径、省略 .md、目录 README 匹配
    const normalizeForMatch = (p) => {
      if (!p) return '';
      return decodeURIComponent(p)
        .replace(/^\/+|\/+$/g, '')
        .replace(/\/README\.md$/i, '')
        .replace(/\/index\.md$/i, '')
        .replace(/\.(md|markdown|html)$/i, '')
        .toLowerCase();
    };

    const target1 = normalizeForMatch(state.currentPath);
    const target2 = normalizeForMatch(state.currentDoc?.path);
    const target3 = normalizeForMatch(state.currentDoc?.rel_path);

    let currIdx = docs.findIndex(d => {
      const dFull = decodeURIComponent(d.fullRoute || '').replace(/\/+$/, '');
      const dPath = decodeURIComponent(d.path || '').replace(/^\/+|\/+$/g, '');

      // 严格全等命中
      if (state.currentPath && dFull === state.currentPath) return true;
      if (state.currentDoc) {
        if (state.currentDoc.rel_path && (dPath === state.currentDoc.rel_path || dPath === decodeURIComponent(state.currentDoc.rel_path))) return true;
        if (state.currentDoc.path && (dFull === state.currentDoc.path || dPath === state.currentDoc.path)) return true;
      }

      // 归一化模糊命中（忽略 .md, README.md, 大小写, 编码差异）
      const normFull = normalizeForMatch(dFull);
      const normPath = normalizeForMatch(dPath);

      if (target1 && (normFull === target1 || normPath === target1)) return true;
      if (target2 && (normFull === target2 || normPath === target2)) return true;
      if (target3 && (normFull === target3 || normPath === target3)) return true;

      return false;
    });

    if (currIdx === -1) {
      el.docPagination.style.display = 'none';
      el.docPagination.innerHTML = '';
      updateHeaderPaginationButtons(null, null);
      return;
    }

    const prevDoc = currIdx > 0 ? docs[currIdx - 1] : null;
    const nextDoc = currIdx < docs.length - 1 ? docs[currIdx + 1] : null;

    // 3. 同时更新顶部工具栏快捷翻页按钮（双导轨设计）
    updateHeaderPaginationButtons(prevDoc, nextDoc);

    if (!prevDoc && !nextDoc) {
      el.docPagination.style.display = 'none';
      el.docPagination.innerHTML = '';
      return;
    }

    // 4. 渲染文章底部大卡片
    let html = '';
    if (prevDoc) {
      html += `
        <div class="doc-pagination-card-wrapper doc-pagination-prev-wrapper">
          <a href="${prevDoc.fullRoute}" class="doc-pagination-card doc-pagination-prev" title="上一篇: ${escapeHtml(prevDoc.name)}">
            <div class="doc-pagination-header">
              <svg class="doc-pagination-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span class="doc-pagination-label">上一篇</span>
            </div>
            <div class="doc-pagination-title">${escapeHtml(cleanDocTitle(prevDoc.name))}</div>
          </a>
        </div>
      `;
    } else {
      html += `<div class="doc-pagination-spacer"></div>`;
    }

    if (nextDoc) {
      html += `
        <div class="doc-pagination-card-wrapper doc-pagination-next-wrapper">
          <a href="${nextDoc.fullRoute}" class="doc-pagination-card doc-pagination-next" title="下一篇: ${escapeHtml(nextDoc.name)}">
            <div class="doc-pagination-header">
              <span class="doc-pagination-label">下一篇</span>
              <svg class="doc-pagination-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
            <div class="doc-pagination-title">${escapeHtml(cleanDocTitle(nextDoc.name))}</div>
          </a>
        </div>
      `;
    }

    el.docPagination.innerHTML = html;
    el.docPagination.style.display = 'grid';

    el.docPagination.querySelectorAll('.doc-pagination-card').forEach(card => {
      const targetRoute = card.getAttribute('href');
      card.addEventListener('pointerenter', () => {
        prefetchDocument(targetRoute);
      }, { once: true });
      card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement) document.activeElement.blur();
        resetDocScroll();
        routeTo(targetRoute, true);
        resetDocScroll();
      });
    });
    resetDocScroll();
  }

  function updateBreadcrumbs(doc) {
    if (!el.headerBreadcrumbs) return;
    const parts = (doc.rel_path || '').split('/').filter(Boolean);
    const repoName = doc.repo_name || (state.currentRepo ? state.currentRepo.Name : '知识库');
    const cleanPrefix = '/' + (state.currentRepo?.RoutePrefix || doc.repo_prefix || '').replace(/^\/+|\/+$/g, '');

    let html = `
      <span class="breadcrumb-item breadcrumb-home" id="breadcrumbHomeBtn" title="返回 ${escapeHtml(repoName)} 概览页" role="button" tabindex="0">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span>${escapeHtml(repoName)}</span>
      </span>
    `;

    parts.forEach((p, idx) => {
      html += `<span class="breadcrumb-separator">/</span>`;
      if (idx === parts.length - 1) {
        html += `<span class="breadcrumb-current" id="breadcrumbCurrentBtn" title="点击回至文档顶部：${escapeHtml(p)}" role="button" tabindex="0">${escapeHtml(p)}</span>`;
      } else {
        const dirRelPath = parts.slice(0, idx + 1).join('/');
        html += `<span class="breadcrumb-item breadcrumb-folder" data-dir="${escapeHtml(dirRelPath)}" title="展开并聚焦目录：${escapeHtml(p)}" role="button" tabindex="0">${escapeHtml(p)}</span>`;
      }
    });

    el.headerBreadcrumbs.innerHTML = html;

    const homeBtn = document.getElementById('breadcrumbHomeBtn');
    if (homeBtn) {
      const goHome = (e) => {
        e.preventDefault();
        routeTo(cleanPrefix || '/', true);
      };
      homeBtn.addEventListener('click', goHome);
      homeBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') goHome(e);
      });
    }

    el.headerBreadcrumbs.querySelectorAll('.breadcrumb-folder').forEach(folderEl => {
      const clickFolder = (e) => {
        e.preventDefault();
        const dirRelPath = folderEl.getAttribute('data-dir');
        if (!dirRelPath) return;
        const targetPath = cleanPrefix ? `${cleanPrefix}/${dirRelPath}` : `/${dirRelPath}`;
        expandPathToNode(targetPath);
        if (window.innerWidth <= 900 && typeof openMobileSidebar === 'function') {
          openMobileSidebar();
        }
      };
      folderEl.addEventListener('click', clickFolder);
      folderEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') clickFolder(e);
      });
    });

    const currentBtn = document.getElementById('breadcrumbCurrentBtn');
    if (currentBtn) {
      const scrollToTop = (e) => {
        e.preventDefault();
        if (el.contentArea) {
          el.contentArea.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      currentBtn.addEventListener('click', scrollToTop);
      currentBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') scrollToTop(e);
      });
    }
  }

  function extractChaptersFromTree(treeData, cleanPrefix) {
    if (!treeData || !treeData.children) return [];
    const chapters = [];

    function collectDocs(node) {
      let docs = [];
      if (!node || !node.children) return docs;
      node.children.forEach(c => {
        if (!c.is_dir) {
          if (/\.(md|markdown|mdown|html|txt)$/i.test(c.name)) {
            const fullRoute = cleanPrefix + '/' + c.path.replace(/^\/+/, '');
            docs.push({
              name: c.name.replace(/\.(md|markdown|mdown|html)$/i, ''),
              rawName: c.name,
              path: c.path,
              fullRoute: fullRoute,
              modTime: c.mod_time,
              size: c.size
            });
          }
        } else {
          docs = docs.concat(collectDocs(c));
        }
      });
      return docs;
    }

    treeData.children.forEach(node => {
      if (node.is_dir) {
        const subDirs = (node.children || []).filter(c => c.is_dir);
        if (subDirs.length > 0 && (node.name === '专题' || node.name === 'chapters' || node.name === 'docs')) {
          subDirs.forEach(sub => {
            const docs = collectDocs(sub);
            chapters.push({
              name: sub.name,
              path: sub.path,
              docs: docs
            });
          });
        } else {
          const docs = collectDocs(node);
          chapters.push({
            name: node.name,
            path: node.path,
            docs: docs
          });
        }
      }
    });

    const rootDocs = (treeData.children || []).filter(c => !c.is_dir && /\.(md|markdown|mdown|html)$/i.test(c.name));
    if (rootDocs.length > 0) {
      chapters.unshift({
        name: '概览与核心导读',
        path: '',
        docs: rootDocs.map(c => ({
          name: c.name.replace(/\.(md|markdown|mdown|html)$/i, ''),
          rawName: c.name,
          path: c.path,
          fullRoute: cleanPrefix + '/' + c.path.replace(/^\/+/, ''),
          modTime: c.mod_time,
          size: c.size
        }))
      });
    }

    return chapters;
  }

  async function fetchRecentDocsForDashboard(repoID, cleanPrefix) {
    try {
      const res = await fetch(`/api/recent?repo=${encodeURIComponent(repoID)}&limit=12`);
      if (!res.ok) return;
      const files = await res.json();
      if (!files || files.length === 0) return;
      const grid = document.getElementById('welcomeRecentGrid');
      if (!grid) return;
      const filterInput = document.getElementById('recentFilterInput');
      if (filterInput && filterInput.value.trim()) return;

      const nowSec = Math.floor(Date.now() / 1000);
      let html = '';
      files.forEach(f => {
        const timeAgo = formatTimeAgo(f.mod_time * 1000);
        const isVeryRecent = (nowSec - f.mod_time) < 86400 * 2;
        const cleanName = f.name.replace(/\.(md|markdown|mdown|html)$/i, '');
        const dirPath = f.path.split('/').slice(0, -1).join('/') || '/';
        html += `
          <a href="${escapeHtml(f.full_route)}" class="welcome-recent-card" data-name="${escapeHtml(cleanName.toLowerCase())}" data-path="${escapeHtml(f.full_route)}">
            <div class="recent-card-top">
              <span class="recent-card-icon">${SVG_ICONS.markdown}</span>
              <span class="recent-card-time ${isVeryRecent ? 'is-new' : ''}">
                ${isVeryRecent ? '⚡ ' : ''}${timeAgo}
              </span>
            </div>
            <div class="recent-card-title" title="${escapeHtml(cleanName)}">${escapeHtml(cleanName)}</div>
            <div class="recent-card-path" title="${escapeHtml(dirPath)}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:4px;opacity:0.75;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>${escapeHtml(dirPath)}</div>
          </a>
        `;
      });
      grid.innerHTML = html;

      grid.querySelectorAll('.welcome-recent-card').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const p = item.getAttribute('data-path');
          if (p) routeTo(p);
        });
      });
    } catch (e) {}
  }

  function renderWelcomeDashboard() {
    if (el.articleHeader) el.articleHeader.style.display = 'none';
    if (el.docPagination) el.docPagination.style.display = 'none';
    if (!state.repos || state.repos.length === 0) return;

    const currentRepo = state.currentRepo || state.repos[0];
    const repoName = currentRepo ? currentRepo.Name : '知识库';
    const cleanPrefix = '/' + (currentRepo.RoutePrefix || '').replace(/^\/+|\/+$/g, '');

    if (el.headerBreadcrumbs) {
      el.headerBreadcrumbs.innerHTML = `
        <span class="breadcrumb-item breadcrumb-home" id="breadcrumbHomeBtn" title="知识库首页" role="button" tabindex="0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>${escapeHtml(repoName)}</span>
        </span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">章节全览与导读</span>
      `;
      const homeBtn = document.getElementById('breadcrumbHomeBtn');
      if (homeBtn) {
        homeBtn.addEventListener('click', () => {
          if (el.contentArea) el.contentArea.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    }

    // 1. 获取当前仓库的“上次阅读”信息
    let allRecent = [];
    try {
      allRecent = JSON.parse(localStorage.getItem('doc_lens_recent_reads') || '[]');
    } catch (e) {}

    let repoRecent = allRecent.filter(r => {
      if (r.repoId) return r.repoId === currentRepo.ID;
      const matched = findRepoForRoute(r.path);
      return matched && matched.ID === currentRepo.ID;
    });

    let lastRead = repoRecent[0] || null;
    if (!lastRead) {
      const lastActivePath = localStorage.getItem('doc_lens_last_active_' + currentRepo.ID);
      if (lastActivePath && lastActivePath !== '/' && lastActivePath !== cleanPrefix) {
        const rawName = decodeURIComponent(lastActivePath.split('/').pop() || '上次阅读文档').replace(/\.(md|markdown|html)$/i, '');
        lastRead = {
          name: rawName,
          path: lastActivePath,
          timestamp: Date.now(),
          repoId: currentRepo.ID
        };
      }
    }

    // 2. 提取当前知识库的最近生成/更新文档
    const recentDocs = extractRecentDocsFromTree(state.treeData, cleanPrefix, 12);
    let recentDocsHtml = '';
    if (recentDocs.length > 0) {
      const nowSec = Math.floor(Date.now() / 1000);
      recentDocs.forEach(d => {
        const timeAgo = formatTimeAgo(d.modTime * 1000);
        const isVeryRecent = (nowSec - d.modTime) < 86400 * 2; // 48小时内更新标记
        recentDocsHtml += `
          <a href="${escapeHtml(d.fullRoute)}" class="welcome-recent-card" data-name="${escapeHtml(d.name.toLowerCase())}" data-path="${escapeHtml(d.fullRoute)}">
            <div class="recent-card-top">
              <span class="recent-card-icon">${SVG_ICONS.markdown}</span>
              <span class="recent-card-time ${isVeryRecent ? 'is-new' : ''}">
                ${isVeryRecent ? '⚡ ' : ''}${timeAgo}
              </span>
            </div>
            <div class="recent-card-title" title="${escapeHtml(d.name)}">${escapeHtml(d.name)}</div>
            <div class="recent-card-path" title="${escapeHtml(d.dirPath)}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:4px;opacity:0.75;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>${escapeHtml(d.dirPath)}</div>
          </a>
        `;
      });
    } else {
      recentDocsHtml = `<div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--text-muted);font-size:13px;">当前知识库暂未检索到文章</div>`;
    }

    // 3. 提取当前知识库的所有章节
    const chapters = extractChaptersFromTree(state.treeData, cleanPrefix);

    // 4. 构建“上次阅读 / 继续阅读”高亮卡片
    let lastReadCardHtml = '';
    if (lastRead) {
      const timeAgo = formatTimeAgo(lastRead.timestamp);
      const dirPath = decodeURIComponent(lastRead.path).split('/').slice(0, -1).join('/') || '/';
      lastReadCardHtml = `
        <div class="welcome-last-read-card" id="welcomeLastReadCard">
          <div class="last-read-header">
            <span class="last-read-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>上次阅读 · ${timeAgo}</span>
            </span>
            <span class="last-read-repo-tag">${escapeHtml(currentRepo.Name)}</span>
          </div>
          <div class="last-read-body">
            <div class="last-read-title-row">
              <span class="last-read-doc-icon">${SVG_ICONS.markdown}</span>
              <a href="${escapeHtml(lastRead.path)}" class="last-read-title" id="lastReadLink">${escapeHtml(lastRead.name)}</a>
            </div>
            <div class="last-read-path"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:4px;opacity:0.75;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>${escapeHtml(dirPath)}</div>
          </div>
          <div class="last-read-actions">
            <button class="btn btn-primary" id="continueReadBtn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>继续阅读本篇</span>
            </button>
            <button class="btn" id="locateInTreeBtn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>在左侧目录树中定位</span>
            </button>
          </div>
        </div>
      `;
    }

    // 5. 构建“知识库完整章节分布”卡片网格
    let chaptersHtml = '';
    if (chapters.length > 0) {
      chapters.forEach((ch, idx) => {
        const decodedLastPath = lastRead ? decodeURIComponent(lastRead.path) : '';
        const isCurrentChapter = lastRead && ch.path && (decodedLastPath.includes(ch.path) || ch.docs.some(d => decodeURIComponent(d.fullRoute) === decodedLastPath));
        let docListHtml = '';
        ch.docs.slice(0, 6).forEach(doc => {
          const isDocActive = lastRead && (decodeURIComponent(doc.fullRoute) === decodedLastPath);
          docListHtml += `
            <a href="${escapeHtml(doc.fullRoute)}" class="chapter-doc-item ${isDocActive ? 'active-doc' : ''}" data-path="${escapeHtml(doc.fullRoute)}">
              <span class="chapter-doc-bullet">${isDocActive ? '📍' : '📄'}</span>
              <span class="chapter-doc-name" title="${escapeHtml(doc.name)}">${escapeHtml(doc.name)}</span>
              ${isDocActive ? '<span class="chapter-doc-badge">上次读到</span>' : ''}
            </a>
          `;
        });
        const hasMore = ch.docs.length > 6;
        if (hasMore) {
          docListHtml += `
            <div class="chapter-more-hint" data-chapter-path="${escapeHtml(ch.path)}">
              + 查看全部 ${ch.docs.length} 篇文档 (展开左侧树)...
            </div>
          `;
        }

        chaptersHtml += `
          <div class="welcome-chapter-card ${isCurrentChapter ? 'is-active-chapter' : ''}" id="chapter-card-${idx}" data-chapter-path="${escapeHtml(ch.path)}">
            <div class="chapter-card-header">
              <div class="chapter-card-title-group">
                <span class="chapter-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                </span>
                <span class="chapter-title" title="${escapeHtml(ch.name)}">${escapeHtml(ch.name)}</span>
              </div>
              <div class="chapter-card-meta">
                ${isCurrentChapter ? '<span class="chapter-reading-badge">📍 上次停留</span>' : ''}
                <span class="chapter-count-badge">${ch.docs.length} 篇</span>
              </div>
            </div>
            <div class="chapter-card-docs">
              ${docListHtml || '<div class="chapter-empty-hint" style="font-size:12px;color:var(--text-muted);padding:6px 8px;">包含子层级文档</div>'}
            </div>
            <div class="chapter-card-footer">
              <button class="btn btn-xs chapter-locate-btn" data-chapter-path="${escapeHtml(ch.path)}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                <span>在左侧目录定位</span>
              </button>
            </div>
          </div>
        `;
      });
    } else {
      chaptersHtml = `<div style="grid-column:1/-1;padding:30px;text-align:center;color:var(--text-muted);font-size:13px;">当前知识库正在整理中，暂未发现文档章节</div>`;
    }

    // 检查章节分布、最近文章以及公开分享折叠偏好
    const isChaptersCollapsed = localStorage.getItem('doc_lens_chapters_collapsed_' + currentRepo.ID) === '1';
    const isRecentCollapsed = localStorage.getItem('doc_lens_recent_collapsed_' + currentRepo.ID) === '1';
    const isSharesCollapsed = localStorage.getItem('doc_lens_shares_collapsed') === '1';

    // 6. 构建“快速切换知识库体系”（知识库集群空间树结构）
    let repoTreeBranchesHtml = '';
    state.repos.forEach(r => {
      const isCurrent = (r.ID === currentRepo.ID);
      repoTreeBranchesHtml += `
        <div class="repo-tree-node ${isCurrent ? 'is-current' : ''}" data-repoid="${escapeHtml(r.ID)}" title="${isCurrent ? '当前所在知识库空间' : '点击秒级切换至该知识库'}">
          <div class="repo-tree-node-left">
            <div class="repo-tree-node-icon">${isCurrent ? '🟢' : '📚'}</div>
            <div class="repo-tree-node-text">
              <div class="repo-tree-node-title-row">
                <span class="repo-tree-node-title">${escapeHtml(r.Name)}</span>
                ${isCurrent ? '<span class="repo-tree-badge-active">当前浏览中</span>' : '<span class="repo-tree-badge-switch">一键切换 ➔</span>'}
              </div>
              <div class="repo-tree-node-desc">${escapeHtml(r.Description || '架构研报、深度技术解剖与代码透视知识库')}</div>
              <div class="repo-tree-node-meta">
                <span class="repo-tree-meta-item">访问前缀: <code>${escapeHtml(r.RoutePrefix || '/')}</code></span>
                ${r.Path ? `<span class="repo-tree-meta-item">本地挂载: <code>${escapeHtml(r.Path)}</code></span>` : ''}
              </div>
            </div>
          </div>
          <div class="repo-tree-node-action">
            ${isCurrent ? '<button type="button" class="btn btn-sm" disabled style="opacity:0.75;cursor:default;">当前空间</button>' : '<button type="button" class="btn btn-sm btn-primary repo-switch-action-btn">穿梭至该库 🚀</button>'}
          </div>
        </div>
      `;
    });

    // 7. 渲染页面（划分为四大部分：1. 最近阅读与动态，2. 对外公开分享管理中心，3. 章节导航，4. 快速切换知识库体系）
    el.articleBody.innerHTML = `
      <div class="welcome-dashboard-container">
        <!-- 头部导读 -->
        <div class="welcome-hero-header">
          <div class="welcome-badge">DocLens Central · 当前知识库</div>
          <h1 class="welcome-title">${escapeHtml(currentRepo.Name)}</h1>
          <p class="welcome-desc">${escapeHtml(currentRepo.Description || '架构研报、深度技术解剖与代码透视知识库')}</p>
        </div>

        <!-- 第一部分：最近阅读与生成动态 (包含上次阅读卡片 + 最近生成与更新文章) -->
        <div class="welcome-section welcome-recent-section" id="homeSectionRecent">
          ${lastReadCardHtml}

          <div class="welcome-section-header">
            <div class="welcome-section-title-wrap">
              <div class="welcome-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>最近生成与更新</span>
              </div>
              <span class="welcome-section-subtitle">最新技术研报与文章动态 · 保持前沿敏锐度</span>
            </div>
            <div class="welcome-section-actions">
              <div class="recent-search-wrap" style="${isRecentCollapsed ? 'display:none;' : ''}" id="recentSearchWrap">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" class="recent-filter-input" id="recentFilterInput" placeholder="过滤最近文章..." autocomplete="off">
                <button type="button" class="recent-clear-filter-btn" id="recentClearFilterBtn" style="display:none;" title="清空">✕</button>
              </div>
              <span class="recent-live-badge"><span class="live-dot"></span>实时同步</span>
              <button type="button" class="btn-collapse-chapters" id="toggleRecentBtn" title="点击收起或展开最近生成与更新">
                <span id="toggleRecentText">${isRecentCollapsed ? '展开' : '收起'}</span>
                <svg id="toggleRecentIcon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="transform:${isRecentCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'};transition:transform 0.2s ease;"><polyline points="18 15 12 9 6 15"></polyline></svg>
              </button>
            </div>
          </div>
          <div class="welcome-chapters-collapsed-bar" id="recentCollapsedBar" style="${isRecentCollapsed ? '' : 'display:none;'}">
            <span>已收起最近生成与更新文章（共 ${recentDocs.length} 篇，点击展开）</span>
          </div>
          <div class="welcome-recent-grid ${isRecentCollapsed ? 'is-collapsed' : ''}" id="welcomeRecentGrid">
            ${recentDocsHtml}
          </div>
        </div>

        <!-- 第二部分：对外公开分享管理中心 (统一管理已生效、已停用或已过期的公开链接) -->
        <div class="welcome-section welcome-shares-section" id="homeSectionShares">
          <div class="welcome-section-header">
            <div class="welcome-section-title-wrap">
              <div class="welcome-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                <span>对外公开分享管理中心</span>
              </div>
              <span class="welcome-section-subtitle">统一掌控所有对外只读公开链接 · 即使关掉也能随时查阅、一键重启或安全销毁</span>
            </div>
            <div class="welcome-section-actions">
              <button type="button" class="btn-collapse-chapters" id="toggleHomeSharesBtn" title="点击收起或展开分享管理">
                <span id="toggleHomeSharesText">${isSharesCollapsed ? '展开' : '收起'}</span>
                <svg id="toggleHomeSharesIcon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="transform:${isSharesCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'};transition:transform 0.2s ease;"><polyline points="18 15 12 9 6 15"></polyline></svg>
              </button>
            </div>
          </div>

          <div class="welcome-chapters-collapsed-bar" id="homeSharesCollapsedBar" style="${isSharesCollapsed ? '' : 'display:none;'}">
            <span id="homeSharesCollapsedText">已收起对外公开分享管理中心（点击展开）</span>
          </div>

          <div class="welcome-shares-body ${isSharesCollapsed ? 'is-collapsed' : ''}" id="homeSharesBody">
            <!-- 统计指标 -->
            <div class="shares-metrics-bar" id="homeSharesMetricsBar">
              <div class="share-metric-card" data-filter="all">
                <span class="metric-num" id="homeMetricTotalShares">0</span>
                <span class="metric-label">全部记录</span>
              </div>
              <div class="share-metric-card active" data-filter="active">
                <span class="metric-num text-success" id="homeMetricActiveShares">0</span>
                <span class="metric-label">🟢 分享中</span>
              </div>
              <div class="share-metric-card" data-filter="disabled">
                <span class="metric-num text-muted" id="homeMetricDisabledShares">0</span>
                <span class="metric-label">⏸️ 已关闭</span>
              </div>
              <div class="share-metric-card" data-filter="expired">
                <span class="metric-num text-warning" id="homeMetricExpiredShares">0</span>
                <span class="metric-label">⏰ 已过期</span>
              </div>
              <div class="share-metric-card metric-views">
                <span class="metric-num text-primary" id="homeMetricTotalViews">0</span>
                <span class="metric-label">累计访客阅读</span>
              </div>
            </div>

            <!-- 工具栏：搜索 + 过滤 -->
            <div class="shares-toolbar" style="margin-top:14px;">
              <div class="shares-search-input-wrap">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" class="text-input shares-search-input" id="homeSharesSearchInput" placeholder="按文档标题、短链 ID 或路径过滤..." autocomplete="off">
                <button type="button" class="clear-search-btn" id="homeSharesClearSearchBtn" style="display:none;">✕</button>
              </div>
              <div class="shares-filter-group">
                <select class="custom-select shares-repo-filter" id="homeSharesRepoFilter">
                  <option value="">所有知识库空间</option>
                </select>
                <select class="custom-select shares-status-filter" id="homeSharesStatusFilter">
                  <option value="all">全部状态</option>
                  <option value="active" selected>仅看生效中</option>
                  <option value="disabled">仅看已关闭</option>
                  <option value="expired">仅看已过期</option>
                </select>
              </div>
              <button type="button" class="btn btn-sm btn-refresh-shares" id="homeRefreshSharesBtn" title="刷新分享列表">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                <span>刷新</span>
              </button>
            </div>

            <!-- 列表容器 -->
            <div class="shares-list-container" id="homeSharesListContainer">
              <div class="shares-loading-hint">正在读取所有公开分享数据...</div>
            </div>
          </div>
        </div>

        <!-- 第三部分：知识库完整章节分布与导航 -->
        <div class="welcome-section welcome-chapters-section" id="homeSectionChapters">
          <div class="welcome-section-header">
            <div class="welcome-section-title-wrap">
              <div class="welcome-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                <span>知识库章节全览导航</span>
              </div>
              <span class="welcome-section-subtitle">共 ${chapters.length} 个核心章节 · 点击文章直达阅读</span>
            </div>
            <div class="welcome-section-actions">
              <button type="button" class="btn-collapse-chapters" id="toggleChaptersBtn" title="点击收起或展开章节分布">
                <span id="toggleChaptersText">${isChaptersCollapsed ? '展开章节' : '收起章节'}</span>
                <svg id="toggleChaptersIcon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="transform:${isChaptersCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'};transition:transform 0.2s ease;"><polyline points="18 15 12 9 6 15"></polyline></svg>
              </button>
            </div>
          </div>
          <div class="welcome-chapters-collapsed-bar" id="chaptersCollapsedBar" style="${isChaptersCollapsed ? '' : 'display:none;'}">
            <span>已收起完整章节分布（共 ${chapters.length} 节，点击展开）</span>
          </div>
          <div class="welcome-chapters-grid ${isChaptersCollapsed ? 'is-collapsed' : ''}" id="welcomeChaptersGrid">
            ${chaptersHtml}
          </div>
        </div>

        <!-- 第三部分：快速切换知识库 (树状空间架构体系) -->
        <div class="welcome-section welcome-switch-section" id="homeSectionRepos">
          <div class="welcome-section-header">
            <div class="welcome-section-title-wrap">
              <div class="welcome-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                <span>快速切换知识库体系</span>
              </div>
              <span class="welcome-section-subtitle">知识库集群空间树 · 支持跨仓库一键秒级穿梭</span>
            </div>
            <div class="welcome-section-actions">
              <span class="welcome-repo-count-badge">共挂载 ${state.repos.length} 个独立知识库空间</span>
            </div>
          </div>
          <div class="welcome-repo-tree-card">
            <div class="repo-tree-root">
              <span class="repo-tree-root-icon">🏛️</span>
              <div class="repo-tree-root-info">
                <span class="repo-tree-root-title">DocLens 本地知识库集群网络 (Cluster)</span>
                <span class="repo-tree-root-desc">全局多库独立索引与统一穿梭管理</span>
              </div>
            </div>
            <div class="repo-tree-branches">
              ${repoTreeBranchesHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    // 绑定事件：继续阅读
    if (lastRead) {
      const continueBtn = document.getElementById('continueReadBtn');
      if (continueBtn) {
        continueBtn.addEventListener('click', () => routeTo(lastRead.path));
      }
      const lastReadLink = document.getElementById('lastReadLink');
      if (lastReadLink) {
        lastReadLink.addEventListener('click', (e) => {
          e.preventDefault();
          routeTo(lastRead.path);
        });
      }
      const locateBtn = document.getElementById('locateInTreeBtn');
      if (locateBtn) {
        locateBtn.addEventListener('click', () => {
          expandPathToNode(lastRead.path);
          if (window.innerWidth <= 900) openMobileSidebar();
        });
      }
    }

    // 绑定事件：最近生成与更新卡片直达
    document.querySelectorAll('.welcome-recent-card').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const p = item.getAttribute('data-path');
        if (p) routeTo(p);
      });
    });

    // 异步通过 /api/recent 再次校准最新落盘文章，确保毫秒级与磁盘保持 100% 同步
    fetchRecentDocsForDashboard(currentRepo.ID, cleanPrefix);

    // 绑定事件：即时过滤最近生成与更新文章
    const recentFilterInput = document.getElementById('recentFilterInput');
    const recentClearFilterBtn = document.getElementById('recentClearFilterBtn');
    const recentGrid = document.getElementById('welcomeRecentGrid');

    if (recentFilterInput && recentGrid) {
      recentFilterInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        if (recentClearFilterBtn) recentClearFilterBtn.style.display = q ? 'flex' : 'none';

        const cards = recentGrid.querySelectorAll('.welcome-recent-card');
        let matchedCount = 0;
        cards.forEach(card => {
          const name = card.getAttribute('data-name') || '';
          const path = (card.getAttribute('data-path') || '').toLowerCase();
          const isMatch = !q || name.includes(q) || path.includes(q);
          card.style.display = isMatch ? 'flex' : 'none';
          if (isMatch) matchedCount++;
        });

        let noMatchEl = document.getElementById('recentNoMatchHint');
        if (matchedCount === 0 && q) {
          if (!noMatchEl) {
            noMatchEl = document.createElement('div');
            noMatchEl.id = 'recentNoMatchHint';
            noMatchEl.style.cssText = 'grid-column:1/-1;padding:26px 16px;text-align:center;font-size:13px;color:var(--text-muted);background:var(--bg-subtle);border-radius:var(--radius-md);border:1px dashed var(--border-default);';
            recentGrid.appendChild(noMatchEl);
          }
          noMatchEl.innerHTML = `
            未在近期文章中找到 "${escapeHtml(q)}"
            <button type="button" class="btn btn-sm btn-primary" id="openGlobalSearchWithQuery" style="margin-left:10px;padding:4px 10px;font-size:12px;">在全库中深入检索 (⌘K)</button>
          `;
          const openBtn = document.getElementById('openGlobalSearchWithQuery');
          if (openBtn) {
            openBtn.addEventListener('click', () => openQuickSearchModal(q));
          }
        } else if (noMatchEl) {
          noMatchEl.remove();
        }
      });

      if (recentClearFilterBtn) {
        recentClearFilterBtn.addEventListener('click', () => {
          recentFilterInput.value = '';
          recentFilterInput.dispatchEvent(new Event('input'));
          recentFilterInput.focus();
        });
      }
    }

    // 绑定事件：收起与展开最近生成与更新
    const toggleRecentBtn = document.getElementById('toggleRecentBtn');
    const recentCollapsedBar = document.getElementById('recentCollapsedBar');
    const recentSearchWrap = document.getElementById('recentSearchWrap');
    const toggleRecentText = document.getElementById('toggleRecentText');
    const toggleRecentIcon = document.getElementById('toggleRecentIcon');

    const handleToggleRecent = () => {
      if (!recentGrid) return;
      const willCollapse = !recentGrid.classList.contains('is-collapsed');
      recentGrid.classList.toggle('is-collapsed', willCollapse);
      if (recentCollapsedBar) recentCollapsedBar.style.display = willCollapse ? 'flex' : 'none';
      if (recentSearchWrap) recentSearchWrap.style.display = willCollapse ? 'none' : 'flex';
      if (toggleRecentText) toggleRecentText.textContent = willCollapse ? '展开' : '收起';
      if (toggleRecentIcon) toggleRecentIcon.style.transform = willCollapse ? 'rotate(180deg)' : 'rotate(0deg)';
      try {
        localStorage.setItem('doc_lens_recent_collapsed_' + currentRepo.ID, willCollapse ? '1' : '0');
      } catch (e) {}
    };

    if (toggleRecentBtn) toggleRecentBtn.addEventListener('click', handleToggleRecent);
    if (recentCollapsedBar) recentCollapsedBar.addEventListener('click', handleToggleRecent);

    // 绑定事件：收起与展开章节分布
    const toggleChaptersBtn = document.getElementById('toggleChaptersBtn');
    const chaptersCollapsedBar = document.getElementById('chaptersCollapsedBar');
    const chaptersGrid = document.getElementById('welcomeChaptersGrid');
    const toggleText = document.getElementById('toggleChaptersText');
    const toggleIcon = document.getElementById('toggleChaptersIcon');

    const handleToggleChapters = () => {
      if (!chaptersGrid) return;
      const willCollapse = !chaptersGrid.classList.contains('is-collapsed');
      chaptersGrid.classList.toggle('is-collapsed', willCollapse);
      if (chaptersCollapsedBar) chaptersCollapsedBar.style.display = willCollapse ? 'flex' : 'none';
      if (toggleText) toggleText.textContent = willCollapse ? '展开章节' : '收起章节';
      if (toggleIcon) toggleIcon.style.transform = willCollapse ? 'rotate(180deg)' : 'rotate(0deg)';
      try {
        localStorage.setItem('doc_lens_chapters_collapsed_' + currentRepo.ID, willCollapse ? '1' : '0');
      } catch (e) {}
    };

    if (toggleChaptersBtn) toggleChaptersBtn.addEventListener('click', handleToggleChapters);
    if (chaptersCollapsedBar) chaptersCollapsedBar.addEventListener('click', handleToggleChapters);

    // 绑定事件：章节文章直达
    document.querySelectorAll('.chapter-doc-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const p = item.getAttribute('data-path');
        if (p) routeTo(p);
      });
    });

    // 绑定事件：定位章节
    document.querySelectorAll('.chapter-locate-btn, .chapter-more-hint').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chPath = btn.getAttribute('data-chapter-path');
        if (chPath) {
          expandPathToNode(chPath);
          if (window.innerWidth <= 900) openMobileSidebar();
        }
      });
    });

    // 绑定事件：切换知识库（在主页直接切换知识库空间，并平滑滚动到顶部，确保极致跟手）
    document.querySelectorAll('.welcome-switch-section .repo-tree-node').forEach(card => {
      card.addEventListener('click', async () => {
        const repoId = card.getAttribute('data-repoid');
        if (!repoId) return;

        // 若是当前仓库空间，平滑滚回顶部即可
        if (state.currentRepo && repoId === state.currentRepo.ID) {
          if (el.contentArea) el.contentArea.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const targetRepo = state.repos.find(r => r.ID === repoId);
        if (!targetRepo) return;

        // 微触感点击动画
        card.style.transform = 'scale(0.98)';
        setTimeout(() => { card.style.transform = ''; }, 120);

        // 切换仓库（不跳转到单篇历史文档，保持在主页视角）
        await selectRepo(repoId, false);
        state.currentDoc = null;
        state.currentPath = targetRepo.RoutePrefix || '/';
        try {
          window.history.pushState(null, '', targetRepo.RoutePrefix || '/');
        } catch (_) {}

        renderWelcomeDashboard();

        // 立即平滑滚动回顶部，上半部分全景、上次阅读、章节分布即时呈现！
        if (el.contentArea) {
          el.contentArea.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // 绑定事件：对外公开分享管理中心交互
    initHomeSharesSection();

    // 8. 构建并渲染主页专属本页导航（第一部分：最近阅读与动态，第二部分：章节导航，第三部分：快速切换知识库空间树）
    buildHomeToc(lastRead, recentDocs, chapters, currentRepo, state.repos);
  }

  function renderErrorDocument(path, errorMsg) {
    if (el.articleHeader) el.articleHeader.style.display = 'none';
    el.articleBody.innerHTML = `
      <div style="padding:48px 16px;text-align:center;background:var(--bg-surface);border:1px solid var(--border-default);border-radius:var(--radius-lg);margin-top:16px;">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" style="margin-bottom:12px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <h3 style="font-size:17px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">文档未找到或读取异常</h3>
        <p style="font-size:13px;color:var(--text-secondary);max-width:440px;margin:0 auto 14px;line-height:1.5;">${escapeHtml(errorMsg)}</p>
        <div style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-muted);background:var(--bg-subtle);display:inline-block;padding:5px 12px;border-radius:var(--radius-sm);word-break:break-all;">${escapeHtml(path)}</div>
      </div>
    `;
    el.tocList.innerHTML = '';
    el.mobileTocList.innerHTML = '';
  }

  let mdParser = null;
  function initMarkdownParser() {
    if (window.markdownit) {
      mdParser = window.markdownit({
        html: true,
        breaks: true,
        linkify: true,
        typographer: false
      });
    }
  }

  function initMermaid() {
    if (window.mermaid) {
      const isDark = state.theme === 'dark';
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        fontFamily: 'var(--font-sans)',
        suppressErrorRendering: true,
        flowchart: {
          curve: 'basis',
          htmlLabels: true,
          padding: 16,
          nodeSpacing: 45,
          rankSpacing: 45
        },
        themeVariables: isDark ? {
          darkMode: true,
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          background: 'transparent',
          primaryColor: '#1c1e24',
          primaryBorderColor: '#3b82f6',
          primaryTextColor: '#ededf0',
          lineColor: '#9ca3af',
          textColor: '#ededf0',
          mainBkg: '#18191e',
          nodeBorder: '#374151',
          nodeTextColor: '#ededf0',
          clusterBkg: '#121316',
          clusterBorder: '#27272a',
          defaultLinkColor: '#9ca3af',
          titleColor: '#ededf0',
          edgeLabelBackground: '#1a1c22',
          actorBorder: '#374151',
          actorBkg: '#18191e',
          actorTextColor: '#ededf0',
          actorLineColor: '#64748b',
          signalColor: '#cbd5e1',
          signalTextColor: '#ededf0',
          labelBoxBkgColor: '#18191e',
          labelBoxBorderColor: '#27272a',
          labelTextColor: '#ededf0',
          loopTextColor: '#ededf0',
          noteBorderColor: '#854d0e',
          noteBkgColor: '#2d2516',
          noteTextColor: '#fef08a'
        } : {
          darkMode: false,
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          background: 'transparent',
          primaryColor: '#f8fafc',
          primaryBorderColor: '#3b82f6',
          primaryTextColor: '#0f172a',
          lineColor: '#64748b',
          textColor: '#0f172a',
          mainBkg: '#f8fafc',
          nodeBorder: '#cbd5e1',
          nodeTextColor: '#0f172a',
          clusterBkg: '#f8fafc',
          clusterBorder: '#e2e8f0',
          defaultLinkColor: '#64748b',
          titleColor: '#0f172a',
          edgeLabelBackground: '#ffffff',
          actorBorder: '#cbd5e1',
          actorBkg: '#f8fafc',
          actorTextColor: '#0f172a',
          actorLineColor: '#94a3b8',
          signalColor: '#475569',
          signalTextColor: '#0f172a',
          labelBoxBkgColor: '#ffffff',
          labelBoxBorderColor: '#cbd5e1',
          labelTextColor: '#0f172a',
          loopTextColor: '#0f172a',
          noteBorderColor: '#fde68a',
          noteBkgColor: '#fefce8',
          noteTextColor: '#854d0e'
        }
      });
    }
  }

  let mermaidLoadingPromise = null;
  function ensureMermaidLoaded() {
    if (window.mermaid) return Promise.resolve(window.mermaid);
    if (mermaidLoadingPromise) return mermaidLoadingPromise;
    mermaidLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/js/mermaid.min.js';
      script.async = true;
      script.onload = () => {
        initMermaid();
        resolve(window.mermaid);
      };
      script.onerror = (err) => {
        mermaidLoadingPromise = null;
        reject(err);
      };
      document.head.appendChild(script);
    });
    return mermaidLoadingPromise;
  }

  // ==========================================================================
  // 思维导图 (Markmap) 离线引擎与全景弹窗控制器
  // ==========================================================================
  let currentMarkmapInstance = null;
  let markmapLoadingPromise = null;

  function ensureMarkmapLoaded() {
    if (window.markmap && window.markmap.Markmap && window.markmap.Transformer) {
      return Promise.resolve(window.markmap);
    }
    if (markmapLoadingPromise) return markmapLoadingPromise;
    markmapLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/js/markmap.min.js';
      script.async = true;
      script.onload = () => {
        resolve(window.markmap);
      };
      script.onerror = (err) => {
        markmapLoadingPromise = null;
        reject(err);
      };
      document.head.appendChild(script);
    });
    return markmapLoadingPromise;
  }

  function getMarkmapPalette() {
    return state.theme === 'dark'
      ? ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#38bdf8', '#4ade80']
      : ['#2563eb', '#059669', '#db2777', '#d97706', '#7c3aed', '#0284c7', '#16a34a'];
  }

  let currentMindmapRawTree = null;
  let currentMindmapExpandDepth = 2;
  let mindmapDrillStack = [];
  let currentHoveredNodeDatum = null;
  let pillHideTimeout = null;

  function extractNodeTitle(node) {
    if (!node) return '分支';
    const tmp = document.createElement('div');
    tmp.innerHTML = node.content || '';
    const text = (tmp.textContent || tmp.innerText || '').trim();
    return text || '分支节点';
  }

  function cloneMindmapTree(n) {
    if (!n) return null;
    return {
      content: n.content,
      payload: { ...(n.payload || {}) },
      children: (n.children || []).map(cloneMindmapTree)
    };
  }

  function setTreeFoldDepth(node, currentDepth, maxDepth) {
    if (!node) return;
    if (node.children && node.children.length > 0) {
      node.payload = node.payload || {};
      if (currentDepth >= maxDepth) {
        node.payload.fold = 1;
      } else {
        node.payload.fold = 0;
      }
      node.children.forEach(c => setTreeFoldDepth(c, currentDepth + 1, maxDepth));
    }
  }

  function hideFocusPill() {
    const pill = document.getElementById('mindmapFocusPill');
    if (pill) pill.style.display = 'none';
    currentHoveredNodeDatum = null;
  }

  function showFocusPillForNode(nodeGroup, datum) {
    const pill = document.getElementById('mindmapFocusPill');
    const body = document.getElementById('mindmapModalBody');
    if (!pill || !body || !nodeGroup || !datum) return;

    // 当前视野的第 1 级核心小圆点不显示操作气泡
    if (datum.state && datum.state.depth === 1) {
      hideFocusPill();
      return;
    }

    currentHoveredNodeDatum = datum;
    clearTimeout(pillHideTimeout);

    const hasChildren = datum.children && datum.children.length > 0;
    const focusBtn = document.getElementById('mindmapPillFocusBtn');
    if (focusBtn) {
      focusBtn.style.display = hasChildren ? 'inline-flex' : 'none';
    }

    // 获取文字标签的精确边界（foreignObject）
    const fo = nodeGroup.querySelector('foreignObject');
    const targetRect = fo ? fo.getBoundingClientRect() : nodeGroup.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();

    // 先设为 flex 方便测量准确宽高
    pill.style.display = 'flex';
    const pillWidth = pill.offsetWidth || 116;
    const pillHeight = pill.offsetHeight || 28;

    // 水平居中对齐于节点文字
    let x = (targetRect.left + targetRect.right) / 2 - bodyRect.left - (pillWidth / 2);
    // 垂直悬浮于节点正上方（间隔 6px）
    let y = targetRect.top - bodyRect.top - pillHeight - 6;

    // 顶部安全防护：若节点过于靠顶，则自动翻转至节点下方展示
    if (y < 6) {
      y = targetRect.bottom - bodyRect.top + 6;
    }
    // 左右边缘安全防护
    if (x < 10) x = 10;
    if (x + pillWidth > bodyRect.width - 10) {
      x = bodyRect.width - pillWidth - 10;
    }

    pill.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  // 从思维导图节点穿透跳转并高亮文章正文对应章节
  function jumpToHeadingInDoc(titleOrText) {
    if (!titleOrText || !el.articleBody) return false;
    const rawClean = titleOrText.trim().replace(/^[\s#*_\-`>]+|[\s#*_\-`>]+$/g, '');
    const cleanSearch = rawClean.toLowerCase();
    if (!cleanSearch) return false;

    // 1. 优先精准/模糊匹配正文标题 h1-h6
    const headings = Array.from(el.articleBody.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let target = headings.find(h => {
      const text = h.textContent.trim().toLowerCase();
      const strippedNumber = text.replace(/^[0-9一二三四五六七八九十\.\s、]+/, '').trim();
      return text === cleanSearch || strippedNumber === cleanSearch || text.includes(cleanSearch) || cleanSearch.includes(text);
    });

    // 2. 若未匹配到标题，尝试在列表项或段落中查找
    if (!target) {
      const items = Array.from(el.articleBody.querySelectorAll('li, p, dt, b, strong'));
      target = items.find(item => {
        const text = item.textContent.trim().toLowerCase();
        return text.includes(cleanSearch) || (cleanSearch.length > 4 && cleanSearch.includes(text));
      });
    }

    if (target) {
      const mindmapModal = document.getElementById('mindmapModal');
      if (mindmapModal) closeModal(mindmapModal);

      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('mindmap-jump-highlight');
        setTimeout(() => {
          target.classList.remove('mindmap-jump-highlight');
        }, 2100);
      }, 150);
      return true;
    }
    return false;
  }

  function updateMindmapBreadcrumbs() {
    const track = document.getElementById('mindmapBreadcrumbsTrack');
    const backBtn = document.getElementById('mindmapBackBtn');
    if (!track) return;

    if (backBtn) {
      backBtn.style.display = mindmapDrillStack.length > 1 ? 'inline-flex' : 'none';
    }

    let html = '';
    mindmapDrillStack.forEach((item, index) => {
      const isLast = index === mindmapDrillStack.length - 1;
      const isRoot = index === 0;
      const label = isRoot ? '🏠 全文' : escapeHtml(item.title);

      if (index > 0) {
        html += `<span class="crumb-separator">/</span>`;
      }

      if (isLast) {
        html += `<span class="crumb-item active" title="${isRoot ? '文档全文大纲' : '当前聚焦分支'}">${label}${index > 0 ? ' <span class="crumb-tag">聚焦中</span>' : ''}</span>`;
      } else {
        html += `<button type="button" class="crumb-item crumb-link" data-crumb-index="${index}" title="返回至【${label}】">${label}</button>`;
      }
    });

    track.innerHTML = html;

    track.querySelectorAll('.crumb-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(btn.getAttribute('data-crumb-index'));
        if (!isNaN(idx) && idx >= 0 && idx < mindmapDrillStack.length - 1) {
          mindmapDrillStack = mindmapDrillStack.slice(0, idx + 1);
          renderCurrentMindmapView();
        }
      });
    });
  }

  async function renderCurrentMindmapView() {
    if (!currentMarkmapInstance || mindmapDrillStack.length === 0) return;
    hideFocusPill();

    const currentLevel = mindmapDrillStack[mindmapDrillStack.length - 1];
    const treeToRender = cloneMindmapTree(currentLevel.rawNode);

    // 第一级主干根节点：清空文字只保留一个核心支点小圆点（无论是全文视图还是下钻聚焦后，当前视野第一级均仅作为支点小圆点，避免重复文字霸占宽度）
    if (treeToRender.children && treeToRender.children.length > 0) {
      treeToRender.content = '';
    }

    if (treeToRender.payload) {
      treeToRender.payload.fold = 0;
    }
    setTreeFoldDepth(treeToRender, 0, currentMindmapExpandDepth);

    await currentMarkmapInstance.setData(treeToRender);
    updateMindmapBreadcrumbs();

    setTimeout(() => {
      if (currentMarkmapInstance) {
        currentMarkmapInstance.fit();
      }
    }, 80);
  }

  function drillIntoNode(nodeDatum) {
    if (!nodeDatum || !nodeDatum.children || nodeDatum.children.length === 0) return;
    const title = extractNodeTitle(nodeDatum);
    const cleanTree = cloneMindmapTree(nodeDatum);

    mindmapDrillStack.push({
      title: title,
      rawNode: cleanTree
    });

    renderCurrentMindmapView();
  }

  async function applyMindmapDepth(depth) {
    if (!currentMarkmapInstance || mindmapDrillStack.length === 0) return;
    currentMindmapExpandDepth = depth;

    document.querySelectorAll('.depth-btn').forEach(btn => {
      const bDepth = parseInt(btn.getAttribute('data-depth'));
      btn.classList.toggle('active', bDepth === depth);
    });

    renderCurrentMindmapView();
  }

  function updateMindmapTheme() {
    const mindmapModal = document.getElementById('mindmapModal');
    if (!mindmapModal) return;
    const isDark = state.theme === 'dark';
    mindmapModal.classList.toggle('markmap-dark', isDark);

    if (currentMarkmapInstance && mindmapModal.classList.contains('open')) {
      const colors = getMarkmapPalette();
      currentMarkmapInstance.setOptions({
        color: (node) => colors[(node.state?.depth || 0) % colors.length]
      });
      currentMarkmapInstance.renderData();
    }
  }

  // =========================================================================
  // 章节与大结构增量透视模块 (纯机械规则比对，无AI噪音)
  // =========================================================================
  async function openIncrementalDiffModal(doc) {
    if (!doc) return;
    const modal = document.getElementById('incrementalDiffModal');
    if (!modal) return;

    const commitSelect = document.getElementById('diffCommitSelect');
    const commitMeta = document.getElementById('diffCommitMeta');
    const summaryBanner = document.getElementById('diffSummaryBanner');
    const sectionsList = document.getElementById('diffSectionsList');

    openModal(modal);

    summaryBanner.innerHTML = '<div style="color:var(--text-muted);"><span class="live-dot" style="margin-right:6px;"></span>正在读取版本记录...</div>';
    sectionsList.innerHTML = '<div class="diff-empty-state">正在比对章节增量...</div>';
    commitSelect.innerHTML = '<option value="">正在读取提交历史...</option>';
    if (commitMeta) commitMeta.textContent = '';

    const repoID = doc.repo_id || (state.currentRepo ? state.currentRepo.ID : '');
    const docPath = doc.rel_path || doc.path;

    try {
      const res = await fetch(`/api/doc/history?repo=${encodeURIComponent(repoID)}&path=${encodeURIComponent(docPath)}`);
      if (!res.ok) throw new Error('读取版本记录失败');
      const commits = await res.json();

      if (!commits || commits.length === 0) {
        summaryBanner.innerHTML = '<div>该文档暂无 Git 提交历史记录（可能是新建未纳入版本控制的文件）</div>';
        sectionsList.innerHTML = '<div class="diff-empty-state">暂无可比对的历史 Commit</div>';
        commitSelect.innerHTML = '<option value="">暂无历史版本</option>';
        return;
      }

      commitSelect.innerHTML = '';
      commits.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.hash;
        const tag = c.hash === 'WORKING_TREE' ? '⚡ ' : '';
        opt.textContent = `${tag}${c.short_hash} - ${c.message} (${c.date})`;
        commitSelect.appendChild(opt);
      });

      // 绑定版本切换事件
      commitSelect.onchange = () => {
        const selectedHash = commitSelect.value;
        const selectedCommit = commits.find(c => c.hash === selectedHash);
        if (selectedCommit && commitMeta) {
          commitMeta.textContent = selectedCommit.date ? `时间: ${selectedCommit.date}` : '';
        }
        loadIncrementalDiff(doc, repoID, selectedHash);
      };

      if (commitMeta && commits[0]) {
        commitMeta.textContent = commits[0].date ? `时间: ${commits[0].date}` : '';
      }

      // 默认加载最新版本的增量
      loadIncrementalDiff(doc, repoID, commits[0].hash);
    } catch (e) {
      summaryBanner.innerHTML = `<div style="color:#ef4444;">获取版本信息失败: ${escapeHtml(e.message)}</div>`;
      sectionsList.innerHTML = '';
    }
  }

  async function loadIncrementalDiff(doc, repoID, commitHash) {
    const summaryBanner = document.getElementById('diffSummaryBanner');
    const sectionsList = document.getElementById('diffSectionsList');
    if (!summaryBanner || !sectionsList) return;

    summaryBanner.innerHTML = '<div style="color:var(--text-muted);"><span class="live-dot" style="margin-right:6px;"></span>正在提取增量结构...</div>';
    sectionsList.innerHTML = '<div class="diff-empty-state">正在提取章节、流程图与数据表格...</div>';

    const docPath = doc.rel_path || doc.path;

    try {
      const res = await fetch(`/api/doc/diff?repo=${encodeURIComponent(repoID)}&path=${encodeURIComponent(docPath)}&commit=${encodeURIComponent(commitHash)}`);
      if (!res.ok) throw new Error('提取增量失败');
      const data = await res.json();

      // 1. 渲染总结 Banner (客观事实与数据，无AI套话)
      summaryBanner.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span>📊</span>
          <span>${escapeHtml(data.summary || '比对完成')}</span>
        </div>
        <div style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted);white-space:nowrap;">
          <span style="color:#10b981;font-weight:600;">+${data.stats ? data.stats.added_lines : 0}</span> / 
          <span style="color:#ef4444;font-weight:600;">-${data.stats ? data.stats.removed_lines : 0}</span> 行
        </div>
      `;

      // 2. 渲染增量大块列表
      if (!data.sections || data.sections.length === 0) {
        sectionsList.innerHTML = `
          <div class="diff-empty-state">
            <div style="font-size:16px;margin-bottom:6px;">👌 未检测到大章节或结构新增</div>
            <div style="color:var(--text-muted);font-size:12.5px;">本次变更未新增核心标题（#、##）、Mermaid流程图或表格；可能仅包含微观语句润色或标点微调，已自动过滤降噪。</div>
          </div>
        `;
        return;
      }

      sectionsList.innerHTML = '';
      data.sections.forEach(s => {
        const card = document.createElement('div');
        card.className = 'diff-section-card';

        let badgeHtml = '';
        switch (s.type) {
          case 'add_heading':
            badgeHtml = `<span class="diff-type-badge badge-add-heading">📌 新增章节 (H${s.level || 2})</span>`;
            break;
          case 'del_heading':
            badgeHtml = `<span class="diff-type-badge badge-del-heading">🗑️ 移除章节 (H${s.level || 2})</span>`;
            break;
          case 'add_diagram':
            badgeHtml = `<span class="diff-type-badge badge-add-diagram">📊 新增推演流程图</span>`;
            break;
          case 'add_table':
            badgeHtml = `<span class="diff-type-badge badge-add-table">📋 新增客观账本对比表</span>`;
            break;
          case 'add_block':
            badgeHtml = `<span class="diff-type-badge badge-add-block">📝 新增分析推演大段</span>`;
            break;
          default:
            badgeHtml = `<span class="diff-type-badge badge-add-block">结构增量</span>`;
        }

        const canJump = s.type !== 'del_heading';

        card.innerHTML = `
          <div class="diff-section-header">
            ${badgeHtml}
            ${canJump ? `<button type="button" class="diff-jump-btn" title="点击定位正文对应位置">定位正文 ➔</button>` : '<span style="font-size:11px;color:var(--text-muted);">已移除章节</span>'}
          </div>
          <div class="diff-section-title">${escapeHtml(s.title)}</div>
          ${s.snippet ? `<div class="diff-section-snippet">${escapeHtml(s.snippet)}</div>` : ''}
        `;

        if (canJump) {
          card.style.cursor = 'pointer';
          card.addEventListener('click', () => {
            closeModal(document.getElementById('incrementalDiffModal'));
            scrollToSectionInDoc(s);
          });
        } else {
          card.style.cursor = 'default';
          card.style.opacity = '0.75';
        }

        sectionsList.appendChild(card);
      });
    } catch (e) {
      summaryBanner.innerHTML = `<div style="color:#ef4444;">计算增量失败: ${escapeHtml(e.message)}</div>`;
      sectionsList.innerHTML = '';
    }
  }

  function findHeadingElement(headingText) {
    if (!el.articleBody || !headingText) return null;
    const headings = el.articleBody.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const target = headingText.trim().toLowerCase();
    for (const h of headings) {
      const text = h.textContent.trim().toLowerCase();
      if (text === target || text.includes(target) || target.includes(text)) {
        return h;
      }
    }
    return null;
  }

  function findNextElementAfterHeading(headingText, selector) {
    const heading = findHeadingElement(headingText);
    if (!heading) return null;
    let cur = heading.nextElementSibling;
    while (cur) {
      if (/^H[1-6]$/i.test(cur.tagName)) break;
      if (cur.matches && cur.matches(selector)) return cur;
      if (cur.querySelector) {
        const inside = cur.querySelector(selector);
        if (inside) return inside;
      }
      cur = cur.nextElementSibling;
    }
    return null;
  }

  function scrollToSectionInDoc(section) {
    if (!el.articleBody || !section) return;

    let matched = null;

    if (section.type === 'add_heading') {
      matched = findHeadingElement(section.title);
    } else if (section.type === 'add_block') {
      // 1. 优先通过文本探针（取前 20~28 字特征字符串）精准匹配段落/列表/引用块
      const cleanSnippet = (section.snippet || '')
        .replace(/[#*`_~>\-|[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const probe = cleanSnippet.slice(0, Math.min(26, cleanSnippet.length)).trim().toLowerCase();

      if (probe.length >= 4) {
        const candidates = el.articleBody.querySelectorAll('p, li, blockquote, pre, div.markdown-body > *');
        for (const elem of candidates) {
          const text = elem.textContent.trim().toLowerCase();
          if (text.includes(probe)) {
            matched = elem;
            break;
          }
        }
      }

      // 2. 若文本探针未能直接匹配，则降级定位至其所属的大章节标题或章节正文首段
      if (!matched && section.context_heading) {
        matched = findNextElementAfterHeading(section.context_heading, 'p, li, blockquote') || findHeadingElement(section.context_heading);
      }
    } else if (section.type === 'add_diagram') {
      // 优先匹配所属章节后的图表
      if (section.context_heading) {
        matched = findNextElementAfterHeading(section.context_heading, '.mermaid, .mermaid-wrapper, pre.mermaid');
      }
      if (!matched) {
        const diagrams = el.articleBody.querySelectorAll('.mermaid, .mermaid-wrapper, pre.mermaid');
        if (diagrams.length > 0) matched = diagrams[0];
      }
    } else if (section.type === 'add_table') {
      // 优先匹配所属章节后的数据对比表格
      if (section.context_heading) {
        matched = findNextElementAfterHeading(section.context_heading, 'table');
      }
      if (!matched && section.snippet) {
        const probe = section.snippet.replace(/[|\s-]/g, '').slice(0, 15).toLowerCase();
        const tables = el.articleBody.querySelectorAll('table');
        for (const tbl of tables) {
          if (tbl.textContent.replace(/[|\s-]/g, '').toLowerCase().includes(probe)) {
            matched = tbl;
            break;
          }
        }
      }
      if (!matched) {
        const tables = el.articleBody.querySelectorAll('table');
        if (tables.length > 0) matched = tables[0];
      }
    }

    if (matched) {
      matched.scrollIntoView({ behavior: 'smooth', block: 'center' });
      matched.classList.add('diff-target-highlight');
      setTimeout(() => matched.classList.remove('diff-target-highlight'), 2600);
    }
  }

  async function openDocMindmap(doc) {
    if (!doc || !doc.content) return;
    const modal = document.getElementById('mindmapModal');
    if (!modal) return;

    const loadingEl = document.getElementById('mindmapLoading');
    const svgEl = document.getElementById('mindmapSvg');
    const emptyEl = document.getElementById('mindmapEmptyState');
    const depthControls = document.querySelector('.mindmap-depth-controls');
    const fitBtn = document.getElementById('mindmapFitBtn');
    const breadcrumbsTrack = document.getElementById('mindmapBreadcrumbsTrack');

    if (emptyEl) emptyEl.style.display = 'none';
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div class="mindmap-spinner"></div>
        <span>正在解析生成思维导图...</span>
      `;
      loadingEl.style.display = 'flex';
    }
    if (svgEl) svgEl.style.opacity = '0';

    openModal(modal);

    try {
      await ensureMarkmapLoaded();

      const transformer = new window.markmap.Transformer();
      const { root } = transformer.transform(doc.content);

      // 纯段落无大纲或内容空文档防呆空态检测
      const hasContent = root && (
        (root.content && root.content.trim().length > 0) ||
        (root.children && root.children.length > 0)
      );

      if (!hasContent || (!root.content.trim() && (!root.children || root.children.length === 0))) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (svgEl) svgEl.style.display = 'none';
        if (depthControls) depthControls.style.display = 'none';
        if (fitBtn) fitBtn.style.display = 'none';
        if (breadcrumbsTrack) breadcrumbsTrack.innerHTML = '<span class="crumb-item active">暂无大纲</span>';
        if (emptyEl) emptyEl.style.display = 'flex';
        return;
      }

      if (emptyEl) emptyEl.style.display = 'none';
      if (depthControls) depthControls.style.display = 'flex';
      if (fitBtn) fitBtn.style.display = 'inline-flex';
      if (loadingEl) loadingEl.style.display = 'none';
      if (svgEl) {
        svgEl.style.display = 'block';
        svgEl.style.opacity = '1';
      }

      if (currentMarkmapInstance) {
        try {
          currentMarkmapInstance.destroy();
        } catch (_) {}
        currentMarkmapInstance = null;
      }

      svgEl.innerHTML = '';

      const isDark = state.theme === 'dark';
      modal.classList.toggle('markmap-dark', isDark);

      // 初始化下钻导航栈（第 0 层为整篇文档全文）
      const docHeadingTitle = doc.title || cleanDocTitle(doc.name) || '全文';
      mindmapDrillStack = [{
        title: docHeadingTitle,
        rawNode: cloneMindmapTree(root)
      }];
      currentMindmapRawTree = root;
      currentMindmapExpandDepth = 2; // 默认展开到第 2 层（核心章节），避免全部展开看不清

      document.querySelectorAll('.depth-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.getAttribute('data-depth')) === 2);
      });

      const initialTree = cloneMindmapTree(root);
      // 第一层主干根节点清空文字，只保留一个圆圈支点
      if (initialTree.children && initialTree.children.length > 0) {
        initialTree.content = '';
      }
      setTreeFoldDepth(initialTree, 0, 2);

      const colors = getMarkmapPalette();
      const mm = window.markmap.Markmap.create(svgEl, {
        duration: 300,
        color: (node) => colors[(node.state?.depth || 0) % colors.length],
        paddingX: 22,
        spacingVertical: 14,
        spacingHorizontal: 80,
        fitRatio: 0.92,
        maxInitialScale: 1.5,
        initialExpandLevel: 2
      }, initialTree);

      currentMarkmapInstance = mm;
      updateMindmapBreadcrumbs();

      // 安全保护：确保脑图内部所有的外链在新标签页打开，防止页面跳转丢失工作区
      svgEl.querySelectorAll('a').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });

      // 鼠标悬停在分支节点上时，弹出操作气泡按钮（聚焦下钻 / 定位正文）
      svgEl.onmouseover = (e) => {
        const nodeGroup = e.target.closest('g.markmap-node');
        if (nodeGroup && nodeGroup.__data__) {
          const datum = nodeGroup.__data__;
          if (datum && datum.state && datum.state.depth === 1) {
            hideFocusPill();
            return;
          }
          showFocusPillForNode(nodeGroup, datum);
        }
      };

      svgEl.onmouseout = (e) => {
        const toElement = e.relatedTarget;
        if (!toElement || (!toElement.closest('g.markmap-node') && !toElement.closest('#mindmapFocusPill'))) {
          pillHideTimeout = setTimeout(hideFocusPill, 250);
        }
      };

      // 单击：平滑居中聚焦节点并显示操作气泡（点击圆点则折叠/展开）
      svgEl.onclick = (e) => {
        const nodeGroup = e.target.closest('g.markmap-node');
        if (!nodeGroup) {
          hideFocusPill();
          return;
        }
        const datum = nodeGroup.__data__;
        if (!datum) return;

        if (!e.target.closest('circle')) {
          if (!(datum.state && datum.state.depth === 1)) {
            showFocusPillForNode(nodeGroup, datum);
          }
          mm.centerNode(datum);
        }
      };

      // 双击：下钻深入此分支聚焦（根节点自身不触发下钻）
      svgEl.ondblclick = (e) => {
        const nodeGroup = e.target.closest('g.markmap-node');
        if (nodeGroup && nodeGroup.__data__) {
          const datum = nodeGroup.__data__;
          if (datum && datum.state && datum.state.depth === 1) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          if (datum && datum.children && datum.children.length > 0) {
            drillIntoNode(datum);
          }
        }
      };

      // 视口平移/缩放时隐藏气泡，防止浮动错位
      svgEl.onwheel = () => hideFocusPill();
      svgEl.onmousedown = (e) => {
        if (!e.target.closest('#mindmapFocusPill')) {
          hideFocusPill();
        }
      };

      // 挂载辅助工具栏（放大、缩小、居中适配），彻底移除任何商标或外链
      const mount = document.getElementById('mindmapToolbarMount');
      if (mount && window.markmap.Toolbar) {
        mount.innerHTML = '';
        const toolbar = new window.markmap.Toolbar();
        toolbar.setBrand(false); // 彻底隐藏商标
        toolbar.setItems(['zoomIn', 'zoomOut', 'fit']);
        toolbar.attach(mm);
        const toolbarNode = toolbar.render();
        toolbarNode.querySelectorAll('.mm-toolbar-brand').forEach(b => b.remove());
        mount.appendChild(toolbarNode);
      }

      // 首次布局完成后自适应视口
      setTimeout(() => {
        if (currentMarkmapInstance) {
          currentMarkmapInstance.fit();
        }
      }, 120);

    } catch (err) {
      console.error('Failed to render mindmap:', err);
      if (loadingEl) {
        loadingEl.style.display = 'flex';
        loadingEl.innerHTML = `
          <div style="color:#ef4444;font-size:13px;display:flex;align-items:center;gap:6px;">
            <span>思维导图解析失败，请检查文档内容格式</span>
          </div>
        `;
      }
    }
  }

  /**
   * fixBrokenEmphasis — CommonMark 定界符侧翼判定容错层
   *
   * 修正 AI 生成内容中常见的 emphasis 标记错误，使 markdown-it 能正确识别：
   *   "* text*"  → "*text*"     (开启星号后的空格)
   *   "*text *"  → "*text*"     (闭合星号前的空格)
   *   "** text**" → "**text**"  (strong 版本同理)
   *
   * 安全排除：
   *   - 行首 `* ` / `- ` / `1. ` 等列表项不动
   *   - `---` / `***` / `___` 水平线不动
   *   - ``` ` ``` 和 ``` `` ``` 行内代码内部不动
   *   - ``` ``` ``` 围栏代码块整段跳过
   */
  function fixBrokenEmphasis(text) {
    const lines = text.split('\n');
    const result = [];
    let inFencedBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trimStart();

      // 围栏代码块开关 (``` or ~~~)
      if (/^(`{3,}|~{3,})/.test(trimmed)) {
        inFencedBlock = !inFencedBlock;
        result.push(line);
        continue;
      }
      if (inFencedBlock) {
        result.push(line);
        continue;
      }

      // 水平线不动
      if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(trimmed)) {
        result.push(line);
        continue;
      }

      // 严格保护行首列表项标记（如 "* ", "  * ", "- ", "1. "），彻底隔离列表结构符号，避免被正则误伤
      const listMatch = line.match(/^([ \t]*[*+-] +|[ \t]*\d+\. +)/);
      const prefix = listMatch ? listMatch[0] : '';
      const body = listMatch ? line.slice(prefix.length) : line;

      // 对非代码块行，跳过行内代码段后修复 emphasis 内部首尾空格
      // 策略：按行内代码分割，采用成对定界符匹配，仅修剪内部空格，绝不吞噬定界符外部空格
      const segments = body.split(/(`{1,2}[^`]+`{1,2})/);
      const fixed = segments.map((seg, idx) => {
        // 奇数索引是行内代码匹配，不动
        if (idx % 2 === 1) return seg;

        let s = seg;

        // 1. 粗斜体: *** content *** → ***content***
        s = s.replace(/(?<!\*)\*{3}([ \t]*)([\s\S]+?)([ \t]*)\*{3}(?!\*)/g, (match, p1, p2, p3) => {
          const t = p2.trim();
          if (!t || /^\*+$/.test(t)) return match;
          if (!p1 && !p3) return match;
          return `***${t}***`;
        });

        // 2. 粗体: ** content ** → **content** (修复开启/闭合多余空格，成对处理避免吞噬外部正常空格)
        s = s.replace(/(?<!\*)\*{2}([ \t]*)([\s\S]+?)([ \t]*)\*{2}(?!\*)/g, (match, p1, p2, p3) => {
          const t = p2.trim();
          if (!t || /^\*+$/.test(t)) return match;
          if (!p1 && !p3) return match;
          return `**${t}**`;
        });

        // 3. 斜体: * content * → *content* (仅处理成对且无比较/数学符号的安全斜体)
        s = s.replace(/(?<!\*)\*([ \t]*)([^\n*+=<>]+?)([ \t]*)\*(?!\*)/g, (match, p1, p2, p3) => {
          if (!p1 && !p3) return match;
          const t = p2.trim();
          if (!t) return match;
          return `*${t}*`;
        });

        return s;
      }).join('');

      result.push(prefix + fixed);
    }

    return result.join('\n');
  }

  function renderMarkdownDoc(rawMarkdown) {
    mermaidStore.clear();

    const { frontmatter, rawYaml, body } = parseYamlFrontmatter(rawMarkdown);
    const propertiesHtml = buildPropertiesCardHtml(frontmatter, rawYaml);

    const preprocessed = fixBrokenEmphasis(preprocessGithubAlertsFast(body));
    let html = mdParser ? mdParser.render(preprocessed) : '<pre>' + escapeHtml(body) + '</pre>';

    let mermaidCounter = 0;
    html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
      mermaidCounter++;
      const uniqueKey = `mermaid-${Date.now()}-${mermaidCounter}`;
      const cleanCode = unescapeHtml(code.trim());
      mermaidStore.set(uniqueKey, cleanCode);

      return `
        <div class="mermaid-wrapper" data-chart-key="${uniqueKey}">
          <div style="color:var(--text-muted);font-size:12.5px;display:flex;align-items:center;gap:6px;padding:20px 0;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <span>架构图解析中...</span>
          </div>
        </div>
      `;
    });

    el.articleBody.innerHTML = `<div class="markdown-body">${propertiesHtml}${html}</div>`;

    bindPropertiesCardEvents();
    resolveMarkdownImages();
    interceptMarkdownLinks();
    enhanceCodeBlocksAsync();
    setupLazyMermaidObserver();

    requestAnimationFrame(() => {
      generateTOC();
    });
  }

  // 路径规范化函数：解析 . 与 ..，消除双斜杠，返回标准绝对路径
  function normalizePath(pathStr) {
    if (!pathStr) return '/';
    const isAbs = pathStr.startsWith('/');
    const parts = pathStr.split('/');
    const stack = [];
    for (const p of parts) {
      if (!p || p === '.') continue;
      if (p === '..') {
        if (stack.length > 0) stack.pop();
      } else {
        stack.push(p);
      }
    }
    const res = stack.join('/');
    return isAbs ? '/' + res : (res || '.');
  }

  // 智能路径重叠拼接：如果 dirRoute 后缀与 relPath 前缀重叠，自动消除重复段
  // 例如 dirRoute = "/product/01-价值篇", relPath = "01-价值篇/README.md" -> "/product/01-价值篇/README.md"
  function mergeOverlappingPaths(dirRoute, relPath) {
    const cleanDir = (dirRoute || '').replace(/^\/+|\/+$/g, '');
    const cleanRel = (relPath || '').replace(/^\/+|\/+$/g, '');
    if (!cleanDir) return '/' + cleanRel;
    if (!cleanRel) return '/' + cleanDir;

    const dirParts = cleanDir.split('/').filter(Boolean);
    const relParts = cleanRel.split('/').filter(Boolean);

    // 从最大可能重叠长度开始向下贪婪匹配
    const maxOverlap = Math.min(dirParts.length, relParts.length);
    for (let k = maxOverlap; k > 0; k--) {
      let isOverlap = true;
      for (let i = 0; i < k; i++) {
        if (dirParts[dirParts.length - k + i] !== relParts[i]) {
          isOverlap = false;
          break;
        }
      }
      if (isOverlap) {
        return '/' + dirParts.concat(relParts.slice(k)).join('/');
      }
    }

    return '/' + dirParts.concat(relParts).join('/');
  }

  // 资源与图片 URL 智能解析器：相对当前文档目录 -> /raw 静态服务地址（自动消除重复目录段）
  function resolveAssetUrl(url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
    if (trimmed.startsWith('/raw/')) {
      return trimmed;
    }

    // 若处于单篇只读分享模式，所有相对静态资源经由免密沙箱 /api/share/raw 加载
    if (state.isShareMode && state.shareId) {
      const relFile = trimmed.replace(/^\.\//, '');
      const passParam = state.sharePasscode ? '&passcode=' + encodeURIComponent(state.sharePasscode) : '';
      return `/api/share/raw?id=${encodeURIComponent(state.shareId)}&file=${encodeURIComponent(relFile)}${passParam}`;
    }

    const repoPrefix = '/' + (state.currentRepo?.RoutePrefix || '').replace(/^\/+|\/+$/g, '');
    let fullRoute;

    if (trimmed.startsWith('/')) {
      // 绝对路径：如果已经带了当前仓库前缀，则直接保留；否则拼接当前仓库前缀
      if (repoPrefix && (trimmed === repoPrefix || trimmed.startsWith(repoPrefix + '/'))) {
        fullRoute = normalizePath(trimmed);
      } else {
        fullRoute = normalizePath(`${repoPrefix}/${trimmed.replace(/^\/+/, '')}`);
      }
    } else {
      // 相对路径：基于当前文档所在目录进行相对计算并消除目录重叠
      let curPath = state.currentDoc?.path || state.currentPath || '';
      let currentDir;
      if (/\.[a-zA-Z0-9]+$/.test(curPath)) {
        currentDir = curPath.substring(0, curPath.lastIndexOf('/'));
      } else {
        currentDir = curPath.replace(/\/+$/, '');
      }
      if (!currentDir) currentDir = repoPrefix || '';

      const stripped = trimmed.replace(/^\.\//, '');
      fullRoute = normalizePath(mergeOverlappingPaths(currentDir, stripped));
    }

    return '/raw' + fullRoute;
  }

  // 智能图片链接处理：自动将相对图片路径改写为 /raw 地址，支持懒加载与点击放大
  function resolveMarkdownImages() {
    el.articleBody.querySelectorAll('.markdown-body img').forEach(img => {
      const src = img.getAttribute('src');
      if (!src) return;
      const resolved = resolveAssetUrl(src);
      if (resolved && resolved !== src) {
        img.setAttribute('src', resolved);
      }
      img.setAttribute('loading', 'lazy');
      const alt = img.getAttribute('alt');
      img.setAttribute('title', alt ? `${alt} (点击在新标签页查看原始大图)` : '点击在新标签页查看原始大图');

      img.addEventListener('click', () => {
        window.open(img.src, '_blank');
      });

      img.addEventListener('error', () => {
        img.style.display = 'none';
        const hint = document.createElement('div');
        hint.className = 'img-broken-hint';
        hint.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>图片未找到: ${escapeHtml(src)}</span>`;
        if (img.parentNode) {
          img.parentNode.insertBefore(hint, img);
        }
      }, { once: true });
    });
  }

  // 智能文档路径与扩展名补齐（支持省略 .md，或者直接链接目录名跳至其 README/index）
  function resolveDocExtension(targetRoute) {
    if (!targetRoute) return targetRoute;
    let tree = state.treeData;
    if (!tree && state.currentRepo && state.repoTreeCache) {
      tree = state.repoTreeCache.get(state.currentRepo.ID);
    }
    const docs = getFlattenedDocList(tree, state.currentRepo?.RoutePrefix);

    // 1. 如果已完全匹配树中某篇文档，直接返回
    if (docs.some(d => d.fullRoute === targetRoute)) {
      return targetRoute;
    }

    // 2. 尝试添加 .md 后缀匹配
    if (docs.some(d => d.fullRoute === targetRoute + '.md')) {
      return targetRoute + '.md';
    }

    // 3. 尝试作为目录查找其下的 README.md 或 index.md
    if (docs.some(d => d.fullRoute === targetRoute + '/README.md')) {
      return targetRoute + '/README.md';
    }
    if (docs.some(d => d.fullRoute === targetRoute + '/index.md')) {
      return targetRoute + '/index.md';
    }

    // 4. 若无后缀且尚未匹配，且不属于已有扩展名，默认补齐 .md
    if (!/\.[a-zA-Z0-9]+$/.test(targetRoute)) {
      return targetRoute + '.md';
    }

    return targetRoute;
  }

  // Markdown 文档内链全息智能路由解析器：
  // 自动兼容：相对当前文档目录、相对知识库根目录、省略 .md、链接目录名自动找 README/index、消除重复路径层级
  function smartResolveMarkdownRoute(rawPath) {
    if (!rawPath) return '';
    const cleanRaw = rawPath.trim();
    if (!cleanRaw) return '';

    const repoPrefix = '/' + (state.currentRepo?.RoutePrefix || '').replace(/^\/+|\/+$/g, '');

    // 1. 获取当前文档实际所在目录路由
    const curPath = state.currentDoc?.path || state.currentPath || '';
    let currentDir;
    if (/\.[a-zA-Z0-9]+$/.test(curPath)) {
      currentDir = curPath.substring(0, curPath.lastIndexOf('/'));
    } else {
      currentDir = curPath.replace(/\/+$/, '');
    }
    if (!currentDir) currentDir = repoPrefix || '';

    // 2. 提取当前知识库全部文档线性列表（用于真值校验）
    let tree = state.treeData;
    if (!tree && state.currentRepo && state.repoTreeCache) {
      tree = state.repoTreeCache.get(state.currentRepo.ID);
    }
    const docs = getFlattenedDocList(tree, state.currentRepo?.RoutePrefix);

    const findInDocs = (r) => {
      if (!r || docs.length === 0) return null;
      const cleanR = normalizePath(r);
      // 精确匹配
      let hit = docs.find(d => d.fullRoute === cleanR);
      if (hit) return hit.fullRoute;
      // 补齐 .md
      hit = docs.find(d => d.fullRoute === cleanR + '.md');
      if (hit) return hit.fullRoute;
      // 目录 README.md / index.md
      hit = docs.find(d => d.fullRoute === cleanR + '/README.md');
      if (hit) return hit.fullRoute;
      hit = docs.find(d => d.fullRoute === cleanR + '/index.md');
      if (hit) return hit.fullRoute;
      return null;
    };

    // 3. 绝对路径情况：/xxx
    if (cleanRaw.startsWith('/')) {
      let cand;
      if (repoPrefix && (cleanRaw === repoPrefix || cleanRaw.startsWith(repoPrefix + '/'))) {
        cand = normalizePath(cleanRaw);
      } else {
        cand = normalizePath(`${repoPrefix}/${cleanRaw.replace(/^\/+/, '')}`);
      }
      const match = findInDocs(cand);
      if (match) return match;
      return resolveDocExtension(cand);
    }

    // 4. 相对路径情况：生成各维度候选
    const strippedRaw = cleanRaw.replace(/^\.\//, '');

    // 候选 A：重叠智能合并（解决当前目录包含相同前缀时被重复叠加的问题）
    const candOverlap = normalizePath(mergeOverlappingPaths(currentDir, strippedRaw));
    // 候选 B：纯相对当前文档目录
    const candRelative = normalizePath(`${currentDir}/${cleanRaw}`);
    // 候选 C：相对知识库根目录（解决直接写 01-价值篇... 的全库根相对习惯）
    const candRepoRoot = normalizePath(`${repoPrefix}/${strippedRaw}`);

    // 按优先级匹配树中真实存在的文档
    const matchOverlap = findInDocs(candOverlap);
    if (matchOverlap) return matchOverlap;

    const matchRel = findInDocs(candRelative);
    if (matchRel) return matchRel;

    const matchRoot = findInDocs(candRepoRoot);
    if (matchRoot) return matchRoot;

    // 5. 若文档树中未命中（如首次加载树尚未就绪或未来待建文档）：
    // 消除相邻重复路径层级（如 /a/b/b/c -> /a/b/c）
    let fallback = candOverlap;
    const parts = fallback.split('/').filter(Boolean);
    const dedupParts = [];
    for (const p of parts) {
      if (dedupParts.length === 0 || dedupParts[dedupParts.length - 1] !== p) {
        dedupParts.push(p);
      }
    }
    fallback = '/' + dedupParts.join('/');

    return resolveDocExtension(fallback);
  }

  // 平滑滚动至页面标题锚点
  function scrollToAnchor(hash) {
    if (!hash) return;
    const cleanHash = decodeURIComponent(hash.replace(/^#/, ''));
    if (!cleanHash) return;

    let target = document.getElementById(cleanHash);
    if (!target && el.articleBody) {
      const headings = Array.from(el.articleBody.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      target = headings.find(h => {
        const text = h.textContent.trim().toLowerCase();
        const targetClean = cleanHash.toLowerCase();
        return text === targetClean || h.id.toLowerCase() === targetClean || text.replace(/^[0-9一二三四五六七八九十\.\s、]+/, '').trim() === targetClean;
      });
    }

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Markdown 文档内链全量智能拦截器：处理绝对/相对路径、上级 ../ 跳转、文档缺省扩展名与纯锚点
  function interceptMarkdownLinks() {
    el.articleBody.querySelectorAll('.markdown-body a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;

      // 1. 外部协议直接新标签页打开
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        return;
      }

      // 2. 本文内部纯锚点跳转
      if (href.startsWith('#')) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToAnchor(href);
        });
        return;
      }

      a.addEventListener('click', (e) => {
        e.preventDefault();

        // 拆分 path 与 hash 锚点
        const [rawPath, hashPart] = href.split('#');

        if (!rawPath && hashPart) {
          scrollToAnchor('#' + hashPart);
          return;
        }

        let targetRoute = smartResolveMarkdownRoute(rawPath);
        if (!targetRoute) return;

        // 3. 检查是否为非文档类静态资源（如图片、压缩包、PDF等），若为静态资源则通过 /raw 服务打开
        const ext = targetRoute.substring(targetRoute.lastIndexOf('.')).toLowerCase();
        const assetExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z', '.mp4', '.mp3'];
        if (assetExts.includes(ext)) {
          window.open('/raw' + targetRoute, '_blank');
          return;
        }

        routeTo(targetRoute, true);

        // 4. 若带有跨文档锚点，在文章加载后自动平滑滚动
        if (hashPart) {
          setTimeout(() => {
            scrollToAnchor('#' + hashPart);
          }, 250);
        }
      });
    });
  }

  // 1. 轻量解析 Markdown 顶部的 YAML Frontmatter（纯原生，零外部依赖，毫秒级解析）
  function parseYamlFrontmatter(markdown) {
    if (!markdown || typeof markdown !== 'string' || !markdown.startsWith('---')) {
      return { frontmatter: null, rawYaml: '', body: markdown || '' };
    }

    const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) {
      return { frontmatter: null, rawYaml: '', body: markdown };
    }

    const rawYaml = match[1];
    const body = markdown.slice(match[0].length);
    const data = {};
    const lines = rawYaml.split(/\r?\n/);
    let currentKey = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // 多行列表项匹配: "  - item" 或 "- item"
      const listMatch = line.match(/^\s*-\s+(.*)$/);
      if (listMatch && currentKey && Array.isArray(data[currentKey])) {
        let val = listMatch[1].trim().replace(/^['"](.*)['"]$/, '$1');
        data[currentKey].push(val);
        continue;
      }

      // 键值对匹配: "key: value" 或 "key:"
      const kvMatch = line.match(/^([a-zA-Z0-9_\u4e00-\u9fa5-]+)\s*:\s*(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1].trim();
        let rawVal = kvMatch[2].trim();
        currentKey = key;

        if (!rawVal) {
          data[key] = [];
        } else if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
          const inner = rawVal.slice(1, -1);
          const items = inner.split(',').map(s => s.trim().replace(/^['"](.*)['"]$/, '$1')).filter(Boolean);
          data[key] = items;
        } else {
          let val = rawVal.replace(/^['"](.*)['"]$/, '$1');
          data[key] = val;
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return { frontmatter: null, rawYaml, body };
    }

    return { frontmatter: data, rawYaml, body };
  }

  // 2. 构建属性折叠卡片 HTML（遵循 Notion/Obsidian 极简低对比风格，默认轻量折叠）
  function buildPropertiesCardHtml(fm, rawYaml) {
    if (!fm) return '';
    const keys = Object.keys(fm);
    if (keys.length === 0) return '';

    // 生成折叠状态下的一行预览信息（提取 tags、date 或 author）
    const previewItems = [];
    if (fm.tags && Array.isArray(fm.tags) && fm.tags.length > 0) {
      const previewTags = fm.tags.slice(0, 3).map(t => `<span class="prop-preview-tag">${escapeHtml(String(t))}</span>`).join('');
      previewItems.push(`<span class="prop-preview-tags">${previewTags}${fm.tags.length > 3 ? '<span class="prop-preview-more">...</span>' : ''}</span>`);
    } else if (fm.tag) {
      previewItems.push(`<span class="prop-preview-tag">${escapeHtml(String(fm.tag))}</span>`);
    }

    if (fm.author) {
      previewItems.push(`<span class="prop-preview-meta">👤 ${escapeHtml(String(fm.author))}</span>`);
    }
    if (fm.date) {
      previewItems.push(`<span class="prop-preview-meta">📅 ${escapeHtml(String(fm.date))}</span>`);
    }

    // 生成展开后的属性行
    let rowsHtml = '';
    for (const key of keys) {
      const val = fm[key];
      let valHtml = '';

      if (Array.isArray(val)) {
        if (val.length === 0) {
          valHtml = '<span class="prop-empty">-</span>';
        } else {
          valHtml = '<div class="prop-tags-list">' + val.map(item => {
            return `<span class="prop-pill-tag">${escapeHtml(String(item))}</span>`;
          }).join('') + '</div>';
        }
      } else if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
        valHtml = `<a href="${escapeHtml(val)}" target="_blank" rel="noopener noreferrer" class="prop-link">${escapeHtml(val)}</a>`;
      } else {
        valHtml = `<span class="prop-value-text">${escapeHtml(String(val))}</span>`;
      }

      rowsHtml += `
        <tr class="prop-row">
          <td class="prop-key">${escapeHtml(key)}</td>
          <td class="prop-value">${valHtml}</td>
        </tr>
      `;
    }

    const previewHtml = previewItems.length > 0
      ? `<div class="doc-properties-preview">${previewItems.join('')}</div>`
      : '';

    return `
      <div class="doc-properties-card is-collapsed" id="docPropertiesCard">
        <div class="doc-properties-header" id="docPropertiesHeader" title="点击展开或折叠文档元数据">
          <div class="doc-properties-title">
            <span class="doc-properties-icon">${SVG_ICONS.properties}</span>
            <span>文档属性</span>
            <span class="doc-properties-count">${keys.length}</span>
          </div>
          ${previewHtml}
          <div class="doc-properties-toggle-btn">
            <span class="toggle-text">展开</span>
            <span class="toggle-chevron">${SVG_ICONS.chevronDown}</span>
          </div>
        </div>
        <div class="doc-properties-body" id="docPropertiesBody">
          <table class="doc-properties-table">
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="doc-properties-footer">
            <button type="button" class="prop-raw-toggle-btn" id="propRawToggleBtn">查看原始 YAML</button>
            <div class="prop-raw-yaml-wrapper" id="propRawYamlWrapper" style="display:none;">
              <pre class="prop-raw-yaml-code"><code>${escapeHtml(rawYaml)}</code></pre>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 3. 绑定属性折叠卡片交互
  function bindPropertiesCardEvents() {
    const card = document.getElementById('docPropertiesCard');
    const header = document.getElementById('docPropertiesHeader');
    if (!card || !header) return;

    header.addEventListener('click', () => {
      const isCollapsed = card.classList.toggle('is-collapsed');
      const toggleText = card.querySelector('.toggle-text');
      if (toggleText) {
        toggleText.textContent = isCollapsed ? '展开' : '收起';
      }
    });

    const rawBtn = document.getElementById('propRawToggleBtn');
    const rawWrapper = document.getElementById('propRawYamlWrapper');
    if (rawBtn && rawWrapper) {
      rawBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = rawWrapper.style.display === 'none';
        rawWrapper.style.display = isHidden ? 'block' : 'none';
        rawBtn.textContent = isHidden ? '隐藏原始 YAML' : '查看原始 YAML';
      });
    }
  }

  function preprocessGithubAlertsFast(text) {
    return text.replace(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][^\S\r\n]*(.*)(?:\r?\n((?:>.*(?:\r?\n|$))*)|$)?/gmi, (match, type, inlineText, content) => {
      let combined = (inlineText || '').trim();
      if (content) {
        const cleanContent = content.replace(/^>\s?/gm, '');
        combined = combined ? (combined + '\n' + cleanContent) : cleanContent;
      }
      const t = type.toLowerCase();
      const contentHtml = mdParser ? mdParser.render(combined) : combined;
      return `\n<div class="markdown-alert markdown-alert-${t}">${contentHtml}</div>\n`;
    });
  }

  function getLanguageInfo(filePath) {
    if (!filePath) return { lang: 'none', display: 'CODE' };
    const cleanPath = filePath.split('?')[0].split('#')[0];
    const filename = cleanPath.substring(cleanPath.lastIndexOf('/') + 1).toLowerCase();

    if (filename === 'dockerfile' || filename.startsWith('dockerfile.')) {
      return { lang: 'dockerfile', display: 'DOCKER' };
    }
    if (filename === 'makefile' || filename === 'gnumakefile') {
      return { lang: 'makefile', display: 'MAKE' };
    }
    if (filename === 'jenkinsfile') {
      return { lang: 'groovy', display: 'GROOVY' };
    }

    const dotIndex = filename.lastIndexOf('.');
    const ext = dotIndex !== -1 ? filename.substring(dotIndex + 1) : filename;

    const extMap = {
      // 常用标记与配置
      yml: { lang: 'yaml', display: 'YAML' },
      yaml: { lang: 'yaml', display: 'YAML' },
      json: { lang: 'json', display: 'JSON' },
      toml: { lang: 'toml', display: 'TOML' },
      xml: { lang: 'xml', display: 'XML' },
      svg: { lang: 'svg', display: 'SVG' },
      html: { lang: 'html', display: 'HTML' },
      htm: { lang: 'html', display: 'HTML' },
      ini: { lang: 'ini', display: 'INI' },
      conf: { lang: 'ini', display: 'CONF' },
      properties: { lang: 'properties', display: 'PROPERTIES' },

      // 常见后端与系统语言
      java: { lang: 'java', display: 'JAVA' },
      py: { lang: 'python', display: 'PYTHON' },
      go: { lang: 'go', display: 'GO' },
      rs: { lang: 'rust', display: 'RUST' },
      rust: { lang: 'rust', display: 'RUST' },
      c: { lang: 'c', display: 'C' },
      h: { lang: 'c', display: 'C' },
      cpp: { lang: 'cpp', display: 'C++' },
      hpp: { lang: 'cpp', display: 'C++' },
      cc: { lang: 'cpp', display: 'C++' },
      cs: { lang: 'csharp', display: 'C#' },
      csharp: { lang: 'csharp', display: 'C#' },
      kt: { lang: 'kotlin', display: 'KOTLIN' },
      kts: { lang: 'kotlin', display: 'KOTLIN' },
      scala: { lang: 'scala', display: 'SCALA' },
      proto: { lang: 'protobuf', display: 'PROTOBUF' },
      protobuf: { lang: 'protobuf', display: 'PROTOBUF' },
      gradle: { lang: 'groovy', display: 'GRADLE' },

      // 运维、脚本与数据库
      sh: { lang: 'bash', display: 'SHELL' },
      bash: { lang: 'bash', display: 'BASH' },
      zsh: { lang: 'bash', display: 'ZSH' },
      shell: { lang: 'bash', display: 'SHELL' },
      sql: { lang: 'sql', display: 'SQL' },
      docker: { lang: 'dockerfile', display: 'DOCKER' },
      dockerfile: { lang: 'dockerfile', display: 'DOCKER' },

      // 前端语言
      js: { lang: 'javascript', display: 'JAVASCRIPT' },
      javascript: { lang: 'javascript', display: 'JAVASCRIPT' },
      jsx: { lang: 'javascript', display: 'JSX' },
      mjs: { lang: 'javascript', display: 'JAVASCRIPT' },
      cjs: { lang: 'javascript', display: 'JAVASCRIPT' },
      ts: { lang: 'typescript', display: 'TYPESCRIPT' },
      typescript: { lang: 'typescript', display: 'TYPESCRIPT' },
      tsx: { lang: 'typescript', display: 'TSX' },
      css: { lang: 'css', display: 'CSS' },
      scss: { lang: 'css', display: 'SCSS' },
      less: { lang: 'css', display: 'LESS' },

      // 文档与纯文本
      md: { lang: 'markdown', display: 'MARKDOWN' },
      markdown: { lang: 'markdown', display: 'MARKDOWN' },
      txt: { lang: 'none', display: 'TEXT' },
      csv: { lang: 'none', display: 'CSV' },
      log: { lang: 'none', display: 'LOG' }
    };

    if (ext && extMap[ext]) {
      return extMap[ext];
    }
    return { lang: ext || 'none', display: (ext || 'CODE').toUpperCase() };
  }

  function enhanceCodeBlocksAsync(defaultCollapsed = true) {
    const pres = Array.from(el.articleBody.querySelectorAll('pre:not([data-enhanced="true"])'));
    if (pres.length === 0) return;

    pres.forEach(pre => {
      pre.setAttribute('data-enhanced', 'true');
      const code = pre.querySelector('code');
      let lang = 'CODE';
      if (code) {
        const cls = code.className || '';
        const match = cls.match(/language-([\w-]+)/);
        if (match) {
          const l = match[1].toLowerCase();
          const info = getLanguageInfo('.' + l);
          lang = info.display || l.toUpperCase();
        }
      }

      const rawText = (code || pre).textContent || '';
      const lineCount = rawText ? rawText.replace(/\n$/, '').split('\n').length : 1;

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      if (defaultCollapsed) {
        wrapper.classList.add('is-collapsed');
      }
      pre.parentNode.insertBefore(wrapper, pre);

      const headerBar = document.createElement('div');
      headerBar.className = 'code-header-bar';
      headerBar.setAttribute('role', 'button');
      headerBar.setAttribute('tabindex', '0');
      headerBar.setAttribute('title', '点击展开或折叠代码块');
      headerBar.innerHTML = `
        <div class="code-header-left">
          <div class="mac-traffic-lights">
            <span class="mac-dot red"></span>
            <span class="mac-dot yellow"></span>
            <span class="mac-dot green"></span>
          </div>
          <span class="code-lang-tag">${lang}</span>
          <span class="code-lines-badge">${lineCount} 行</span>
        </div>
        <div class="code-header-actions">
          <button class="code-toggle-btn" type="button" aria-expanded="${!defaultCollapsed}" title="${defaultCollapsed ? '展开代码' : '收起代码'}">
            <svg class="code-toggle-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <span class="code-toggle-text">${defaultCollapsed ? '展开' : '收起'}</span>
          </button>
          <button class="code-copy-btn" type="button" title="复制代码">
            ${SVG_ICONS.copy}
            <span>复制</span>
          </button>
        </div>
      `;

      const toggleBtn = headerBar.querySelector('.code-toggle-btn');
      const toggleText = headerBar.querySelector('.code-toggle-text');
      const copyBtn = headerBar.querySelector('.code-copy-btn');

      function toggleCollapse() {
        const isCollapsed = wrapper.classList.toggle('is-collapsed');
        if (isCollapsed) {
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.title = '展开代码';
          toggleText.textContent = '展开';
        } else {
          toggleBtn.setAttribute('aria-expanded', 'true');
          toggleBtn.title = '收起代码';
          toggleText.textContent = '收起';
          if (window.Prism && code && !code.dataset.highlighted) {
            try {
              Prism.highlightElement(code);
              code.dataset.highlighted = 'true';
            } catch (e) {}
          }
        }
      }

      headerBar.addEventListener('click', (e) => {
        if (e.target.closest('.code-copy-btn')) return;
        toggleCollapse();
      });

      headerBar.addEventListener('keydown', (e) => {
        if (e.target.closest('.code-copy-btn')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCollapse();
        }
      });

      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await copyTextToClipboard((code || pre).innerText);
        copyBtn.innerHTML = `${SVG_ICONS.check} <span style="color:#10b981;">已复制</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = `${SVG_ICONS.copy} <span>复制</span>`;
        }, 2000);
      });

      wrapper.appendChild(headerBar);
      wrapper.appendChild(pre);
    });

    let idx = 0;
    function highlightNextChunk() {
      const deadline = performance.now() + 14;
      while (idx < pres.length && performance.now() < deadline) {
        const pre = pres[idx];
        const code = pre.querySelector('code');
        if (window.Prism && code && !code.dataset.highlighted) {
          try {
            Prism.highlightElement(code);
            code.dataset.highlighted = 'true';
          } catch (e) {}
        }
        idx++;
      }
      if (idx < pres.length) {
        if (window.requestIdleCallback) {
          requestIdleCallback(highlightNextChunk);
        } else {
          setTimeout(highlightNextChunk, 16);
        }
      }
    }
    highlightNextChunk();
  }

  function setupLazyMermaidObserver() {
    if (mermaidObserver) {
      mermaidObserver.disconnect();
    }

    const wrappers = el.articleBody.querySelectorAll('.mermaid-wrapper[data-chart-key]');
    if (wrappers.length === 0) return;

    // 后台非阻塞异步预加载 mermaid.js，确保滚动到图表时渲染引擎已就绪
    ensureMermaidLoaded().catch(() => {});

    mermaidObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const wrapper = entry.target;
          mermaidObserver.unobserve(wrapper);
          renderSingleMermaidChart(wrapper);
        }
      });
    }, { rootMargin: '300px 0px 300px 0px' });

    wrappers.forEach(w => mermaidObserver.observe(w));
  }

  // ==========================================================================
  // 全屏 Mermaid 架构图高清视窗 (自由缩放与平移拖拽控制器)
  // ==========================================================================
  const mermaidZoomState = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    minScale: 0.15,
    maxScale: 6.0,
    svgWidth: 0,
    svgHeight: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    startTranslateX: 0,
    startTranslateY: 0
  };

  function applyMermaidTransform(smooth = false) {
    const canvas = document.getElementById('mermaidCanvas');
    const label = document.getElementById('mermaidZoomLabel');
    if (!canvas) return;

    if (smooth) {
      canvas.style.transition = 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      canvas.style.transition = 'none';
    }

    canvas.style.transform = `translate3d(${mermaidZoomState.translateX}px, ${mermaidZoomState.translateY}px, 0) scale(${mermaidZoomState.scale})`;

    if (label) {
      label.textContent = `${Math.round(mermaidZoomState.scale * 100)}%`;
    }
  }

  function fitMermaidDiagram(isInitial = false) {
    const viewport = document.getElementById('mermaidViewport');
    if (!viewport || !mermaidZoomState.svgWidth || !mermaidZoomState.svgHeight) return;

    const vW = viewport.clientWidth;
    const vH = viewport.clientHeight;
    if (vW <= 0 || vH <= 0) return;

    const padding = 36;
    const availableW = Math.max(vW - padding * 2, 100);
    const availableH = Math.max(vH - padding * 2, 100);

    const scaleW = availableW / mermaidZoomState.svgWidth;
    const scaleH = availableH / mermaidZoomState.svgHeight;
    let targetScale = Math.min(scaleW, scaleH);

    if (isInitial) {
      // 彻底解决全屏后图表依然很小的问题：
      // 如果图表内容较为精炼，将其放大至舒适易读的黄金视觉尺寸 (1.2x ~ 2.0x)，绝不让全屏显得空旷冷清！
      if (targetScale < 1.0) {
        targetScale = Math.max(targetScale, 0.4);
      } else {
        targetScale = Math.min(targetScale * 1.25, 2.0);
      }
    }

    mermaidZoomState.scale = Math.max(mermaidZoomState.minScale, Math.min(mermaidZoomState.maxScale, targetScale));
    mermaidZoomState.translateX = (vW - mermaidZoomState.svgWidth * mermaidZoomState.scale) / 2;
    mermaidZoomState.translateY = (vH - mermaidZoomState.svgHeight * mermaidZoomState.scale) / 2;

    applyMermaidTransform(true);
  }

  function zoomMermaid(factor, clientX = null, clientY = null) {
    const viewport = document.getElementById('mermaidViewport');
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const originX = clientX !== null ? clientX - rect.left : rect.width / 2;
    const originY = clientY !== null ? clientY - rect.top : rect.height / 2;

    const oldScale = mermaidZoomState.scale;
    const newScale = Math.max(mermaidZoomState.minScale, Math.min(mermaidZoomState.maxScale, oldScale * factor));
    if (newScale === oldScale) return;

    const ratio = newScale / oldScale;
    mermaidZoomState.translateX = originX - (originX - mermaidZoomState.translateX) * ratio;
    mermaidZoomState.translateY = originY - (originY - mermaidZoomState.translateY) * ratio;
    mermaidZoomState.scale = newScale;

    applyMermaidTransform(clientX === null);
  }

  function openMermaidLightbox(rawSvgString) {
    const modal = document.getElementById('mermaidModal');
    const canvas = document.getElementById('mermaidCanvas');
    const viewport = document.getElementById('mermaidViewport');
    if (!modal || !canvas || !viewport) return;

    canvas.innerHTML = rawSvgString;
    const svg = canvas.querySelector('svg');
    if (!svg) return;

    // 解析并提取真实无损尺寸
    let vbW = 600, vbH = 400;
    const vbAttr = svg.getAttribute('viewBox');
    if (vbAttr) {
      const parts = vbAttr.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        vbW = parts[2];
        vbH = parts[3];
      }
    } else {
      const b = svg.getBoundingClientRect();
      vbW = b.width || 600;
      vbH = b.height || 400;
    }

    mermaidZoomState.svgWidth = vbW;
    mermaidZoomState.svgHeight = vbH;

    // 移除限制宽度的内联样式，使 SVG 能够按真实高分屏无损矢量放大
    svg.style.maxWidth = 'none';
    svg.style.maxHeight = 'none';
    svg.style.width = `${vbW}px`;
    svg.style.height = `${vbH}px`;
    svg.setAttribute('width', vbW);
    svg.setAttribute('height', vbH);

    openModal(modal);

    // 待浮层打开展开后，计算并应用最佳可视缩放与居中
    setTimeout(() => {
      fitMermaidDiagram(true);
    }, 60);
  }

  function initMermaidLightboxEvents() {
    const viewport = document.getElementById('mermaidViewport');
    const zoomInBtn = document.getElementById('mermaidZoomInBtn');
    const zoomOutBtn = document.getElementById('mermaidZoomOutBtn');
    const fitBtn = document.getElementById('mermaidFitBtn');
    const zoomLabel = document.getElementById('mermaidZoomLabel');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => zoomMermaid(1.25));
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => zoomMermaid(0.8));
    }
    if (fitBtn) {
      fitBtn.addEventListener('click', () => fitMermaidDiagram(false));
    }
    if (zoomLabel) {
      zoomLabel.addEventListener('click', () => {
        zoomMermaid(1.0 / mermaidZoomState.scale);
      });
    }

    if (!viewport) return;

    // 鼠标滚轮缩放
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      zoomMermaid(factor, e.clientX, e.clientY);
    }, { passive: false });

    // 鼠标拖拽平移
    viewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      mermaidZoomState.isDragging = true;
      mermaidZoomState.startX = e.clientX;
      mermaidZoomState.startY = e.clientY;
      mermaidZoomState.startTranslateX = mermaidZoomState.translateX;
      mermaidZoomState.startTranslateY = mermaidZoomState.translateY;
      viewport.classList.add('grabbing');
    });

    window.addEventListener('mousemove', (e) => {
      if (!mermaidZoomState.isDragging) return;
      mermaidZoomState.translateX = mermaidZoomState.startTranslateX + (e.clientX - mermaidZoomState.startX);
      mermaidZoomState.translateY = mermaidZoomState.startTranslateY + (e.clientY - mermaidZoomState.startY);
      applyMermaidTransform(false);
    });

    window.addEventListener('mouseup', () => {
      if (mermaidZoomState.isDragging) {
        mermaidZoomState.isDragging = false;
        viewport.classList.remove('grabbing');
      }
    });

    // 双击居中适配
    viewport.addEventListener('dblclick', (e) => {
      if (e.target.closest('.btn')) return;
      fitMermaidDiagram(false);
    });

    // 触控单指平移与双指捏合缩放
    let touchStartDist = 0;
    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        mermaidZoomState.isDragging = true;
        mermaidZoomState.startX = e.touches[0].clientX;
        mermaidZoomState.startY = e.touches[0].clientY;
        mermaidZoomState.startTranslateX = mermaidZoomState.translateX;
        mermaidZoomState.startTranslateY = mermaidZoomState.translateY;
      } else if (e.touches.length === 2) {
        mermaidZoomState.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && mermaidZoomState.isDragging) {
        mermaidZoomState.translateX = mermaidZoomState.startTranslateX + (e.touches[0].clientX - mermaidZoomState.startX);
        mermaidZoomState.translateY = mermaidZoomState.startTranslateY + (e.touches[0].clientY - mermaidZoomState.startY);
        applyMermaidTransform(false);
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const factor = currentDist / touchStartDist;
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        zoomMermaid(factor, midX, midY);
        touchStartDist = currentDist;
      }
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        mermaidZoomState.isDragging = false;
        touchStartDist = 0;
      }
    });

    window.addEventListener('resize', () => {
      const modal = document.getElementById('mermaidModal');
      if (modal && modal.classList.contains('open')) {
        fitMermaidDiagram(false);
      }
    });
  }

  // ==========================================================================
  // Mermaid 宽容渲染与语法自愈器 (Fault-Tolerant & Self-Healing Pipeline)
  // 解决 LLM 或手写图表中节点/subgraph 未加引号包含冒号/括号/特殊字符导致语法崩溃等常见痛点
  // ==========================================================================
  function healSubgraphLine(line) {
    const match = line.match(/^(\s*subgraph)([\s:].*)$/i);
    if (!match) return line;

    const indent = line.match(/^\s*/)[0];
    let rest = match[2];

    // 清除 subgraph 后面误写的半角/全角冒号与前导空格，如 "subgraph: 架构" -> " 架构"
    rest = rest.replace(/^[\s:：]+/, ' ').trim();
    if (!rest) return line;

    // 1. 如果已经用双引号或单引号完整包裹，如 subgraph "..."
    if ((rest.startsWith('"') && rest.endsWith('"')) || (rest.startsWith("'") && rest.endsWith("'"))) {
      return `${indent}subgraph ${rest}`;
    }

    // 2. 检查是否为带 ID 和方括号的形式: subgraph id [title] 或 subgraph id[title]
    const idBracketMatch = rest.match(/^([a-zA-Z0-9_-]+)\s*\[([\s\S]*)\]$/);
    if (idBracketMatch) {
      const id = idBracketMatch[1];
      let title = idBracketMatch[2].trim();
      if ((title.startsWith('"') && title.endsWith('"')) || (title.startsWith("'") && title.endsWith("'"))) {
        return `${indent}subgraph ${id} [${title}]`;
      }
      const safeTitle = title.replace(/"/g, '#quot;');
      return `${indent}subgraph ${id} ["${safeTitle}"]`;
    }

    // 3. 检查是否为单一纯英文数字下划线 ID，如 subgraph cluster1
    if (/^[a-zA-Z0-9_-]+$/.test(rest)) {
      return `${indent}subgraph ${rest}`;
    }

    // 4. 其他情况（包括直接写中文标题、含冒号、空格、括号、特殊字符等）：
    // 清除末尾冗余的冒号
    rest = rest.replace(/[:：\s]+$/, '');
    const safeTitle = rest.replace(/"/g, '#quot;');
    return `${indent}subgraph "${safeTitle}"`;
  }

  function healMermaidLineOnePass(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return line;

    // 0. subgraph 语句特殊容错治理（避免包含冒号、括号、特殊字符时导致 Jison 词法报错）
    if (/^\s*subgraph\b/i.test(line)) {
      return healSubgraphLine(line);
    }

    // 复合与单括号形状定义（按开启符长度降序，先匹配复合再匹配单字符）
    const shapes = [
      { open: '([', close: '])' },
      { open: '[(', close: ')]' },
      { open: '[[', close: ']]' },
      { open: '((', close: '))' },
      { open: '{{', close: '}}' },
      { open: '[/', close: '/]' },
      { open: '[\\', close: '\\]' },
      { open: '[/', close: '\\]' },
      { open: '[\\', close: '/]' },
      { open: '[', close: ']' },
      { open: '{', close: '}' },
      { open: '(', close: ')' },
    ];

    let i = 0;
    let out = '';

    while (i < line.length) {
      // 1. 连线标签 |...| 容错包裹
      if (line[i] === '|') {
        const nextPipe = line.indexOf('|', i + 1);
        if (nextPipe > i + 1) {
          const label = line.substring(i + 1, nextPipe);
          const trimmedLabel = label.trim();
          if ((trimmedLabel.startsWith('"') && trimmedLabel.endsWith('"')) ||
              (trimmedLabel.startsWith("'") && trimmedLabel.endsWith("'"))) {
            out += line.substring(i, nextPipe + 1);
          } else if (/[()[\]{}<>,:*&~#]/.test(label)) {
            const safe = label.replace(/"/g, '#quot;');
            out += `|"${safe}"|`;
          } else {
            out += line.substring(i, nextPipe + 1);
          }
          i = nextPipe + 1;
          continue;
        }
      }

      // 2. 已存在的双引号字符串，原样保留跳过
      if (line[i] === '"') {
        let quoteEnd = i + 1;
        while (quoteEnd < line.length) {
          if (line[quoteEnd] === '\\') {
            quoteEnd += 2;
          } else if (line[quoteEnd] === '"') {
            quoteEnd++;
            break;
          } else {
            quoteEnd++;
          }
        }
        out += line.substring(i, quoteEnd);
        i = quoteEnd;
        continue;
      }

      // 3. 匹配节点形状
      let matchedShape = null;
      for (const shape of shapes) {
        if (line.startsWith(shape.open, i)) {
          if (shape.open === '(') {
            // 圆括号必须前面有非空白字符（如节点ID），避免与连线或普通数学式混淆
            if (i > 0 && /\s/.test(line[i - 1])) {
              continue;
            }
          }
          matchedShape = shape;
          break;
        }
      }

      if (matchedShape) {
        const openLen = matchedShape.open.length;
        const closeStr = matchedShape.close;
        const openStr = matchedShape.open;
        let j = i + openLen;
        let closeIndex = -1;
        let inQuote = false;
        let depth = 0;

        while (j < line.length) {
          if (line[j] === '"') {
            inQuote = !inQuote;
          } else if (!inQuote) {
            if (line.startsWith(openStr, j)) {
              depth++;
              j += openLen - 1;
            } else if (line.startsWith(closeStr, j)) {
              if (depth > 0) {
                depth--;
                j += closeStr.length - 1;
              } else {
                closeIndex = j;
                break;
              }
            }
          }
          j++;
        }

        if (closeIndex !== -1) {
          const rawContent = line.substring(i + openLen, closeIndex);
          const trimmedContent = rawContent.trim();
          let newContent = rawContent;

          // 若未包裹双引号，且含有破坏 Mermaid 词法解析的敏感符号（如括号、冒号、星号、斜杠、尖括号等）
          if (!trimmedContent.startsWith('"') || !trimmedContent.endsWith('"')) {
            if (/[()[\]{}<>:*&~#/]/.test(rawContent)) {
              const safe = rawContent.replace(/"/g, '#quot;');
              newContent = `"${safe}"`;
            }
          }

          out += matchedShape.open + newContent + matchedShape.close;
          i = closeIndex + closeStr.length;
          continue;
        }
      }

      out += line[i];
      i++;
    }

    return out;
  }

  function autoHealMermaidSyntax(code) {
    if (!code || typeof code !== 'string') return code;
    let healed = code;

    // 1. 去除首尾代码块围栏
    healed = healed.replace(/^```(?:mermaid)?\r?\n?/i, '').replace(/\r?\n?```$/i, '').trim();

    // 2. 连线纠错（中文长破折号或全角减号连线转为半角连线）
    healed = healed.replace(/[\u2014\u2015\u2500\uFF0D]{2,}>/g, '-->');
    healed = healed.replace(/[\u2014\u2015\u2500\uFF0D]{2,}/g, '---');

    const lines = healed.split('\n');
    const healedLines = lines.map(healMermaidLineOnePass);
    healed = healedLines.join('\n');

    // 3. 补全缺失的图表类型声明（例如直接以 A --> B 起手）
    const firstNonEmpty = healedLines.map(l => l.trim()).find(l => l && !l.startsWith('%%'));
    if (firstNonEmpty) {
      const knownDiagramTypes = [
        'flowchart', 'graph', 'sequencediagram', 'classdiagram', 'statediagram',
        'statediagram-v2', 'erdiagram', 'journey', 'gantt', 'pie', 'gitgraph',
        'mindmap', 'quadrantchart', 'requirementdiagram', 'c4context', 'c4container',
        'c4component', 'c4dynamic', 'c4deployment', 'timeline', 'zenuml', 'sankey-beta', 'block-beta'
      ];
      const firstWord = firstNonEmpty.split(/[\s\n(]/)[0].toLowerCase();
      if (!knownDiagramTypes.includes(firstWord)) {
        if (healed.includes('-->') || healed.includes('---')) {
          healed = 'flowchart TD\n' + healed;
        }
      }
    }

    // 4. 补全缺失的 subgraph 闭合关键字 end
    const subgraphCount = (healed.match(/^\s*subgraph\b/gmi) || []).length;
    const endCount = (healed.match(/^\s*end\b/gmi) || []).length;
    if (subgraphCount > endCount) {
      const diff = subgraphCount - endCount;
      healed = healed + '\n' + Array(diff).fill('end').join('\n');
    }

    return healed;
  }

  // ==========================================================================
  // Mermaid 智能布局方向检测与自适应重排引擎 (LR ⇄ TD)
  // 核心解决：3个及以上并排节点横向太长导致字号严重缩水成蚂蚁字的问题
  // ==========================================================================
  function getMermaidFlowchartInfo(code) {
    if (!code || typeof code !== 'string') return null;
    const match = code.match(/^\s*(graph|flowchart)\s+([A-Za-z]+)\b/im);
    if (!match) return null;
    const dir = match[2].toUpperCase();
    return {
      type: match[1],
      direction: dir, // 'LR', 'RL', 'TD', 'TB', 'BT'
      isLR: dir === 'LR' || dir === 'RL',
      isTD: dir === 'TD' || dir === 'TB'
    };
  }

  function switchMermaidFlowchartDirection(code, targetDir) {
    if (!code || typeof code !== 'string') return code;
    return code.replace(/^(\s*(?:graph|flowchart)\s+)[A-Za-z]+\b/im, `$1${targetDir}`);
  }

  // ==========================================================================
  // Mermaid 节点长文本智能软折行算法 (Auto Soft Wrap)
  // 彻底解决节点包含长单句导致矩形框被撑成 800px 宽巨型带状、在手机上缩成蚂蚁字的问题
  // ==========================================================================
  function autoWrapLongMermaidLabels(code) {
    if (!code || typeof code !== 'string') return code;

    function wrapText(text, maxLen = 16) {
      if (!text || text.length <= maxLen || text.includes('<br') || text.includes('\n')) {
        return text;
      }
      
      // 1. 优先按冒号（标题: 描述）断开首行
      const colonMatch = text.match(/^([^:：]{2,10}[:：])\s*(.+)$/);
      if (colonMatch) {
        const title = colonMatch[1];
        const rest = colonMatch[2];
        return title + '<br/>' + wrapText(rest, maxLen);
      }

      // 2. 标点符号优先软断行（中文逗号、分号、顿号、空格等）
      const breakPuncts = new Set(['，', ',', '；', ';', '、', ' ', '。', '！', '!']);
      const lines = [];
      let cur = '';
      for (let i = 0; i < text.length; i++) {
        cur += text[i];
        if (cur.length >= maxLen && breakPuncts.has(text[i])) {
          lines.push(cur.trim());
          cur = '';
        } else if (cur.length >= maxLen + 6) {
          lines.push(cur.trim());
          cur = '';
        }
      }
      if (cur.trim()) lines.push(cur.trim());
      return lines.join('<br/>');
    }

    let result = code;

    // 1. 匹配带双引号的各类节点内容: ["..."], ("..."), {"..."}, (["..."]), [\"...\"]
    result = result.replace(/(\[\"|\(\"|\{\")([^\"\r\n]+)(\"\]|\"\)|\"\})/g, (match, open, content, close) => {
      return open + wrapText(content, 16) + close;
    });

    // 2. 匹配不带引号的长节点内容（且长度大于 18 个字符）
    result = result.replace(/(\[|\()([^\r\n\[\]\(\)\{\}\"]{20,})(\]|\))/g, (match, open, content, close) => {
      const trimmed = content.trim();
      if (trimmed.startsWith('subgraph') || trimmed.startsWith('class') || trimmed.startsWith('style') || trimmed.startsWith('click')) {
        return match;
      }
      return open + wrapText(content, 16) + close;
    });

    // 3. 匹配时序图 Note 文本: Note over X: ...
    result = result.replace(/(\bNote\s+(?:over|left\s+of|right\s+of)\s+[^:\n]+:\s*)([^\r\n]{22,})/gi, (match, prefix, content) => {
      return prefix + wrapText(content, 18);
    });

    return result;
  }

  function isMermaidCodeTooWide(code) {
    const info = getMermaidFlowchartInfo(code);
    if (!info || !info.isLR) return false;

    const lines = code.split('\n');
    const arrowRegex = /(-->|---|==>|-\.->|--o|--x|-\.-)/g;

    // 1. 检查单行是否存在 2 个及以上连线（例如 A --> B --> C，即 3 个及以上框）
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('%%') || trimmed.startsWith('subgraph')) continue;
      const arrows = trimmed.match(arrowRegex);
      if (arrows && arrows.length >= 2) {
        return true;
      }
    }

    // 2. 检查多行拓扑链路深度与分支节点规模
    const edges = [];
    const edgeRegex = /([a-zA-Z0-9_\u4e00-\u9fa5]+)\s*(?:\[[^\]]*\]|\([^\)]*\)|\{[^\}]*\}|\([\[\{].*?[\}\]\)])?\s*(?:-->|---|==>|-\.->|--o|--x)\s*(?:\|[^\|]*\|\s*)?([a-zA-Z0-9_\u4e00-\u9fa5]+)/g;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('%%') || trimmed.startsWith('subgraph')) continue;
      let match;
      while ((match = edgeRegex.exec(trimmed)) !== null) {
        edges.push([match[1], match[2]]);
      }
    }

    if (edges.length >= 2) {
      const graph = {};
      const uniqueNodes = new Set();
      for (const [u, v] of edges) {
        uniqueNodes.add(u);
        uniqueNodes.add(v);
        if (!graph[u]) graph[u] = [];
        graph[u].push(v);
      }

      // 独立节点总数较多（>= 4 个）在横排下必然拉宽
      if (uniqueNodes.size >= 4) return true;

      // 检测前驱-后继最长链条深度是否 >= 3 个节点
      let maxDepth = 1;
      function dfs(node, visited, depth) {
        if (depth > maxDepth) maxDepth = depth;
        if (maxDepth >= 3) return;
        const neighbors = graph[node] || [];
        for (const nxt of neighbors) {
          if (!visited.has(nxt)) {
            visited.add(nxt);
            dfs(nxt, visited, depth + 1);
            visited.delete(nxt);
          }
        }
      }

      for (const start of Object.keys(graph)) {
        dfs(start, new Set([start]), 1);
        if (maxDepth >= 3) return true;
      }
    }

    return false;
  }

  // ==========================================================================
  // Mermaid 移动端拓扑智能选向引擎 (Smart Auto Orientation)
  // 核心逻辑：
  // 1. 多分支发散结构 (1对多，例如 A 致命缺陷分支出 B, C, D, E 四个点)：
  //    - 在 TD 下，4 个子节点会横排成 4 列，在手机上宽度 1300px 造成极度挤压！
  //    - 在 LR 下，A 在左，4 个子节点在右侧从上到下垂直排成 4 排，完美贴合手机竖屏！
  // 2. 连续长链条结构 (A --> B --> C --> D)：
  //    - 在 LR 下会横排拉伸成长条；在 TD 下会从上到下垂直排列！
  // ==========================================================================
  // ==========================================================================
  // 对无连线独立卡片组（如三大历史统治实验）追加隐形连线，确保在 TD 模式下垂直堆叠
  // ==========================================================================
  function ensureVerticalStackForIsolatedNodes(code) {
    const lines = code.split('\n');
    const edgeRegex = /-->|---|==>|-\.->|--o|--x|~~~/;
    
    let hasEdges = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('%%')) continue;
      if (edgeRegex.test(trimmed)) {
        hasEdges = true;
        break;
      }
    }

    if (!hasEdges) {
      const nodeDefRegex = /^\s*([a-zA-Z0-9_\u4e00-\u9fa5]+)\s*(?:\[[^\]]*\]|\([^\)]*\)|\{[^\}]*\})/g;
      const nodeIds = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('%%') || trimmed.startsWith('subgraph') || trimmed.startsWith('end') || trimmed.startsWith('class') || trimmed.startsWith('style')) continue;
        let m;
        while ((m = nodeDefRegex.exec(trimmed)) !== null) {
          if (!['subgraph', 'end', 'graph', 'flowchart'].includes(m[1].toLowerCase())) {
            nodeIds.push(m[1]);
          }
        }
      }

      if (nodeIds.length >= 2) {
        const invisibleChain = nodeIds.join(' ~~~ ');
        if (code.includes('end')) {
          const lastEndIdx = code.lastIndexOf('end');
          return code.slice(0, lastEndIdx) + `        ${invisibleChain}\n    ` + code.slice(lastEndIdx);
        } else {
          return code + `\n${invisibleChain}\n`;
        }
      }
    }

    return code;
  }

  function detectBestFlowchartDirection(code, isMobile = false) {
    const info = getMermaidFlowchartInfo(code);
    if (!info) return null;
    if (!info.isLR && !info.isTD) return info.direction;

    const lines = code.split('\n');
    const edges = [];
    const arrowRegex = /(-->|---|==>|-\.->|-\.-x|--o|--x|-[^-]+-)/;

    for (const rawLine of lines) {
      const l = rawLine.trim();
      if (!l || l.startsWith('%%') || l.startsWith('subgraph') || l.startsWith('end') || l.startsWith('class') || l.startsWith('style')) continue;
      
      const parts = l.split(arrowRegex);
      if (parts.length >= 3) {
        const leftPart = parts[0];
        const rightPart = parts.slice(2).join('');
        
        // 兼容 A & B & C & D & E --> F 等多节点语法
        const leftNodes = leftPart.split('&').map(s => {
          const m = s.trim().match(/^([a-zA-Z0-9_\u4e00-\u9fa5]+)/);
          return m ? m[1] : null;
        }).filter(Boolean);

        const cleanRight = rightPart.replace(/\|[^\|]*\|/g, '').trim();
        const rightNodes = cleanRight.split('&').map(s => {
          const m = s.trim().match(/^([a-zA-Z0-9_\u4e00-\u9fa5]+)/);
          return m ? m[1] : null;
        }).filter(Boolean);

        for (const u of leftNodes) {
          for (const v of rightNodes) {
            edges.push([u, v]);
          }
        }
      }
    }

    if (edges.length === 0) {
      // 提取无连线的独立节点数量（如三大历史统治实验）
      const nodeDefRegex = /^\s*([a-zA-Z0-9_\u4e00-\u9fa5]+)\s*(?:\[[^\]]*\]|\([^\)]*\)|\{[^\}]*\})/g;
      const isolatedNodes = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('%%') || trimmed.startsWith('subgraph') || trimmed.startsWith('end')) continue;
        let m;
        while ((m = nodeDefRegex.exec(trimmed)) !== null) {
          if (!['subgraph', 'end', 'graph', 'flowchart'].includes(m[1].toLowerCase())) {
            isolatedNodes.push(m[1]);
          }
        }
      }
      if (isolatedNodes.length >= 2) {
        // 在移动端，多个独立卡片必须用 TD 从上到下垂直堆叠！
        return isMobile ? 'TD' : info.direction;
      }
      return info.direction;
    }

    const outDegree = {};
    const inDegree = {};
    for (const [u, v] of edges) {
      outDegree[u] = (outDegree[u] || 0) + 1;
      inDegree[v] = (inDegree[v] || 0) + 1;
    }

    const maxOut = Math.max(...Object.values(outDegree), 0);
    const maxIn = Math.max(...Object.values(inDegree), 0);

    // 规则 1：如果存在一个节点分支出多个子节点，或多个父节点汇聚到一个节点（如 A & B & C & D & E -> F）
    // 在 TD 下多个节点必定在同层横排成多列！在移动端必须以 LR 渲染，让它们在垂直方向依次堆叠排布！
    if (maxOut >= 2 || maxIn >= 2) {
      return isMobile ? 'LR' : (maxOut >= 4 || maxIn >= 4 ? 'LR' : info.direction);
    }

    // 规则 2：如果是连续链路（例如 A -> B -> C -> D）
    let maxChain = 1;
    const graph = {};
    for (const [u, v] of edges) {
      if (!graph[u]) graph[u] = [];
      graph[u].push(v);
    }
    function dfs(n, visited, depth) {
      if (depth > maxChain) maxChain = depth;
      if (maxChain >= 3) return;
      for (const nxt of (graph[n] || [])) {
        if (!visited.has(nxt)) {
          visited.add(nxt);
          dfs(nxt, visited, depth + 1);
          visited.delete(nxt);
        }
      }
    }
    for (const s of Object.keys(graph)) {
      dfs(s, new Set([s]), 1);
      if (maxChain >= 3) break;
    }

    if (maxChain >= 3) {
      // 连续长链条用 TD 从上到下垂直瀑布流
      return isMobile ? 'TD' : info.direction;
    }

    return info.direction;
  }

  async function renderSingleMermaidChart(wrapper, forcedDirection = null) {
    if (!forcedDirection && wrapper.getAttribute('data-rendered') === 'true') return;
    const chartKey = wrapper.getAttribute('data-chart-key');
    const rawCode = mermaidStore.get(chartKey);
    if (!rawCode) return;

    // 解析当前流程图方向与智能拓扑选向
    const flowInfo = getMermaidFlowchartInfo(rawCode);
    let targetDir = forcedDirection || wrapper.getAttribute('data-direction');

    if (!targetDir && flowInfo) {
      const isMobileScreen = window.innerWidth <= 768;
      targetDir = detectBestFlowchartDirection(rawCode, isMobileScreen) || flowInfo.direction;
    }

    // 生成目标代码（如果需要方向转换）
    let codeToRender = rawCode;
    if (flowInfo && targetDir && targetDir !== flowInfo.direction) {
      codeToRender = switchMermaidFlowchartDirection(rawCode, targetDir);
    }
    // 如果当前采用的是 TD，并且是无连线多卡片，追加隐形连线强制垂直瀑布流
    if (targetDir === 'TD' || targetDir === 'TB') {
      codeToRender = ensureVerticalStackForIsolatedNodes(codeToRender);
    }
    // 关键优化：自动对长节点文本执行智能断行，从根源将巨型长条框缩至合身宽度
    codeToRender = autoWrapLongMermaidLabels(codeToRender);

    const uniqueSvgId = `svg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    let finalSvg = null;
    let isHealed = false;
    let renderError = null;

    try {
      await ensureMermaidLoaded();
      await new Promise(r => setTimeout(r, 16));
      // 阶段一：首选原样标准渲染（Fast Path，零额外开销）
      const res = await window.mermaid.render(uniqueSvgId, codeToRender);
      finalSvg = res.svg;
    } catch (primaryErr) {
      renderError = primaryErr;
      // 清除 Mermaid 可能在 DOM 中残留的未捕获错误节点
      try {
        const strays = document.querySelectorAll(`[id*="${uniqueSvgId}"]`);
        strays.forEach(n => { if (n !== wrapper && !wrapper.contains(n)) n.remove(); });
      } catch (_) {}

      // 阶段二：宽容渲染自愈尝试（Self-Healing Recovery Path）
      const healedCode = autoHealMermaidSyntax(codeToRender);
      if (healedCode && healedCode !== codeToRender) {
        const retrySvgId = `svg-heal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        try {
          const retryRes = await window.mermaid.render(retrySvgId, healedCode);
          finalSvg = retryRes.svg;
          isHealed = true;
          console.info('Mermaid tolerant render recovered successfully from syntax errors.');
        } catch (retryErr) {
          renderError = retryErr;
          try {
            const strays = document.querySelectorAll(`[id*="${retrySvgId}"]`);
            strays.forEach(n => { if (n !== wrapper && !wrapper.contains(n)) n.remove(); });
          } catch (_) {}
          console.warn('Mermaid self-healing retry also failed:', retryErr);
        }
      } else {
        console.warn('Mermaid render error (cannot heal):', primaryErr);
      }
    }

    if (finalSvg) {
      const isCurrentlyTD = targetDir === 'TD' || targetDir === 'TB';
      const canToggleDirection = flowInfo !== null;

      wrapper.innerHTML = `
        <div class="mermaid-toolbar">
          ${isHealed ? `<span class="mermaid-heal-badge" title="图表节点或连线包含非标字符，系统已自动宽容自愈渲染"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>容错自愈</span>` : ''}
          ${canToggleDirection ? `
            <button type="button" class="mermaid-tool-btn mermaid-dir-toggle-btn" title="切换排版：${isCurrentlyTD ? '当前为纵向瀑布流，点击切换为横排' : '当前为横排，点击切换为纵向瀑布流'}" aria-label="切换排版方向">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                ${isCurrentlyTD 
                  ? '<path d="M8 7l4-4 4 4M12 3v14M5 21h14"/>' 
                  : '<path d="M7 8l-4 4 4 4M3 12h14M21 5v14"/>'}
              </svg>
            </button>
          ` : ''}
          <button type="button" class="mermaid-tool-btn mermaid-fullscreen-btn" title="全屏高清查看 (点击图表亦可放大)" aria-label="全屏高清查看">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          </button>
        </div>
        ${finalSvg}
      `;
      wrapper.setAttribute('data-rendered', 'true');
      if (targetDir) {
        wrapper.setAttribute('data-direction', targetDir);
      }

      // 移动端字号防缩水保底：对于较宽的图（如时序图、复杂横向图），保底 min-width，避免强压成蚂蚁字
      const svgEl = wrapper.querySelector('svg');
      if (svgEl) {
        let vbW = 0;
        const vbAttr = svgEl.getAttribute('viewBox');
        if (vbAttr) {
          const parts = vbAttr.trim().split(/[\s,]+/).map(Number);
          if (parts.length === 4) vbW = parts[2];
        }
        if (window.innerWidth <= 768 && vbW > 450) {
          svgEl.style.minWidth = Math.min(vbW, 600) + 'px';
        }
      }

      // 绑定方向切换按钮（标准单一 click 事件，避免移动端 touchend+click 导致双重翻转复位）
      const dirBtn = wrapper.querySelector('.mermaid-dir-toggle-btn');
      if (dirBtn) {
        dirBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentDir = wrapper.getAttribute('data-direction') || targetDir;
          const nextDir = (currentDir === 'TD' || currentDir === 'TB') ? 'LR' : 'TD';
          renderSingleMermaidChart(wrapper, nextDir);
        });
      }

      // 绑定全屏按钮（标准单一 click 事件）
      const fullscreenBtn = wrapper.querySelector('.mermaid-fullscreen-btn');
      if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const curSvg = wrapper.querySelector('svg');
          if (curSvg) openMermaidLightbox(curSvg.outerHTML);
        });
      }

      // 绑定图表主体点击全屏查看（只绑定一次）
      if (!wrapper.__mermaidClickBound) {
        wrapper.__mermaidClickBound = true;
        wrapper.addEventListener('click', (e) => {
          // 如果点击的是节点内部可能存在的外部链接超链接，放行跳转
          if (e.target.closest('a')) return;
          // 如果点击的是工具栏或自愈提示，不触发全屏
          if (e.target.closest('.mermaid-toolbar')) return;
          // 如果用户正在划词选择文本，不误触发全屏
          const selection = window.getSelection();
          if (selection && selection.toString().trim().length > 0) return;
          const curSvg = wrapper.querySelector('svg');
          if (curSvg) openMermaidLightbox(curSvg.outerHTML);
        });
      }
    } else {
      // 降级兜底显示
      const errMsg = renderError ? (renderError.message || String(renderError)) : '未知解析错误';
      wrapper.innerHTML = `
        <div style="width:100%;font-size:12px;color:var(--text-secondary);background:var(--bg-surface-hover);padding:14px;border-radius:var(--radius-md);border:1px solid var(--border-default);">
          <div style="font-weight:600;margin-bottom:6px;color:#f59e0b;display:flex;align-items:center;gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>架构图存在严重语法错误，已降级源码显示：</span>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;font-family:var(--font-mono);">${escapeHtml(errMsg.split('\n')[0])}</div>
          <pre style="margin:0;background:transparent;border:none;padding:0;font-size:11.5px;color:var(--text-muted);overflow-x:auto;">${escapeHtml(rawCode)}</pre>
        </div>
      `;
      wrapper.setAttribute('data-rendered', 'true');
    }
  }

  // ==========================================================================
  // 本页大纲 (TOC) 多层级快速收缩与精准导轨控制器
  // 需求规范：手机版默认选 1 级，电脑版默认选 2 级
  // ==========================================================================
  let currentDesktopTocLevel = localStorage.getItem('doc_lens_toc_level_desktop') || '2';
  let currentMobileTocLevel = localStorage.getItem('doc_lens_toc_level_mobile') || '1';

  function initTocLevelControl() {
    if (el.tocLevelCtrl) {
      el.tocLevelCtrl.addEventListener('click', (e) => {
        const btn = e.target.closest('.toc-level-btn');
        if (!btn) return;
        const targetLevel = btn.getAttribute('data-level');
        applyDesktopTocLevel(targetLevel);
      });
    }
    if (el.mobileTocLevelCtrl) {
      el.mobileTocLevelCtrl.addEventListener('click', (e) => {
        const btn = e.target.closest('.toc-level-btn');
        if (!btn) return;
        const targetLevel = btn.getAttribute('data-level');
        applyMobileTocLevel(targetLevel);
      });
    }

    // 初始化应用各自默认/记忆层级
    applyDesktopTocLevel(currentDesktopTocLevel);
    applyMobileTocLevel(currentMobileTocLevel);
  }

  function applyDesktopTocLevel(level) {
    currentDesktopTocLevel = level || '2';
    try { localStorage.setItem('doc_lens_toc_level_desktop', currentDesktopTocLevel); } catch (e) {}

    // 1. 同步更新电脑端收缩控制按钮的 active 状态
    if (el.tocLevelCtrl) {
      el.tocLevelCtrl.querySelectorAll('.toc-level-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-level') === currentDesktopTocLevel);
      });
    }

    // 2. 更新桌面端 TOC 列表容器的 CSS 过滤类
    if (el.tocList) {
      el.tocList.classList.remove('toc-filter-1', 'toc-filter-2');
      if (currentDesktopTocLevel === '1') {
        el.tocList.classList.add('toc-filter-1');
      } else if (currentDesktopTocLevel === '2') {
        el.tocList.classList.add('toc-filter-2');
      }
    }

    // 3. 收缩后重新校验当前高亮位置
    const activeLink = el.tocList?.querySelector('.toc-link.active');
    if (activeLink) {
      const id = activeLink.getAttribute('href')?.replace('#', '');
      if (id) highlightTocLink(id);
    }
  }

  function applyMobileTocLevel(level) {
    currentMobileTocLevel = level || '1';
    try { localStorage.setItem('doc_lens_toc_level_mobile', currentMobileTocLevel); } catch (e) {}

    // 1. 同步更新移动端收缩控制按钮的 active 状态
    if (el.mobileTocLevelCtrl) {
      el.mobileTocLevelCtrl.querySelectorAll('.toc-level-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-level') === currentMobileTocLevel);
      });
    }

    // 2. 更新移动端 TOC 列表容器的 CSS 过滤类
    if (el.mobileTocList) {
      el.mobileTocList.classList.remove('toc-filter-1', 'toc-filter-2');
      if (currentMobileTocLevel === '1') {
        el.mobileTocList.classList.add('toc-filter-1');
      } else if (currentMobileTocLevel === '2') {
        el.mobileTocList.classList.add('toc-filter-2');
      }
    }

    // 3. 收缩后重新校验当前高亮位置
    const activeLink = el.mobileTocList?.querySelector('.mobile-toc-link.active');
    if (activeLink) {
      const id = activeLink.getAttribute('href')?.replace('#', '');
      if (id) highlightTocLink(id);
    }
  }

  function applyTocLevelFilter(level) {
    if (level) {
      applyDesktopTocLevel(level);
      applyMobileTocLevel(level);
    } else {
      applyDesktopTocLevel(currentDesktopTocLevel);
      applyMobileTocLevel(currentMobileTocLevel);
    }
  }

  function highlightTocLink(activeId) {
    if (!activeId) return;

    // 桌面端高亮与智能冒泡
    if (el.tocList) {
      const allItems = Array.from(el.tocList.querySelectorAll('.toc-item'));
      const allLinks = el.tocList.querySelectorAll('.toc-link');
      allLinks.forEach(l => l.classList.remove('active'));

      const targetItem = el.tocList.querySelector(`.toc-item a[href="#${activeId}"]`)?.closest('.toc-item');
      if (targetItem) {
        let itemToHighlight = targetItem;
        // 若当前项在当前收缩层级下不可见，向上回溯最近的一个可见父级章节
        if (itemToHighlight.offsetParent === null) {
          const idx = allItems.indexOf(targetItem);
          for (let i = idx - 1; i >= 0; i--) {
            if (allItems[i].offsetParent !== null) {
              itemToHighlight = allItems[i];
              break;
            }
          }
        }
        if (itemToHighlight) {
          const activeLink = itemToHighlight.querySelector('.toc-link');
          if (activeLink) activeLink.classList.add('active');
        }
      }
    }

    // 移动端独立判断高亮与智能冒泡
    if (el.mobileTocList) {
      const allMobileItems = Array.from(el.mobileTocList.querySelectorAll('.mobile-toc-item'));
      const allMobileLinks = el.mobileTocList.querySelectorAll('.mobile-toc-link');
      allMobileLinks.forEach(l => l.classList.remove('active'));

      const targetMobileItem = el.mobileTocList.querySelector(`.mobile-toc-item a[href="#${activeId}"]`)?.closest('.mobile-toc-item');
      if (targetMobileItem) {
        let mobileItemToHighlight = targetMobileItem;
        if (mobileItemToHighlight.offsetParent === null) {
          const mIdx = allMobileItems.indexOf(targetMobileItem);
          for (let i = mIdx - 1; i >= 0; i--) {
            if (allMobileItems[i].offsetParent !== null) {
              mobileItemToHighlight = allMobileItems[i];
              break;
            }
          }
        }
        if (mobileItemToHighlight) {
          const mLink = mobileItemToHighlight.querySelector('.mobile-toc-link');
          if (mLink) mLink.classList.add('active');
        }
      }
    }
  }

  function generateTOC() {
    let headings = Array.from(el.articleBody.querySelectorAll('h2, h3, h4'));
    if (headings.length === 0) {
      headings = Array.from(el.articleBody.querySelectorAll('h1'));
    }

    el.tocList.innerHTML = '';
    el.mobileTocList.innerHTML = '';

    if (headings.length === 0) {
      if (el.tocLevelCtrl) el.tocLevelCtrl.style.display = 'none';
      if (el.mobileTocLevelCtrl) el.mobileTocLevelCtrl.style.display = 'none';
      el.tocList.innerHTML = '<li class="toc-item" style="color:var(--text-muted);font-size:12px;padding:8px 4px;">本文无层级章节标题</li>';
      el.mobileTocList.innerHTML = '<li class="toc-item" style="color:var(--text-muted);font-size:14px;padding:12px;">本文无章节标题</li>';
      return;
    }

    // 统计文中实际出现的标题级别（如 ['h2', 'h3', 'h4']）
    const uniqueTags = Array.from(new Set(headings.map(h => h.tagName.toLowerCase()))).sort();
    const hasMultiLevels = uniqueTags.length > 1;

    // 仅当文章存在多级章节时，才显示快速收缩控制器，避免无意义的按钮干扰
    if (el.tocLevelCtrl) {
      el.tocLevelCtrl.style.display = hasMultiLevels ? 'inline-flex' : 'none';
    }
    if (el.mobileTocLevelCtrl) {
      el.mobileTocLevelCtrl.style.display = hasMultiLevels ? 'inline-flex' : 'none';
    }

    const fragment = document.createDocumentFragment();
    const mobileFragment = document.createDocumentFragment();

    headings.forEach((h, idx) => {
      const id = 'heading-' + idx;
      h.id = id;
      const tag = h.tagName.toLowerCase();
      const text = h.textContent.trim();

      // 计算相对层级 (1 = 最高大章节, 2 = 二级章节, 3 = 更深层级)
      const tagIdx = uniqueTags.indexOf(tag);
      const level = tagIdx === 0 ? '1' : (tagIdx === 1 ? '2' : '3');

      const li = document.createElement('li');
      li.className = `toc-item ${tag}`;
      li.setAttribute('data-level', level);

      const a = document.createElement('a');
      a.className = 'toc-link';
      a.href = '#' + id;
      a.textContent = text;
      a.title = text;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth' });
      });
      li.appendChild(a);
      fragment.appendChild(li);

      const mLi = document.createElement('li');
      mLi.className = `mobile-toc-item ${tag}`;
      mLi.setAttribute('data-level', level);

      const mA = document.createElement('a');
      mA.className = 'mobile-toc-link';
      mA.href = '#' + id;
      mA.textContent = text;
      mA.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(el.mobileTocModal);
        h.scrollIntoView({ behavior: 'smooth' });
      });
      mLi.appendChild(mA);
      mobileFragment.appendChild(mLi);
    });

    el.tocList.appendChild(fragment);
    el.mobileTocList.appendChild(mobileFragment);

    // 默认或保持当前收缩/展开层级设置：电脑端默认 2 级，手机端默认 1 级
    applyDesktopTocLevel(currentDesktopTocLevel);
    applyMobileTocLevel(currentMobileTocLevel);

    setupScrollSpy(headings);
  }

  // ==========================================================================
  // 主页模式专属“本页导航”体系 (第一部分：最近阅读，第二部分：章节导航，第三部分：快速切换知识库空间树)
  // ==========================================================================
  function buildHomeToc(lastRead, recentDocs, chapters, currentRepo, repos) {
    if (!el.tocList || !el.mobileTocList) return;

    el.tocList.innerHTML = '';
    el.mobileTocList.innerHTML = '';

    // 主页具有多级大纲（1级主模块，2级子章节与空间树分支），开启快速层级收缩控制器
    if (el.tocLevelCtrl) el.tocLevelCtrl.style.display = 'inline-flex';
    if (el.mobileTocLevelCtrl) el.mobileTocLevelCtrl.style.display = 'inline-flex';

    const desktopFrag = document.createDocumentFragment();
    const mobileFrag = document.createDocumentFragment();

    function createHomeTocNode(text, href, level, iconSvg, onClick) {
      const tag = level === '1' ? 'h2' : 'h3';

      // 1. 桌面端导航节点
      const li = document.createElement('li');
      li.className = `toc-item ${tag}`;
      li.setAttribute('data-level', level);

      const a = document.createElement('a');
      a.className = 'toc-link';
      a.href = href;
      a.title = text;
      a.innerHTML = `${iconSvg ? `<span class="toc-icon" style="margin-right:6px;display:inline-flex;align-items:center;vertical-align:-1px;">${iconSvg}</span>` : ''}<span>${escapeHtml(text)}</span>`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (onClick) {
          onClick();
        } else {
          scrollToAnchor(href);
        }
      });
      li.appendChild(a);
      desktopFrag.appendChild(li);

      // 2. 移动端抽屉导航节点
      const mLi = document.createElement('li');
      mLi.className = `mobile-toc-item ${tag}`;
      mLi.setAttribute('data-level', level);

      const mA = document.createElement('a');
      mA.className = 'mobile-toc-link';
      mA.href = href;
      mA.title = text;
      mA.innerHTML = `${iconSvg ? `<span class="toc-icon" style="margin-right:8px;display:inline-flex;align-items:center;vertical-align:-1px;">${iconSvg}</span>` : ''}<span>${escapeHtml(text)}</span>`;
      mA.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(el.mobileTocModal);
        if (onClick) {
          onClick();
        } else {
          scrollToAnchor(href);
        }
      });
      mLi.appendChild(mA);
      mobileFrag.appendChild(mLi);
    }

    // ====== 第一部分：最近阅读与动态 ======
    createHomeTocNode(
      '最近阅读与动态',
      '#homeSectionRecent',
      '1',
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
    );
    if (lastRead) {
      createHomeTocNode(
        `上次读到: ${lastRead.name}`,
        '#welcomeLastReadCard',
        '2',
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
        () => {
          const card = document.getElementById('welcomeLastReadCard');
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      );
    }
    createHomeTocNode(
      `最新更新 (${recentDocs ? recentDocs.length : 0} 篇)`,
      '#homeSectionRecent',
      '2',
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
      () => {
        const sec = document.getElementById('homeSectionRecent');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    );

    // ====== 第二部分：对外公开分享管理中心 ======
    createHomeTocNode(
      '公开分享管理',
      '#homeSectionShares',
      '1',
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
      () => {
        openSharesHub();
      }
    );

    // ====== 第三部分：知识库章节导航 ======
    createHomeTocNode(
      '知识库章节导航',
      '#homeSectionChapters',
      '1',
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>'
    );
    if (chapters && chapters.length > 0) {
      chapters.forEach((ch, idx) => {
        createHomeTocNode(
          `${ch.name} (${ch.docs.length}篇)`,
          `#chapter-card-${idx}`,
          '2',
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
          () => {
            const card = document.getElementById(`chapter-card-${idx}`);
            if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              card.style.transition = 'box-shadow 0.3s, border-color 0.3s';
              card.style.borderColor = 'var(--accent-color)';
              card.style.boxShadow = '0 0 0 2px var(--accent-color)';
              setTimeout(() => {
                card.style.borderColor = '';
                card.style.boxShadow = '';
              }, 1200);
            }
          }
        );
      });
    }

    // ====== 第三部分：快速切换知识库 (空间树体系) ======
    createHomeTocNode(
      '快速切换知识库 (空间树)',
      '#homeSectionRepos',
      '1',
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>'
    );
    if (repos && repos.length > 0) {
      repos.forEach(r => {
        const isCurrent = currentRepo && r.ID === currentRepo.ID;
        const label = isCurrent ? `${r.Name} (当前空间)` : r.Name;
        createHomeTocNode(
          label,
          '#homeSectionRepos',
          '2',
          isCurrent
            ? '<span style="color:#10b981;font-size:11px;">●</span>'
            : '<span style="color:var(--text-muted);font-size:11px;">○</span>',
          async () => {
            if (isCurrent) {
              const sec = document.getElementById('homeSectionRepos');
              if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              await selectRepo(r.ID, false);
              state.currentDoc = null;
              state.currentPath = r.RoutePrefix || '/';
              try { window.history.pushState(null, '', r.RoutePrefix || '/'); } catch (_) {}
              renderWelcomeDashboard();
              if (el.contentArea) el.contentArea.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
        );
      });
    }

    el.tocList.appendChild(desktopFrag);
    el.mobileTocList.appendChild(mobileFrag);

    // 应用层级：电脑端默认 2 级，手机端默认 1 级
    applyDesktopTocLevel(currentDesktopTocLevel);
    applyMobileTocLevel(currentMobileTocLevel);

    // 默认高亮首项
    highlightTocLink('homeSectionRecent');

    // 关联 ScrollSpy 导轨跟踪
    const spyTargets = [];
    const secRecent = document.getElementById('homeSectionRecent');
    if (secRecent) spyTargets.push(secRecent);
    const lastCard = document.getElementById('welcomeLastReadCard');
    if (lastCard) spyTargets.push(lastCard);
    const secChapters = document.getElementById('homeSectionChapters');
    if (secChapters) spyTargets.push(secChapters);
    if (chapters && chapters.length > 0) {
      chapters.forEach((_, idx) => {
        const cCard = document.getElementById(`chapter-card-${idx}`);
        if (cCard) spyTargets.push(cCard);
      });
    }
    const secRepos = document.getElementById('homeSectionRepos');
    if (secRepos) spyTargets.push(secRepos);

    if (spyTargets.length > 0) {
      setupScrollSpy(spyTargets);
    }
  }

  function setupScrollSpy(headings) {
    if (scrollSpyObserver) {
      scrollSpyObserver.disconnect();
    }

    scrollSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          highlightTocLink(id);
        }
      });
    }, { rootMargin: '0px 0px -70% 0px' });

    headings.forEach(h => scrollSpyObserver.observe(h));
  }

  function renderHtmlDoc(path, content) {
    el.tocList.innerHTML = '';
    el.mobileTocList.innerHTML = '';
    if (el.tocLevelCtrl) el.tocLevelCtrl.style.display = 'none';
    if (el.mobileTocLevelCtrl) el.mobileTocLevelCtrl.style.display = 'none';
    const rawUrl = '/raw' + path;
    el.articleBody.innerHTML = `
      <div style="margin-bottom:14px;display:flex;gap:10px;">
        <button class="btn btn-primary" id="viewRenderBtn">🌐 安全沙箱预览</button>
        <button class="btn" id="viewSourceBtn">💻 查看网页源码</button>
      </div>
      <div id="htmlContainer">
        <iframe src="${rawUrl}" sandbox="allow-scripts allow-forms" style="width:100%;height:75vh;border:1px solid var(--border-default);border-radius:var(--radius-md);background:#ffffff;"></iframe>
      </div>
    `;

    document.getElementById('viewRenderBtn').addEventListener('click', () => {
      document.getElementById('htmlContainer').innerHTML = `<iframe src="${rawUrl}" sandbox="allow-scripts allow-forms" style="width:100%;height:75vh;border:1px solid var(--border-default);border-radius:var(--radius-md);background:#ffffff;"></iframe>`;
      document.getElementById('viewRenderBtn').className = 'btn btn-primary';
      document.getElementById('viewSourceBtn').className = 'btn';
    });

    document.getElementById('viewSourceBtn').addEventListener('click', () => {
      document.getElementById('htmlContainer').innerHTML = `<pre style="max-height:75vh;"><code class="language-html">${escapeHtml(content)}</code></pre>`;
      if (window.Prism) Prism.highlightAll();
      document.getElementById('viewSourceBtn').className = 'btn btn-primary';
      document.getElementById('viewRenderBtn').className = 'btn';
    });
  }

  function renderCodeDoc(content, path) {
    el.tocList.innerHTML = '';
    el.mobileTocList.innerHTML = '';
    if (el.tocLevelCtrl) el.tocLevelCtrl.style.display = 'none';
    if (el.mobileTocLevelCtrl) el.mobileTocLevelCtrl.style.display = 'none';
    const info = getLanguageInfo(path);
    el.articleBody.innerHTML = `
      <pre style="max-height:80vh;"><code class="language-${info.lang}">${escapeHtml(content)}</code></pre>
    `;
    enhanceCodeBlocksAsync(false);
  }

  function openAiTaskModal(options = {}) {
    if (state.isShareMode) return;
    const doc = options.doc || null;
    state.draftContextDoc = doc;

    // 容错兜底：确保 draftRepo 选项已填充
    if (el.draftRepo && (!el.draftRepo.options || el.draftRepo.options.length === 0)) {
      if (state.repos && state.repos.length > 0) {
        populateRepoSelect();
      } else if (typeof loadRepos === 'function') {
        loadRepos();
      }
    }

    const targetRepoId = doc ? doc.repo_id : (options.repoId || (state.currentRepo ? state.currentRepo.ID : (state.repos && state.repos[0] ? state.repos[0].ID : '')));
    if (targetRepoId && el.draftRepo) {
      el.draftRepo.value = targetRepoId;
    }
    if (el.draftRepo && !el.draftRepo.value && el.draftRepo.options && el.draftRepo.options.length > 0) {
      el.draftRepo.selectedIndex = 0;
    }
    syncDraftRepoUI(el.draftRepo ? el.draftRepo.value : targetRepoId);
    closeDraftRepoMenu();

    if (doc && (doc.rel_path || doc.path)) {
      const rel = doc.rel_path || doc.path;
      if (el.draftTargetFile) el.draftTargetFile.value = rel;
      if (el.draftDocContextPath) el.draftDocContextPath.textContent = rel;
      if (el.draftDocContextGroup) el.draftDocContextGroup.style.display = 'block';
    } else if (options.targetFile) {
      if (el.draftTargetFile) el.draftTargetFile.value = options.targetFile;
      if (el.draftDocContextPath) el.draftDocContextPath.textContent = options.targetFile;
      if (el.draftDocContextGroup) el.draftDocContextGroup.style.display = 'block';
    } else {
      if (el.draftTargetFile) el.draftTargetFile.value = '';
      if (el.draftDocContextGroup) el.draftDocContextGroup.style.display = 'none';
    }

    const defaultAction = options.defaultAction || (doc || options.targetFile ? 'append' : 'new');
    setTaskActionType(defaultAction);

    if (options.prompt && el.draftPrompt) {
      el.draftPrompt.value = options.prompt;
    } else if (el.draftPrompt) {
      el.draftPrompt.value = '';
    }

    openModal(el.aiDraftModal);
    setTimeout(() => {
      if (el.draftPrompt) el.draftPrompt.focus();
    }, 150);
  }

  function setTaskActionType(action) {
    if (!action) action = 'new';
    if (el.draftTaskType) el.draftTaskType.value = action;

    document.querySelectorAll('.task-action-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-action') === action);
    });

    const titleEl = document.getElementById('draftModalTitle');
    const titleMap = {
      new: '派发 AI 新增文档任务',
      append: '派发 AI 补充深化文章',
      modify: '派发 AI 修改重构文章',
      explain: '派发 AI 深度解剖文章'
    };
    if (titleEl) titleEl.textContent = titleMap[action] || 'AI 任务派发';

    const placeholders = {
      new: '请输入你想研究或沉淀的课题要求（例如：结合朝韩历史与粮食账本，深入剖析平壤政权韧性的核心支柱与生存实相...）',
      append: '请输入你想在当前文章中补充的论点、问答、图表、客观账本或案例...',
      modify: '请输入你想针对当前文章修改的段落、错误纠错、术语替换或重构要求...',
      explain: '针对当前文章，指出核心矛盾、客观利益账本、潜在盲点与要点总结...'
    };
    if (el.draftPrompt) {
      el.draftPrompt.placeholder = placeholders[action] || placeholders.new;
    }
  }

  function clearContextDoc() {
    state.draftContextDoc = null;
    if (el.draftTargetFile) el.draftTargetFile.value = '';
    if (el.draftDocContextGroup) el.draftDocContextGroup.style.display = 'none';
    setTaskActionType('new');
  }

  function toggleDraftRepoMenu() {
    if (!el.draftRepoMenu || !el.draftRepoTriggerBtn) return;
    const isVisible = el.draftRepoMenu.style.display !== 'none';
    if (isVisible) {
      closeDraftRepoMenu();
    } else {
      openDraftRepoMenu();
    }
  }

  function openDraftRepoMenu() {
    if (!el.draftRepoMenu || !el.draftRepoTriggerBtn) return;
    renderDraftRepoMenuList();
    el.draftRepoMenu.style.display = 'flex';
    el.draftRepoTriggerBtn.classList.add('active');
    el.draftRepoTriggerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDraftRepoMenu() {
    if (!el.draftRepoMenu || !el.draftRepoTriggerBtn) return;
    el.draftRepoMenu.style.display = 'none';
    el.draftRepoTriggerBtn.classList.remove('active');
    el.draftRepoTriggerBtn.setAttribute('aria-expanded', 'false');
  }

  function selectDraftRepo(repoId) {
    if (!repoId) return;
    if (el.draftRepo) {
      const prevVal = el.draftRepo.value;
      el.draftRepo.value = repoId;
      if (prevVal !== repoId) {
        el.draftRepo.dispatchEvent(new Event('change'));
      }
    }
    syncDraftRepoUI(repoId);
    closeDraftRepoMenu();
  }

  function syncDraftRepoUI(selectedRepoId) {
    if (!state.repos || state.repos.length === 0) return;
    const repo = state.repos.find(r => r.ID === selectedRepoId) || state.repos[0];
    if (!repo) return;

    if (el.draftRepoSelectedName) {
      el.draftRepoSelectedName.textContent = repo.Name;
    }
    if (el.draftRepoSelectedPrefix) {
      el.draftRepoSelectedPrefix.textContent = repo.RoutePrefix || '';
      el.draftRepoSelectedPrefix.style.display = repo.RoutePrefix ? 'inline-block' : 'none';
    }
    if (el.draftRepoSelectedDesc) {
      el.draftRepoSelectedDesc.textContent = repo.Description || '目标工作知识库';
    }
  }

  function renderDraftRepoMenuList() {
    if (!el.draftRepoMenuList || !state.repos) return;
    el.draftRepoMenuList.innerHTML = '';
    const currentVal = (el.draftRepo && el.draftRepo.value) || (state.currentRepo ? state.currentRepo.ID : (state.repos[0] ? state.repos[0].ID : ''));

    if (el.draftRepoCount) {
      el.draftRepoCount.textContent = `共 ${state.repos.length} 个空间`;
    }

    state.repos.forEach(r => {
      const isCur = r.ID === currentVal;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `draft-repo-item ${isCur ? 'active' : ''}`;
      btn.innerHTML = `
        <div class="draft-repo-item-main">
          <span class="draft-repo-item-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </span>
          <div class="draft-repo-item-info">
            <div class="draft-repo-item-title-row">
              <span class="draft-repo-item-name">${escapeHtml(r.Name)}</span>
              ${r.RoutePrefix ? `<span class="draft-repo-item-prefix">${escapeHtml(r.RoutePrefix)}</span>` : ''}
            </div>
            ${r.Description ? `<span class="draft-repo-item-desc">${escapeHtml(r.Description)}</span>` : ''}
          </div>
        </div>
        ${isCur ? '<span class="draft-repo-item-check">✓</span>' : ''}
      `;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectDraftRepo(r.ID);
      });
      el.draftRepoMenuList.appendChild(btn);
    });
  }

  async function handleDraftSubmit(e) {
    e.preventDefault();
    const prompt = el.draftPrompt.value.trim();
    const repoID = el.draftRepo.value;
    const taskType = (el.draftTaskType && el.draftTaskType.value) || 'new';
    const targetFile = (el.draftTargetFile && el.draftTargetFile.value.trim()) || '';

    if (!prompt) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: taskType,
          repo_id: repoID,
          target_file: targetFile,
          prompt: prompt
        })
      });
      if (!res.ok) {
        const err = await res.json();
        alert('提交任务失败: ' + (err.error || '未知错误'));
        return;
      }
      const task = await res.json();
      closeModal(el.aiDraftModal);
      el.draftPrompt.value = '';
      openTaskCenter();
      inspectTask(task.id || task.ID);
    } catch (err) {
      alert('网络请求失败，请检查服务状态');
    }
  }

  function openTaskCenter() {
    openModal(el.taskCenterModal);
    loadTasks();
  }

  async function loadTasks() {
    try {
      const res = await fetch('/api/tasks?limit=100');
      if (!res.ok) return;
      state.tasks = await res.json();
      renderTaskList();

      const hasRunning = state.tasks.some(t => t.status === 'running' || t.status === 'queued');
      if (el.aiTaskBtn) {
        el.aiTaskBtn.classList.toggle('running', hasRunning);
      }
    } catch (e) {}
  }

  function renderTaskList() {
    el.taskList.innerHTML = '';
    if (state.tasks.length === 0) {
      el.taskList.innerHTML = '<div style="padding:18px;color:var(--text-muted);font-size:12.5px;text-align:center;">暂无运行中的任务</div>';
      return;
    }

    state.tasks.forEach(t => {
      const item = document.createElement('div');
      item.className = 'terminal-task-item';
      const taskId = t.id || t.ID;
      if (taskId === state.activeTaskId) {
        item.classList.add('active');
      }

      const statusMap = {
        queued: '<span style="color:#f59e0b;">⏳ 排队中</span>',
        running: '<span style="color:#3b82f6;">⚡ 正在执行</span>',
        completed: '<span style="color:#10b981;">✅ 已完成</span>',
        failed: '<span style="color:#ef4444;">❌ 失败</span>'
      };

      const hasOutputFile = t.output_file && t.status === 'completed';

      item.innerHTML = `
        <div class="terminal-task-status-row">
          <span class="task-status-badge">${statusMap[t.status] || t.status}</span>
          <span class="task-time-str">${new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="terminal-task-prompt" title="${escapeHtml(t.full_prompt || t.prompt)}">${escapeHtml(t.prompt)}</div>
        ${hasOutputFile ? `
          <div class="terminal-task-jump-row">
            <button type="button" class="btn btn-primary btn-task-jump-doc" data-jump-file="${escapeHtml(t.output_file)}">
              📖 立即打开文档 ➔
            </button>
          </div>
        ` : ''}
        ${t.status === 'failed' ? `
          <div class="terminal-task-fail-row">
            <button type="button" class="btn btn-task-retry-doc btn-card-retry" data-retry-id="${taskId}">
              🔄 重试
            </button>
            <button type="button" class="btn btn-task-retry-doc btn-card-edit" data-edit-id="${taskId}">
              ✏️ 编辑
            </button>
          </div>
        ` : ''}
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.btn-task-jump-doc')) return;
        if (e.target.closest('.btn-card-retry')) return;
        if (e.target.closest('.btn-card-edit')) return;
        document.querySelectorAll('.terminal-task-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        inspectTask(taskId);
      });

      const jumpBtn = item.querySelector('.btn-task-jump-doc');
      if (jumpBtn) {
        jumpBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetUrl = jumpBtn.getAttribute('data-jump-file');
          if (targetUrl) {
            closeAllModals();
            invalidateDocCache(targetUrl);
            routeTo(targetUrl, true);
          }
        });
      }

      const cardRetryBtn = item.querySelector('.btn-card-retry');
      if (cardRetryBtn) {
        cardRetryBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          retryTask(taskId);
        });
      }

      const cardEditBtn = item.querySelector('.btn-card-edit');
      if (cardEditBtn) {
        cardEditBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          editAndRetryTask(taskId);
        });
      }

      el.taskList.appendChild(item);
    });

    if (!state.activeTaskId && state.tasks.length > 0) {
      inspectTask(state.tasks[0].id || state.tasks[0].ID);
    }
  }

  function inspectTask(taskId) {
    state.activeTaskId = taskId;
    if (state.taskLogTimer) clearInterval(state.taskLogTimer);

    if (window.innerWidth <= 640) {
      const layoutBody = document.querySelector('.terminal-layout-body');
      if (layoutBody) layoutBody.classList.add('show-log');
      const tabs = document.querySelectorAll('.terminal-tab');
      tabs.forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-tab') === 'log');
      });
    }

    const task = state.tasks.find(t => (t.id || t.ID) === taskId);
    if (task) {
      el.activeTaskMeta.innerHTML = `
        <span style="font-weight:600;color:var(--text-primary);">[${(task.type || 'TASK').toUpperCase()}]</span>
        <span>ID: ${taskId.substring(0, 8)}</span>
        <span>仓库: ${escapeHtml(task.repo_id)}</span>
      `;
      renderActiveTaskActions(task);
    }

    fetchTaskLogs(taskId);
    state.taskLogTimer = setInterval(() => {
      fetchTaskLogs(taskId);
    }, 2000);
  }

  function renderActiveTaskActions(task) {
    if (!el.activeTaskActions || !task) return;
    const taskId = task.id || task.ID;

    if (task.output_file && task.status === 'completed') {
      el.activeTaskActions.innerHTML = `
        <button class="btn btn-primary" id="openGeneratedFileBtn" style="padding:4px 12px;font-size:12px;display:flex;align-items:center;gap:6px;">
          <span>📖 立即打开文档 ➔</span>
        </button>
      `;
      const openBtn = document.getElementById('openGeneratedFileBtn');
      if (openBtn) {
        openBtn.addEventListener('click', () => {
          closeAllModals();
          invalidateDocCache(task.output_file);
          routeTo(task.output_file, true);
        });
      }
    } else if (task.status === 'failed') {
      el.activeTaskActions.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="retryTaskBtn" style="padding:4px 12px;font-size:12px;display:flex;align-items:center;gap:6px;">
            <span>🔄 一键重试</span>
          </button>
          <button class="btn" id="editRetryTaskBtn" style="padding:4px 12px;font-size:12px;display:flex;align-items:center;gap:6px;">
            <span>✏️ 载入并重新编辑</span>
          </button>
        </div>
      `;
      const retryBtn = document.getElementById('retryTaskBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => retryTask(taskId));
      }
      const editBtn = document.getElementById('editRetryTaskBtn');
      if (editBtn) {
        editBtn.addEventListener('click', () => editAndRetryTask(taskId));
      }
    } else {
      el.activeTaskActions.innerHTML = '';
    }
  }

  async function retryTask(taskId) {
    const retryBtn = document.getElementById('retryTaskBtn');
    if (retryBtn) {
      retryBtn.disabled = true;
      retryBtn.innerHTML = '<span>⏳ 正在重试...</span>';
    }
    document.querySelectorAll(`.btn-card-retry[data-retry-id="${taskId}"]`).forEach(btn => {
      btn.disabled = true;
      btn.textContent = '⏳ 重试中...';
    });

    try {
      const res = await fetch(`/api/tasks/${taskId}/retry`, {
        method: 'POST'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('重试任务失败: ' + (err.error || '未知错误'));
        if (retryBtn) {
          retryBtn.disabled = false;
          retryBtn.innerHTML = '<span>🔄 一键重试</span>';
        }
        await loadTasks();
        return;
      }
      const newTask = await res.json();
      await loadTasks();
      inspectTask(newTask.id || newTask.ID);
    } catch (e) {
      alert('重试网络请求失败，请检查服务状态');
      if (retryBtn) {
        retryBtn.disabled = false;
        retryBtn.innerHTML = '<span>🔄 一键重试</span>';
      }
      await loadTasks();
    }
  }

  async function editAndRetryTask(taskId) {
    let task = state.tasks.find(t => (t.id || t.ID) === taskId);
    if (!task) return;

    if (!task.full_prompt) {
      try {
        const res = await fetch(`/api/tasks/${taskId}`);
        if (res.ok) {
          const detail = await res.json();
          task = { ...task, ...detail };
        }
      } catch (e) {}
    }

    closeAllModals();

    const prompt = task.full_prompt || task.Prompt || task.prompt || '';
    const repoId = task.repo_id || task.RepoID || '';
    const targetFile = task.target_file || task.TargetFile || '';
    const type = task.type || task.Type || 'new';

    openAiTaskModal({
      repoId: repoId,
      targetFile: targetFile,
      defaultAction: type,
      prompt: prompt
    });
  }

  async function fetchTaskLogs(taskId) {
    try {
      const res = await fetch(`/api/tasks/${taskId}/logs?tail=40000`);
      if (res.ok && el.taskLogArea) {
        const text = await res.text();
        el.taskLogArea.textContent = text || '等待子进程实时输出流...';
        el.taskLogArea.scrollTop = el.taskLogArea.scrollHeight;
      }
      const taskRes = await fetch(`/api/tasks/${taskId}`);
      if (taskRes.ok) {
        const task = await taskRes.json();
        if (task.status === 'completed' || task.status === 'failed') {
          if (state.taskLogTimer) {
            clearInterval(state.taskLogTimer);
            state.taskLogTimer = null;
          }
          loadTasks();

          if ((task.id || task.ID) === state.activeTaskId) {
            renderActiveTaskActions(task);
          }

          if (task.status === 'completed') {
            const rId = task.repo_id || task.RepoID;
            if (rId && state.currentRepo && state.currentRepo.ID === rId) {
              loadTree(rId, true);
              loadRecentCreated(rId);
            }
          }
        }
      }
    } catch (e) {}
  }

  /* ==========================================================================
     文章语音朗读播客控制器 (Audio Overview / TTS)
     ========================================================================== */
  const audioState = {
    audio: null,
    currentDoc: null,
    voice: localStorage.getItem('doc_lens_tts_voice') || 'zh-CN-YunyangNeural',
    speed: parseFloat(localStorage.getItem('doc_lens_tts_speed') || '1.0'),
    isGenerating: false,
    isPlaying: false,
    queue: { current_id: '', items: [] },
    queueItem: null,
    restorePosition: 0,
    lastProgressSave: 0
  };

  function initAudioPlayer() {
    el.docAudioBar = document.getElementById('docAudioBar');
    el.audioPlayToggleBtn = document.getElementById('audioPlayToggleBtn');
    el.audioPlayIcon = document.getElementById('audioPlayIcon');
    el.audioTrackTitle = document.getElementById('audioTrackTitle');
    el.audioCurrentTime = document.getElementById('audioCurrentTime');
    el.audioDuration = document.getElementById('audioDuration');
    el.audioStatusPill = document.getElementById('audioStatusPill');
    el.audioProgressSlider = document.getElementById('audioProgressSlider');
    el.audioVoiceSelect = document.getElementById('audioVoiceSelect');
    el.audioSpeedBtn = document.getElementById('audioSpeedBtn');
    el.audioDownloadBtn = document.getElementById('audioDownloadBtn');
    el.audioCloseBtn = document.getElementById('audioCloseBtn');
    el.audioPrevBtn = document.getElementById('audioPrevBtn');
    el.audioNextBtn = document.getElementById('audioNextBtn');
    el.listenQueueBtn = document.getElementById('listenQueueBtn');
    el.listenQueueDrawer = document.getElementById('listenQueueDrawer');
    el.listenQueueList = document.getElementById('listenQueueList');
    el.listenQueueCloseBtn = document.getElementById('listenQueueCloseBtn');
    audioState.audio = document.getElementById('globalAudioPlayer');

    if (!audioState.audio) return;

    if (el.listenQueueBtn) el.listenQueueBtn.addEventListener('click', toggleListenQueue);
    if (el.listenQueueCloseBtn) el.listenQueueCloseBtn.addEventListener('click', closeListenQueue);
    window.addEventListener('resize', positionListenQueue);
    document.addEventListener('click', (event) => {
      if (!el.listenQueueDrawer || el.listenQueueDrawer.style.display === 'none') return;
      if (el.listenQueueDrawer.contains(event.target) || (el.listenQueueBtn && el.listenQueueBtn.contains(event.target))) return;
      closeListenQueue();
    });
    if (el.audioPrevBtn) el.audioPrevBtn.addEventListener('click', () => playAdjacentQueueItem(-1));
    if (el.audioNextBtn) el.audioNextBtn.addEventListener('click', () => playAdjacentQueueItem(1));
    loadListenQueue().catch(() => {});

    // 恢复历史音色偏好
    if (el.audioVoiceSelect) {
      el.audioVoiceSelect.value = audioState.voice;
      el.audioVoiceSelect.addEventListener('change', () => {
        audioState.voice = el.audioVoiceSelect.value;
        localStorage.setItem('doc_lens_tts_voice', audioState.voice);
        if (audioState.currentDoc) {
          playDocAudio(audioState.currentDoc, true);
        }
      });
    }

    // 恢复历史倍速
    if (el.audioSpeedBtn) {
      el.audioSpeedBtn.textContent = audioState.speed + 'x';
      audioState.audio.playbackRate = audioState.speed;
      el.audioSpeedBtn.addEventListener('click', () => {
        const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
        let idx = speeds.indexOf(audioState.speed);
        idx = (idx + 1) % speeds.length;
        audioState.speed = speeds[idx];
        audioState.audio.playbackRate = audioState.speed;
        el.audioSpeedBtn.textContent = audioState.speed + 'x';
        localStorage.setItem('doc_lens_tts_speed', audioState.speed.toString());
      });
    }

    // 播放/暂停切换
    if (el.audioPlayToggleBtn) {
      el.audioPlayToggleBtn.addEventListener('click', () => {
        if (!audioState.audio.src) return;
        if (audioState.audio.paused) {
          audioState.audio.play();
        } else {
          audioState.audio.pause();
        }
      });
    }

    // 进度条拖动
    if (el.audioProgressSlider) {
      el.audioProgressSlider.addEventListener('input', () => {
        if (audioState.audio.duration) {
          const seekTime = (el.audioProgressSlider.value / 100) * audioState.audio.duration;
          el.audioCurrentTime.textContent = formatAudioTime(seekTime);
        }
      });
      el.audioProgressSlider.addEventListener('change', () => {
        if (audioState.audio.duration) {
          audioState.audio.currentTime = (el.audioProgressSlider.value / 100) * audioState.audio.duration;
        }
      });
    }

    // 音频核心事件监听
    audioState.audio.addEventListener('timeupdate', () => {
      if (!audioState.audio.duration) return;
      const pct = (audioState.audio.currentTime / audioState.audio.duration) * 100;
      el.audioProgressSlider.value = pct;
      el.audioCurrentTime.textContent = formatAudioTime(audioState.audio.currentTime);
      if (audioState.queueItem && Date.now() - audioState.lastProgressSave > 10000) {
        audioState.lastProgressSave = Date.now();
        saveListenProgress(audioState.queueItem.id, audioState.audio.currentTime, 'playing');
      }
    });

    audioState.audio.addEventListener('loadedmetadata', () => {
      el.audioDuration.textContent = formatAudioTime(audioState.audio.duration);
      audioState.audio.playbackRate = audioState.speed;
      if (audioState.restorePosition > 0 && audioState.restorePosition < audioState.audio.duration - 5) audioState.audio.currentTime = audioState.restorePosition;
      audioState.restorePosition = 0;
    });

    audioState.audio.addEventListener('play', () => {
      audioState.isPlaying = true;
      updateAudioPlayButtonUI(true);
      if (el.audioStatusPill) {
        el.audioStatusPill.textContent = '播放中';
        el.audioStatusPill.className = 'audio-status-pill playing';
      }
      const audioBtn = document.getElementById('docAudioBtn');
      if (audioBtn) audioBtn.classList.add('is-playing');
    });

    audioState.audio.addEventListener('pause', () => {
      audioState.isPlaying = false;
      updateAudioPlayButtonUI(false);
      if (el.audioStatusPill) {
        el.audioStatusPill.textContent = '已暂停';
        el.audioStatusPill.className = 'audio-status-pill';
      }
      const audioBtn = document.getElementById('docAudioBtn');
      if (audioBtn) audioBtn.classList.remove('is-playing');
      if (audioState.queueItem && !audioState.audio.ended) saveListenProgress(audioState.queueItem.id, audioState.audio.currentTime, 'paused');
    });

    audioState.audio.addEventListener('ended', async () => {
      audioState.isPlaying = false;
      updateAudioPlayButtonUI(false);
      el.audioProgressSlider.value = 0;
      el.audioCurrentTime.textContent = '00:00';
      if (el.audioStatusPill) {
        el.audioStatusPill.textContent = '已播完';
        el.audioStatusPill.className = 'audio-status-pill';
      }
      const audioBtn = document.getElementById('docAudioBtn');
      if (audioBtn) audioBtn.classList.remove('is-playing');
      if (audioState.queueItem) {
        const finishedID = audioState.queueItem.id;
        const finishedIndex = audioState.queue.items.findIndex(item => item.id === finishedID);
        const nextItem = finishedIndex >= 0 ? audioState.queue.items[finishedIndex + 1] : null;
        try {
          await fetch('/api/listen-queue?id=' + encodeURIComponent(finishedID), { method: 'DELETE' });
          audioState.queueItem = null;
          await loadListenQueue();
        } catch (e) {
          saveListenProgress(finishedID, 0, 'completed');
        }
        if (nextItem) {
          const refreshedNext = audioState.queue.items.find(item => item.id === nextItem.id) || nextItem;
          playListenItem(refreshedNext);
        }
      }
    });

    audioState.audio.addEventListener('error', () => {
      audioState.isPlaying = false;
      updateAudioPlayButtonUI(false);
      if (el.audioStatusPill) {
        el.audioStatusPill.textContent = '加载失败';
        el.audioStatusPill.className = 'audio-status-pill';
      }
    });

    // 关闭音频播放器
    if (el.audioCloseBtn) {
      el.audioCloseBtn.addEventListener('click', () => {
        if (audioState.audio) {
          audioState.audio.pause();
        }
        if (el.docAudioBar) {
          el.docAudioBar.style.display = 'none';
        }
        positionListenQueue();
        const audioBtn = document.getElementById('docAudioBtn');
        if (audioBtn) audioBtn.classList.remove('is-playing');
      });
    }
  }

  function formatAudioTime(secs) {
    if (!secs || isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function updateAudioPlayButtonUI(isPlaying) {
    if (!el.audioPlayIcon) return;
    if (isPlaying) {
      el.audioPlayIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    } else {
      el.audioPlayIcon.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    }
  }

  async function toggleDocAudio(doc) {
    if (!doc) return;
    const relPath = (doc.rel_path || doc.path || '').replace(/^\/+/, '');
    const curRelPath = audioState.currentDoc ? (audioState.currentDoc.rel_path || audioState.currentDoc.path || '').replace(/^\/+/, '') : '';
    const repoId = doc.repo_id || (state.currentRepo ? state.currentRepo.ID : '');
    const curRepoId = audioState.currentDoc ? (audioState.currentDoc.repo_id || '') : '';

    if (curRelPath === relPath && curRepoId === repoId && audioState.audio.src) {
      if (audioState.audio.paused) {
        audioState.audio.play();
      } else {
        audioState.audio.pause();
      }
      return;
    }
    playDocAudio(doc, false);
  }

  async function playDocAudio(doc, forceRegenerate) {
    if (!doc) return;
    audioState.currentDoc = doc;
    const repoId = doc.repo_id || (state.currentRepo ? state.currentRepo.ID : '');
    const relPath = (doc.rel_path || doc.path || '').replace(/^\/+/, '');
    const docTitle = relPath.split('/').pop().replace(/\.md$/i, '') || '文档音频';
    audioState.queueItem = audioState.queue.items.find(item => item.repo_id === repoId && item.path === relPath) || null;

    if (el.docAudioBar) {
      el.docAudioBar.style.display = 'block';
    }
    if (el.audioTrackTitle) {
      el.audioTrackTitle.textContent = docTitle;
      el.audioTrackTitle.title = docTitle;
    }
    if (el.audioStatusPill) {
      el.audioStatusPill.textContent = '检查中...';
      el.audioStatusPill.className = 'audio-status-pill generating';
    }
    if (el.audioPlayToggleBtn) {
      el.audioPlayToggleBtn.disabled = true;
    }

    const voice = audioState.voice;
    const audioUrl = `/api/audio?repo=${encodeURIComponent(repoId)}&path=${encodeURIComponent(relPath)}&voice=${encodeURIComponent(voice)}`;

    try {
      if (!forceRegenerate) {
        // 先检查是否有现成缓存
        const checkRes = await fetch(`${audioUrl}&check=true`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.cached) {
            startAudioPlayback(audioUrl, docTitle);
            return;
          }
        }
      }

      // 未缓存或强制切换：调用生成
      if (el.audioStatusPill) {
        el.audioStatusPill.textContent = '🎙️ 正在合成解说音频 (约2~5秒)...';
      }

      const genRes = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: repoId,
          path: relPath,
          voice: voice
        })
      });

      if (!genRes.ok) {
        const errJson = await genRes.json().catch(() => ({}));
        throw new Error(errJson.error || '合成音频失败');
      }

      const genData = await genRes.json();
      startAudioPlayback(genData.url || audioUrl, docTitle);
    } catch (err) {
      console.error('[Audio] Error synthesizing audio:', err);
      if (el.audioStatusPill) {
        el.audioStatusPill.textContent = '合成失败: ' + err.message;
        el.audioStatusPill.className = 'audio-status-pill';
      }
      if (el.audioPlayToggleBtn) {
        el.audioPlayToggleBtn.disabled = false;
      }
    }
  }

  function startAudioPlayback(url, title) {
    if (!audioState.audio) return;
    positionListenQueue();
    audioState.audio.src = url;
    audioState.audio.load();
    audioState.audio.playbackRate = audioState.speed;
    audioState.audio.play().catch(e => {
      console.warn('[Audio] Autoplay blocked or deferred:', e);
    });

    if (el.audioDownloadBtn) {
      el.audioDownloadBtn.href = url;
      el.audioDownloadBtn.download = `${title}.mp3`;
    }

    if (el.audioPlayToggleBtn) {
      el.audioPlayToggleBtn.disabled = false;
    }

    if (el.audioStatusPill) {
      el.audioStatusPill.textContent = '已就绪';
      el.audioStatusPill.className = 'audio-status-pill playing';
    }
  }

  async function loadListenQueue() {
    const res = await fetch('/api/listen-queue');
    if (!res.ok) return;
    audioState.queue = await res.json();
    const badge = document.getElementById('listenQueueCount');
    if (badge) {
      badge.textContent = audioState.queue.items.length;
      badge.style.display = audioState.queue.items.length ? 'inline-flex' : 'none';
    }
    renderListenQueue();
  }

  async function addToListenQueue(doc) {
    const repoId = doc.repo_id || (state.currentRepo ? state.currentRepo.ID : '');
    const relPath = (doc.rel_path || doc.path || '').replace(/^\/+/, '');
    const title = relPath.split('/').pop().replace(/\.md$/i, '');
    const res = await fetch('/api/listen-queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ RepoID: repoId, Path: relPath, Title: title }) });
    if (!res.ok) { alert('加入稍后听失败'); return; }
    const data = await res.json();
    await loadListenQueue();
    const btn = document.getElementById('addListenQueueBtn');
    if (btn) btn.querySelector('.btn-text-full').textContent = data.added ? '已加入' : '已在队列';
  }

  async function toggleListenQueue() {
    if (el.listenQueueDrawer && el.listenQueueDrawer.style.display !== 'none') {
      closeListenQueue();
      return;
    }
    await loadListenQueue();
    if (el.listenQueueDrawer) {
      el.listenQueueDrawer.style.display = 'flex';
      if (el.listenQueueBtn) el.listenQueueBtn.setAttribute('aria-expanded', 'true');
      positionListenQueue();
    }
  }

  function closeListenQueue() {
    if (el.listenQueueDrawer) el.listenQueueDrawer.style.display = 'none';
    if (el.listenQueueBtn) el.listenQueueBtn.setAttribute('aria-expanded', 'false');
  }

  function positionListenQueue() {
    if (!el.listenQueueDrawer || el.listenQueueDrawer.style.display === 'none') return;
    const playerVisible = el.docAudioBar && el.docAudioBar.style.display !== 'none';
    if (!playerVisible) {
      el.listenQueueDrawer.style.removeProperty('bottom');
      return;
    }
    const playerTop = el.docAudioBar.getBoundingClientRect().top;
    el.listenQueueDrawer.style.bottom = Math.max(82, window.innerHeight - playerTop + 10) + 'px';
  }

  function renderListenQueue() {
    if (!el.listenQueueList) return;
    if (!audioState.queue.items.length) {
      el.listenQueueList.innerHTML = '<div class="listen-queue-empty">队列还是空的，在文章页点击“稍后听”即可加入。</div>';
      return;
    }
    el.listenQueueList.innerHTML = audioState.queue.items.map((item, index) => `<div class="listen-queue-item ${item.id === audioState.queue.current_id ? 'active' : ''}" data-id="${escapeHtml(item.id)}"><button class="listen-item-play">${item.status === 'completed' ? '✓' : '▶'}</button><div class="listen-item-info"><strong>${escapeHtml(item.title)}</strong><small>${index + 1} · ${item.position ? '已听 ' + formatAudioTime(item.position) : '未播放'}</small></div><button class="listen-item-remove">✕</button></div>`).join('');
    el.listenQueueList.querySelectorAll('.listen-queue-item').forEach(row => {
      const item = audioState.queue.items.find(v => v.id === row.dataset.id);
      row.querySelector('.listen-item-play').addEventListener('click', () => playListenItem(item));
      row.querySelector('.listen-item-info').addEventListener('click', () => playListenItem(item));
      row.querySelector('.listen-item-remove').addEventListener('click', async () => { await fetch('/api/listen-queue?id=' + encodeURIComponent(item.id), { method: 'DELETE' }); await loadListenQueue(); });
    });
  }

  function playListenItem(item) {
    if (!item) return;
    audioState.queue.current_id = item.id;
    audioState.queueItem = item;
    audioState.restorePosition = item.position || 0;
    playDocAudio({ repo_id: item.repo_id, rel_path: item.path, path: item.path }, false);
    renderListenQueue();
  }

  function playAdjacentQueueItem(direction) {
    const items = audioState.queue.items || [];
    if (!items.length) return;
    let index = items.findIndex(item => item.id === (audioState.queueItem && audioState.queueItem.id));
    if (index < 0) index = items.findIndex(item => item.id === audioState.queue.current_id);
    const next = index + direction;
    if (next >= 0 && next < items.length) playListenItem(items[next]);
  }

  function saveListenProgress(id, position, status) {
    if (!id) return;
    const item = audioState.queue.items.find(v => v.id === id);
    if (item) { item.position = position; item.status = status; audioState.queue.current_id = id; }
    fetch('/api/listen-progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, position, status }), keepalive: true }).catch(() => {});
  }

  // =========================================================================
  // 单篇文档对外免密只读分享模块 (Document Sharing & Reader Mode - 极简单一分享架构)
  // =========================================================================

  let currentShareTargetDoc = null;
  let currentDocActiveShare = null;

  function generateRandomPasscode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async function openShareModal(doc) {
    if (!doc) return;
    currentShareTargetDoc = doc;
    currentDocActiveShare = null;

    const title = doc.name ? cleanDocTitle(doc.name) : (doc.title || (doc.path ? doc.path.split('/').pop() : '未命名文档'));
    if (el.shareModalDocTitle) el.shareModalDocTitle.textContent = title;
    if (el.shareModalDocPath) el.shareModalDocPath.textContent = doc.rel_path || doc.path || '';

    // 重置未分享面板初始值
    if (el.newShareExpireSelect) el.newShareExpireSelect.value = '7';
    if (el.newShareEnablePass) el.newShareEnablePass.checked = false;
    if (el.newSharePassWrap) el.newSharePassWrap.style.display = 'none';
    if (el.newSharePassInput) el.newSharePassInput.value = '';
    if (el.activeSharePassDrawer) el.activeSharePassDrawer.style.display = 'none';

    // 默认隐藏活跃卡片，等待异步拉取状态
    if (el.shareActivePanel) el.shareActivePanel.style.display = 'none';
    if (el.shareCreatePanel) el.shareCreatePanel.style.display = 'none';

    openModal(el.shareDocModal);

    // 查询当前文档生效分享
    const repoId = doc.repo_id || (state.currentRepo ? state.currentRepo.ID : '');
    const relPath = (doc.rel_path || doc.path || '').replace(/^\/+/, '');
    await loadCurrentDocShare(repoId, relPath);
  }

  async function loadCurrentDocShare(repoId, relPath) {
    try {
      const cleanRel = (relPath || '').replace(/^\/+/, '');
      const res = await fetch(`/api/shares?repo=${encodeURIComponent(repoId)}&path=${encodeURIComponent(cleanRel)}`);
      if (!res.ok) {
        currentDocActiveShare = null;
        renderActiveSharePanel(null);
        return;
      }
      const data = await res.json();
      currentDocActiveShare = data.share || null;
      renderActiveSharePanel(currentDocActiveShare);
    } catch (e) {
      currentDocActiveShare = null;
      renderActiveSharePanel(null);
    }
  }

  function renderActiveSharePanel(share) {
    if (!share) {
      if (el.shareActivePanel) el.shareActivePanel.style.display = 'none';
      if (el.shareCreatePanel) el.shareCreatePanel.style.display = 'flex';
      return;
    }

    if (el.shareCreatePanel) el.shareCreatePanel.style.display = 'none';
    if (el.shareActivePanel) el.shareActivePanel.style.display = 'flex';

    const shareUrl = `${window.location.origin}/s/${share.id}`;
    if (el.shareActiveUrlInput) el.shareActiveUrlInput.value = shareUrl;
    if (el.shareViewCounter) el.shareViewCounter.textContent = `${share.view_count || 0} 次浏览`;

    // 格式化有效期选择框与描述
    const now = Math.floor(Date.now() / 1000);
    const isExpired = share.expires_at > 0 && now > share.expires_at;
    const isDisabled = !!share.disabled;

    if (el.shareLiveDot) {
      if (isDisabled) el.shareLiveDot.className = 'disabled-dot';
      else if (isExpired) el.shareLiveDot.className = 'expired-dot';
      else el.shareLiveDot.className = 'live-dot';
    }
    if (el.shareLiveText) {
      if (isDisabled) el.shareLiveText.textContent = '已关闭 (访客无法访问)';
      else if (isExpired) el.shareLiveText.textContent = '已过期';
      else el.shareLiveText.textContent = '分享中';
    }
    if (el.toggleShareStateBtn) {
      if (isDisabled) {
        el.toggleShareStateBtn.textContent = '▶️ 重新开启分享';
        el.toggleShareStateBtn.className = 'btn-toggle-share-state is-reopen';
      } else {
        el.toggleShareStateBtn.textContent = '⏸️ 关闭分享';
        el.toggleShareStateBtn.className = 'btn-toggle-share-state is-close';
      }
    }

    if (share.expires_at === 0) {
      if (el.activeShareExpireSelect) el.activeShareExpireSelect.value = '0';
      if (el.activeShareExpireDesc) {
        el.activeShareExpireDesc.textContent = '永久有效';
        el.activeShareExpireDesc.style.color = 'var(--text-muted)';
      }
    } else {
      const daysRemaining = Math.max(1, Math.round((share.expires_at - now) / 86400));
      if (el.activeShareExpireSelect) {
        if (daysRemaining <= 1) el.activeShareExpireSelect.value = '1';
        else if (daysRemaining <= 10) el.activeShareExpireSelect.value = '7';
        else el.activeShareExpireSelect.value = '30';
      }
      if (el.activeShareExpireDesc) {
        el.activeShareExpireDesc.textContent = isExpired ? '已过期' : `截止 ${new Date(share.expires_at * 1000).toLocaleDateString()}`;
        el.activeShareExpireDesc.style.color = isExpired ? '#ef4444' : 'var(--text-muted)';
      }
    }

    // 格式化密码展示
    if (share.passcode) {
      if (el.activeSharePassDesc) el.activeSharePassDesc.textContent = `密码 ${share.passcode}`;
      if (el.activeShareEditPassToggle) el.activeShareEditPassToggle.textContent = '修改';
      if (el.activeShareRemovePassBtn) el.activeShareRemovePassBtn.style.display = 'inline-block';
      if (el.activeSharePassInput) el.activeSharePassInput.value = share.passcode;
    } else {
      if (el.activeSharePassDesc) el.activeSharePassDesc.textContent = '公开免密';
      if (el.activeShareEditPassToggle) el.activeShareEditPassToggle.textContent = '设置密码';
      if (el.activeShareRemovePassBtn) el.activeShareRemovePassBtn.style.display = 'none';
      if (el.activeSharePassInput) el.activeSharePassInput.value = '';
    }
  }

  // 切换单篇文档分享的停用/启用状态（关掉后依然保留记录，不丢失短链）
  async function toggleCurrentDocShareState() {
    if (!currentDocActiveShare) return;
    const newDisabled = !currentDocActiveShare.disabled;
    try {
      const res = await fetch('/api/shares', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          share_id: currentDocActiveShare.id,
          disabled: newDisabled
        })
      });
      if (res.ok) {
        const data = await res.json();
        currentDocActiveShare = data.share;
        renderActiveSharePanel(currentDocActiveShare);
        loadAllShares(); // 同步刷新管理端
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || '切换分享状态失败');
      }
    } catch (e) {
      alert('网络通信异常，请重试');
    }
  }

  // 直接更改现有分享的有效期，即改即生效
  async function handleActiveExpireChange() {
    if (!currentDocActiveShare) return;
    const expireDays = parseInt(el.activeShareExpireSelect.value) || 0;
    try {
      const res = await fetch('/api/shares', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          share_id: currentDocActiveShare.id,
          expire_days: expireDays,
          passcode: currentDocActiveShare.passcode || ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        currentDocActiveShare = data.share;
        renderActiveSharePanel(currentDocActiveShare);
        loadAllShares();
      }
    } catch (e) {}
  }

  // 保存新密码
  async function handleActiveSavePasscode() {
    if (!currentDocActiveShare) return;
    const newPass = (el.activeSharePassInput.value || '').trim();
    const now = Math.floor(Date.now() / 1000);
    const expireDays = currentDocActiveShare.expires_at > 0 ? Math.max(1, Math.round((currentDocActiveShare.expires_at - now) / 86400)) : 0;
    try {
      const res = await fetch('/api/shares', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          share_id: currentDocActiveShare.id,
          expire_days: expireDays,
          passcode: newPass
        })
      });
      if (res.ok) {
        const data = await res.json();
        currentDocActiveShare = data.share;
        if (el.activeSharePassDrawer) el.activeSharePassDrawer.style.display = 'none';
        renderActiveSharePanel(currentDocActiveShare);
        loadAllShares();
      }
    } catch (e) {}
  }

  // 移除密码
  async function handleActiveRemovePasscode() {
    if (!currentDocActiveShare) return;
    const now = Math.floor(Date.now() / 1000);
    const expireDays = currentDocActiveShare.expires_at > 0 ? Math.max(1, Math.round((currentDocActiveShare.expires_at - now) / 86400)) : 0;
    try {
      const res = await fetch('/api/shares', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          share_id: currentDocActiveShare.id,
          expire_days: expireDays,
          passcode: ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        currentDocActiveShare = data.share;
        if (el.activeSharePassDrawer) el.activeSharePassDrawer.style.display = 'none';
        renderActiveSharePanel(currentDocActiveShare);
        loadAllShares();
      }
    } catch (e) {}
  }

  // 初次开启分享
  async function handleStartShare() {
    if (!currentShareTargetDoc) return;
    const expireDays = parseInt(el.newShareExpireSelect ? el.newShareExpireSelect.value : '7') || 0;
    const enablePass = el.newShareEnablePass ? el.newShareEnablePass.checked : false;
    const pass = enablePass && el.newSharePassInput ? el.newSharePassInput.value.trim() : '';

    const repoId = currentShareTargetDoc.repo_id || (state.currentRepo ? state.currentRepo.ID : '');
    const relPath = (currentShareTargetDoc.rel_path || currentShareTargetDoc.path || '').replace(/^\/+/, '');
    const title = currentShareTargetDoc.name ? cleanDocTitle(currentShareTargetDoc.name) : (currentShareTargetDoc.title || relPath.split('/').pop());

    if (el.startShareBtn) {
      el.startShareBtn.disabled = true;
      el.startShareBtn.textContent = '正在开启分享...';
    }

    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_id: repoId,
          rel_path: relPath,
          doc_title: title,
          expire_days: expireDays,
          passcode: pass
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '开启分享失败');
        return;
      }

      currentDocActiveShare = data.share;
      renderActiveSharePanel(currentDocActiveShare);
      loadAllShares(); // 同步刷新管理端

      // 自动复制链接到剪贴板
      const fullUrl = `${window.location.origin}/s/${data.share_id}`;
      const copied = await copyTextToClipboard(fullUrl);
      if (el.mainCopyShareBtn && copied) {
        const origHtml = el.mainCopyShareBtn.innerHTML;
        el.mainCopyShareBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span style="color:#10b981;font-weight:600;">已生成并自动复制!</span>
        `;
        setTimeout(() => {
          if (el.mainCopyShareBtn) el.mainCopyShareBtn.innerHTML = origHtml;
        }, 2500);
      }
    } catch (err) {
      alert('网络通信异常，请重试');
    } finally {
      if (el.startShareBtn) {
        el.startShareBtn.disabled = false;
        el.startShareBtn.textContent = '🚀 开启分享并复制链接';
      }
    }
  }

  async function copyMainShareUrl() {
    if (!el.shareActiveUrlInput || !el.shareActiveUrlInput.value) return;
    const ok = await copyTextToClipboard(el.shareActiveUrlInput.value);
    const copyBtn = el.mainCopyShareBtn;
    if (copyBtn) {
      const origHtml = copyBtn.innerHTML;
      if (ok) {
        copyBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span style="color:#10b981;font-weight:600;">已复制链接!</span>
        `;
      } else {
        copyBtn.innerHTML = `<span>复制失败，请手动选中文本复制</span>`;
      }
      setTimeout(() => {
        if (copyBtn) copyBtn.innerHTML = origHtml;
      }, 2000);
    }
  }

  async function revokeCurrentActiveShare() {
    if (!currentDocActiveShare) return;
    if (!confirm(`确定彻底删除此分享记录 (/s/${currentDocActiveShare.id}) 吗？删除后此短链接将被彻底注销。建议优先使用【关闭分享】保留历史。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/shares/${encodeURIComponent(currentDocActiveShare.id)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '删除失败');
        return;
      }

      currentDocActiveShare = null;
      renderActiveSharePanel(null);
      loadAllShares(); // 同步刷新
    } catch (e) {
      alert('删除通信失败');
    }
  }

  // =========================================================================
  // 全局公开链接统一管理核心引擎 (Public Shares Management Hub)
  // =========================================================================

  // 格式化分享状态
  function getShareStatus(item, nowSec) {
    const isExpired = item.expires_at > 0 && nowSec > item.expires_at;
    if (item.disabled) return { type: 'disabled', label: '已关闭', cls: 'status-disabled' };
    if (isExpired) return { type: 'expired', label: '已过期', cls: 'status-expired' };
    return { type: 'active', label: '分享中', cls: 'status-active' };
  }

  // 格式化有效期文本
  function formatShareExpireText(expiresAt, nowSec) {
    if (!expiresAt || expiresAt === 0) {
      return '<span class="expire-permanent">永久有效</span>';
    }
    const diff = expiresAt - nowSec;
    const dateStr = new Date(expiresAt * 1000).toLocaleDateString();
    if (diff <= 0) {
      return `<span class="expire-expired">已于 ${dateStr} 过期</span>`;
    }
    const days = Math.ceil(diff / 86400);
    if (days <= 1) {
      const hours = Math.max(1, Math.ceil(diff / 3600));
      return `<span class="expire-soon">剩 ${hours} 小时 (截止今日)</span>`;
    }
    return `<span class="expire-valid">剩 ${days} 天 (截止 ${dateStr})</span>`;
  }

  // 统一异步拉取并分发分享数据
  async function loadAllShares() {
    try {
      const res = await fetch('/api/shares');
      if (!res.ok) return;
      const data = await res.json();
      state.allShares = Array.isArray(data) ? data : [];
      updateSharesMetricsAndBadges();
      renderHomeSharesList();
      renderModalSharesList();
    } catch (e) {
      console.warn('[Shares] Load all shares failed:', e);
    }
  }

  // 更新指标卡片与 Header 上的计数徽章
  function updateSharesMetricsAndBadges() {
    const now = Math.floor(Date.now() / 1000);
    const shares = state.allShares || [];

    let total = shares.length;
    let active = 0;
    let disabled = 0;
    let expired = 0;
    let totalViews = 0;

    shares.forEach(s => {
      totalViews += (s.view_count || 0);
      const isExp = s.expires_at > 0 && now > s.expires_at;
      if (s.disabled) {
        disabled++;
      } else if (isExp) {
        expired++;
      } else {
        active++;
      }
    });

    // 1. 更新顶部 Header 角标
    if (el.sharesCountBadge) {
      if (active > 0) {
        el.sharesCountBadge.textContent = active;
        el.sharesCountBadge.style.display = 'inline-flex';
      } else {
        el.sharesCountBadge.style.display = 'none';
      }
    }

    // 2. 更新首页指标卡片
    const setNum = (id, val) => {
      const node = document.getElementById(id);
      if (node) node.textContent = val;
    };
    setNum('homeMetricTotalShares', total);
    setNum('homeMetricActiveShares', active);
    setNum('homeMetricDisabledShares', disabled);
    setNum('homeMetricExpiredShares', expired);
    setNum('homeMetricTotalViews', totalViews);

    // 3. 更新弹窗指标卡片
    setNum('metricTotalShares', total);
    setNum('metricActiveShares', active);
    setNum('metricDisabledShares', disabled);
    setNum('metricExpiredShares', expired);
    setNum('metricTotalViews', totalViews);
  }

  // 构建单条记录的 HTML 结构
  function renderShareItemHtml(item, nowSec) {
    const status = getShareStatus(item, nowSec);
    const expireHtml = formatShareExpireText(item.expires_at, nowSec);
    const repo = (state.repos || []).find(r => r.ID === item.repo_id);
    const repoName = repo ? repo.Name : (item.repo_id || '知识库');
    const fullDocRoute = '/' + (repo ? (repo.RoutePrefix || '').replace(/^\/+|\/+$/g, '') : '') + '/' + item.rel_path.replace(/^\/+/, '');
    const shareUrl = `${window.location.origin}/s/${item.id}`;

    let passHtml = '<span class="share-pass-pill free">🔓 免密公开</span>';
    if (item.passcode) {
      passHtml = `<span class="share-pass-pill locked" title="点击复制提取码" data-pass="${escapeHtml(item.passcode)}">🔑 提取码: <code>${escapeHtml(item.passcode)}</code></span>`;
    }

    // 状态切换按钮
    let toggleBtnHtml = '';
    if (status.type === 'active') {
      toggleBtnHtml = `<button type="button" class="btn btn-xs btn-share-toggle is-disable" data-id="${item.id}" data-action="disable" title="暂时关闭此链接，访客将无法访问">⏸️ 关闭</button>`;
    } else if (status.type === 'disabled') {
      toggleBtnHtml = `<button type="button" class="btn btn-xs btn-share-toggle is-enable" data-id="${item.id}" data-action="enable" title="重新开启外部访问">▶️ 重新开启</button>`;
    } else {
      toggleBtnHtml = `<button type="button" class="btn btn-xs btn-share-toggle is-renew" data-id="${item.id}" data-action="renew" title="延长 7 天有效期并开启">⏰ 续期7天</button>`;
    }

    return `
      <div class="share-card-item ${status.cls}" data-id="${escapeHtml(item.id)}" data-repo="${escapeHtml(item.repo_id)}" data-relpath="${escapeHtml(item.rel_path)}" data-title="${escapeHtml(item.doc_title.toLowerCase())}">
        <div class="share-card-top-row">
          <div class="share-card-title-group">
            <span class="share-status-tag ${status.cls}">
              <span class="dot"></span>
              <span>${status.label}</span>
            </span>
            <a href="${escapeHtml(fullDocRoute)}" class="share-card-doc-link" title="点击在系统内直达阅读此文档" data-path="${escapeHtml(fullDocRoute)}">
              <span class="doc-icon">${SVG_ICONS.markdown}</span>
              <span class="doc-title-text">${escapeHtml(item.doc_title)}</span>
            </a>
          </div>
          <div class="share-card-meta-tags">
            <span class="share-card-repo-tag" title="所属知识库空间">${escapeHtml(repoName)}</span>
            <span class="share-card-views-tag" title="累计访客阅读次数">👁️ ${item.view_count || 0} 次阅读</span>
          </div>
        </div>

        <div class="share-card-path-row">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          <span class="path-text" title="${escapeHtml(item.rel_path)}">${escapeHtml(item.rel_path)}</span>
        </div>

        <div class="share-card-url-bar">
          <div class="share-card-url-left" title="点击快速复制短链接" data-url="${escapeHtml(shareUrl)}">
            <span class="url-label">短链:</span>
            <input type="text" class="url-input-compact" value="${escapeHtml(shareUrl)}" readonly spellcheck="false">
          </div>
          <div class="share-card-url-right">
            <button type="button" class="btn btn-xs btn-primary btn-copy-share-card" data-url="${escapeHtml(shareUrl)}" title="复制完整分享链接">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>复制</span>
            </button>
            <a href="/s/${escapeHtml(item.id)}" target="_blank" rel="noopener" class="btn btn-xs btn-open-share-card" title="在新标签页作为访客预览">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <span>预览</span>
            </a>
          </div>
        </div>

        <div class="share-card-footer">
          <div class="share-card-params">
            ${passHtml}
            <span class="share-card-expire">${expireHtml}</span>
          </div>
          <div class="share-card-actions">
            ${toggleBtnHtml}
            <button type="button" class="btn btn-xs btn-share-edit" data-id="${item.id}" title="修改有效期或提取码">设置</button>
            <button type="button" class="btn btn-xs btn-share-del" data-id="${item.id}" title="彻底从系统删除此记录">删除</button>
          </div>
        </div>
      </div>
    `;
  }

  // 过滤并生成列表 HTML
  function generateSharesListHtml(shares, filterRepo, filterStatus, searchQuery) {
    if (!shares || shares.length === 0) {
      return `
        <div class="shares-empty-state">
          <div class="empty-icon">🔗</div>
          <div class="empty-title">当前暂无任何对外公开分享链接</div>
          <div class="empty-desc">在任意文档阅读页面点击右上角【分享】按钮，即可快速生成专属只读短链接。</div>
        </div>
      `;
    }

    const now = Math.floor(Date.now() / 1000);
    const q = (searchQuery || '').trim().toLowerCase();

    const filtered = shares.filter(s => {
      // 仓库过滤
      if (filterRepo && s.repo_id !== filterRepo) return false;

      // 状态过滤
      const st = getShareStatus(s, now).type;
      if (filterStatus && filterStatus !== 'all' && st !== filterStatus) return false;

      // 文本搜索
      if (q) {
        const titleMatch = (s.doc_title || '').toLowerCase().includes(q);
        const pathMatch = (s.rel_path || '').toLowerCase().includes(q);
        const idMatch = (s.id || '').toLowerCase().includes(q);
        if (!titleMatch && !pathMatch && !idMatch) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      return `
        <div class="shares-empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">未发现符合筛选条件的公开分享</div>
          <div class="empty-desc">可尝试清空搜索关键字或切换状态筛选选项。</div>
        </div>
      `;
    }

    return filtered.map(item => renderShareItemHtml(item, now)).join('');
  }

  // 绑定分享列表内的所有交互动作
  function bindSharesListEvents(container) {
    if (!container) return;

    // 1. 复制短链接按钮
    container.querySelectorAll('.btn-copy-share-card').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = btn.getAttribute('data-url');
        if (!url) return;
        const ok = await copyTextToClipboard(url);
        const origText = btn.innerHTML;
        if (ok) {
          btn.innerHTML = `<span style="color:#10b981;font-weight:600;">已复制!</span>`;
          setTimeout(() => { btn.innerHTML = origText; }, 1800);
        }
      });
    });

    // 点击输入框或左侧栏直接全选并复制
    container.querySelectorAll('.share-card-url-left').forEach(box => {
      box.addEventListener('click', async (e) => {
        e.stopPropagation();
        const input = box.querySelector('.url-input-compact');
        if (input) {
          input.focus();
          input.select();
          input.setSelectionRange(0, 99999);
        }
        const url = box.getAttribute('data-url');
        if (!url) return;
        const ok = await copyTextToClipboard(url);
        if (ok) {
          const btn = box.parentElement.querySelector('.btn-copy-share-card');
          if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = `<span style="color:#10b981;font-weight:600;">已复制!</span>`;
            setTimeout(() => { btn.innerHTML = orig; }, 1800);
          }
        }
      });
    });

    // 2. 点击密码直接复制提取码
    container.querySelectorAll('.share-pass-pill.locked').forEach(pill => {
      pill.addEventListener('click', async (e) => {
        e.stopPropagation();
        const pass = pill.getAttribute('data-pass');
        if (!pass) return;
        await copyTextToClipboard(pass);
        const orig = pill.innerHTML;
        pill.innerHTML = `🔑 已复制密码 ${pass}!`;
        setTimeout(() => { pill.innerHTML = orig; }, 1500);
      });
    });

    // 3. 点击文档标题直达系统内阅读
    container.querySelectorAll('.share-card-doc-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('data-path');
        if (path) {
          closeModal(el.sharesHubModal);
          routeTo(path);
        }
      });
    });

    // 4. 切换状态（关闭 / 重新开启 / 续期）
    container.querySelectorAll('.btn-share-toggle').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const shareId = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        if (!shareId) return;

        btn.disabled = true;
        try {
          if (action === 'disable') {
            await fetch('/api/shares', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ share_id: shareId, disabled: true })
            });
          } else if (action === 'enable') {
            await fetch('/api/shares', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ share_id: shareId, disabled: false })
            });
          } else if (action === 'renew') {
            await fetch('/api/shares', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ share_id: shareId, expire_days: 7, disabled: false })
            });
          }
          await loadAllShares();
        } catch (err) {
          alert('操作失败，请重试');
        } finally {
          btn.disabled = false;
        }
      });
    });

    // 5. 设置编辑（打开对应文档分享弹窗）
    container.querySelectorAll('.btn-share-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const shareId = btn.getAttribute('data-id');
        const share = (state.allShares || []).find(s => s.id === shareId);
        if (!share) return;
        closeModal(el.sharesHubModal);
        openShareModal({
          name: share.doc_title,
          rel_path: share.rel_path,
          path: share.rel_path,
          repo_id: share.repo_id
        });
      });
    });

    // 6. 彻底删除
    container.querySelectorAll('.btn-share-del').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const shareId = btn.getAttribute('data-id');
        if (!shareId) return;
        if (!confirm(`确定彻底删除此分享记录 (/s/${shareId}) 吗？删除后链接将永久注销无法恢复。`)) {
          return;
        }
        btn.disabled = true;
        try {
          const res = await fetch(`/api/shares/${encodeURIComponent(shareId)}`, { method: 'DELETE' });
          if (res.ok) {
            await loadAllShares();
          } else {
            alert('删除失败');
          }
        } catch (err) {
          alert('网络异常');
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  // 渲染首页分享板块
  function renderHomeSharesList() {
    const container = document.getElementById('homeSharesListContainer');
    if (!container) return;

    const repoFilter = document.getElementById('homeSharesRepoFilter') ? document.getElementById('homeSharesRepoFilter').value : '';
    const statusFilter = document.getElementById('homeSharesStatusFilter') ? document.getElementById('homeSharesStatusFilter').value : 'active';
    const searchQuery = document.getElementById('homeSharesSearchInput') ? document.getElementById('homeSharesSearchInput').value : '';

    container.innerHTML = generateSharesListHtml(state.allShares, repoFilter, statusFilter, searchQuery);
    bindSharesListEvents(container);
  }

  // 渲染弹窗分享板块
  function renderModalSharesList() {
    const container = el.sharesListContainer;
    if (!container) return;

    const repoFilter = el.sharesRepoFilter ? el.sharesRepoFilter.value : '';
    const statusFilter = el.sharesStatusFilter ? el.sharesStatusFilter.value : 'active';
    const searchQuery = el.sharesSearchInput ? el.sharesSearchInput.value : '';

    container.innerHTML = generateSharesListHtml(state.allShares, repoFilter, statusFilter, searchQuery);
    bindSharesListEvents(container);
  }

  // 初始化首页公开分享板块交互
  function initHomeSharesSection() {
    const toggleBtn = document.getElementById('toggleHomeSharesBtn');
    const collapsedBar = document.getElementById('homeSharesCollapsedBar');
    const body = document.getElementById('homeSharesBody');
    const toggleText = document.getElementById('toggleHomeSharesText');
    const toggleIcon = document.getElementById('toggleHomeSharesIcon');

    // 折叠展开
    const handleToggle = () => {
      if (!body) return;
      const willCollapse = !body.classList.contains('is-collapsed');
      body.classList.toggle('is-collapsed', willCollapse);
      if (collapsedBar) collapsedBar.style.display = willCollapse ? 'flex' : 'none';
      if (toggleText) toggleText.textContent = willCollapse ? '展开' : '收起';
      if (toggleIcon) toggleIcon.style.transform = willCollapse ? 'rotate(180deg)' : 'rotate(0deg)';
      try {
        localStorage.setItem('doc_lens_shares_collapsed', willCollapse ? '1' : '0');
      } catch (e) {}
    };

    if (toggleBtn) toggleBtn.addEventListener('click', handleToggle);
    if (collapsedBar) collapsedBar.addEventListener('click', handleToggle);

    // 填充知识库仓库下拉选项
    const repoSelect = document.getElementById('homeSharesRepoFilter');
    if (repoSelect && state.repos) {
      const curVal = repoSelect.value;
      repoSelect.innerHTML = `<option value="">全部知识库空间</option>` + state.repos.map(r => `
        <option value="${escapeHtml(r.ID)}">${escapeHtml(r.Name)}</option>
      `).join('');
      if (curVal) repoSelect.value = curVal;
      repoSelect.addEventListener('change', () => renderHomeSharesList());
    }

    // 状态过滤下拉
    const statusSelect = document.getElementById('homeSharesStatusFilter');
    if (statusSelect) {
      statusSelect.addEventListener('change', () => {
        const val = statusSelect.value;
        // 同步更新指标卡片的 active 高亮
        document.querySelectorAll('#homeSharesMetricsBar .share-metric-card').forEach(card => {
          card.classList.toggle('active', card.getAttribute('data-filter') === val);
        });
        renderHomeSharesList();
      });
    }

    // 搜索过滤
    const searchInput = document.getElementById('homeSharesSearchInput');
    const clearBtn = document.getElementById('homeSharesClearSearchBtn');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';
        renderHomeSharesList();
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
          searchInput.focus();
        }
      });
    }

    // 统计指标卡片点击筛选
    document.querySelectorAll('#homeSharesMetricsBar .share-metric-card').forEach(card => {
      card.addEventListener('click', () => {
        const f = card.getAttribute('data-filter');
        if (!f) return;
        document.querySelectorAll('#homeSharesMetricsBar .share-metric-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        if (statusSelect) statusSelect.value = f;
        renderHomeSharesList();
      });
    });

    // 刷新按钮
    const refreshBtn = document.getElementById('homeRefreshSharesBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const svg = refreshBtn.querySelector('svg');
        if (svg) svg.style.transform = 'rotate(360deg)';
        await loadAllShares();
        setTimeout(() => { if (svg) svg.style.transform = ''; }, 500);
      });
    }

    // 初始渲染一次
    renderHomeSharesList();
    updateSharesMetricsAndBadges();
  }

  // 初始化全局公开链接管理弹窗
  function initSharesHubModal() {
    if (el.sharesRepoFilter && state.repos) {
      const curVal = el.sharesRepoFilter.value;
      el.sharesRepoFilter.innerHTML = `<option value="">全部知识库空间</option>` + state.repos.map(r => `
        <option value="${escapeHtml(r.ID)}">${escapeHtml(r.Name)}</option>
      `).join('');
      if (curVal) el.sharesRepoFilter.value = curVal;
      el.sharesRepoFilter.addEventListener('change', () => renderModalSharesList());
    }

    if (el.sharesStatusFilter) {
      el.sharesStatusFilter.addEventListener('change', () => {
        const val = el.sharesStatusFilter.value;
        document.querySelectorAll('#sharesHubModal .share-metric-card').forEach(card => {
          card.classList.toggle('active', card.getAttribute('data-filter') === val);
        });
        renderModalSharesList();
      });
    }

    if (el.sharesSearchInput) {
      el.sharesSearchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        if (el.sharesClearSearchBtn) el.sharesClearSearchBtn.style.display = q ? 'flex' : 'none';
        renderModalSharesList();
      });
    }

    if (el.sharesClearSearchBtn) {
      el.sharesClearSearchBtn.addEventListener('click', () => {
        if (el.sharesSearchInput) {
          el.sharesSearchInput.value = '';
          el.sharesSearchInput.dispatchEvent(new Event('input'));
          el.sharesSearchInput.focus();
        }
      });
    }

    document.querySelectorAll('#sharesHubModal .share-metric-card').forEach(card => {
      card.addEventListener('click', () => {
        const f = card.getAttribute('data-filter');
        if (!f) return;
        document.querySelectorAll('#sharesHubModal .share-metric-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        if (el.sharesStatusFilter) el.sharesStatusFilter.value = f;
        renderModalSharesList();
      });
    });

    if (el.refreshSharesBtn) {
      el.refreshSharesBtn.addEventListener('click', async () => {
        const svg = el.refreshSharesBtn.querySelector('svg');
        if (svg) svg.style.transform = 'rotate(360deg)';
        await loadAllShares();
        setTimeout(() => { if (svg) svg.style.transform = ''; }, 500);
      });
    }
  }

  // 打开公开分享管理中心 (支持首页智能直达与模态框两种场景)
  function openSharesHub(targetFilter = null) {
    if (!state.currentDoc) {
      // 当前在首页：平滑滚动到首页公开分享板块
      const homeSection = document.getElementById('homeSectionShares');
      if (homeSection) {
        const body = document.getElementById('homeSharesBody');
        const collapsedBar = document.getElementById('homeSharesCollapsedBar');
        const toggleText = document.getElementById('toggleHomeSharesText');
        const toggleIcon = document.getElementById('toggleHomeSharesIcon');
        if (body && body.classList.contains('is-collapsed')) {
          body.classList.remove('is-collapsed');
          if (collapsedBar) collapsedBar.style.display = 'none';
          if (toggleText) toggleText.textContent = '收起';
          if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
        }
        if (targetFilter) {
          const statusSelect = document.getElementById('homeSharesStatusFilter');
          if (statusSelect) statusSelect.value = targetFilter;
          document.querySelectorAll('#homeSharesMetricsBar .share-metric-card').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-filter') === targetFilter);
          });
          renderHomeSharesList();
        }
        homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        homeSection.classList.add('section-highlight-pulse');
        setTimeout(() => homeSection.classList.remove('section-highlight-pulse'), 1500);
        return;
      }
    }

    // 在文档阅读页：弹出统一管理弹窗
    initSharesHubModal();
    if (targetFilter && el.sharesStatusFilter) {
      el.sharesStatusFilter.value = targetFilter;
      document.querySelectorAll('#sharesHubModal .share-metric-card').forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-filter') === targetFilter);
      });
    }
    renderModalSharesList();
    openModal(el.sharesHubModal);
  }

  // 访客端：加载分享文档内容
  async function loadSharedDoc(shareId, passcode = '') {
    if (!shareId) return;

    renderDocumentSkeleton('/s/' + shareId);

    try {
      const url = `/api/share/content?id=${encodeURIComponent(shareId)}${passcode ? '&passcode=' + encodeURIComponent(passcode) : ''}`;
      const res = await fetch(url);

      if (res.status === 401) {
        const errData = await res.json();
        if (errData.error === 'need_passcode') {
          if (el.sharePasscodePromptText && errData.title) {
            el.sharePasscodePromptText.textContent = `本文档《${errData.title}》已被作者设置访问保护，请输入密码继续：`;
          }
          openModal(el.sharePasscodeModal);
          if (el.guestPasscodeInput) {
            el.guestPasscodeInput.value = '';
            el.guestPasscodeInput.focus();
          }
          return;
        }
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let errMsg = '该分享链接不存在、超出有效期限或已被作者撤销。';
        if (errData.error === 'disabled') {
          errMsg = '抱歉，此公开分享链接已被所有者暂时关闭。';
        } else if (errData.error === 'expired') {
          errMsg = '抱歉，此分享链接已超出有效期限，无法继续阅读。';
        }
        renderShareErrorPage(errMsg);
        return;
      }

      const docData = await res.json();
      state.currentShareDoc = docData;
      state.sharePasscode = passcode;
      closeModal(el.sharePasscodeModal);

      renderSharedDocument(docData);
    } catch (err) {
      renderShareErrorPage('网络加载失败，请检查网络连接或稍后重试。');
    }
  }

  function handleGuestPasscodeSubmit(e) {
    e.preventDefault();
    if (!el.guestPasscodeInput) return;
    const code = el.guestPasscodeInput.value.trim();
    if (!code) return;
    if (el.sharePasscodeError) el.sharePasscodeError.textContent = '';

    loadSharedDoc(state.shareId, code);
  }

  function renderShareErrorPage(msg) {
    if (el.articleHeader) el.articleHeader.style.display = 'none';
    if (el.articleBody) {
      el.articleBody.innerHTML = `
        <div style="text-align:center;padding:60px 20px;max-width:500px;margin:0 auto;">
          <div style="font-size:48px;margin-bottom:16px;">📭</div>
          <h2 style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--text-primary);">分享链接不可访问</h2>
          <p style="font-size:14px;color:var(--text-muted);line-height:1.6;margin-bottom:24px;">${escapeHtml(msg)}</p>
          <a href="/" class="btn btn-primary" style="display:inline-flex;align-items:center;padding:8px 20px;text-decoration:none;">进入 DocLens 知识库</a>
        </div>
      `;
    }
    resetDocScroll();
  }

  function renderSharedDocument(docData) {
    if (!docData) return;
    const title = docData.title || (docData.rel_path ? docData.rel_path.split('/').pop() : '技术文档');
    document.title = `${title} - DocLens 分享阅读`;

    if (el.articleHeader) el.articleHeader.style.display = 'block';

    if (el.headerBreadcrumbs) {
      el.headerBreadcrumbs.innerHTML = `
        <span class="breadcrumb-item breadcrumb-home">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>${escapeHtml(docData.repo_name || '知识库')}</span>
        </span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item active">${escapeHtml(title)}</span>
      `;
    }

    if (el.articlePath) el.articlePath.textContent = docData.rel_path || '';
    if (el.articleTypePill) el.articleTypePill.style.display = 'none';

    const dateStr = new Date((docData.mod_time || 0) * 1000).toLocaleString('zh-CN', { hour12: false });
    if (el.articleMeta) {
      el.articleMeta.innerHTML = `
        <span class="article-meta-item">📅 ${dateStr}</span>
        <span class="article-meta-item">📏 ${docData.lines || 0} 行</span>
        <span class="article-meta-item">👁️ ${docData.view_count || 1} 次阅读</span>
        <span class="article-meta-item">🏷️ ${escapeHtml(docData.repo_name || '')}</span>
      `;
    }

    const isMarkdown = docData.type === 'markdown';
    if (el.articleActions) {
      el.articleActions.innerHTML = `
        ${isMarkdown ? `
        <button class="btn btn-mindmap" id="docMindmapBtn" title="查看文章思维导图（层级大纲脑图）">
          ${SVG_ICONS.mindmap}
          <span class="btn-text-full">思维导图</span>
          <span class="btn-text-short">导图</span>
        </button>` : ''}
        <button class="btn" id="copyShareLinkBtn" title="复制当前分享链接">
          ${SVG_ICONS.link}
          <span class="btn-text-full">复制链接</span>
          <span class="btn-text-short">链接</span>
        </button>
      `;

      if (isMarkdown) {
        const mindmapBtn = document.getElementById('docMindmapBtn');
        if (mindmapBtn) {
          mindmapBtn.addEventListener('click', () => {
            openDocMindmap({
              path: docData.rel_path,
              name: docData.title,
              content: docData.content
            });
          });
        }
      }

      const copyBtn = document.getElementById('copyShareLinkBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          await copyTextToClipboard(window.location.href);
          copyBtn.classList.add('copy-success');
          copyBtn.innerHTML = `${SVG_ICONS.check} <span class="btn-text-full" style="color:#10b981;">已复制</span><span class="btn-text-short" style="color:#10b981;">已复制</span>`;
          setTimeout(() => {
            copyBtn.classList.remove('copy-success');
            copyBtn.innerHTML = `${SVG_ICONS.link} <span class="btn-text-full">复制链接</span><span class="btn-text-short">链接</span>`;
          }, 2000);
        });
      }
    }

    if (docData.type === 'markdown') {
      renderMarkdownDoc(docData.content);
    } else if (docData.type === 'html') {
      renderHtmlDoc(docData.path, docData.content);
    } else {
      renderCodeDoc(docData.content, docData.path);
    }

    if (el.articleBody) {
      const footerDiv = document.createElement('div');
      footerDiv.className = 'shared-reader-footer';
      footerDiv.innerHTML = `
        <div>由 <strong>DocLens</strong> 轻量技术知识库驱动 · 单篇只读保护</div>
        <a href="/" target="_self">进入主知识库</a>
      `;
      el.articleBody.appendChild(footerDiv);
    }

    resetDocScroll();
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function unescapeHtml(str) {
    return (str || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  }

})();
