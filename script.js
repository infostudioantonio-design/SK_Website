// SuperKonnected Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Register Service Worker for PWA
    registerServiceWorker();
    
    // Mobile Menu Toggle
    initMobileMenu();
    
    // Smooth Scrolling for Navigation Links
    initSmoothScrolling();
    
    // Navbar Background on Scroll
    initNavbarScroll();
    
    // Abdul Bio Toggle
    initAbdulBioToggle();
    
    // Episode Play Buttons
    initEpisodePlayButtons();
    
    // Additional fallback for Abdul bio toggle
    setTimeout(() => {
        const readMoreBtn = document.getElementById('read-more-btn');
        if (readMoreBtn && !readMoreBtn.hasAttribute('data-initialized')) {
            readMoreBtn.setAttribute('data-initialized', 'true');
            readMoreBtn.addEventListener('click', toggleBiography);
        }
    }, 500);
    
    // Intersection Observer for Animations
    initScrollAnimations();
    
    // Partners Carousel
    initPartnersCarousel();
    
    // Hero Parallax Effect
    initHeroParallax();
    
    // Initialize Performance Monitoring
    initPerformanceMonitoring();
    
    // Initialize Lazy Loading
    initLazyLoading();
    
    // Initialize Theme Toggle
    initThemeToggle();
    

    
    // Initialize Analytics
    initAnalytics();
    
    // Hide loading screen
    hideLoadingScreen();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });
    }
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar Background on Scroll
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Abdul Bio Toggle
function initAbdulBioToggle() {
    // Use timeout to ensure DOM is fully loaded
    setTimeout(() => {
        const readMoreBtn = document.getElementById('read-more-btn');
        const bioFull = document.getElementById('bio-full');
        const btnText = document.querySelector('.btn-text');
        const bioPreview = document.querySelector('.bio-preview');
        
        if (readMoreBtn && bioFull && btnText && bioPreview) {
            readMoreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = bioFull.classList.contains('expanded');
                
                if (isExpanded) {
                    // Collapse
                    bioFull.classList.remove('expanded');
                    readMoreBtn.classList.remove('expanded');
                    btnText.textContent = 'Lees meer';
                    bioPreview.style.display = 'block';
                    
                    // Smooth scroll to bio start
                    setTimeout(() => {
                        const abdulBio = document.querySelector('.abdul-biography');
                        if (abdulBio) {
                            abdulBio.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start' 
                            });
                        }
                    }, 300);
                } else {
                    // Expand
                    bioFull.classList.add('expanded');
                    readMoreBtn.classList.add('expanded');
                    btnText.textContent = 'Lees minder';
                    bioPreview.style.display = 'none';
                }
            });
        }
    }, 100);
}

// Global function for onclick in HTML
function toggleBiography() {
    const readMoreBtn = document.getElementById('read-more-btn');
    const bioFull = document.getElementById('bio-full');
    const btnText = document.querySelector('.btn-text');
    const bioPreview = document.querySelector('.bio-preview');
    
    if (readMoreBtn && bioFull && btnText && bioPreview) {
        const isExpanded = bioFull.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse
            bioFull.classList.remove('expanded');
            readMoreBtn.classList.remove('expanded');
            btnText.textContent = 'Lees meer';
            bioPreview.style.display = 'block';
            
            // Smooth scroll to bio start
            setTimeout(() => {
                const abdulBio = document.querySelector('.abdul-biography');
                if (abdulBio) {
                    abdulBio.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }, 300);
        } else {
            // Expand
            bioFull.classList.add('expanded');
            readMoreBtn.classList.add('expanded');
            btnText.textContent = 'Lees minder';
            bioPreview.style.display = 'none';
        }
    }
}

