// Configuration
const USER_ID = "1592079038";
const CHECK_INTERVAL = 1000; // 10 seconds
const MAX_RETRIES = 3;
let trackingInterval;
let statusHistory = [];
let retryCount = 0;

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
    
    refreshBtn.addEventListener('click', manualRefresh);
});

function startTracking() {
    checkStatus();
    trackingInterval = setInterval(checkStatus, CHECK_INTERVAL);
    updateConnectionStatus(true);
}

async function checkStatus() {
    try {
        const startTime = Date.now();
        const response = await fetchWithTimeout(`/api/check_status?user_id=${USER_ID}`, {
            timeout: 5000
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const duration = Date.now() - startTime;
        
        if (data.error) throw new Error(data.error);
        
        updateStatusDisplay(data);
        addToHistory(data, duration);
        updateLastChecked();
        updateConnectionStatus(true);
        retryCount = 0;
    } catch (error) {
        console.error('Error checking status:', error);
        retryCount++;
        
        if (retryCount <= MAX_RETRIES) {
            console.log(`Retrying... (${retryCount}/${MAX_RETRIES})`);
            setTimeout(checkStatus, 2000);
        } else {
            showErrorState(error);
            updateConnectionStatus(false);
            retryCount = 0;
        }
    }
}

function fetchWithTimeout(url, options = {}) {
    const { timeout = 5000 } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    return fetch(url, {
        ...options,
        signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
}

function showErrorState(error) {
    statusIndicator.className = "status-indicator offline";
    statusText.textContent = "Connection Error";
    
    gameInfo.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i> 
            ${error.message || 'Failed to fetch status'}
        </div>
    `;
    
    gameLink.style.display = "none";
    statusCard.classList.add('error-pulse');
    setTimeout(() => statusCard.classList.remove('error-pulse'), 1000);
}

function manualRefresh() {
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
    refreshBtn.disabled = true;
    
    clearInterval(trackingInterval);
    checkStatus().finally(() => {
        setTimeout(() => {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            refreshBtn.disabled = false;
            trackingInterval = setInterval(checkStatus, CHECK_INTERVAL);
        }, 1000);
    });
}

// ... (keep existing updateStatusDisplay, addToHistory, renderHistory functions) ...

function updateConnectionStatus(connected) {
    if (connected) {
        connectionStatus.innerHTML = '<i class="fas fa-circle connected"></i> Connected';
        connectionStatus.classList.remove('disconnected');
        connectionStatus.classList.add('connected');
    } else {
        connectionStatus.innerHTML = '<i class="fas fa-circle disconnected"></i> Disconnected';
        connectionStatus.classList.remove('connected');
        connectionStatus.classList.add('disconnected');
    }
}
