// Working Modal Functionality
function initGuestSignupModal() {
    const modal = document.getElementById('guest-signup-modal');
    const openBtn = document.getElementById('guest-signup-btn');
    const closeBtn = document.getElementById('modal-close');
    const form = document.getElementById('guest-signup-form');
    
    if (!modal || !openBtn || !closeBtn || !form) {
        console.log('Modal elements not found, skipping modal initialization');
        return;
    }
    
    const overlay = modal.querySelector('.modal-overlay');

    // Open modal
    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset form
        form.reset();
        // Hide success message if visible
        const successMessage = modal.querySelector('.success-message');
        if (successMessage) {
            successMessage.classList.remove('active');
        }
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.signup-submit');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Versturen...</span>';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                phone: formData.get('phone'),
                story: formData.get('story'),
                newsletter: formData.get('newsletter') === 'on',
                privacy: formData.get('privacy') === 'on'
            };

            // Send email using mailto link
            const subject = 'Nieuwe aanmelding als gast - SuperKonnected';
            const body = `
Nieuwe aanmelding als gast voor SuperKonnected podcast:

Naam: ${data.name}
E-mail: ${data.email}
Bedrijf: ${data.company || 'Niet opgegeven'}
Telefoon: ${data.phone || 'Niet opgegeven'}

Jouw verhaal:
${data.story || 'Niet opgegeven'}

Newsletter: ${data.newsletter ? 'Ja' : 'Nee'}
Privacy akkoord: ${data.privacy ? 'Ja' : 'Nee'}

---
Verzonden via SuperKonnected website
            `.trim();

            const mailtoLink = `mailto:info@superkonnected.nl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // Open default email client
            window.open(mailtoLink);

            // Show success message
            showSuccessMessage(modal);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Er is een fout opgetreden. Probeer het later opnieuw of neem contact op via info@superkonnected.nl');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function showSuccessMessage(modal) {
    const modalBody = modal.querySelector('.modal-body');
    const form = modal.querySelector('.signup-form');
    const benefits = modal.querySelector('.signup-benefits');
    
    // Hide form and benefits
    form.style.display = 'none';
    benefits.style.display = 'none';
    
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message active';
    successMessage.innerHTML = `
        <div class="success-icon">
            <i class="fas fa-check"></i>
        </div>
        <h4>Aanmelding succesvol verzonden!</h4>
        <p>Bedankt voor je interesse in SuperKonnected. We nemen binnen 48 uur contact met je op om de mogelijkheden te bespreken.</p>
        <button class="btn btn-primary" onclick="closeModal()">
            <i class="fas fa-times"></i>
            <span>Sluiten</span>
        </button>
    `;
    
    modalBody.appendChild(successMessage);
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modal functionality
    initGuestSignupModal();
});

