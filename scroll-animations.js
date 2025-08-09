// SuperKonnected Scroll Animations
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
});

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.fade-up, .fade-in, .slide-in');
    animateElements.forEach(el => observer.observe(el));
}

// Add CSS for animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .fade-up {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-up.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .fade-in {
        opacity: 0;
        transition: opacity 0.8s ease;
    }
    
    .fade-in.animate-in {
        opacity: 1;
    }
`;

document.head.appendChild(animationStyles);