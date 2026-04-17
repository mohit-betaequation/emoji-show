/**
 * VIBE OVERLAY - COMPLETE CONTROLLER (2026)
 * Handles: Category Management, Settings, Favorites, and Syncing.
 */
// 1. Initial Data Structure (Enriched for Video Reactions)
let DEFAULT_DATA = {
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
            config = res.vibeMasterData;
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
        config.settings.density = parseInt(e.target.value);
        saveData();
    };
    document.getElementById('speed-slider').oninput = (e) => {
        config.settings.speed = parseInt(e.target.value);
        saveData();
    };

    // Management
    document.getElementById('add-category').onclick = addNewCategory;
    document.getElementById('restore-default').onclick = restoreDefaults;
}

// --- VIEW CONTROLLERS ---

function renderCategories() {
    const container = document.getElementById('category-container');
    container.innerHTML = '';
    
    // Filter based on "Fav Only" toggle
    const list = config.showOnlyFavs ? config.categories.filter(c => c.fav) : config.categories;
    
    // Update UI Labels
    document.getElementById('view-title').innerText = config.showOnlyFavs ? "Favorites" : "All Categories";
    document.getElementById('toggle-all-view').innerText = config.showOnlyFavs ? "Browse All Categories" : "Show Favorites Only";

    list.forEach(cat => {
        const btn = document.createElement('div');
        btn.className = `vibe-btn ${config.activeVibe === cat.id ? 'active' : ''}`;
        btn.innerHTML = `
            <span class="fav-star ${cat.fav ? 'is-fav' : ''}" title="Toggle Favorite">★</span>
            <div style="font-size: 1.6rem;">${cat.emojis[0]}</div>
            <div style="font-size: 0.75rem; font-weight: bold; margin-top: 5px;">${cat.name}</div>
        `;

        // Selection Logic
        btn.onclick = () => {
            config.activeVibe = cat.id;
            renderCategories();
            saveData();
        };

        // Favorite Toggle Logic
        btn.querySelector('.fav-star').onclick = (e) => {
            e.stopPropagation();
            cat.fav = !cat.fav;
            saveData();
            renderCategories();
        };

        container.appendChild(btn);
    });
}

function openSettings() {
    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('settings-view').classList.remove('hidden');
    
    // Load current slider values
    document.getElementById('density-slider').value = config.settings.density;
    document.getElementById('speed-slider').value = config.settings.speed;
    renderEditList();
}

function closeSettings() {
    document.getElementById('settings-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
    renderCategories();
}

function toggleViewMode() {
    config.showOnlyFavs = !config.showOnlyFavs;
    renderCategories();
    saveData();
}

// --- DATA MANAGEMENT ---

function renderEditList() {
    const listEl = document.getElementById('edit-list');
    listEl.innerHTML = '';

    console.log("data.categories", config.categories)
    config.categories.forEach(cat => {
        const row = document.createElement('div');
        row.style = "display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; align-items: center; background: white; margin-bottom: 5px; border-radius: 5px;";
        row.innerHTML = `
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: bold; font-size: 0.85rem;">${cat.emojis[0]} ${cat.name}</span>
                <span style="font-size: 0.65rem; color: #888;">${cat.emojis.slice(1, 4).join(' ')}...</span>
            </div>
            <button class="btn-icon" style="color: #ff4d4d;" data-id="${cat.id}">🗑️</button>
        `;
        
        row.querySelector('button').onclick = () => {
            if (confirm(`Delete category "${cat.name}"?`)) {
                config.categories = config.categories.filter(c => c.id !== cat.id);
                // If we deleted the active vibe, reset it to hype
                if (config.activeVibe === cat.id) config.activeVibe = 'hype';
                saveData();
                renderEditList();
            }
        };
        listEl.appendChild(row);
    });
}

function addNewCategory() {
    const name = prompt("Category Name (e.g., Space):");
    if (!name) return;
    
    const emojisStr = prompt("Paste Emojis (e.g., 🚀, 👨‍🚀, 🛸):");
    if (!emojisStr) return;

    const newCat = {
        id: 'user_' + Date.now(),
        name: name,
        emojis: emojisStr.split(/[, ]+/).filter(e => e.trim().length > 0),
        fav: false
    };

    config.categories.push(newCat);
    saveData();
    renderEditList();
}

function saveData() {
    // 1. Persist to Local Storage
    chrome.storage.local.set({ vibeMasterData: config });

    // 2. Broadcast to Content Script in current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
                action: "SYNC_ALL", 
                data: config 
            }).catch(err => console.log("Content script not ready yet. Navigate to a webpage first."));
        }
    });
}
function renderSettings() {
  document.getElementById('density-slider').value = config.settings.density;
  document.getElementById('speed-slider').value = config.settings.speed;
}

function restoreDefaults(){
    if (confirm("This will delete all custom categories and reset your settings. Are you sure?")) {
        // 1. Overwrite current data object with a deep copy of DEFAULTS
        config = JSON.parse(JSON.stringify(DEFAULT_DATA));
        
        // 2. Save to local storage
        saveData();

        // 3. Update the UI
        renderSettings(); // Refresh sliders
        renderEditList(); // Refresh the list in settings
        
        // 4. Visual feedback
        const btn = document.getElementById('restore-default');
        btn.innerText = "Done! ✅";
        setTimeout(() => { btn.innerText = "Restore to Defaults"; }, 2000);
        
        // Optional: If you are using Cloud Sync (Supabase), 
        // this will trigger pushToCloud() inside your saveData() function.
    }
};