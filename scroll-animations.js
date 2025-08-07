/**
 * Modern Scroll Animations voor SuperKonnected
 * Kaarten vliegen van buiten naar binnen tijdens scrollen
 */

class ScrollAnimations {
    constructor() {
        this.animatedElements = new Set();
        this.observer = null;
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupAnimationElements();
        console.info('🚀 Scroll animations geïnitialiseerd!');
    }
    
    setupIntersectionObserver() {
        // Controleer of browser Intersection Observer ondersteunt
        if (!window.IntersectionObserver) {
            console.warn('Intersection Observer niet ondersteund, animaties uitgeschakeld');
            return;
        }
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Kaart komt in beeld - animeer naar binnen
                    this.animateIn(entry.target);
                } else {
                    // Kaart verdwijnt uit beeld - animeer naar buiten
                    this.animateOut(entry.target);
                }
            });
        }, {
            threshold: 0.2, // Trigger wanneer 20% zichtbaar is
            rootMargin: '0px 0px -80px 0px' // Meer ruimte voor soepele overgangen
        });
    }
    
    setupAnimationElements() {
        // Selecteer alle kaart-elementen (behalve in hero sectie)
        const cardSelectors = [
            '.stat-card',
            '.pillar-card', 
            '.platform-card',
            '.pricing-card',
            '.episode-card',
            '.abdul-biography',
            '.why-choose-card',
            '.testimonial-card',
            '.signup-card',
            '.partner-logo'
        ];
        
        cardSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                // Skip elementen in hero sectie
                if (element.closest('.hero, .hero-section')) {
                    return;
                }
                
                // Voeg animatie klasse toe
                element.classList.add('scroll-animate');
                
                // Bepaal animatie richting gebaseerd op positie
                const animationType = this.getAnimationType(element, index);
                element.classList.add(animationType);
                
                // Voeg stagger delay toe voor meer dynamiek
                const delay = (index % 4) * 200; // 200ms per kaart, max 4 tegelijk voor soepelere flow
                element.style.setProperty('--animation-delay', `${delay}ms`);
                
                // Start observing
                if (this.observer) {
                    this.observer.observe(element);
                }
                
                this.animatedElements.add(element);
            });
        });
        
        console.log(`📋 ${this.animatedElements.size} elementen voorbereid voor animatie`);
    }
    
    getAnimationType(element, index) {
        // Bepaal animatie richting gebaseerd op elementtype en positie
        const types = ['slide-up', 'slide-left', 'slide-right', 'fade-scale'];
        
        // Specifieke richtingen voor verschillende elementen
        if (element.classList.contains('stat-card')) {
            return index % 2 === 0 ? 'slide-left' : 'slide-right';
        }
        
        if (element.classList.contains('pillar-card')) {
            if (index === 0) return 'slide-left';
            if (index === 1) return 'slide-up';
            if (index === 2) return 'slide-right';
        }
        
        if (element.classList.contains('platform-card')) {
            if (index === 0) return 'slide-left';
            if (index === 1) return 'slide-up';
            if (index === 2) return 'slide-right';
        }
        
        if (element.classList.contains('pricing-card')) {
            if (index === 0) return 'slide-left';
            if (index === 1) return 'fade-scale'; // Premium kaart
            if (index === 2) return 'slide-right';
        }
        
        // Default voor andere elementen
        return types[index % types.length];
    }
    
    animateIn(element) {
        // Verwijder mogelijk bestaande animate-out klasse
        element.classList.remove('animate-out');
        
        // Voeg animate-in klasse toe voor de transitie
        requestAnimationFrame(() => {
            element.classList.add('animate-in');
        });
        
        // Log voor debugging
        console.log(`✨ Animatie IN gestart voor:`, element.className);
    }
    
    animateOut(element) {
        // Verwijder animate-in en voeg animate-out toe
        element.classList.remove('animate-in');
        
        requestAnimationFrame(() => {
            element.classList.add('animate-out');
        });
        
        // Log voor debugging
        console.log(`🌫️ Animatie OUT gestart voor:`, element.className);
    }
    
    // Manual trigger functie
    triggerAnimation(element) {
        if (element.classList.contains('scroll-animate') && !element.classList.contains('animate-in')) {
            this.animateIn(element);
        }
    }
    
    // Reset alle animaties (voor testing)
    resetAll() {
        this.animatedElements.forEach(element => {
            element.classList.remove('animate-in', 'animate-out');
            if (this.observer) {
                this.observer.observe(element);
            }
        });
        console.log('🔄 Alle animaties gereset');
    }
    
    // Cleanup
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.animatedElements.forEach(element => {
            element.classList.remove('scroll-animate', 'animate-in', 'animate-out', 'slide-up', 'slide-left', 'slide-right', 'fade-scale');
            element.style.removeProperty('--animation-delay');
        });
        
        this.animatedElements.clear();
        console.log('🧹 Scroll animations opgeruimd');
    }
}

// Auto-initialisatie wanneer DOM ready is
document.addEventListener('DOMContentLoaded', () => {
    // Kleine vertraging om ervoor te zorgen dat alle styles geladen zijn
    setTimeout(() => {
        window.scrollAnimations = new ScrollAnimations();
    }, 100);
});

// Voeg refresh functie toe voor dynamische content
function refreshScrollAnimations() {
    if (window.scrollAnimations) {
        window.scrollAnimations.destroy();
        window.scrollAnimations = new ScrollAnimations();
    }
}

// Export voor gebruik
window.ScrollAnimations = ScrollAnimations;
window.refreshScrollAnimations = refreshScrollAnimations;