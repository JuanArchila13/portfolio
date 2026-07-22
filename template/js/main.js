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