// Episode Play Buttons
function initEpisodePlayButtons() {
    const playButtons = document.querySelectorAll('.play-button');
    
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Add loading animation
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // Simulate loading
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-pause"></i>';
                
                // Here you would integrate with your actual podcast player
                console.log('Play episode functionality would be implemented here');
                
                // Reset after demo
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-play"></i>';
                }, 3000);
            }, 1000);
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Stagger animations for grids
                if (entry.target.classList.contains('features-grid') || 
                    entry.target.classList.contains('episodes-grid') ||
                    entry.target.classList.contains('pricing-grid')) {
                    staggerChildren(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animateElements = document.querySelectorAll([
        '.feature-card',
        '.episode-card',
        '.pricing-card',
        '.community-stat-card',
        '.social-link',
        '.abdul-content',
        '.stats-section'
    ].join(', '));
    
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Stagger children animations
function staggerChildren(parent) {
    const children = parent.children;
    Array.from(children).forEach((child, index) => {
        setTimeout(() => {
            child.classList.add('animate-in');
        }, index * 100);
    });
}

// Partners Carousel
function initPartnersCarousel() {
    const carousel = document.querySelector('.partners-carousel');
    
    if (carousel) {
        // Add infinite scroll effect
        let scrollAmount = 0;
        const scrollStep = 1;
        const scrollInterval = 50;
        
        function autoScroll() {
            scrollAmount += scrollStep;
            if (scrollAmount >= carousel.scrollWidth / 2) {
                scrollAmount = 0;
            }
            carousel.scrollLeft = scrollAmount;
        }
        
        // Auto scroll (commented out for now, can be enabled)
        // setInterval(autoScroll, scrollInterval);
        
        // Pause on hover
        carousel.addEventListener('mouseenter', function() {
            // clearInterval(autoScrollInterval);
        });
        
        carousel.addEventListener('mouseleave', function() {
            // autoScrollInterval = setInterval(autoScroll, scrollInterval);
        });
    }
}

// Utility function for throttling
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Add CSS classes for animations
const style = document.createElement('style');
style.textContent = `
    /* Scroll Animations */
    .feature-card,
    .episode-card,
    .pricing-card,
    .community-stat-card,
    .social-link {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .feature-card.animate-in,
    .episode-card.animate-in,
    .pricing-card.animate-in,
    .community-stat-card.animate-in,
    .social-link.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .abdul-content {
        opacity: 0;
        transform: translateX(-30px);
        transition: all 0.8s ease;
    }
    
    .abdul-content.animate-in {
        opacity: 1;
        transform: translateX(0);
    }
    
    .stats-section {
        opacity: 0;
        transform: scale(0.95);
        transition: all 0.8s ease;
    }
    
    .stats-section.animate-in {
        opacity: 1;
        transform: scale(1);
    }
    
    /* Navbar Scroll Effect */
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }
    
    /* Mobile Menu Styles */
    @media (max-width: 768px) {
        .nav-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 1rem;
            gap: 1rem;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }
        
        .nav-link {
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .nav-link:last-child {
            border-bottom: none;
        }
    }
    
    /* Loading Animation */
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    /* Hover Effects */
    .feature-card:hover .feature-icon {
        transform: scale(1.1);
    }
    
    .episode-card:hover .play-button {
        background: rgba(255, 255, 255, 1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .pricing-card:hover {
        border-color: var(--primary-orange);
    }
    
    .social-link:hover i {
        transform: scale(1.2);
    }
    
    /* Focus states for accessibility */
    .btn:focus,
    .nav-link:focus,
    .bio-toggle:focus {
        outline: 2px solid var(--primary-orange);
        outline-offset: 2px;
    }
`;

document.head.appendChild(style);

// Performance optimization: Lazy load images when they become available
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        // Also observe background images for lazy loading
        const backgroundObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const bgImage = element.dataset.bgImage;
                    if (bgImage) {
                        element.style.backgroundImage = `url(${bgImage})`;
                        element.classList.remove('lazy-bg');
                        observer.unobserve(element);
                    }
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('[data-bg-image]').forEach(element => {
            backgroundObserver.observe(element);
        });
    }
}

