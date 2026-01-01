
// Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    follower.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
});

document.addEventListener('mousedown', () => {
    follower.style.transform += ` scale(0.8)`;
});

document.addEventListener('mouseup', () => {
    follower.style.transform = follower.style.transform.replace(' scale(0.8)', '');
});

// Hover effects for links and items
const links = document.querySelectorAll('a, button, .modelo-item');
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        follower.style.transform += ` scale(1.5)`;
        follower.style.background = 'rgba(255,255,255,0.05)';
        follower.style.borderColor = 'rgba(255,255,255,0.5)';
    });
    link.addEventListener('mouseleave', () => {
        follower.style.transform = follower.style.transform.replace(' scale(1.5)', '');
        follower.style.background = 'transparent';
        follower.style.borderColor = 'rgba(255,255,255,0.2)';
    });
});

// Smooth reveal for scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.modelo-item, .demo-box').forEach(el => {
    observer.observe(el);
});

// Simple mesh movement based on mouse
const mesh = document.querySelector('.mesh-gradient');
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    mesh.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
});
