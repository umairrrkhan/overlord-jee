document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item-new');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answerDiv = item.querySelector('.faq-answer');

        questionButton.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close other open items when opening a new one
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                    otherItem.querySelector('.faq-answer').style.paddingTop = '0';
                    otherItem.querySelector('.faq-answer').style.paddingBottom = '0';
                }
            });

            if (isActive) {
                item.classList.remove('active');
                answerDiv.style.maxHeight = null;
                // Delay removing padding until transition ends for smoother collapse
                setTimeout(() => {
                    if (!item.classList.contains('active')) { // Check again in case it was quickly reopened
                         answerDiv.style.paddingTop = '0';
                         answerDiv.style.paddingBottom = '0';
                    }
                }, 300); // Match transition duration
            } else {
                item.classList.add('active');
                // Set padding before setting max-height for smooth expansion
                answerDiv.style.paddingTop = '1rem'; 
                answerDiv.style.paddingBottom = '1.5rem';
                answerDiv.style.maxHeight = answerDiv.scrollHeight + "px";
            }
        });
    });
});