
// Scroll Reveal Animation
const revealElements = document.querySelectorAll('[data-reveal]');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, {
    threshold: 0.1
});

revealElements.forEach(el => observer.observe(el));

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth Scroll for Nav Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Scanning Line Animation for the Scout Visual
const scoutVisual = document.querySelector('.scout-visual');
if (scoutVisual) {
    const line = document.createElement('div');
    line.style.position = 'absolute';
    line.style.width = '100%';
    line.style.height = '2px';
    line.style.background = 'var(--primary)';
    line.style.boxShadow = '0 0 15px var(--primary)';
    line.style.top = '0';
    line.style.zIndex = '5';
    scoutVisual.appendChild(line);

    let pos = 0;
    setInterval(() => {
        pos += 2;
        if (pos > 500) pos = 0;
        line.style.top = pos + 'px';
    }, 20);
}

// Restricted Access Meta-Logic
const modal = document.getElementById('access-modal');
const trigger = document.getElementById('restricted-trigger');

if (trigger) {
    trigger.addEventListener('click', () => {
        modal.style.display = 'block';
    });
}

function verifyAccess() {
    const code = document.getElementById('access-code').value;
    if (code.toLowerCase() === 'vip2025' || code.toLowerCase() === 'costa') {
        window.location.href = './proyectos_vip/index.html';
    } else {
        alert('Código de acceso inválido. Por favor, contacte con su consultor estratégico.');
    }
}
