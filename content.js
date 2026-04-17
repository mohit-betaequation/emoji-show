let localData = null;
let intervalId = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "SYNC_ALL") {
    localData = msg.data;
    restartLoop();
  }
});

function restartLoop() {
  if (intervalId) clearInterval(intervalId);
  if (!localData) return;

  intervalId = setInterval(() => {
    const activeCat = localData.categories.find(c => c.id === localData.activeVibe);
    if (activeCat) createEmoji(activeCat.emojis);
  }, localData.settings.density);
}

function createEmoji(emojis) {
  const emoji = document.createElement('div');
  emoji.className = 'vibe-emoji';
  emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
  emoji.style.left = Math.random() * window.innerWidth + "px";
  
  // Apply the speed dynamically
  emoji.style.animationDuration = localData.settings.speed + "s";
  
  document.body.appendChild(emoji);
  setTimeout(() => emoji.remove(), localData.settings.speed * 1000);
}