// Hero Parallax Effect
function initHeroParallax() {
    const heroLayers = {
        layer3: document.querySelector('.hero-layer-3'),
        layer4: document.querySelector('.hero-layer-4'),
        layer5: document.querySelector('.hero-layer-5'),
        layer6: document.querySelector('.hero-layer-6'),
        layer7: document.querySelector('.hero-layer-7')
    };
    
    // Check if elements exist
    const hasLayers = Object.values(heroLayers).every(layer => layer !== null);
    if (!hasLayers) return;
    
    const parallaxHandler = throttle(function() {
        const scrollY = window.pageYOffset;
        const heroHeight = window.innerHeight;
        
        // Only apply parallax when hero is in view
        if (scrollY < heroHeight) {
            const scrollFactor = scrollY / heroHeight;
            
            // Layer 3 and 4 remain static (no movement)
            
            // Synchronized breathing for layers 5 and 6
            const breatheAmount = Math.sin(Date.now() * 0.001) * 0.02;
            
            if (heroLayers.layer5) {
                heroLayers.layer5.style.transform = `translateY(${scrollY * 0.2}px) scale(${1 + breatheAmount})`;
            }
            
            if (heroLayers.layer6) {
                heroLayers.layer6.style.transform = `translateY(${scrollY * 0.2}px) scale(${1 + breatheAmount})`;
            }
            
            if (heroLayers.layer7) {
                heroLayers.layer7.style.transform = `translateY(${scrollY * 0.3}px)`;
            }
        }
    }, 16); // 60fps
    
    // Add scroll listener
    window.addEventListener('scroll', parallaxHandler);
    
    // Performance optimization: Remove listener when hero is out of view
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                window.addEventListener('scroll', parallaxHandler);
            } else {
                window.removeEventListener('scroll', parallaxHandler);
            }
        });
    }, { threshold: 0 });
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroObserver.observe(heroSection);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
} else {
    initLazyLoading();
}

// Accordion Component Functionality
function toggleAccordion(categoryId) {
    const content = document.getElementById(`${categoryId}-content`);
    const icon = document.getElementById(`${categoryId}-icon`);
    const isOpen = content.classList.contains('open');
    
    // Close all other accordion items
    const allContents = document.querySelectorAll('.accordion-content');
    const allIcons = document.querySelectorAll('.accordion-icon');
    
    allContents.forEach(content => {
        content.classList.remove('open');
        content.style.maxHeight = '0px';
    });
    
    allIcons.forEach(icon => {
        icon.style.transform = 'rotate(0deg)';
    });
    
    // Toggle current accordion item
    if (!isOpen) {
        content.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
    }
}

// Initialize accordion functionality when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Accordion is already initialized via onclick handlers
        initializeEntrepreneurSearch();
    });
} else {
    // Accordion is already initialized via onclick handlers
    initializeEntrepreneurSearch();
}

// Entrepreneur Search Functionality
function initializeEntrepreneurSearch() {
    const searchInput = document.getElementById('entrepreneur-search');
    const provinceFilter = document.getElementById('province-filter');
    const cityFilter = document.getElementById('city-filter');
    const distanceFilter = document.getElementById('distance-filter');
    const resultsCount = document.getElementById('search-results-count');
    
    if (!searchInput) return;
    
    // Debounce function to limit search frequency
    let searchTimeout;
    
    // Function to perform search with all filters
    function performAdvancedSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = searchInput.value;
            const province = provinceFilter ? provinceFilter.value : '';
            const city = cityFilter ? cityFilter.value : '';
            const distance = distanceFilter ? distanceFilter.value : '';
            
            performSearch(searchTerm, province, city, distance);
        }, 300);
    }
    
    // Add event listeners for all search inputs
    searchInput.addEventListener('input', performAdvancedSearch);
    
    if (provinceFilter) {
        provinceFilter.addEventListener('change', performAdvancedSearch);
    }
    
    if (cityFilter) {
        cityFilter.addEventListener('input', performAdvancedSearch);
    }
    
    if (distanceFilter) {
        distanceFilter.addEventListener('input', performAdvancedSearch);
    }
    
    // Clear search when input is cleared
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            performAdvancedSearch();
        }
    });
    
    // Load entrepreneurs data after a short delay to ensure DOM is ready
    setTimeout(() => {
        if (typeof loadEntrepreneursIntoAccordion === 'function') {
            loadEntrepreneursIntoAccordion();
        }
    }, 1000);
}

