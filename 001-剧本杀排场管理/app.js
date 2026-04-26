const STATUS = {
    PREPARING: 'preparing',
    IN_PROGRESS: 'in-progress',
    FINISHED: 'finished',
    CANCELLED: 'cancelled'
};

const STATUS_LABELS = {
    [STATUS.PREPARING]: '准备中',
    [STATUS.IN_PROGRESS]: '进行中',
    [STATUS.FINISHED]: '已结束',
    [STATUS.CANCELLED]: '已取消'
};

let rooms = [
    { id: 1, name: '1号房间', capacity: 6 },
    { id: 2, name: '2号房间', capacity: 8 },
    { id: 3, name: '3号房间', capacity: 10 },
    { id: 4, name: '4号房间', capacity: 12 },
    { id: 5, name: '5号房间', capacity: 6 },
    { id: 6, name: '6号房间', capacity: 8 }
];

let sessions = [];
let nextSessionId = 1;

document.addEventListener('DOMContentLoaded', function() {
    initDateDisplay();
    initDateTimePicker();
    initRoomSelect();
    loadData();
    renderRooms();
    setupFormHandlers();
});

function initDateDisplay() {
    const dateDisplay = document.getElementById('dateDisplay');
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateDisplay.textContent = today.toLocaleDateString('zh-CN', options);
}

function isTodaySession(session) {
    const sessionStart = new Date(session.startTime);
    const today = new Date();
    return sessionStart.toDateString() === today.toDateString();
}

function initDateTimePicker() {
    const startTimeInput = document.getElementById('startTime');
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = '00';
    
    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    startTimeInput.min = minDateTime;
    
    const defaultHours = now.getHours() < 23 ? String(now.getHours() + 1).padStart(2, '0') : '23';
    const defaultDateTime = `${year}-${month}-${day}T${defaultHours}:${minutes}`;
    startTimeInput.value = defaultDateTime;
}

function initRoomSelect() {
    const roomSelect = document.getElementById('roomSelect');
    roomSelect.innerHTML = '<option value="">请选择房间</option>';
    
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `${room.name} (可容纳${room.capacity}人)`;
        roomSelect.appendChild(option);
    });
}

function setupFormHandlers() {
    const form = document.getElementById('addSessionForm');
    const playersInput = document.getElementById('players');
    const roomSelect = document.getElementById('roomSelect');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addSession();
    });

    playersInput.addEventListener('input', checkRoomRecommendation);
    roomSelect.addEventListener('change', checkRoomRecommendation);
}

function checkRoomRecommendation() {
    const playersInput = document.getElementById('players');
    const roomSelect = document.getElementById('roomSelect');
    
    const players = parseInt(playersInput.value);
    const selectedRoomId = parseInt(roomSelect.value);

    if (!players || isNaN(players) || !selectedRoomId || isNaN(selectedRoomId)) {
        return;
    }

    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    if (!selectedRoom) {
        return;
    }

    const suitableRooms = rooms
        .filter(r => r.capacity >= players)
        .sort((a, b) => a.capacity - b.capacity);

    if (suitableRooms.length === 0) {
        return;
    }

    const bestFitRoom = suitableRooms[0];

    if (selectedRoom.capacity > bestFitRoom.capacity) {
        const betterRooms = suitableRooms.filter(r => r.capacity < selectedRoom.capacity);
        if (betterRooms.length > 0) {
            const betterRoomNames = betterRooms.map(r => r.name).join('、');
            showMessage(
                `💡 建议：当前选择的是${selectedRoom.name}（${selectedRoom.capacity}人），但有更合适的房间：${betterRoomNames}（${betterRooms[0].capacity}人）。建议选择容量刚好匹配的房间，以节省大房间给更多人数的场次。`,
                'warning'
            );
        }
    }
}

function addSession() {
    const scriptName = document.getElementById('scriptName').value.trim();
    const startTime = document.getElementById('startTime').value;
    const duration = parseInt(document.getElementById('duration').value);
    const players = parseInt(document.getElementById('players').value);
    const roomId = parseInt(document.getElementById('roomSelect').value);

    if (!scriptName || !startTime || !duration || !players || !roomId) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const room = rooms.find(r => r.id === roomId);
    if (players > room.capacity) {
        showMessage(`该房间最多容纳${room.capacity}人，当前选择${players}人超出限制`, 'error');
        return;
    }

    if (isTimeConflict(roomId, startDate, endDate)) {
        return;
    }

    const session = {
        id: nextSessionId++,
        scriptName: scriptName,
        startTime: startDate,
        endTime: endDate,
        duration: duration,
        players: players,
        roomId: roomId,
        status: STATUS.PREPARING
    };

    sessions.push(session);
    saveData();
    renderRooms();
    clearForm();
    showMessage('场次添加成功！', 'success');
}

