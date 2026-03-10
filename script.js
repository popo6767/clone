// --- 8-Bit Game UI Sound Effects ---
function playClickSound() {
    if (!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
    
    const oscillator = window.audioCtx.createOscillator();
    const gainNode = window.audioCtx.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, window.audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, window.audioCtx.currentTime + 0.1); 
    
    gainNode.gain.setValueAtTime(0.05, window.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioCtx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(window.audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(window.audioCtx.currentTime + 0.1);
}

document.addEventListener('click', (e) => {
    if(e.target.closest('button') || e.target.closest('a') || e.target.closest('.interactive')) {
        playClickSound();
    }
});

// --- Background Music Toggle (Using YouTube API) ---
let player;
let bgmPlaying = false;
const toggleBtn = document.getElementById('bgm-toggle');

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0', videoId: 'ZbyxjGE885I',
        playerVars: { 'playsinline': 1, 'loop': 1, 'playlist': 'ZbyxjGE885I' }
    });
}

function toggleBGM() {
    if (!player || !player.playVideo) return;
    if (!bgmPlaying) {
        player.playVideo();
        toggleBtn.innerText = '🔊 Music: ON';
        toggleBtn.classList.add('playing');
        bgmPlaying = true;
    } else {
        player.pauseVideo();
        toggleBtn.innerText = '🔊 Music: OFF';
        toggleBtn.classList.remove('playing');
        bgmPlaying = false;
    }
}

// --- Copy to Clipboard Logic ---
function copyEmail() {
    const emailText = document.getElementById('email-text').innerText;
    navigator.clipboard.writeText(emailText).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        copyBtn.innerText = 'Extracted';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.innerText = 'Extract';
            copyBtn.classList.remove('copied');
        }, 2000);
    });
}

// --- Targeting Custom Cursor Logic ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

function updateInteractives() {
    const interactives = document.querySelectorAll('.interactive, nav a, .start-game-btn, .reaction-screen');
    interactives.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
    });
}

function handleMouseEnter() { document.body.classList.add('hovering'); }
function handleMouseLeave() { document.body.classList.remove('hovering'); }

updateInteractives();

window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
    cursorOutline.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 150, fill: "forwards" }); 
});

// --- System Slideshow Logic w/ Auto-Timer ---
let slideIndex = 1;
let slideTimer;

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementsByClassName("slide").length > 0) {
        showSlides(slideIndex);
        // Start the automatic timer (Changes every 3.5 seconds)
        slideTimer = setInterval(() => {
            showSlides(slideIndex += 1);
        }, 3500); 
    }
});

// Jump to a specific slide when a dot is clicked
function currentSlide(n) {
    clearInterval(slideTimer); // Stop auto-timer when user interacts
    showSlides(slideIndex = n);
    // Restart the auto-timer so it keeps going after they click
    slideTimer = setInterval(() => {
        showSlides(slideIndex += 1);
    }, 3500);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    
    // Loop around if we reach the end or beginning
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    
    // Hide all slides and remove the fade animation class
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        slides[i].classList.remove("fade"); 
    }
    
    // Remove active class from all dots
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active-dot", "");
    }
    
    // Show the current slide
    slides[slideIndex - 1].style.display = "block";
    
    // Trick the browser into restarting the CSS fade animation
    void slides[slideIndex - 1].offsetWidth; 
    
    // Add the fade class back and highlight the current dot
    slides[slideIndex - 1].classList.add("fade");
    dots[slideIndex - 1].className += " active-dot";
}

// --- LEFT GAME: Reaction Time Test ---
function setupReactionGame() {
    let bestTime = Infinity, timeoutId, startTime, gameState = 'idle';
    const gameArea = document.getElementById('reaction-area');
    const bestDisplay = document.getElementById('reaction-best');
    const lastDisplay = document.getElementById('reaction-last');
    const startBtn = document.getElementById('start-reaction-btn');

    startBtn.addEventListener('click', startGame);

    function startGame(e) {
        if (e) e.stopPropagation(); 
        gameState = 'waiting';
        gameArea.classList.add('active-game');
        
        const screen = document.createElement('div');
        screen.className = 'reaction-screen reaction-waiting interactive';
        screen.innerText = 'Wait for Cyan...';
        screen.onclick = handleScreenClick;
        
        gameArea.innerHTML = '';
        gameArea.appendChild(screen);
        updateInteractives();
        
        timeoutId = setTimeout(() => {
            if (gameState === 'waiting') {
                gameState = 'ready';
                screen.className = 'reaction-screen reaction-go interactive';
                screen.innerText = 'CLICK NOW!';
                startTime = performance.now();
            }
        }, Math.random() * 3000 + 1000);
    }

    function handleScreenClick(e) {
        e.stopPropagation();
        const screen = e.target;
        if (gameState === 'waiting') {
            clearTimeout(timeoutId);
            gameState = 'result';
            screen.className = 'reaction-screen reaction-waiting interactive';
            screen.innerText = 'Too Soon! Click to retry.';
        } else if (gameState === 'ready') {
            const reactionTime = Math.round(performance.now() - startTime);
            gameState = 'result';
            screen.className = 'reaction-screen reaction-result interactive';
            screen.innerText = `${reactionTime} ms! Click to retry.`;
            lastDisplay.innerText = reactionTime;
            if (reactionTime < bestTime) {
                bestTime = reactionTime;
                bestDisplay.innerText = bestTime;
            }
        } else if (gameState === 'result') startGame();
    }
}
if (document.getElementById('reaction-area')) setupReactionGame();

// --- RIGHT GAME: Aim Trainer ---
function setupAimTrainer() {
    let gameScore = 0, gameTime = 10.0, gameInterval;
    const gameArea = document.getElementById('game-area-2');
    const scoreDisplay = document.getElementById('game-score-2');
    const timeDisplay = document.getElementById('game-time-2');
    const startBtn = document.getElementById('start-game-btn-2');

    startBtn.addEventListener('click', () => {
        gameScore = 0; gameTime = 10.0;
        scoreDisplay.innerText = gameScore;
        timeDisplay.innerText = gameTime.toFixed(1);
        startBtn.style.display = 'none';
        gameArea.classList.add('active-game');
        
        gameInterval = setInterval(() => {
            gameTime -= 0.1;
            timeDisplay.innerText = Math.max(0, gameTime).toFixed(1);
            if (gameTime <= 0) endGame();
        }, 100);
        spawnTarget();
    });

    function spawnTarget() {
        gameArea.innerHTML = ''; 
        const target = document.createElement('div');
        target.classList.add('game-target', 'interactive');
        target.style.left = `${Math.floor(Math.random() * (gameArea.clientWidth - 30))}px`;
        target.style.top = `${Math.floor(Math.random() * (gameArea.clientHeight - 30))}px`;
        target.onmousedown = () => { gameScore++; scoreDisplay.innerText = gameScore; spawnTarget(); };
        gameArea.appendChild(target);
        updateInteractives(); 
    }

    function endGame() {
        clearInterval(gameInterval);
        gameArea.innerHTML = '';
        gameArea.classList.remove('active-game');
        startBtn.style.display = 'block';
        startBtn.innerText = `Score: ${gameScore} - Retry?`;
        gameArea.appendChild(startBtn);
        updateInteractives();
    }
}
if (document.getElementById('game-area-2')) setupAimTrainer();