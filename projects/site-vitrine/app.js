document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Navbar Scroll Style Change
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Filterable Project Gallery
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active status from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    // Show item with transition
                    item.classList.remove('hide');
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    // Hide item with transition
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        item.classList.add('hide');
                    }, 300);
                }
            });
        });
    });

    // 5. Quote Eligibility Form submission simulation
    const quoteForm = document.getElementById('quote-form');
    const successBox = document.getElementById('success-box');

    if (quoteForm && successBox) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Animate submit button
            const submitBtn = quoteForm.querySelector('.btn-submit');
            const submitText = submitBtn.querySelector('span');
            submitBtn.style.pointerEvents = 'none';
            submitText.textContent = 'Calcul en cours...';

            setTimeout(() => {
                quoteForm.style.opacity = '0';
                quoteForm.style.transform = 'translateY(10px)';
                quoteForm.style.transition = 'all 0.4s ease';

                setTimeout(() => {
                    quoteForm.style.display = 'none';
                    successBox.style.display = 'flex';
                    setTimeout(() => {
                        successBox.style.opacity = '1';
                        successBox.style.transform = 'translateY(0)';
                    }, 50);
                }, 400);
            }, 1800);
        });
    }
});
