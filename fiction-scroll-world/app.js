// Elysium - Celestial Princess Kingdom Scroll Engine

const canvas = document.getElementById("scroll-canvas");
const ctx = canvas.getContext("2d");

const sparkleCanvas = document.getElementById("sparkle-canvas");
const sCtx = sparkleCanvas.getContext("2d");

const loader = document.getElementById("loader");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const greetingBanner = document.getElementById("greeting-banner");

// Hotspots
const hotspotLake = document.getElementById("hotspot-lake");
const hotspotBridge = document.getElementById("hotspot-bridge");
const hotspotPalace = document.getElementById("hotspot-palace");
const hotspotInterior = document.getElementById("hotspot-interior");

// Sound Elements
const soundBtn = document.getElementById("sound-btn");
const ambientMusic = document.getElementById("ambient-music");

// Config
const frameCount = 240;
const frames = new Array(frameCount);
const loadedFrames = new Array(frameCount).fill(false);

const priorityFrames = new Set();
// Load first 15 frames for immediate initial display
for (let i = 0; i < 15; i++) {
    priorityFrames.add(i);
}
// Add keyframes every 10 frames across the remaining timeline
for (let i = 20; i < frameCount; i += 10) {
    priorityFrames.add(i);
}
priorityFrames.add(frameCount - 1); // Ensure last frame is included

let priorityLoadedCount = 0;
let experienceStarted = false;
let currentFrameIndex = 0;
let targetFrameIndex = 0;

// Easing/Interpolation factor for buttery smooth scroll
const scrollLerpFactor = 0.08; 

// Generate Frame File Paths
function getFramePath(index) {
    // Frames are named frame_000.jpg, frame_001.jpg, etc.
    const paddedIndex = String(index).padStart(3, '0');
    return `assets/frames/frame_${paddedIndex}.jpg`;
}

// Preload Images (Progressive Strategy)
function preloadImages() {
    // Initialize image objects for all frames first so they exist in array
    for (let i = 0; i < frameCount; i++) {
        if (!priorityFrames.has(i)) {
            frames[i] = null;
        }
    }
    
    // First, load all priority frames in parallel
    priorityFrames.forEach(index => {
        const img = new Image();
        img.src = getFramePath(index);
        img.onload = () => {
            frames[index] = img;
            loadedFrames[index] = true;
            priorityLoadedCount++;
            
            // Only update progress bar based on priority frames to show fast progress
            if (!experienceStarted) {
                const percent = Math.min(100, Math.floor((priorityLoadedCount / priorityFrames.size) * 100));
                progressBar.style.width = `${percent}%`;
                progressText.innerText = `Loading magic... ${percent}%`;
                
                if (priorityLoadedCount === priorityFrames.size) {
                    experienceStarted = true;
                    setTimeout(startExperience, 400);
                    // Start background loading of all remaining frames
                    loadRemainingFrames();
                }
            }
        };
        img.onerror = () => {
            loadedFrames[index] = true; // Avoid block on error
            priorityLoadedCount++;
            if (!experienceStarted && priorityLoadedCount === priorityFrames.size) {
                experienceStarted = true;
                setTimeout(startExperience, 400);
                loadRemainingFrames();
            }
        };
    });
}

// Load remaining non-priority frames in the background
async function loadRemainingFrames() {
    const queue = [];
    for (let i = 0; i < frameCount; i++) {
        if (!priorityFrames.has(i)) {
            queue.push(i);
        }
    }
    
    // Process queue in small chunks of concurrent downloads (concurrency of 4)
    const concurrency = 4;
    let indexInQueue = 0;
    
    async function loadNext() {
        if (indexInQueue >= queue.length) return;
        const currentIdx = queue[indexInQueue++];
        
        await new Promise((resolve) => {
            const img = new Image();
            img.src = getFramePath(currentIdx);
            img.onload = () => {
                frames[currentIdx] = img;
                loadedFrames[currentIdx] = true;
                resolve();
            };
            img.onerror = () => {
                resolve();
            };
        });
        
        loadNext();
    }
    
    for (let c = 0; c < concurrency; c++) {
        loadNext();
    }
}

// Start Experience
function startExperience() {
    loader.classList.add("fade-out");
    resizeCanvas();
    renderFrame(0);
    animate();
    setupSound();
    setupScrollLabelNavigation();
    setupHotspotAudio();
}

