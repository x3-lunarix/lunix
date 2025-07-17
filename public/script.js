// Configuration
const USER_ID = "1592079038";
const CHECK_INTERVAL = 1000; // 10 seconds
let trackingInterval;
let statusHistory = [];

// DOM Elements
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const gameInfo = document.getElementById('game-info');
const gameLink = document.getElementById('game-link');
const historyContent = document.getElementById('history-content');
const lastUpdated = document.getElementById('last-updated');
const connectionStatus = document.getElementById('connection-status');
const refreshBtn = document.getElementById('refresh-btn');
const statusCard = document.querySelector('.status-card');

// Start tracking immediately when page loads
document.addEventListener('DOMContentLoaded', () => {
    startTracking();
    
    // Add click event for manual refresh
    refreshBtn.addEventListener('click', () => {
        manualRefresh();
    });
});

function startTracking() {
    // Initial check
    checkStatus();
    
    // Set up interval for continuous checking
    trackingInterval = setInterval(checkStatus, CHECK_INTERVAL);
    
    // Update connection status
    updateConnectionStatus(true);
}

async function checkStatus() {
    try {
        const startTime = Date.now();
        const response = await fetch(`/api/check_status?user_id=${USER_ID}`);
        const data = await response.json();
        
        // Calculate request duration
        const duration = Date.now() - startTime;
        
        updateStatusDisplay(data);
        addToHistory(data, duration);
        updateLastChecked();
        
        updateConnectionStatus(true);
    } catch (error) {
        console.error('Error checking status:', error);
        updateConnectionStatus(false);
    }
}

function manualRefresh() {
    // Add spinning animation to refresh button
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
    
    // Clear existing interval and do immediate check
    clearInterval(trackingInterval);
    checkStatus();
    
    // Restore button and interval after check completes
    setTimeout(() => {
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        trackingInterval = setInterval(checkStatus, CHECK_INTERVAL);
    }, 1000);
}

function updateStatusDisplay(data) {
    // Update main status display
    if (data.online) {
        statusIndicator.className = "status-indicator online";
        statusText.textContent = "Online";
        
        if (data.game) {
            gameInfo.textContent = `Playing: ${data.game}`;
            gameLink.href = data.game_url;
            gameLink.style.display = "inline-block";
        } else {
            gameInfo.textContent = "Online - Not in game";
            gameLink.style.display = "none";
        }
    } else {
        statusIndicator.className = "status-indicator offline";
        statusText.textContent = "Offline";
        gameInfo.textContent = "Currently offline";
        gameLink.style.display = "none";
    }
    
    // Add visual feedback
    statusCard.classList.add('status-updated');
    setTimeout(() => {
        statusCard.classList.remove('status-updated');
    }, 500);
}

function addToHistory(data, duration) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    // Create history entry
    const entry = {
        timestamp: now,
        timeString: timeString,
        online: data.online,
        game: data.game || null,
        duration: duration,
        error: data.error || null
    };
    
    // Add to beginning of history array
    statusHistory.unshift(entry);
    
    // Keep only last 20 entries
    if (statusHistory.length > 20) {
        statusHistory.pop();
    }
    
    // Update history display
    renderHistory();
}

function renderHistory() {
    historyContent.innerHTML = '';
    
    statusHistory.forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        if (entry.error) {
            historyItem.innerHTML = `
                <span class="time">${entry.timeString}</span>
                <span class="status error"><i class="fas fa-exclamation-circle"></i> Error</span>
                <span class="duration">${entry.duration}ms</span>
            `;
        } else if (entry.online) {
            historyItem.innerHTML = `
                <span class="time">${entry.timeString}</span>
                <span class="status online"><i class="fas fa-circle"></i> Online</span>
                <span class="game">${entry.game || 'No game'}</span>
                <span class="duration">${entry.duration}ms</span>
            `;
        } else {
            historyItem.innerHTML = `
                <span class="time">${entry.timeString}</span>
                <span class="status offline"><i class="fas fa-circle"></i> Offline</span>
                <span class="duration">${entry.duration}ms</span>
            `;
        }
        
        historyContent.appendChild(historyItem);
    });
}

function updateLastChecked() {
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
}

function updateConnectionStatus(connected) {
    if (connected) {
        connectionStatus.innerHTML = '<i class="fas fa-circle connected"></i> Connected';
    } else {
        connectionStatus.innerHTML = '<i class="fas fa-circle disconnected"></i> Connection Error';
    }
}
