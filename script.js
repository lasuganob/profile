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

function appendSuggestions(suggestions) {
  const container = document.createElement('div');
  container.className = 'suggestions-container';
  suggestions.forEach(sugg => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.textContent = sugg;
    btn.addEventListener('click', () => {
      chatInput.value = sugg;
      handleSend();
    });
    container.appendChild(btn);
  });
  chatWindow.appendChild(container);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return container;
}

function getBotResponse(userMsg) {
  const cleanText = userMsg.toLowerCase().replace(/[^\w\s]/gi, ''); // remove punctuation
  const tokens = cleanText.split(/\s+/);
  
  let bestMatch = null;
  let highestScore = 0;

  for (const item of knowledgeBase) {
    let score = 0;
    for (const kw of item.keywords) {
      const kwTokens = kw.toLowerCase().split(/\s+/);
      
      // Full phrase match gets highest priority
      if (kw.includes(' ') && userMsg.toLowerCase().includes(kw.toLowerCase())) {
         score += 5; 
      }
      // Single exact word match
      else if (kwTokens.length === 1 && tokens.includes(kwTokens[0])) {
         score += 2;
      }
      // Partial word matches (e.g., 'experienc' matching 'experience')
      else if (tokens.some(t => t.length > 3 && (kwTokens[0].includes(t) || t.includes(kwTokens[0])))) {
         score += 1;
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore > 0) {
    return {
      answer: bestMatch.answer,
      isHtml: bestMatch.isHtml || false,
      suggestions: bestMatch.suggestions || []
    };
  }

  if (tokens.includes('hi') || tokens.includes('hello') || tokens.includes('hey')) {
    return {
      answer: "Hi there! How can I help you learn more about Leo?",
      suggestions: ["Tell me about yourself", "What are your skills?"]
    };
  }
  
  return {
    answer: "I'm not quite sure about that! I'm Leo's portfolio assistant. You can ask me about his <strong>skills</strong>, <strong>projects</strong>, or <strong>experience</strong>.",
    isHtml: true,
    suggestions: ["Skills", "Projects", "Experience"]
  };
}

function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Remove existing suggestions to keep chat clean
  document.querySelectorAll('.suggestions-container').forEach(el => el.remove());

  appendMessage(text, 'user');
  chatInput.value = '';

  const typingMsg = showTypingIndicator();

  setTimeout(() => {
    typingMsg.remove();
    const response = getBotResponse(text);
    if (typeof response === 'string') {
        appendMessage(response, 'bot');
    } else {
        appendMessage(response.answer, 'bot', response.isHtml);
        if (response.suggestions && response.suggestions.length > 0) {
            appendSuggestions(response.suggestions);
        }
    }
  }, 700 + Math.random() * 500); // simulate realistic typing delay
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSend();
});

// Initial greeting
setTimeout(() => {
  appendMessage("Hello! I'm Leo's virtual assistant. Feel free to ask me any questions.", 'bot');
  appendSuggestions(["Tell me about yourself", "What are your skills?", "How can I contact you?"]);
}, 600);
