let trackingInterval;
let checkInterval = 5000; // 5 seconds

document.getElementById('track-btn').addEventListener('click', startTracking);
document.getElementById('stop-btn').addEventListener('click', stopTracking);

function startTracking() {
    const userId = document.getElementById('user-id').value.trim();
    const username = document.getElementById('username').value.trim();
    
    if (!userId) {
        alert('Please enter a Roblox User ID');
        return;
    }
    
    // Update displayed username
    document.getElementById('display-username').textContent = username || `User ${userId}`;
    
    // Disable start button, enable stop button
    document.getElementById('track-btn').disabled = true;
    document.getElementById('stop-btn').disabled = false;
    
    // Make initial check
    checkStatus(userId);
    
    // Set up interval for continuous checking
    trackingInterval = setInterval(() => checkStatus(userId), checkInterval);
}

function stopTracking() {
    clearInterval(trackingInterval);
    document.getElementById('track-btn').disabled = false;
    document.getElementById('stop-btn').disabled = true;
}

async function checkStatus(userId) {
    try {
        const response = await fetch(`/api/check_status?user_id=${userId}`);
        const data = await response.json();
        
        updateUI(data);
        addToHistory(data);
    } catch (error) {
        console.error('Error checking status:', error);
        document.getElementById('last-checked').textContent = new Date().toLocaleTimeString();
    }
}

function updateUI(data) {
    const lastChecked = document.getElementById('last-checked');
    const statusIndicator = document.getElementById('status-indicator');
    const gameInfo = document.getElementById('game-info');
    const gameLink = document.getElementById('game-link');
    
    lastChecked.textContent = new Date().toLocaleTimeString();
    
    if (data.error) {
        statusIndicator.textContent = '❗ Error';
        statusIndicator.className = 'status-error';
        gameInfo.textContent = 'Could not retrieve status';
        gameLink.style.display = 'none';
        return;
    }
    
    if (data.online) {
        statusIndicator.textContent = '🟢 Online';
        statusIndicator.className = 'status-online';
        
        if (data.game) {
            gameInfo.textContent = `Playing: ${data.game}`;
            gameLink.href = data.game_url;
            gameLink.textContent = 'Join Game';
            gameLink.style.display = 'inline-block';
        } else {
            gameInfo.textContent = 'Online but not in any game';
            gameLink.style.display = 'none';
        }
    } else {
        statusIndicator.textContent = '🔴 Offline';
        statusIndicator.className = 'status-offline';
        gameInfo.textContent = 'Not currently in any game';
        gameLink.style.display = 'none';
    }
}

function addToHistory(data) {
    const historyList = document.getElementById('history-list');
    const listItem = document.createElement('li');
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'status-time';
    timeSpan.textContent = new Date().toLocaleTimeString();
    
    const statusSpan = document.createElement('span');
    
    if (data.error) {
        statusSpan.textContent = 'Error checking status';
        statusSpan.style.color = '#aa0000';
    } else if (data.online) {
        statusSpan.textContent = data.game ? `Online - Playing ${data.game}` : 'Online';
        statusSpan.style.color = '#00aa00';
    } else {
        statusSpan.textContent = 'Offline';
        statusSpan.style.color = '#aa0000';
    }
    
    listItem.appendChild(timeSpan);
    listItem.appendChild(statusSpan);
    
    // Add to top of list
    if (historyList.firstChild) {
        historyList.insertBefore(listItem, historyList.firstChild);
    } else {
        historyList.appendChild(listItem);
    }
    
    // Limit history to 20 items
    if (historyList.children.length > 20) {
        historyList.removeChild(historyList.lastChild);
    }
}
