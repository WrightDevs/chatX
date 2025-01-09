const socket = io();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatInterface = document.getElementById('chat-interface');
const loginForm = document.getElementById('login-form');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const usersList = document.getElementById('users-list');
const typingIndicator = document.getElementById('typing-indicator');

let username = '';
let typingTimeout = null;

// Login Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    username = document.getElementById('username-input').value.trim();
    if (username) {
        loginScreen.classList.add('hidden');
        chatInterface.classList.remove('hidden');
        socket.emit('join', username);
    }
});

// Message Handler
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chatMessage', message);
        messageInput.value = '';
    }
});

// Typing Indicator Handler
messageInput.addEventListener('input', () => {
    socket.emit('typing');
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    typingTimeout = setTimeout(() => {
        socket.emit('stopTyping');
    }, 1000);
});

// Socket Event Handlers
socket.on('message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', data.username === username ? 'sent' : 'received');
    
    messageElement.innerHTML = `
        <div class="meta">
            <span class="username">${data.username}</span>
            <span class="time">${data.time}</span>
        </div>
        <div class="text">${data.text}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

socket.on('userJoined', (data) => {
    // Update users list
    updateUsersList(data.users);
    
    // Add system message
    addSystemMessage(data.message);
});

socket.on('userLeft', (data) => {
    // Update users list
    updateUsersList(data.users);
    
    // Add system message
    addSystemMessage(data.message);
});

socket.on('userTyping', (username) => {
    typingIndicator.textContent = `${username} is typing...`;
});

socket.on('userStoppedTyping', () => {
    typingIndicator.textContent = '';
});

// Helper Functions
function updateUsersList(users) {
    usersList.innerHTML = users
        .map(user => `<li>${user}</li>`)
        .join('');
}

function addSystemMessage(message) {
    const systemMessage = document.createElement('div');
    systemMessage.classList.add('system-message');
    systemMessage.textContent = message;
    messagesContainer.appendChild(systemMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}