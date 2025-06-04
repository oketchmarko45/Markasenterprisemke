// paw-chatbot.js
document.addEventListener('DOMContentLoaded', function() {
  // Create chatbot elements
  const chatbotLauncher = document.createElement('div');
  chatbotLauncher.className = 'chatbot-launcher';
  chatbotLauncher.innerHTML = '<i class="fas fa-paw"></i>';
  document.body.appendChild(chatbotLauncher);

  const chatbotContainer = document.createElement('div');
  chatbotContainer.className = 'chatbot-container';
  chatbotContainer.id = 'chatbot-container';
  chatbotContainer.style.display = 'none';
  chatbotContainer.innerHTML = `
    <div class="chat-header">
      <span>🐾 PetBot Assistant</span>
      <button id="close-chatbot" aria-label="Close chat">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="chat-box" id="chat-box">
      <div class="bot-message message">
        Hi there! I'm PetBot, your friendly pet care assistant. 🐶🐱<br><br>
        How can I help you with your pet questions today?
      </div>
      <div class="quick-actions">
        <button class="quick-action-btn" data-question="How often should I feed my puppy?">Puppy feeding</button>
        <button class="quick-action-btn" data-question="What's the best way to groom a long-haired cat?">Cat grooming</button>
        <button class="quick-action-btn" data-question="How much exercise does my dog need daily?">Dog exercise</button>
      </div>
    </div>
    <div class="chat-controls">
      <input type="text" id="user-input" placeholder="Ask about pet care..." autocomplete="off" aria-label="Type your message"/>
      <button id="send-btn" aria-label="Send message">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  `;
  document.body.appendChild(chatbotContainer);

  // Chatbot functionality
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const closeBtn = document.getElementById('close-chatbot');
  const launcher = document.querySelector('.chatbot-launcher');

  // Toggle chatbot visibility
  launcher.addEventListener('click', function() {
    chatbotContainer.style.display = 'flex';
    launcher.style.display = 'none';
  });

  closeBtn.addEventListener('click', function() {
    chatbotContainer.style.display = 'none';
    launcher.style.display = 'flex';
  });

  // Quick action buttons
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      userInput.value = this.getAttribute('data-question');
      userInput.focus();
    });
  });

  // Send message function
  async function sendMessage() {
    const input = userInput.value.trim();
    if (!input) return;

    appendMessage('user', input);
    userInput.value = '';
    sendBtn.disabled = true;
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      // Simulate API response (replace with actual API call in production)
      setTimeout(() => {
        chatBox.removeChild(typingIndicator);
        const responses = {
          "How often should I feed my puppy?": "Puppies typically need 3-4 small meals per day. The exact amount depends on their breed and age.",
          "What's the best way to groom a long-haired cat?": "Regular brushing (2-3 times a week) is essential. Use a wide-toothed comb and be gentle around sensitive areas.",
          "How much exercise does my dog need daily?": "Most dogs need 30 minutes to 2 hours of exercise daily, depending on breed and age.",
          "default": "I'm sorry, I can't answer that right now. Please try asking about pet care, grooming, or feeding."
        };
        
        const reply = responses[input] || responses["default"];
        appendMessage('bot', reply);
        sendBtn.disabled = false;
      }, 1500);
      
    } catch (err) {
      console.error('Error:', err);
      chatBox.removeChild(typingIndicator);
      appendMessage('error', '⚠️ Sorry, I encountered an error. Please try again later.');
      sendBtn.disabled = false;
    }
  }

  function appendMessage(sender, message) {
    const msg = document.createElement('div');
    msg.classList.add('message', `${sender}-message`);
    
    // Basic sanitization
    const sanitizedMessage = message
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    
    msg.innerHTML = sanitizedMessage;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
});
