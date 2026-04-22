/**
 * VIBE OVERLAY - CONTENT SCRIPT
 * Responsibilities: Rendering floating emojis, listening for sync updates,
 * and managing animation performance.
 */

let vibeData = null;
let animationInterval = null;

// 1. Initial Load: Check local cache immediately on page load
chrome.storage.local.get(['vibeMasterData'], (res) => {
    if (res.vibeMasterData) {
        vibeData = res.vibeMasterData;
        startVibeLoop();
    }
});

// 2. Listen for real-time updates from the Popup (Manual changes or Cloud Syncs)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SYNC_ALL") {
        vibeData = request.data;
        startVibeLoop(); // Restart to apply new density/speed immediately
        sendResponse({ status: "Content Script Synced" });
    }   else if (request.action === "PlayPause Toggle") {
        console.log("Received Play/Pause Toggle from Popup");
        if (animationInterval){
            clearInterval(animationInterval);
            animationInterval = null;
        } else {
            console.log("Resuming Vibes...");
            startVibeLoop();
        }
        sendResponse({ status: "Content Script Synced" });
    }
});

/**
 * Manages the timing loop for creating emojis
 */
function startVibeLoop() {
    // Clear any existing loop to prevent "stacking" intervals
    if (animationInterval) clearInterval(animationInterval);
    
    if (!vibeData || !vibeData.settings) return;

    animationInterval = setInterval(() => {
        const activeCategory = vibeData.categories.find(c => c.id === vibeData.activeVibe);
        if (activeCategory && activeCategory.emojis.length > 0) {
            spawnEmoji(activeCategory.emojis);
        }
    }, vibeData.settings.density);
}

/**
 * Injects the emoji element into the DOM and handles animation
 */
function spawnEmoji(emojiList) {
    const emojiElement = document.createElement('div');
    
    // Pick a random emoji from the active category
    const char = emojiList[Math.floor(Math.random() * emojiList.length)];
    
    emojiElement.innerText = char;
    emojiElement.className = 'vibe-emoji'; // Styles are handled in style.css

    // Randomize Horizontal Position (0 to 100% of viewport width)
    const posX = Math.random() * (window.innerWidth - 50);
    emojiElement.style.left = `${posX}px`;

    // Apply dynamic speed from settings
    const speed = vibeData.settings.speed || 4;
    emojiElement.style.animationDuration = `${speed}s`;

    // Ensure it's not blocked by UI elements
    emojiElement.style.position = 'fixed';
    emojiElement.style.bottom = '-60px';
    emojiElement.style.zIndex = '2147483647'; // Maximum possible z-index
    emojiElement.style.pointerEvents = 'none';

    document.body.appendChild(emojiElement);

    // Cleanup: Remove element after animation finishes to save memory
    setTimeout(() => {
        emojiElement.remove();
    }, speed * 1000);
}

// 3. Handle Tab Visibility
// Pause the loop if the user switches tabs to save CPU/Battery
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationInterval) clearInterval(animationInterval);
    } else {
        startVibeLoop();
    }
});