// Draw Frame with Object-Fit Cover Logic
function renderFrame(index) {
    const targetIdx = Math.floor(index);
    let img = frames[targetIdx];
    
    // Fallback to nearest loaded frame if current frame isn't ready
    if (!img || !loadedFrames[targetIdx]) {
        let bestDistance = Infinity;
        let fallbackIdx = -1;
        for (let i = 0; i < frameCount; i++) {
            if (loadedFrames[i] && frames[i]) {
                const distance = Math.abs(i - targetIdx);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    fallbackIdx = i;
                }
            }
        }
        if (fallbackIdx !== -1) {
            img = frames[fallbackIdx];
        } else {
            return;
        }
    }
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;
    
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgRatio > canvasRatio) {
        // Image is wider than canvas
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
    } else {
        // Image is taller than canvas
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
    }
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Handle Canvas Resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    sparkleCanvas.width = window.innerWidth;
    sparkleCanvas.height = window.innerHeight;
    
    renderFrame(currentFrameIndex);
}

window.addEventListener("resize", resizeCanvas);

// Main Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Smooth frame transition via Linear Interpolation (lerp)
    const diff = targetFrameIndex - currentFrameIndex;
    if (Math.abs(diff) > 0.01) {
        currentFrameIndex += diff * scrollLerpFactor;
        renderFrame(currentFrameIndex);
    }
    
    // Smooth mouse coordinates for parallax
    currentMouseX += (targetMouseX - currentMouseX) * 0.08;
    currentMouseY += (targetMouseY - currentMouseY) * 0.08;
    
    // Calculate translate displacement (up to 15px)
    const px = (currentMouseX - window.innerWidth / 2) * 0.015;
    const py = (currentMouseY - window.innerHeight / 2) * 0.015;
    canvas.style.transform = `translate(${px}px, ${py}px) scale(1.03)`;
    
    // Update Telemetry & UI
    updateUIElements(currentFrameIndex);
    
    // Render magic sparkle overlay
    renderSparkles();
}

// Update Telemetry, Hotspots, and Cards based on Frame Index
function updateUIElements(frameIndex) {
    const fraction = frameIndex / (frameCount - 1);
    
    // 1. Scrollbar Progress
    const scrollbarThumb = document.getElementById("scrollbar-thumb");
    if (scrollbarThumb) {
        scrollbarThumb.style.top = `${fraction * 80}%`; // Limit height to track height
    }
    
    // Active Scroll Labels highlighting
    const scrollLabels = document.querySelectorAll(".scroll-label");
    scrollLabels.forEach(label => {
        const target = parseFloat(label.getAttribute("data-target")) / 100;
        if (Math.abs(fraction - target) < 0.15) {
            label.classList.add("active");
        } else {
            label.classList.remove("active");
        }
    });


    
    // 3. Section Text Cards Visibility (standard scroll detection)
    const cards = document.querySelectorAll(".content-card");
    const sections = document.querySelectorAll(".scroll-section");
    
    sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        const card = cards[idx];
        
        // If section is in viewport
        if (rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.2) {
            card.classList.add("card-visible");
        } else {
            card.classList.remove("card-visible");
        }
    });

    // 4. Hotspot Visibilities based on specific Frame Sections (scaled for 240 frames)
    // Lake and Bridge hotspots appear in Phase 1 (0 to 60 frames)
    if (frameIndex >= 5 && frameIndex <= 53) {
        hotspotLake.classList.add("visible");
        hotspotBridge.classList.add("visible");
    } else {
        hotspotLake.classList.remove("visible");
        hotspotBridge.classList.remove("visible");
    }
    
    // Palace gates hotspot appears in Phase 2 (60 to 120 frames)
    if (frameIndex >= 63 && frameIndex <= 113) {
        hotspotPalace.classList.add("visible");
    } else {
        hotspotPalace.classList.remove("visible");
    }
    
    // Palace interior hotspot appears in Phase 3 (120 to 180 frames)
    if (frameIndex >= 123 && frameIndex <= 173) {
        hotspotInterior.classList.add("visible");
    } else {
        hotspotInterior.classList.remove("visible");
    }
}

// Track Scroll Position and Speed
let lastScrollTop = 0;

