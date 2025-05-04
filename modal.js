document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('shutdown-modal');
    const closeButton = modal.querySelector('.close-button');
    const modalShownKey = 'shutdownModalShown';

    // Function to show the modal
    const showModal = () => {
        modal.style.display = 'block';
    };

    // Function to hide the modal
    const hideModal = () => {
        modal.style.display = 'none';
    };

    // Check if the modal has already been shown in this session
    if (!sessionStorage.getItem(modalShownKey)) {
        // If not shown, display the modal after a short delay
        setTimeout(showModal, 1500); // Show after 1.5 seconds
        // Mark as shown for this session
        sessionStorage.setItem(modalShownKey, 'true');
    }

    // Close the modal when the close button is clicked
    closeButton.addEventListener('click', hideModal);

    // Close the modal if the user clicks outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    // Close the modal if the user presses the Escape key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            hideModal();
        }
    });
});