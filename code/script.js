// Set default dates
document.addEventListener('DOMContentLoaded', () => {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    checkinInput.value = today;
    checkoutInput.value = tomorrow;
    
    // Smooth scroll for buttons
    document.querySelectorAll('.btn-primary, .btn-book').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent.includes('Browse') || this.textContent.includes('Book') || this.textContent.includes('Start')) {
                document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Smooth scroll navigation
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});
