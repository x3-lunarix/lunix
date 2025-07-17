// Configuration
const USER_ID = "1592079038";
const CHECK_INTERVAL = 1000; // 10 seconds
let trackingInterval;

// DOM Elements
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const gameInfo = document.getElementById('game-info');
const historyContent = document.getElementById('history-content');
const lastUpdated = document.getElementById('last-updated');
const connectionStatus = document.getElementById('connection-status');

// Start tracking immediately when page loads
document.addEventListener('DOMContentLoaded', () => {
    startTracking();
});

function startTracking() {
    // Initial check
    checkStatus();
    
    // Set up interval for continuous checking
    trackingInterval = setInterval(checkStatus, CHECK_INTERVAL);
    
    // Update connection status
    connectionStatus.textContent = "Connected";
    connectionStatus.previousElementSibling.className = "fas fa-circle connected";
}

async function checkStatus() {
    try {
        const response = await fetch(`/api/check_status?user_id=${USER_ID}`);
        const data = await response.json();
        
        updateStatusDisplay(data);
        addToHistory(data);
        updateLastChecked();
        
        // Update connection status
        connectionStatus.textContent = "Connected";
        connectionStatus.previousElementSibling.className = "fas fa-circle connected";
    } catch (error) {
        console.error('Error checking status:', error);
        connectionStatus.textContent = "Connection Error";
        connectionStatus.previousElementSibling.className = "fas fa-circle disconnected";
    }
}

function updateStatusDisplay(data) {
    // Update last checked time
    lastUpdated.textContent = `Last checked: ${new Date().
