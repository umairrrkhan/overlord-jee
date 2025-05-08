// Dynamic word animation for hero section
const dynamicWords = ['Outsmart', 'Break', 'Dominate', 'Predict'];
const dynamicElement = document.querySelector('.dynamic-word');
let currentIndex = 0;

function animateWord() {
  dynamicElement.style.animation = 'slideDownOut 0.6s ease-in forwards';
  
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % dynamicWords.length;
    dynamicElement.textContent = dynamicWords[currentIndex];
    dynamicElement.style.animation = 'slideUpIn 0.6s ease-out forwards';
  }, 600);
}

// Start animation and cycle every 2 seconds
setInterval(animateWord, 2000);