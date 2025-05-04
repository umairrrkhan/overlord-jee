// Set the date we're counting down to (7 days from now)
// Check localStorage for existing countdown end time
let countdownDate = new Date();
const storedEndTime = localStorage.getItem('countdownEndTime');
const initialDuration = 7 * 24 * 60 * 60 * 1000;

if (storedEndTime) {
    countdownDate = new Date(parseInt(storedEndTime));
} else {
    countdownDate.setDate(countdownDate.getDate() + 7);
    localStorage.setItem('countdownEndTime', countdownDate.getTime().toString());
}

// Update the countdown every 1 second
const interval = setInterval(function() {

    // Get today's date and time
    const now = new Date().getTime();

    // Find the distance between now and the countdown date
    const distance = countdownDate - now;

    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Function to format numbers to two digits
    const formatTime = (time) => time < 10 ? `0${time}` : time;

    // Display the result in the elements
    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");
    const daysWarningElement = document.getElementById("countdown-days-warning");

    if (daysElement && hoursElement && minutesElement && secondsElement) {
        daysElement.innerHTML = formatTime(days);
        hoursElement.innerHTML = formatTime(hours);
        minutesElement.innerHTML = formatTime(minutes);
        secondsElement.innerHTML = formatTime(seconds);
    }

    if (daysWarningElement) {
        daysWarningElement.innerHTML = days;
    }

    // Calculate heartbeat intensity (0-1) based on time remaining
    const heartbeatIntensity = 1 - (distance / initialDuration);
    
    // Apply heartbeat effect to timer display
    const timerDisplay = document.getElementById('countdown-timer');
    if (timerDisplay) {
        const scale = 1 + (0.2 * heartbeatIntensity);
        timerDisplay.style.transform = `scale(${scale})`;
        timerDisplay.style.transition = 'transform 0.5s ease-in-out';
    }
    
    // Calculate and update remaining copies (decreases as deadline approaches)
    const remainingCopies = Math.max(50, Math.floor(1000 * (1 - heartbeatIntensity)));
    document.querySelector('.warning-text-block p:nth-child(2)').textContent = 
        `1400+ students downloaded. ${remainingCopies} copies left.`;
    
    // If the countdown is finished, reset it to 7 days
    if (distance < 0) {
        // Reset countdown date to 7 days from now
        countdownDate.setTime(new Date().getTime() + initialDuration);
        localStorage.setItem('countdownEndTime', countdownDate.getTime().toString());
        
        // Update copies left (random between 50-100)
        const copiesLeft = Math.floor(Math.random() * 51) + 50;
        document.querySelector('.warning-text-block p:nth-child(2)').textContent = 
            `1400+ students downloaded. ${copiesLeft} copies left.`;
    }
}, 1000);