import { knowledgeBase } from './knowledge-base.js';
import { dialogData } from './dialog-data.js';

const overlay = document.getElementById('dialogOverlay');
const dTitle = document.getElementById('dTitle');
const dBody = document.getElementById('dBody');

function openDialog(type) {
  if(dialogData[type]) {
    dTitle.innerHTML = dialogData[type].title;
    dBody.innerHTML = dialogData[type].body;
    overlay.classList.add('active');
  }
}

function closeDialog(e) {
  // If event is passed and target is not overlay, ignore
  if (e && e.target !== overlay) return;
  overlay.classList.remove('active');
}

// Expose functions globally since this is now an ES module
window.openDialog = openDialog;
window.closeDialog = closeDialog;

// --- Chat Logic ---
const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.getElementById('chatContainer');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatCloseBtn = document.getElementById('chatCloseBtn');

chatToggleBtn.addEventListener('click', () => {
  chatContainer.classList.add('open');
});

chatCloseBtn.addEventListener('click', () => {
  chatContainer.classList.remove('open');
});

function appendMessage(text, sender, isHtml = false) {
  const msg = document.createElement('div');
  msg.className = `msg ${sender}`;
  if (isHtml) {
    msg.innerHTML = text;
  } else {
    msg.textContent = text;
  }
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msg;
}

function showTypingIndicator() {
  return appendMessage('<div class="typing"><span></span><span></span><span></span></div>', 'bot', true);
}

function getBotResponse(userMsg) {
  const text = userMsg.toLowerCase();
  for (const item of knowledgeBase) {
    if (item.keywords.some(kw => text.includes(kw))) {
      return item.answer;
    }
  }
  if (text.includes('hi') || text.includes('hello')) {
    return "Hi there! How can I help you learn more about Leo?";
  }
  return "I'm just a simple assistant. Try asking about Leo's skills, projects, or how to contact him!";
}

function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  chatInput.value = '';

  const typingMsg = showTypingIndicator();

  setTimeout(() => {
    typingMsg.remove();
    const reply = getBotResponse(text);
    appendMessage(reply, 'bot');
  }, 700 + Math.random() * 500); // simulate realistic typing delay
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSend();
});

// Initial greeting
setTimeout(() => {
  appendMessage("Hello! I'm Leo's virtual assistant. Feel free to ask me any questions.", 'bot');
}, 600);
