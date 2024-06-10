// Array of words to float
const words = [
    "只有精英能进入顶刊吗？", "非精英与精英的研究课题差别在哪？", 
    "精英机构是否呈现聚集性？", "精英作者只与精英作者合作？", 
    "每个国家的精英作者机构在哪？", "每个机构有哪些精英作者？",
    "谁是精英作者？", "有没有精英作者和非精英作者同时偏爱的期刊？",
    "Top 100的精英作者的作品有哪些？",
];

// Function to create floating words
function createFloatingWords() {
    const container = document.getElementById('floating-words');

    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.className = 'word';
        span.style.left = Math.random() * 100 + 'vw';
        span.style.top = Math.random() * 100 + 'vh';  // Set a random vertical starting position
        span.style.animationDelay = Math.random() * 10 + 's';
        span.style.fontSize = (Math.random() * 2 + 1) + 'vw';  // Use viewport width units for font size
        container.appendChild(span);
    });
}

// Call the function to create floating words
createFloatingWords();

// Function to show the button after a delay
setTimeout(function() {
    document.getElementById('transition-next-btn').style.display = 'block';
}, 2000);

// Function to scroll to the other page
function moveToOtherPage() {
    // Navigate to the other HTML page
    window.location.href = 'introduction.html';
}

// Adjust positions on window resize
window.addEventListener('resize', () => {
    document.querySelectorAll('.word').forEach((span) => {
        span.style.left = Math.random() * 100 + 'vw';
        span.style.top = Math.random() * 100 + 'vh';
        span.style.fontSize = (Math.random() * 2 + 1) + 'vw';
    });
});
