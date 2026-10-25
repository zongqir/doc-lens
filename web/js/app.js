// doc-lens: 极简纯原生双端技术文档与 Markdown 实时投影器 (Modern Pro Edition v2.2.0 Ultra Fast)
(function() {
  'use strict';

  const SVG_ICONS = {
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    folderOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="2" y1="10" x2="22" y2="10"></line></svg>',
    repo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>',
    markdown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><polyline points="8 13 10 15 12 13"></polyline><line x1="10" y1="9" x2="10" y2="15"></line></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
    html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
    copy: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    sun: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    sparkles: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
    link: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
    star: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    starFilled: '<svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    chevronRight: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'
  };

  const ALERT_ICONS = {
    note: '<svg class="alert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    tip: '<svg class="alert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>',
    important: '<svg class="alert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 16 12 12 8"></polygon></svg>',
    warning: '<svg class="alert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    caution: '<svg class="alert-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
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
    filterFavoritesOnly: false
  };

  const mermaidStore = new Map();
  const el = {};
  let mermaidObserver = null;
  let scrollSpyObserver = null;
  let searchDebounceTimer = null;

  function getStoredTheme() {
    try {
      return localStorage.getItem('doc_lens_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) {
      return 'dark';
    }
  }

  document.addEventListener('DOMContentLoaded', initApp);

  async function initApp() {
    bindDOMElements();
    applyTheme(state.theme);
    initFontPreferences();
    initMarkdownParser();
    initMermaid();
    bindGlobalKeybindings();

    renderRecentReads();
    renderFavorites();

    window.addEventListener('popstate', () => {
      routeTo(window.location.pathname, false);
    });

    await Promise.all([checkAuth(), loadRepos()]);

    if (state.authenticated) {
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

    el.tocList = document.getElementById('tocList');
    el.mobileTocList = document.getElementById('mobileTocList');
    el.fabTocBtn = document.getElementById('fabTocBtn');
    el.mobileTocModal = document.getElementById('mobileTocModal');

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
    el.draftFileName = document.getElementById('draftFileName');
    el.draftPrompt = document.getElementById('draftPrompt');

    // 事件绑定
    el.themeBtn.addEventListener('click', toggleTheme);
    el.menuBtn.addEventListener('click', toggleMobileSidebar);
    el.sidebarOverlay.addEventListener('click', closeMobileSidebar);
    if (el.closeSidebarBtn) el.closeSidebarBtn.addEventListener('click', closeMobileSidebar);

    el.fabTocBtn.addEventListener('click', () => openModal(el.mobileTocModal));
    el.loginForm.addEventListener('submit', handleLoginSubmit);
    el.repoSelect.addEventListener('change', (e) => selectRepo(e.target.value));
    el.searchInput.addEventListener('input', onSearchInput);
    el.clearSearchBtn.addEventListener('click', clearSearch);
    if (el.quickSearchBtn) {
      el.quickSearchBtn.addEventListener('click', () => {
        el.searchInput.focus();
        el.searchInput.select();
      });
    }

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

    // 侧边栏专区折叠/展开与独立工具操作
    if (el.headerFavorites) {
      el.headerFavorites.addEventListener('click', () => {
        const sec = document.getElementById('sectionFavorites');
        if (sec) {
          sec.dataset.userToggled = 'true';
          sec.classList.toggle('collapsed');
        }
      });
    }

    if (el.headerRecentReads) {
      el.headerRecentReads.addEventListener('click', (e) => {
        if (e.target.closest('#clearRecentReadsBtn')) return;
        const sec = document.getElementById('sectionRecentReads');
        if (sec) {
          sec.dataset.userToggled = 'true';
          sec.classList.toggle('collapsed');
        }
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
        const sec = document.getElementById('sectionRecentCreated');
        if (sec) sec.classList.toggle('collapsed');
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
        const sec = document.getElementById('sectionFileTree');
        if (sec) sec.classList.toggle('collapsed');
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

    el.aiTaskBtn.addEventListener('click', openTaskCenter);
    el.aiDraftBtn.addEventListener('click', () => openDraftModal());
    el.aiDraftForm.addEventListener('submit', handleDraftSubmit);
    el.refreshTasksBtn.addEventListener('click', loadTasks);

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

    // 手机端大纲悬浮球微交互
    let lastScrollY = 0;
    el.contentArea.addEventListener('scroll', () => {
      const curY = el.contentArea.scrollTop;
      if (curY > lastScrollY && curY > 120) {
        el.fabTocBtn.style.opacity = '0.35';
        el.fabTocBtn.style.transform = 'scale(0.86)';
      } else {
        el.fabTocBtn.style.opacity = '1';
        el.fabTocBtn.style.transform = 'scale(1)';
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

  function bindGlobalKeybindings() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
        closeMobileSidebar();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (el.sidebar && !el.sidebar.classList.contains('open') && window.innerWidth <= 900) {
          toggleMobileSidebar();
        }
        el.searchInput.focus();
        el.searchInput.select();
      }
    });
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('doc_lens_theme', theme);
    } catch (e) {}

    if (el.themeBtn) {
      el.themeBtn.innerHTML = theme === 'dark' ? SVG_ICONS.sun : SVG_ICONS.moon;
    }
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);

    if (window.mermaid) {
      initMermaid();
      document.querySelectorAll('.mermaid-wrapper').forEach(wrapper => {
        wrapper.removeAttribute('data-rendered');
        renderSingleMermaidChart(wrapper);
      });
    }
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

  function openModal(modalEl) {
    modalEl.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('open');
    if (!document.querySelector('.modal-overlay.open')) {
      document.body.classList.remove('modal-open');
    }
  }

  function closeAllModals() {
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
      const res = await fetch('/api/repos');
      if (!res.ok) return;
      state.repos = await res.json();
      el.repoSelect.innerHTML = '';
      if (el.draftRepo) el.draftRepo.innerHTML = '';

      state.repos.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.ID;
        opt.textContent = `${r.Name} (${r.RoutePrefix})`;
        el.repoSelect.appendChild(opt);

        if (el.draftRepo) {
          const dOpt = document.createElement('option');
          dOpt.value = r.ID;
          dOpt.textContent = r.Name;
          el.draftRepo.appendChild(dOpt);
        }
      });
    } catch (e) {
      console.error('Failed to load repositories', e);
    }
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
  // 目录展开状态持久化与侧边栏滚动记忆 (Per-Repo Directory Expansion Memory)
  // =========================================================================
  function getExpandedDirs(repoID) {
    if (!repoID) return new Set();
    try {
      const saved = localStorage.getItem('doc_lens_expanded_dirs_' + repoID);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch (e) {}
    return new Set();
  }

  function saveExpandedDirs(repoID, set) {
    if (!repoID || !set) return;
    try {
      localStorage.setItem('doc_lens_expanded_dirs_' + repoID, JSON.stringify([...set]));
    } catch (e) {}
  }

  function setDirExpanded(repoID, dirPath, expanded) {
    if (!repoID || !dirPath) return;
    if (!state.expandedDirs) state.expandedDirs = getExpandedDirs(repoID);
    if (expanded) {
      state.expandedDirs.add(dirPath);
    } else {
      state.expandedDirs.delete(dirPath);
    }
    saveExpandedDirs(repoID, state.expandedDirs);
  }

  function clearAllExpandedDirs(repoID) {
    if (!repoID) return;
    state.expandedDirs = new Set();
    saveExpandedDirs(repoID, state.expandedDirs);
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
    state.expandedDirs = getExpandedDirs(repoID);
    el.repoSelect.value = repoID;
    try {
      localStorage.setItem('doc_lens_last_repo', repoID);
    } catch (e) {}

    renderRecentReads();

    // 核心修复：切换仓库时必须先无缝挂载并渲染该仓库的目录树，确保侧边栏目录即时切换
    await loadTree(repoID);
    loadRecentCreated(repoID);

    if (restoreLastActive) {
      const lastDoc = localStorage.getItem('doc_lens_last_active_' + repoID);
      const cleanPrefix = '/' + (repo.RoutePrefix || '').replace(/^\/+|\/+$/g, '');
      if (lastDoc && lastDoc !== '/' && lastDoc !== cleanPrefix) {
        await routeTo(lastDoc, true);
        restoreSidebarScroll(repoID);
        return;
      }
      const lastDir = localStorage.getItem('doc_lens_last_dir_' + repoID);
      if (lastDir) {
        expandPathToNode(lastDir);
        restoreSidebarScroll(repoID);
        return;
      }
    }

    if (!state.currentDoc || window.location.pathname === '/' || window.location.pathname === (repo.RoutePrefix || '')) {
      renderWelcomeDashboard();
    }

    restoreSidebarScroll(repoID);
  }

  async function loadTree(repoID, forceRefresh = false) {
    state.expandedDirs = getExpandedDirs(repoID);
    if (!state.repoTreeCache) state.repoTreeCache = new Map();
    if (!forceRefresh && state.repoTreeCache.has(repoID)) {
      state.treeData = state.repoTreeCache.get(repoID);
      if (state.filterFavoritesOnly || (el.searchInput && el.searchInput.value.trim())) {
        filterFileTree(el.searchInput ? el.searchInput.value : '');
      } else {
        renderFileTree(state.treeData, el.fileTree);
        updateTreeFileStats(state.treeData);
      }
      return;
    }

    el.fileTree.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">加载目录索引...</div>';
    try {
      const res = await fetch(`/api/tree?repo=${encodeURIComponent(repoID)}&refresh=${forceRefresh}`);
      if (!res.ok) throw new Error('Failed to load tree');
      state.treeData = await res.json();
      state.repoTreeCache.set(repoID, state.treeData);
      if (state.filterFavoritesOnly || (el.searchInput && el.searchInput.value.trim())) {
        filterFileTree(el.searchInput ? el.searchInput.value : '');
      } else {
        renderFileTree(state.treeData, el.fileTree);
        updateTreeFileStats(state.treeData);
      }
    } catch (e) {
      el.fileTree.innerHTML = `<div style="padding:16px;color:#ef4444;font-size:12px;">加载失败: ${e.message}</div>`;
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
            row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
      btn.innerHTML = `${SVG_ICONS.starFilled} <span>已收藏</span>`;
    } else {
      btn.className = 'btn';
      btn.title = '收藏此文档';
      btn.innerHTML = `${SVG_ICONS.star} <span>收藏</span>`;
    }
  }

  function renderFavorites() {
    const listEl = document.getElementById('favoritesList');
    const badgeEl = document.getElementById('favoritesCountBadge');
    const secEl = document.getElementById('sectionFavorites');
    const favs = getFavorites();

    if (badgeEl) {
      badgeEl.textContent = `${favs.length} 项`;
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
    recent.slice(0, 8).forEach(item => {
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
      const res = await fetch(`/api/recent?repo=${encodeURIComponent(repoID)}&limit=8`);
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
      el.repoSelect.value = targetRepo.ID;
      // 必须先加载完成目录树，保障 expandPathToNode 能够即时命中节点
      await loadTree(targetRepo.ID);
      loadRecentCreated(targetRepo.ID);
    }

    const cleanPrefix = targetRepo ? '/' + (targetRepo.RoutePrefix || '').replace(/^\/+|\/+$/g, '') : '/';
    if (decodedPath === '/' || decodedPath === cleanPrefix) {
      document.querySelectorAll('.tree-item-row.active').forEach(r => r.classList.remove('active'));
      renderRecentReads();
      renderFavorites();
      renderWelcomeDashboard();
      if (el.contentArea) el.contentArea.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (state.docCache.has(decodedPath)) {
      const doc = state.docCache.get(decodedPath);
      state.currentDoc = doc;
      renderDocument(doc);
      recordRecentRead(doc);
      return;
    }

    try {
      const res = await fetch(`/api/content?path=${encodeURIComponent(decodedPath)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '文件不存在或读取失败');
      }
      const doc = await res.json();
      state.docCache.set(decodedPath, doc);
      if (state.docCache.size > 50) {
        const firstKey = state.docCache.keys().next().value;
        state.docCache.delete(firstKey);
      }
      state.currentDoc = doc;
      renderDocument(doc);
      recordRecentRead(doc);
    } catch (err) {
      if (targetRepo) {
        try { localStorage.removeItem('doc_lens_last_active_' + targetRepo.ID); } catch (e) {}
      }
      renderErrorDocument(decodedPath, err.message);
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
    el.articleActions.innerHTML = `
      <button class="btn ${fav ? 'btn-favorite-active' : ''}" id="favoriteBtn" title="${fav ? '取消收藏' : '收藏此文档'}">
        ${fav ? SVG_ICONS.starFilled : SVG_ICONS.star}
        <span>${fav ? '已收藏' : '收藏'}</span>
      </button>
      <button class="btn" id="copyLinkBtn" title="复制直达链接">
        ${SVG_ICONS.link}
        <span>复制链接</span>
      </button>
      <button class="btn btn-primary" id="aiExplainBtn" title="AI 深度解剖">
        ${SVG_ICONS.sparkles}
        <span>AI 深度解剖</span>
      </button>
    `;

    document.getElementById('favoriteBtn').addEventListener('click', () => {
      toggleFavorite(doc);
    });

    document.getElementById('copyLinkBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href);
      const b = document.getElementById('copyLinkBtn');
      b.innerHTML = `${SVG_ICONS.check} <span style="color:#10b981;">已复制</span>`;
      setTimeout(() => {
        b.innerHTML = `${SVG_ICONS.link} <span>复制链接</span>`;
      }, 2000);
    });

    document.getElementById('aiExplainBtn').addEventListener('click', () => {
      openAiExplainModal(doc);
    });

    if (doc.type === 'markdown') {
      renderMarkdownDoc(doc.content);
    } else if (doc.type === 'html') {
      renderHtmlDoc(doc.path, doc.content);
    } else {
      renderCodeDoc(doc.content, doc.path);
    }
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

  function renderWelcomeDashboard() {
    if (el.articleHeader) el.articleHeader.style.display = 'none';
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

    // 2. 自动在左侧目录树中定位并展开上次阅读的章节
    if (lastRead && lastRead.path) {
      setTimeout(() => {
        expandPathToNode(lastRead.path);
      }, 150);
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
            <span class="last-read-repo-tag">🏷️ ${escapeHtml(currentRepo.Name)}</span>
          </div>
          <div class="last-read-body">
            <div class="last-read-title-row">
              <span class="last-read-doc-icon">${SVG_ICONS.markdown}</span>
              <a href="${escapeHtml(lastRead.path)}" class="last-read-title" id="lastReadLink">${escapeHtml(lastRead.name)}</a>
            </div>
            <div class="last-read-path">📂 ${escapeHtml(dirPath)}</div>
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
      chapters.forEach(ch => {
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
          <div class="welcome-chapter-card ${isCurrentChapter ? 'is-active-chapter' : ''}" data-chapter-path="${escapeHtml(ch.path)}">
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

    // 6. 构建“快速切换其他知识库”（移至最底部）
    let switchReposHtml = '';
    const otherRepos = state.repos.filter(r => r.ID !== currentRepo.ID);
    otherRepos.forEach(r => {
      switchReposHtml += `
        <div class="welcome-repo-card" data-repoid="${r.ID}">
          <div class="welcome-repo-name">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>${escapeHtml(r.Name)}</span>
          </div>
          <div class="welcome-repo-desc">${escapeHtml(r.Description || '技术研报与知识架构')}</div>
          <div style="font-size:11px;font-family:var(--font-mono);color:var(--text-accent);margin-top:4px;">前缀: ${r.RoutePrefix}</div>
        </div>
      `;
    });

    // 7. 渲染页面
    el.articleBody.innerHTML = `
      <div class="welcome-dashboard-container">
        <!-- 头部导读 -->
        <div class="welcome-hero-header">
          <div class="welcome-badge">DocLens Central · 当前知识库</div>
          <h1 class="welcome-title">${escapeHtml(currentRepo.Name)}</h1>
          <p class="welcome-desc">${escapeHtml(currentRepo.Description || '架构研报、深度技术解剖与代码透视知识库')}</p>
        </div>

        <!-- 模块 1：上次阅读高亮卡片 -->
        ${lastReadCardHtml}

        <!-- 模块 2：知识库完整章节分布 -->
        <div class="welcome-section welcome-chapters-section">
          <div class="welcome-section-header">
            <div class="welcome-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              <span>知识库完整章节分布</span>
            </div>
            <span class="welcome-section-subtitle">共 ${chapters.length} 个核心章节 · 点击文章直达阅读</span>
          </div>
          <div class="welcome-chapters-grid">
            ${chaptersHtml}
          </div>
        </div>

        <!-- 模块 3：最下方的快速切换其他知识库 -->
        <div class="welcome-section welcome-switch-section">
          <div class="welcome-section-header">
            <div class="welcome-section-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
              <span>快速切换其他知识库</span>
            </div>
            <span class="welcome-section-subtitle">可跨仓库秒级穿梭检索</span>
          </div>
          <div class="welcome-repo-grid">${switchReposHtml}</div>
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

    // 绑定事件：切换知识库（在主页直接切换知识库全景大厅，并平滑滚动到顶部，确保极致跟手）
    document.querySelectorAll('.welcome-switch-section .welcome-repo-card').forEach(card => {
      card.addEventListener('click', async () => {
        const repoId = card.getAttribute('data-repoid');
        const targetRepo = state.repos.find(r => r.ID === repoId);
        if (!targetRepo) return;

        // 微触感点击动画
        card.style.transform = 'scale(0.97)';
        setTimeout(() => { card.style.transform = ''; }, 120);

        // 切换仓库（不跳转到单篇历史文档，保持在主页视角）
        await selectRepo(repoId, false);
        state.currentDoc = null;
        state.currentPath = targetRepo.RoutePrefix || '/';
        try {
          window.history.pushState(null, '', targetRepo.RoutePrefix || '/');
        } catch (e) {}

        renderWelcomeDashboard();

        // 立即平滑滚动回顶部，上半部分全景、上次阅读、章节分布即时呈现！
        if (el.contentArea) {
          el.contentArea.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    el.tocList.innerHTML = '';
    el.mobileTocList.innerHTML = '';
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
      window.mermaid.initialize({
        startOnLoad: false,
        theme: state.theme === 'dark' ? 'dark' : 'neutral',
        securityLevel: 'loose',
        fontFamily: 'var(--font-sans)',
        suppressErrorRendering: true
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

  function renderMarkdownDoc(rawMarkdown) {
    mermaidStore.clear();

    const preprocessed = preprocessGithubAlertsFast(rawMarkdown);
    let html = mdParser ? mdParser.render(preprocessed) : '<pre>' + escapeHtml(rawMarkdown) + '</pre>';

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

    el.articleBody.innerHTML = `<div class="markdown-body">${html}</div>`;

    interceptMarkdownLinks();
    enhanceCodeBlocksAsync();
    setupLazyMermaidObserver();

    requestAnimationFrame(() => {
      generateTOC();
    });
  }

  function interceptMarkdownLinks() {
    el.articleBody.querySelectorAll('.markdown-body a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http://') || href.startsWith('https://')) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        return;
      }
      if (href.startsWith('#')) return;

      a.addEventListener('click', (e) => {
        e.preventDefault();
        let targetRoute = href;
        if (!targetRoute.startsWith('/')) {
          const currentDir = state.currentPath.substring(0, state.currentPath.lastIndexOf('/'));
          targetRoute = `${currentDir}/${href}`;
        }
        routeTo(targetRoute, true);
      });
    });
  }

  function preprocessGithubAlertsFast(text) {
    return text.replace(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>.*(?:\n|$))*)/gmi, (match, type, content) => {
      const cleanContent = content.replace(/^>\s?/gm, '');
      const t = type.toLowerCase();
      const icon = ALERT_ICONS[t] || ALERT_ICONS.note;
      const contentHtml = mdParser ? mdParser.render(cleanContent) : cleanContent;
      return `\n<div class="markdown-alert markdown-alert-${t}"><div class="markdown-alert-title">${icon}<span>${t.toUpperCase()}</span></div>${contentHtml}</div>\n`;
    });
  }

  function enhanceCodeBlocksAsync() {
    const pres = Array.from(el.articleBody.querySelectorAll('pre:not([data-enhanced="true"])'));
    if (pres.length === 0) return;

    pres.forEach(pre => {
      pre.setAttribute('data-enhanced', 'true');
      const code = pre.querySelector('code');
      let lang = 'CODE';
      if (code) {
        const cls = code.className || '';
        const match = cls.match(/language-(\w+)/);
        if (match) lang = match[1].toUpperCase();
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);

      const headerBar = document.createElement('div');
      headerBar.className = 'code-header-bar';
      headerBar.innerHTML = `
        <div class="code-header-left">
          <div class="mac-traffic-lights">
            <span class="mac-dot red"></span>
            <span class="mac-dot yellow"></span>
            <span class="mac-dot green"></span>
          </div>
          <span class="code-lang-tag">${lang}</span>
        </div>
        <button class="code-copy-btn">
          ${SVG_ICONS.copy}
          <span>复制</span>
        </button>
      `;

      const copyBtn = headerBar.querySelector('.code-copy-btn');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText((code || pre).innerText);
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
        if (window.Prism && code) {
          try {
            Prism.highlightElement(code);
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

  async function renderSingleMermaidChart(wrapper) {
    if (wrapper.getAttribute('data-rendered') === 'true') return;
    const chartKey = wrapper.getAttribute('data-chart-key');
    const rawCode = mermaidStore.get(chartKey);
    if (!rawCode) return;

    const uniqueSvgId = `svg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    try {
      await ensureMermaidLoaded();
      const { svg } = await window.mermaid.render(uniqueSvgId, rawCode);
      wrapper.innerHTML = `
        <div class="mermaid-toolbar">
          <button class="mermaid-tool-btn" title="全屏高清查看">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            <span>全屏</span>
          </button>
        </div>
        ${svg}
      `;
      wrapper.setAttribute('data-rendered', 'true');

      const expandBtn = wrapper.querySelector('.mermaid-tool-btn');
      if (expandBtn) {
        expandBtn.addEventListener('click', () => {
          const modalBody = document.getElementById('mermaidModalBody');
          if (modalBody) {
            modalBody.innerHTML = svg;
            openModal(document.getElementById('mermaidModal'));
          }
        });
      }
    } catch (e) {
      console.warn('Mermaid render error:', e);
      // 清除 Mermaid 可能在 DOM 中残留的未捕获错误节点（如 #d + uniqueSvgId）
      try {
        const strays = document.querySelectorAll(`[id*="${uniqueSvgId}"]`);
        strays.forEach(n => { if (n !== wrapper && !wrapper.contains(n)) n.remove(); });
      } catch (_) {}

      wrapper.innerHTML = `
        <div style="width:100%;font-size:12px;color:var(--text-secondary);background:var(--bg-surface-hover);padding:14px;border-radius:var(--radius-md);border:1px solid var(--border-default);">
          <div style="font-weight:600;margin-bottom:6px;color:#f59e0b;display:flex;align-items:center;gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>架构图存在语法错误，已降级源码显示：</span>
          </div>
          <pre style="margin:0;background:transparent;border:none;padding:0;font-size:11.5px;color:var(--text-muted);overflow-x:auto;">${escapeHtml(rawCode)}</pre>
        </div>
      `;
      wrapper.setAttribute('data-rendered', 'true');
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
      el.tocList.innerHTML = '<li class="toc-item" style="color:var(--text-muted);font-size:12px;padding:8px 4px;">本文无层级章节标题</li>';
      el.mobileTocList.innerHTML = '<li class="toc-item" style="color:var(--text-muted);font-size:14px;padding:12px;">本文无章节标题</li>';
      return;
    }

    const fragment = document.createDocumentFragment();
    const mobileFragment = document.createDocumentFragment();

    headings.forEach((h, idx) => {
      const id = 'heading-' + idx;
      h.id = id;
      const tag = h.tagName.toLowerCase();
      const text = h.textContent.trim();

      const li = document.createElement('li');
      li.className = `toc-item ${tag}`;
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

    setupScrollSpy(headings);
  }

  function setupScrollSpy(headings) {
    if (scrollSpyObserver) {
      scrollSpyObserver.disconnect();
    }
    const links = el.tocList.querySelectorAll('.toc-link');
    scrollSpyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(l => {
            if (l.getAttribute('href') === '#' + id) {
              l.classList.add('active');
            } else {
              l.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '0px 0px -70% 0px' });

    headings.forEach(h => scrollSpyObserver.observe(h));
  }

  function renderHtmlDoc(path, content) {
    el.tocList.innerHTML = '';
    el.mobileTocList.innerHTML = '';
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
    const ext = path.substring(path.lastIndexOf('.')).replace('.', '');
    el.articleBody.innerHTML = `
      <pre style="max-height:80vh;"><code class="language-${ext}">${escapeHtml(content)}</code></pre>
    `;
    enhanceCodeBlocksAsync();
  }

  function openDraftModal() {
    if (state.currentRepo && el.draftRepo) {
      el.draftRepo.value = state.currentRepo.ID;
    }
    const titleEl = document.getElementById('draftModalTitle');
    if (titleEl) titleEl.textContent = '派发 AI 创作 / 深度研报';
    const typeEl = document.getElementById('draftTaskType');
    if (typeEl) typeEl.value = 'draft';
    openModal(el.aiDraftModal);
  }

  function openAiExplainModal(doc) {
    const prompt = `请对当前技术研报进行深度解剖，全面梳理三大核心架构论点、潜在缺陷与关键边界：${doc.path}`;
    if (el.draftPrompt) el.draftPrompt.value = prompt;
    if (el.draftRepo) el.draftRepo.value = doc.repo_id;
    if (el.draftFileName) el.draftFileName.value = '';
    const titleEl = document.getElementById('draftModalTitle');
    if (titleEl) titleEl.textContent = '派发 AI 深度解剖当前文章';
    const typeEl = document.getElementById('draftTaskType');
    if (typeEl) typeEl.value = 'explain';
    openModal(el.aiDraftModal);
  }

  async function handleDraftSubmit(e) {
    e.preventDefault();
    const prompt = el.draftPrompt.value.trim();
    const repoID = el.draftRepo.value;
    const fileName = el.draftFileName.value.trim();
    const taskType = document.getElementById('draftTaskType').value || 'draft';

    if (!prompt) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: taskType,
          repo_id: repoID,
          target_file: fileName,
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
      el.draftFileName.value = '';
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
      const res = await fetch('/api/tasks?limit=25');
      if (!res.ok) return;
      state.tasks = await res.json();
      renderTaskList();

      const hasRunning = state.tasks.some(t => t.status === 'running' || t.status === 'queued');
      if (el.taskRunningDot) {
        el.taskRunningDot.classList.toggle('running', hasRunning);
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

      item.innerHTML = `
        <div class="terminal-task-status-row">
          <span class="task-status-badge">${statusMap[t.status] || t.status}</span>
          <span class="task-time-str">${new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="terminal-task-prompt" title="${escapeHtml(t.prompt)}">${escapeHtml(t.prompt)}</div>
      `;

      item.addEventListener('click', () => {
        document.querySelectorAll('.terminal-task-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        inspectTask(taskId);
      });

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
        <span style="font-weight:600;color:var(--text-primary);">[${task.type.toUpperCase()}]</span>
        <span>ID: ${taskId.substring(0, 8)}</span>
        <span>仓库: ${escapeHtml(task.repo_id)}</span>
      `;

      if (task.output_file) {
        el.activeTaskActions.innerHTML = `
          <button class="btn btn-primary" id="openGeneratedFileBtn" style="padding:3px 10px;font-size:12px;">
            直达生成文档 ➔
          </button>
        `;
        document.getElementById('openGeneratedFileBtn').addEventListener('click', () => {
          closeAllModals();
          routeTo(task.output_file, true);
        });
      } else {
        el.activeTaskActions.innerHTML = '';
      }
    }

    fetchTaskLogs(taskId);
    state.taskLogTimer = setInterval(() => {
      fetchTaskLogs(taskId);
    }, 2000);
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
        }
      }
    } catch (e) {}
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function unescapeHtml(str) {
    return (str || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  }

})();
