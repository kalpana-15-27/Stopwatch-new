// DOM Element References
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const lapsList = document.getElementById('laps');
const sessionsList = document.getElementById('sessions');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// State Variables
let timer = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;
let laps = [];
let sessions = [];

/**
 * Formats time from milliseconds to a HH:MM:SS.ms string.
 * @param {number} time - The time in milliseconds.
 * @returns {string} The formatted time string.
 */
function formatTime(time) {
    const date = new Date(time);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0').slice(0, 2);
    // Show hours only if necessary
    if (hours > '00') {
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
    return `${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Updates the main time display.
 */
function updateDisplay() {
    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => {
        const currentTime = isRunning ? Date.now() : startTime + elapsedTime;
        elapsedTime = currentTime - startTime;
        display.textContent = formatTime(elapsedTime);
    });
}

function runTimer() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    display.textContent = formatTime(elapsedTime);
}

function start() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        timer = setInterval(runTimer, 10);
        isRunning = true;
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        lapBtn.disabled = false;
    }
}

function pause() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
    }
}

function reset() {
    // Save session before resetting if timer has run
    if (elapsedTime > 0) {
        saveSession();
    }

    clearInterval(timer);
    isRunning = false;
    elapsedTime = 0;
    laps = [];
    
    display.textContent = formatTime(0);
    renderLaps();

    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    lapBtn.disabled = true;
}

function lap() {
    if (isRunning) {
        const lapTime = elapsedTime;
        laps.push(lapTime);
        renderLaps();
    }
}

function renderLaps() {
    lapsList.innerHTML = '';
    if (laps.length === 0) {
        lapsList.innerHTML = '<li class="text-gray-500 text-center p-2">No laps yet.</li>';
        return;
    }
    const reversedLaps = [...laps].reverse();
    reversedLaps.forEach((lapTime, index) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-2 bg-gray-800 rounded-md fade-in';
        li.innerHTML = `
            <span class="font-medium text-gray-400">Lap ${laps.length - index}</span>
            <span class="font-mono text-lg">${formatTime(lapTime)}</span>
        `;
        lapsList.appendChild(li);
    });
}

// --- Session History Functions ---

function saveSession() {
    const session = {
        totalTime: elapsedTime,
        laps: [...laps],
        date: new Date().toISOString()
    };
    sessions.unshift(session); // Add to the beginning
    localStorage.setItem('stopwatchSessions', JSON.stringify(sessions));
    renderSessions();
}

function loadSessions() {
    const storedSessions = localStorage.getItem('stopwatchSessions');
    if (storedSessions) {
        sessions = JSON.parse(storedSessions);
        renderSessions();
    }
}

function renderSessions() {
    sessionsList.innerHTML = '';
    clearHistoryBtn.disabled = sessions.length === 0;

    if (sessions.length === 0) {
        sessionsList.innerHTML = '<li class="text-gray-500 text-center p-2">No saved sessions.</li>';
        return;
    }

    sessions.forEach((session, index) => {
        const sessionLi = document.createElement('li');
        sessionLi.className = 'bg-gray-800 rounded-md p-3 cursor-pointer hover:bg-gray-700 transition fade-in';
        const sessionDate = new Date(session.date);

        sessionLi.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <div class="font-bold text-lg">${formatTime(session.totalTime)}</div>
                    <div class="text-xs text-gray-400">${sessionDate.toLocaleDateString()} ${sessionDate.toLocaleTimeString()}</div>
                </div>
                <span class="text-sm text-gray-500">${session.laps.length} lap(s)</span>
            </div>
            <ul class="laps-details hidden mt-2 space-y-1 pl-4 border-l-2 border-gray-600">
                ${session.laps.map((lapTime, lapIndex) => `
                    <li class="flex justify-between text-sm">
                        <span class="text-gray-400">Lap ${lapIndex + 1}</span>
                        <span>${formatTime(lapTime)}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        
        // Toggle lap details visibility on click
        sessionLi.addEventListener('click', () => {
            sessionLi.querySelector('.laps-details').classList.toggle('hidden');
        });

        sessionsList.appendChild(sessionLi);
    });
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all session history? This cannot be undone.')) {
        sessions = [];
        localStorage.removeItem('stopwatchSessions');
        renderSessions();
    }
}

// Event Listeners
startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', lap);
clearHistoryBtn.addEventListener('click', clearHistory);

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadSessions();
    reset();
});