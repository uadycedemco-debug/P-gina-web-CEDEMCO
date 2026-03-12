/* ==============================
   CEDEMCO — SCRIPTS COMPARTIDOS
   ============================== */

(function () {
    'use strict';

    // --- CONFIGURACIÓN ---
    var WHATSAPP_NUMBER = '529993358915';
    var WHATSAPP_MESSAGE = '¡Hola! Me gustaría obtener más información sobre CEDEMCO.';

    // --- MENÚ MÓVIL ---
    window.toggleMenu = function () {
        var menu = document.getElementById('mobile-menu');
        var btn = document.querySelector('.hamburger-btn');
        if (menu && btn) {
            menu.classList.toggle('open');
            btn.classList.toggle('open');
            document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
        }
    };

    // --- NAVEGACIÓN: OCULTAR AL HACER SCROLL ---
    function initNavScroll() {
        var lastScroll = 0;
        var nav = document.querySelector('.nav-container');
        if (!nav) return;

        window.addEventListener('scroll', function () {
            var currentScroll = window.scrollY;

            // Add scrolled class for shadow
            if (currentScroll > 10) {
                document.body.classList.add('nav-scrolled');
            } else {
                document.body.classList.remove('nav-scrolled');
                document.body.classList.remove('nav-hidden');
            }

            // Hide on scroll down, show on scroll up
            if (currentScroll > 80) {
                if (currentScroll > lastScroll && currentScroll > 200) {
                    document.body.classList.add('nav-hidden');
                } else {
                    document.body.classList.remove('nav-hidden');
                }
            }

            lastScroll = currentScroll;
        });
    }

    // --- AÑO DINÁMICO EN FOOTER ---
    function initDynamicYear() {
        var yearEls = document.querySelectorAll('.dynamic-year');
        var year = new Date().getFullYear();
        yearEls.forEach(function (el) {
            el.textContent = year;
        });
    }

    // --- ANIMACIONES AL SCROLL (Intersection Observer) ---
    function initScrollAnimations() {
        var elements = document.querySelectorAll('.animate-fade-in');
        if (!elements.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        elements.forEach(function (el) {
            observer.observe(el);
        });
    }

    // --- SMOOTH SCROLL PARA LINKS INTERNOS ---
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                var target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    var offset = 80;
                    var pos = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: pos, behavior: 'smooth' });
                }
            });
        });
    }

    // --- ACTIVE NAV LINK ---
    function initActiveNavLink() {
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage === '') currentPage = 'index.html';
        document.querySelectorAll('.nav-link, .mobile-menu-link').forEach(function (link) {
            var href = link.getAttribute('href');
            if (!href) return;
            // Only match exact page links, not anchor-only links
            var hasHash = href.indexOf('#') !== -1;
            var linkPage = href.split('#')[0];
            // Skip anchor-only links (like "#nosotros") for active marking
            if (hasHash && linkPage === '') return;
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // --- BLOG: CARGAR ARTÍCULOS ---
    window.loadBlogArticles = function (containerId, limit, category) {
        var container = document.getElementById(containerId);
        if (!container) return;

        fetch('blog/articles.json')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var articles = data.articles || [];

                // Filter by category if provided
                if (category && category !== 'todos') {
                    articles = articles.filter(function (a) {
                        return a.category.toLowerCase() === category.toLowerCase();
                    });
                }

                // Sort by date (newest first)
                articles.sort(function (a, b) {
                    return new Date(b.date) - new Date(a.date);
                });

                // Limit
                if (limit) {
                    articles = articles.slice(0, limit);
                }

                if (articles.length === 0) {
                    container.innerHTML = '<p style="text-align:center;color:var(--cedemco-gray-300);grid-column:1/-1;padding:3rem;">No se encontraron artículos.</p>';
                    return;
                }

                container.innerHTML = articles.map(function (article) {
                    var dateStr = new Date(article.date).toLocaleDateString('es-MX', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                    return '<a href="articulo.html?id=' + article.id + '" class="blog-card animate-fade-in">' +
                        '<div class="blog-card-image-wrapper">' +
                        '<img src="' + (article.image || 'images/blog-default.jpg') + '" alt="' + article.title + '" class="blog-card-image" loading="lazy" onerror="this.src=\'images/blog-default.jpg\'">' +
                        '<span class="blog-card-category">' + article.category + '</span>' +
                        '</div>' +
                        '<div class="blog-card-body">' +
                        '<span class="blog-card-date">' + dateStr + '</span>' +
                        '<h3 class="blog-card-title">' + article.title + '</h3>' +
                        '<p class="blog-card-excerpt">' + article.excerpt + '</p>' +
                        '<span class="blog-card-link">Leer más →</span>' +
                        '</div>' +
                        '</a>';
                }).join('');

                // Re-init scroll animations for new elements
                initScrollAnimations();
            })
            .catch(function (err) {
                console.error('Error cargando artículos:', err);
                container.innerHTML = '<p style="text-align:center;color:var(--cedemco-gray-300);grid-column:1/-1;">Error al cargar los artículos.</p>';
            });
    };

    // --- BLOG: CARGAR ARTÍCULO INDIVIDUAL ---
    window.loadArticle = function () {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('id');
        if (!id) return;

        fetch('blog/articles.json')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var article = (data.articles || []).find(function (a) { return a.id === id; });
                if (!article) {
                    document.getElementById('article-title').textContent = 'Artículo no encontrado';
                    return;
                }

                // Set header info
                var titleEl = document.getElementById('article-title');
                var dateEl = document.getElementById('article-date');
                var authorEl = document.getElementById('article-author');
                var categoryEl = document.getElementById('article-category');

                if (titleEl) titleEl.textContent = article.title;
                if (dateEl) dateEl.textContent = new Date(article.date).toLocaleDateString('es-MX', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                if (authorEl) authorEl.textContent = article.author;
                if (categoryEl) categoryEl.textContent = article.category;

                document.title = article.title + ' | Blog CEDEMCO';

                // Load markdown content
                return fetch(article.file);
            })
            .then(function (res) {
                if (!res) return;
                return res.text();
            })
            .then(function (md) {
                if (!md) return;
                // Remove first # heading (already shown in article header)
                md = md.replace(/^#\s+.*\n+/, '');
                var contentEl = document.getElementById('article-body');
                if (contentEl && window.marked) {
                    contentEl.innerHTML = window.marked.parse(md);
                } else if (contentEl) {
                    // Fallback: basic markdown rendering
                    contentEl.innerHTML = basicMarkdown(md);
                }
            })
            .catch(function (err) {
                console.error('Error cargando artículo:', err);
            });
    };

    // --- BASIC MARKDOWN RENDERER (Fallback) ---
    function basicMarkdown(text) {
        var html = text
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        return '<p>' + html + '</p>';
    }

    // --- BLOG FILTER ---
    window.filterBlog = function (category, btn) {
        document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        if (btn) btn.classList.add('active');
        window.loadBlogArticles('blog-grid', null, category);
    };

    // --- WHATSAPP LINK ---
    window.openWhatsApp = function (customMessage) {
        var msg = encodeURIComponent(customMessage || WHATSAPP_MESSAGE);
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + msg, '_blank');
    };

    // --- COUNTER ANIMATION ---
    function initCounters() {
        var counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var target = parseInt(entry.target.getAttribute('data-count'));
                    var suffix = entry.target.getAttribute('data-suffix') || '';
                    animateCounter(entry.target, 0, target, 2000, suffix);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function (el) { observer.observe(el); });
    }

    function animateCounter(el, start, end, duration, suffix) {
        var range = end - start;
        var startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(start + range * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // --- INICIALIZACIÓN ---
    function init() {
        initNavScroll();
        initDynamicYear();
        initScrollAnimations();
        initSmoothScroll();
        initActiveNavLink();
        initCounters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
