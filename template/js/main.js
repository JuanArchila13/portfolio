/**
 * Lógica compartida para la plantilla de documentación de proyectos.
 * Incluye: tema claro/oscuro, AOS, animación de skill bars,
 * navegación activa al hacer scroll y manejo del formulario.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAOS();
    initSkillsObserver();
    initActiveNavOnScroll();
    initMobileMenu();
    initFormHandler();
    initSmoothScroll();
    initImageLightbox();
    initGalleryCarousels();
});

/* ---------- TEMA CLARO / OSCURO ---------- */
function initTheme() {
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const icon = toggle.querySelector('.knob i');

    function applyTheme(theme) {
        html.classList.toggle('dark', theme === 'dark');
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        localStorage.setItem('theme', theme);
    }

    // Por defecto el tema principal es claro
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    toggle.addEventListener('click', () => {
        applyTheme(html.classList.contains('dark') ? 'light' : 'dark');
    });
}

/* ---------- ANIMACIONES AOS ---------- */
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 900,
            once: true,
            offset: 80,
            easing: 'ease-out-cubic'
        });
    }
}

/* ---------- ANIMACIÓN DE BARRAS DE HABILIDADES ---------- */
function initSkillsObserver() {
    const skillsContainer = document.getElementById('skills');
    if (!skillsContainer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.skill-fill').forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.width = bar.dataset.width + '%';
                    }, index * 120);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(skillsContainer);
}

/* ---------- NAVEGACIÓN ACTIVA AL HACER SCROLL ---------- */
function initActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.navbar-menu a[href^="#"]');
    if (!sections.length || !links.length) return;

    const onScroll = () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ---------- MENÚ MÓVIL ---------- */
function initMobileMenu() {
    const toggler = document.querySelector('.navbar-toggler');
    const menu = document.querySelector('.navbar-menu');
    if (!toggler || !menu) return;

    toggler.addEventListener('click', () => {
        menu.classList.toggle('open');
        const isOpen = menu.classList.contains('open');
        toggler.setAttribute('aria-expanded', String(isOpen));
    });

    // Cerrar menú al hacer clic en un enlace
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            toggler.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ---------- FORMULARIO DE CONTACTO / DEMO ---------- */
function initFormHandler() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;

        button.innerHTML = '¡Mensaje enviado! <i class="fas fa-check"></i>';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            form.reset();
        }, 2500);
    });
}

