// Working Preloader Functionality
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Wait for progress bar to complete
        setTimeout(() => {
            preloader.classList.add('hidden');
            // Remove from DOM after animation
            setTimeout(() => {
                preloader.remove();
                // Trigger website entrance animation
                document.body.classList.add('website-loaded');
            }, 800);
        }, 3000); // Wait for 3 seconds to show the full animation
    }
}

// Initialize preloader when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide preloader after page loads
    hidePreloader();
});