window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    if (maxScroll <= 0) return;
    
    const scrollFraction = scrollTop / maxScroll;
    targetFrameIndex = Math.min(frameCount - 1, scrollFraction * frameCount);
    
    // Fade out greeting banner on scroll
    if (greetingBanner) {
        greetingBanner.style.opacity = Math.max(0, 1 - scrollFraction * 15);
        greetingBanner.style.transform = `translate(-50%, -50%) translateY(${-scrollFraction * 180}px)`;
    }
    
    // Calculate scroll velocity
    const velocity = Math.abs(scrollTop - lastScrollTop);
    lastScrollTop = scrollTop;
    
    // Trigger sparkle bursts on fast scrolling
    if (velocity > 8) {
        const burstSize = Math.min(6, Math.floor(velocity / 10));
        for (let s = 0; s < burstSize; s++) {
            createSparkle(Math.random() * window.innerWidth, Math.random() * window.innerHeight, true);
        }
    }
});

// Scroll Navigation Label Clicks
function setupScrollLabelNavigation() {
    const scrollLabels = document.querySelectorAll(".scroll-label");
    scrollLabels.forEach(label => {
        label.addEventListener("click", () => {
            const targetPercent = parseFloat(label.getAttribute("data-target")) / 100;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({
                top: targetPercent * maxScroll,
                behavior: "smooth"
            });
        });
    });
}

// Particle System for Magic Sparkles
const sparkles = [];
const maxSparkles = 60;
let targetMouseX = window.innerWidth / 2;
let targetMouseY = window.innerHeight / 2;
let currentMouseX = window.innerWidth / 2;
let currentMouseY = window.innerHeight / 2;

window.addEventListener("mousemove", (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
    
    // Add micro sparkle trailing mouse occasionally
    if (Math.random() < 0.25) {
        createSparkle(targetMouseX, targetMouseY, true);
    }
});

function createSparkle(x, y, fromMouse = false) {
    sparkles.push({
        x: x || Math.random() * sparkleCanvas.width,
        y: y || sparkleCanvas.height + 10,
        size: Math.random() * 2 + 0.5,
        speedX: fromMouse ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 1.2,
        speedY: fromMouse ? -(Math.random() * 2 + 1) : -(Math.random() * 1.5 + 0.5),
        opacity: Math.random() * 0.7 + 0.3,
        color: Math.random() < 0.6 ? "#dfba6b" : "#ff8da1", // gold or pink sparkles
        life: Math.random() * 150 + 50
    });
}

function renderSparkles() {
    sCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
    
    // Regularly spawn natural bottom sparkles
    if (sparkles.length < maxSparkles && Math.random() < 0.08) {
        createSparkle();
    }
    
    for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        
        s.x += s.speedX;
        s.y += s.speedY;
        s.life -= 1;
        
        // Draw glinting glow
        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        sCtx.fillStyle = s.color;
        sCtx.shadowBlur = s.size * 3;
        sCtx.shadowColor = s.color;
        sCtx.globalAlpha = (s.life / 200) * s.opacity;
        sCtx.fill();
        
        if (s.life <= 0 || s.y < -10 || s.x < -10 || s.x > sparkleCanvas.width + 10) {
            sparkles.splice(i, 1);
        }
    }
    
    sCtx.shadowBlur = 0; // reset shadow blurring
    sCtx.globalAlpha = 1.0;
}

// Background Soundtrack Audio Logic
function setupSound() {
    soundBtn.addEventListener("click", () => {
        if (ambientMusic.paused) {
            ambientMusic.play()
                .then(() => {
                    soundBtn.querySelector("span").innerText = "Soundtrack On";
                    soundBtn.classList.add("pulse-sound");
                })
                .catch(err => {
                    console.error("Audio failed to play:", err);
                });
        } else {
            ambientMusic.pause();
            soundBtn.querySelector("span").innerText = "Soundtrack Off";
            soundBtn.classList.remove("pulse-sound");
        }
    });
}

// Web Audio API Magical Chime Synthesizer
function playMagicChime() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioCtx.currentTime;
        
        const osc1 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1000, now);
        osc1.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1500, now);
        osc2.frequency.exponentialRampToValueAtTime(500, now + 0.4);
        
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
    } catch (e) {
        console.warn("Audio Context blocked or error", e);
    }
}

function setupHotspotAudio() {
    const hotspots = document.querySelectorAll(".hotspot");
    hotspots.forEach(h => {
        h.addEventListener("mouseenter", () => {
            playMagicChime();
        });
    });
}



// Initialize Preloading
preloadImages();