/* ---------- SCROLL SUAVE PARA ANCLAS ---------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ---------- CARRUSEL DE GALERÍA ---------- */
function initGalleryCarousels() {
    const english = document.documentElement.lang.startsWith('en');
    document.querySelectorAll('[data-gallery-carousel]').forEach(carousel => {
        const track = carousel.querySelector('.gallery-carousel-track');
        const slides = [...track.querySelectorAll('.gallery-carousel-slide')];
        const controls = carousel.querySelector('.gallery-carousel-controls');
        const pagination = carousel.querySelector('.gallery-carousel-pagination');
        const status = carousel.querySelector('[data-carousel-status]');
        const autoplayButton = carousel.querySelector('[data-carousel-autoplay]');
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let active = 0;
        let scrollTimer = null;
        let autoplayTimer = null;
        let paused = motion.matches;
        let visible = false;
        let hovered = false;
        let touching = false;
        const dots = slides.map((slide, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'gallery-carousel-dot';
            dot.setAttribute('aria-label', `${english ? 'Show image' : 'Ver imagen'} ${index + 1}: ${slide.querySelector('img').alt}`);
            dot.addEventListener('click', () => goTo(index));
            pagination.append(dot);
            return dot;
        });

        function render() {
            const focusedSlide = slides.find(slide => slide.contains(document.activeElement));
            slides.forEach((slide, index) => {
                slide.inert = index !== active;
                slide.setAttribute('aria-hidden', String(index !== active));
                dots[index].setAttribute('aria-current', String(index === active));
            });
            status.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
            status.setAttribute('aria-label', english ? `Image ${active + 1} of ${slides.length}` : `Imagen ${active + 1} de ${slides.length}`);
            if (focusedSlide && focusedSlide !== slides[active]) {
                slides[active].querySelector('button')?.focus({ preventScroll: true });
            }
        }

        function goTo(index) {
            window.clearTimeout(scrollTimer);
            active = (index + slides.length) % slides.length;
            render();
            track.scrollTo({
                left: active * track.clientWidth,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });
            scheduleAutoplay();
        }

        function canAutoplay() {
            return slides.length > 1 && !paused && visible && !document.hidden
                && !hovered && !touching && !carousel.contains(document.activeElement)
                && !document.documentElement.classList.contains('image-lightbox-open');
        }

        function scheduleAutoplay() {
            window.clearTimeout(autoplayTimer);
            autoplayTimer = null;
            status.setAttribute('aria-live', canAutoplay() ? 'off' : 'polite');
            if (autoplayButton) {
                const label = english
                    ? (paused ? 'Resume slideshow' : 'Pause slideshow')
                    : (paused ? 'Reanudar carrusel' : 'Pausar carrusel');
                autoplayButton.setAttribute('aria-label', label);
                autoplayButton.setAttribute('title', label);
                autoplayButton.querySelector('i').className = paused ? 'fas fa-play' : 'fas fa-pause';
            }
            if (canAutoplay()) {
                autoplayTimer = window.setTimeout(() => {
                    autoplayTimer = null;
                    if (canAutoplay()) goTo(active + 1);
                }, 5000);
            }
        }

        autoplayButton?.addEventListener('click', () => {
            paused = !paused;
            scheduleAutoplay();
        });
        carousel.addEventListener('pointerenter', event => {
            hovered = event.pointerType === 'mouse';
            scheduleAutoplay();
        });
        carousel.addEventListener('pointerleave', () => {
            hovered = false;
            scheduleAutoplay();
        });
        carousel.addEventListener('pointerdown', () => {
            touching = true;
            scheduleAutoplay();
        });
        const endTouch = () => {
            touching = false;
            scheduleAutoplay();
        };
        window.addEventListener('pointerup', endTouch);
        window.addEventListener('pointercancel', endTouch);
        carousel.addEventListener('focusin', scheduleAutoplay);
        carousel.addEventListener('focusout', () => window.setTimeout(scheduleAutoplay, 0));
        document.addEventListener('visibilitychange', scheduleAutoplay);
        document.addEventListener('image-lightbox-statechange', scheduleAutoplay);
        motion.addEventListener('change', event => {
            if (event.matches) paused = true;
            scheduleAutoplay();
        });
        if (typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver(entries => {
                visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .25;
                scheduleAutoplay();
            }, { threshold: .25 });
            observer.observe(carousel);
        } else {
            visible = true;
        }
        carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => goTo(active - 1));
        carousel.querySelector('[data-carousel-next]').addEventListener('click', () => goTo(active + 1));
        carousel.addEventListener('keydown', event => {
            const destinations = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: slides.length - 1 };
            if (!(event.key in destinations)) return;
            event.preventDefault();
            goTo(destinations[event.key]);
        });
        track.addEventListener('scroll', () => {
            window.clearTimeout(scrollTimer);
            scrollTimer = window.setTimeout(() => {
                if (!track.clientWidth) return;
                active = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
                render();
                scheduleAutoplay();
            }, 100);
        }, { passive: true });
        window.addEventListener('resize', () => {
            track.scrollTo({ left: active * track.clientWidth, behavior: 'auto' });
        });
        controls.hidden = slides.length < 2;
        render();
        scheduleAutoplay();
    });
}