function isTimeConflict(roomId, newStartTime, newEndTime) {
    const roomSessions = sessions.filter(s => 
        s.roomId === roomId && 
        s.status !== STATUS.CANCELLED &&
        s.status !== STATUS.FINISHED
    );

    for (const session of roomSessions) {
        const existingStart = new Date(session.startTime);
        const existingEnd = new Date(session.endTime);

        if (newStartTime < existingEnd && newEndTime > existingStart) {
            const conflictInfo = formatConflictInfo(session, newStartTime, newEndTime);
            showMessage(`时间冲突！${conflictInfo}`, 'error');
            return true;
        }
    }

    return false;
}

function formatConflictInfo(existingSession, newStartTime, newEndTime) {
    const formatTime = (date) => {
        const d = new Date(date);
        return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const room = rooms.find(r => r.id === existingSession.roomId);
    return `该房间在 ${formatTime(existingSession.startTime)} - ${formatTime(existingSession.endTime)} 已有场次「${existingSession.scriptName}」`;
}

function changeSessionStatus(sessionId, newStatus) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
        return;
    }

    const oldStatus = session.status;
    const now = new Date();
    const originalStartTime = new Date(session.startTime);
    const originalEndTime = new Date(session.endTime);

    let adjustedStartTime = null;
    let adjustedEndTime = null;
    let timeAdjusted = false;

    if (newStatus === STATUS.IN_PROGRESS) {
        if (now < originalStartTime) {
            const durationMs = originalEndTime.getTime() - originalStartTime.getTime();
            adjustedStartTime = new Date(now);
            adjustedEndTime = new Date(now.getTime() + durationMs);
            timeAdjusted = true;
        } else if (now > originalEndTime) {
            showMessage('无法标记为进行中：该场次已过结束时间。如需继续，请先修改场次时间。', 'error');
            return;
        }
    }

    const needsConflictCheck = (
        (oldStatus === STATUS.FINISHED || oldStatus === STATUS.CANCELLED) &&
        (newStatus === STATUS.PREPARING || newStatus === STATUS.IN_PROGRESS)
    ) || timeAdjusted;

    if (needsConflictCheck) {
        const roomSessions = sessions.filter(s => 
            s.id !== session.id &&
            s.roomId === session.roomId && 
            s.status !== STATUS.CANCELLED &&
            s.status !== STATUS.FINISHED
        );

        const checkStartTime = adjustedStartTime || new Date(session.startTime);
        const checkEndTime = adjustedEndTime || new Date(session.endTime);

        for (const existingSession of roomSessions) {
            const existingStart = new Date(existingSession.startTime);
            const existingEnd = new Date(existingSession.endTime);

            if (checkStartTime < existingEnd && checkEndTime > existingStart) {
                const conflictInfo = formatConflictInfo(existingSession, checkStartTime, checkEndTime);
                if (timeAdjusted) {
                    showMessage(`无法标记为进行中！自动调整时间后，${conflictInfo}。请选择其他时间或房间。`, 'error');
                } else {
                    showMessage(`状态切换失败！${conflictInfo}，无法将该场次恢复为活跃状态。`, 'error');
                }
                return;
            }
        }

        if (timeAdjusted) {
            session.startTime = adjustedStartTime;
            session.endTime = adjustedEndTime;
        }
    }

    session.status = newStatus;
    saveData();
    renderRooms();

    if (timeAdjusted) {
        const formatTime = (date) => {
            const d = new Date(date);
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        };
        showMessage(`状态已更新为「进行中」，时间已自动调整：${formatTime(adjustedStartTime)} - ${formatTime(adjustedEndTime)}`, 'success');
    } else {
        showMessage(`状态已更新为「${STATUS_LABELS[newStatus]}」`, 'success');
    }
}

function renderRooms() {
    const roomsList = document.getElementById('roomsList');
    roomsList.innerHTML = '';

    const statusPriority = {
        'available': 0,
        'has-sessions': 1,
        'busy': 2
    };

    const roomsWithStatus = rooms.map(room => {
        const roomSessions = sessions
            .filter(s => s.roomId === room.id)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
        const todaySessions = roomSessions.filter(isTodaySession);
        
        const status = getRoomCurrentStatus(room, roomSessions);
        return {
            ...room,
            _status: status,
            _sessions: todaySessions
        };
    });

    roomsWithStatus.sort((a, b) => {
        const priorityDiff = statusPriority[a._status] - statusPriority[b._status];
        if (priorityDiff !== 0) {
            return priorityDiff;
        }
        return a.id - b.id;
    });

    roomsWithStatus.forEach(room => {
        const roomCard = createRoomCard(room);
        roomsList.appendChild(roomCard);
    });
}

