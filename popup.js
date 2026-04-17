/**
 * VIBE OVERLAY - COMPLETE CONTROLLER (2026)
 * Handles: Category Management, Settings, Favorites, and Syncing.
 */

// 1. Initial Data Structure (Enriched for Video Reactions)
let data = {
    categories: [
        { id: 'hype', name: 'Hype/Fire', emojis: ['🔥', '🚀', '💥', '💯', '⚡', '🌋'], fav: true },
        { id: 'factcheck', name: 'Fact Check', emojis: ['🧐', '✅', '❌', '📊', '🧠', '📖', '🔍'], fav: true },
        { id: 'funny', name: 'Funny/Fail', emojis: ['😂', '💀', '🤡', '🫠', '📉', '🤣', '👻'], fav: true },
        { id: 'aesthetic', name: 'Aesthetic', emojis: ['✨', '🌸', '🌊', '🦄', '☁️', '🎨', '🌙'], fav: false },
        { id: 'mindblown', name: 'Mind Blown', emojis: ['🤯', '🌌', '🔮', '🧬', '🧪', '🛸', '🛰️'], fav: false },
        { id: 'nature', name: 'Nature/Earth', emojis: ['🌿', '🌻', '🌲', '🦜', '🍃', '🌍', '🍄'], fav: false },
        { id: 'money', name: 'Success/Money', emojis: ['💰', '💎', '💸', '🏦', '💹', '🏆'], fav: false },
        { id: 'coding', name: 'Dev/AI', emojis: ['💻', '🤖', '👾', '📡', '⚙️', '🛠️'], fav: false }
    ],
    settings: {
        density: 2000,
        speed: 4
    },
    activeVibe: 'hype',
    showOnlyFavs: true
};

// --- CORE INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // Load data from Chrome Storage
    chrome.storage.local.get(['vibeMasterData'], (res) => {
        if (res.vibeMasterData) {
            data = res.vibeMasterData;
        }
        renderCategories();
        initEventListeners();
    });
});

function initEventListeners() {
    // Navigation
    document.getElementById('go-settings').onclick = openSettings;
    document.getElementById('back-home').onclick = closeSettings;
    document.getElementById('toggle-all-view').onclick = toggleViewMode;

    // Settings Sliders
    document.getElementById('density-slider').oninput = (e) => {
        data.settings.density = parseInt(e.