/* ---------- VISOR DE IMÁGENES ---------- */
function initImageLightbox() {
    if (typeof HTMLDialogElement === 'undefined') return;

    const images = [...document.querySelectorAll('main img')]
        .filter(image => !image.closest('a, button, [data-no-lightbox]'));
    if (!images.length) return;

    const english = document.documentElement.lang.startsWith('en');
    const labels = english
        ? { title: 'Image preview', close: 'Close image preview', open: 'Enlarge image' }
        : { title: 'Vista ampliada', close: 'Cerrar imagen', open: 'Ampliar imagen' };
    const dialog = document.createElement('dialog');
    dialog.className = 'image-lightbox';
    dialog.setAttribute('aria-labelledby', 'image-lightbox-title');
    dialog.innerHTML = `
        <div class="image-lightbox-header">
            <h2 class="image-lightbox-title" id="image-lightbox-title">${labels.title}</h2>
            <button class="image-lightbox-close" type="button" aria-label="${labels.close}" autofocus>&times;</button>
        </div>
        <img class="image-lightbox-image" alt="">
        <p class="image-lightbox-caption"></p>`;
    document.body.append(dialog);

    const preview = dialog.querySelector('.image-lightbox-image');
    const caption = dialog.querySelector('.image-lightbox-caption');
    const closeButton = dialog.querySelector('.image-lightbox-close');
    let trigger = null;
    let startedOutside = false;
    let closeTimer = null;

    function openImage(image, opener) {
        if (dialog.open) return;
        trigger = opener;
        startedOutside = false;
        preview.src = image.currentSrc || image.src;
        preview.alt = image.alt;
        caption.textContent = image.alt;
        dialog.showModal();
        document.documentElement.classList.add('image-lightbox-open');
        document.dispatchEvent(new CustomEvent('image-lightbox-statechange'));
        closeButton.focus();
    }

    function closeImage() {
        if (!dialog.open || dialog.classList.contains('is-closing')) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            dialog.close();
            return;
        }
        dialog.classList.add('is-closing');
        // Fallback if the animation is interrupted or disabled by another stylesheet.
        closeTimer = window.setTimeout(() => dialog.close(), 300);
    }

    function isOutside(event) {
        const bounds = dialog.getBoundingClientRect();
        return event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom;
    }

    closeButton.addEventListener('click', closeImage);
    dialog.addEventListener('cancel', event => {
        event.preventDefault();
        closeImage();
    });
    dialog.addEventListener('animationend', event => {
        if (event.target === dialog && event.animationName === 'image-lightbox-out'
            && dialog.classList.contains('is-closing')) {
            dialog.close();
        }
    });
    dialog.addEventListener('pointerdown', event => {
        startedOutside = event.target === dialog && isOutside(event);
    });
    dialog.addEventListener('click', event => {
        if (startedOutside && event.target === dialog && isOutside(event)) closeImage();
        startedOutside = false;
    });
    dialog.addEventListener('close', () => {
        window.clearTimeout(closeTimer);
        closeTimer = null;
        dialog.classList.remove('is-closing');
        document.documentElement.classList.remove('image-lightbox-open');
        preview.removeAttribute('src');
        trigger?.focus({ preventScroll: true });
        document.dispatchEvent(new CustomEvent('image-lightbox-statechange'));
    });

    images.forEach(image => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'image-lightbox-trigger';
        button.setAttribute('aria-label', `${labels.open}: ${image.alt || labels.title}`);
        button.setAttribute('aria-haspopup', 'dialog');
        image.before(button);
        button.append(image);
        button.addEventListener('click', () => openImage(image, button));

        const figure = button.closest('.architecture-figure');
        const enlargeLink = figure?.querySelector('figcaption a');
        if (enlargeLink) {
            enlargeLink.removeAttribute('target');
            enlargeLink.setAttribute('aria-haspopup', 'dialog');
            enlargeLink.addEventListener('click', event => {
                event.preventDefault();
                openImage(image, enlargeLink);
            });
        }
    });
}