function performSearch(searchTerm, province = '', city = '', distance = '') {
    const entrepreneurItems = document.querySelectorAll('.entrepreneur-item');
    const resultsCount = document.getElementById('search-results-count');
    let visibleCount = 0;
    
    entrepreneurItems.forEach(item => {
        const name = item.getAttribute('data-name') || '';
        const profession = item.getAttribute('data-profession') || '';
        const location = item.getAttribute('data-location') || '';
        const specialty = item.getAttribute('data-specialty') || '';
        const itemProvince = item.getAttribute('data-province') || '';
        const itemCity = item.getAttribute('data-city') || '';
        const itemDistance = item.getAttribute('data-distance') || '';
        
        // Basic text search
        const searchableText = `${name} ${profession} ${location} ${specialty}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        const textMatch = searchTerm === '' || searchableText.includes(searchLower);
        
        // Province filter
        const provinceMatch = province === '' || itemProvince.toLowerCase() === province.toLowerCase();
        
        // City filter
        const cityMatch = city === '' || itemCity.toLowerCase().includes(city.toLowerCase());
        
        // Distance filter (if distance is specified)
        let distanceMatch = true;
        if (distance && itemDistance) {
            const itemDistanceNum = parseInt(itemDistance);
            const distanceNum = parseInt(distance);
            distanceMatch = itemDistanceNum <= distanceNum;
        }
        
        // Show item only if all filters match
        if (textMatch && provinceMatch && cityMatch && distanceMatch) {
            item.style.display = 'block';
            item.style.opacity = '1';
            visibleCount++;
        } else {
            item.style.display = 'none';
            item.style.opacity = '0';
        }
    });
    
    // Update results count
    if (resultsCount) {
        resultsCount.textContent = visibleCount;
    }
    
    // Auto-open accordion sections that have visible results
    autoOpenRelevantSections(searchTerm);
}

function autoOpenRelevantSections(searchTerm) {
    if (!searchTerm) return;
    
    const categories = ['coaches', 'pioneers', 'motivators'];
    
    categories.forEach(category => {
        const content = document.getElementById(`${category}-content`);
        const grid = content.querySelector('.entrepreneur-grid');
        const visibleItems = grid.querySelectorAll('.entrepreneur-item[style*="display: block"]');
        
        if (visibleItems.length > 0) {
            // Open the accordion section if it has visible results
            if (!content.classList.contains('open')) {
                toggleAccordion(category);
            }
        }
    });
}

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Performance Monitoring
function initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
            
            if (lastEntry.startTime > 2500) {
                console.warn('LCP is slow:', lastEntry.startTime);
            }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
                
                if (entry.processingStart - entry.startTime > 100) {
                    console.warn('FID is slow:', entry.processingStart - entry.startTime);
                }
            });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
            
            if (clsValue > 0.1) {
                console.warn('CLS is poor:', clsValue);
            }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
    
    // Monitor page load performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart);
                console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
            }
        }, 0);
    });
}

// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle?.querySelector('i');
    
    if (!themeToggle || !icon) return;
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(icon, currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(icon, newTheme);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    });
    
    // Handle system preference changes
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                updateThemeIcon(icon, newTheme);
            }
        });
    }
}

function updateThemeIcon(icon, theme) {
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        icon.setAttribute('aria-label', 'Switch to light mode');
    } else {
        icon.className = 'fas fa-moon';
        icon.setAttribute('aria-label', 'Switch to dark mode');
    }
}

// Analytics Tracking
function initAnalytics() {
    // Track page views
    trackPageView();
    
    // Track user interactions
    trackUserInteractions();
    
    // Track performance metrics
    trackPerformanceMetrics();
}

function trackPageView() {
    const pageData = {
        page: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
    };
    
    // Send to analytics service (replace with your analytics service)
    console.log('Page View:', pageData);
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: pageData.title,
            page_location: window.location.href
        });
    }
}

function trackUserInteractions() {
    // Track button clicks
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .btn, a')) {
            const interactionData = {
                type: 'click',
                element: e.target.tagName,
                text: e.target.textContent?.trim(),
                href: e.target.href,
                timestamp: new Date().toISOString()
            };
            console.log('User Interaction:', interactionData);
        }
    });
    
    // Track form submissions
    document.addEventListener('submit', (e) => {
        const formData = {
            type: 'form_submit',
            form_id: e.target.id || 'unknown',
            timestamp: new Date().toISOString()
        };
        console.log('Form Submission:', formData);
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', throttle(() => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            if (maxScrollDepth % 25 === 0) { // Track every 25%
                console.log('Scroll Depth:', maxScrollDepth + '%');
            }
        }
    }, 1000));
}

function trackPerformanceMetrics() {
    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                const metric = {
                    name: entry.name,
                    value: entry.value || entry.startTime,
                    timestamp: new Date().toISOString()
                };
                console.log('Performance Metric:', metric);
            });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }
}

// Loading Screen Management
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // Wait for a minimum time to show loading screen
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            // Remove from DOM after animation
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1000);
    }
}