function createRoomCard(room) {
    const roomCard = document.createElement('div');
    roomCard.className = 'room-card';

    const roomSessions = room._sessions || sessions
        .filter(s => s.roomId === room.id && isTodaySession(s))
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const currentStatus = room._status || getRoomCurrentStatus(room, roomSessions);
    const statusClass = getRoomStatusClass(currentStatus);
    const statusText = getRoomStatusText(currentStatus);

    const header = document.createElement('div');
    header.className = 'room-header';
    header.innerHTML = `
        <div class="room-name">${room.name}</div>
        <div class="room-info">
            <span class="room-capacity">可容纳 ${room.capacity} 人</span>
            <span class="room-status ${statusClass}">${statusText}</span>
        </div>
    `;
    roomCard.appendChild(header);

    const sessionsSection = document.createElement('div');
    sessionsSection.className = 'room-sessions';

    const sessionsTitle = document.createElement('h3');
    sessionsTitle.textContent = '当天场次时间线';
    sessionsSection.appendChild(sessionsTitle);

    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    if (roomSessions.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-sessions';
        emptyMsg.textContent = '暂无场次安排';
        timeline.appendChild(emptyMsg);
    } else {
        roomSessions.forEach(session => {
            const sessionItem = createSessionItem(session);
            timeline.appendChild(sessionItem);
        });
    }

    sessionsSection.appendChild(timeline);
    roomCard.appendChild(sessionsSection);

    return roomCard;
}

function getRoomCurrentStatus(room, sessions) {
    const now = new Date();
    
    const activeSessions = sessions.filter(s => s.status === STATUS.IN_PROGRESS);
    if (activeSessions.length > 0) {
        return 'busy';
    }

    const todayActiveSessions = sessions.filter(s => {
        const start = new Date(s.startTime);
        const today = new Date();
        return start.toDateString() === today.toDateString() && 
               s.status !== STATUS.CANCELLED &&
               s.status !== STATUS.FINISHED;
    });

    if (todayActiveSessions.length > 0) {
        return 'has-sessions';
    }

    return 'available';
}

function getRoomStatusClass(status) {
    switch (status) {
        case 'busy': return 'busy';
        case 'has-sessions': return 'has-sessions';
        default: return 'available';
    }
}

function getRoomStatusText(status) {
    switch (status) {
        case 'busy': return '使用中';
        case 'has-sessions': return '今日有场次';
        default: return '空闲';
    }
}

function createSessionItem(session) {
    const sessionItem = document.createElement('div');
    sessionItem.className = `session-item ${session.status}`;

    const formatTime = (date) => {
        const d = new Date(date);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const startTime = formatTime(session.startTime);
    const endTime = formatTime(session.endTime);

    const header = document.createElement('div');
    header.className = 'session-header';
    header.innerHTML = `
        <div class="session-name">${session.scriptName}</div>
        <span class="session-status-badge ${session.status}">${STATUS_LABELS[session.status]}</span>
    `;
    sessionItem.appendChild(header);

    const info = document.createElement('div');
    info.className = 'session-info';
    info.innerHTML = `
        <span>⏰ ${startTime} - ${endTime} (${session.duration}分钟)</span>
        <span>👥 ${session.players}人</span>
    `;
    sessionItem.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'session-actions';

    const statusOptions = [
        { value: STATUS.PREPARING, label: '准备中' },
        { value: STATUS.IN_PROGRESS, label: '进行中' },
        { value: STATUS.FINISHED, label: '已结束' },
        { value: STATUS.CANCELLED, label: '已取消' }
    ];

    statusOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-status ${session.status === option.value ? 'active' : ''}`;
        btn.textContent = option.label;
        btn.onclick = () => changeSessionStatus(session.id, option.value);
        actions.appendChild(btn);
    });

    sessionItem.appendChild(actions);

    return sessionItem;
}

function clearForm() {
    document.getElementById('addSessionForm').reset();
    initDateTimePicker();
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type} show`;

    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 3000);
}

function saveData() {
    try {
        localStorage.setItem('scriptKill_rooms', JSON.stringify(rooms));
        localStorage.setItem('scriptKill_sessions', JSON.stringify(sessions));
        localStorage.setItem('scriptKill_nextSessionId', nextSessionId.toString());
    } catch (e) {
        console.error('保存数据失败:', e);
    }
}

function loadData() {
    try {
        const savedRooms = localStorage.getItem('scriptKill_rooms');
        const savedSessions = localStorage.getItem('scriptKill_sessions');
        const savedNextSessionId = localStorage.getItem('scriptKill_nextSessionId');

        if (savedRooms) {
            rooms = JSON.parse(savedRooms);
        }
        if (savedSessions) {
            sessions = JSON.parse(savedSessions).map(s => ({
                ...s,
                startTime: new Date(s.startTime),
                endTime: new Date(s.endTime)
            }));
        }
        if (savedNextSessionId) {
            nextSessionId = parseInt(savedNextSessionId);
        }
    } catch (e) {
        console.error('加载数据失败:', e);
    }
}
