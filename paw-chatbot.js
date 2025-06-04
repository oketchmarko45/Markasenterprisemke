document.addEventListener('DOMContentLoaded', function() {
  // Create and append chatbot elements
  const chatbotLauncher = document.createElement('div');
  chatbotLauncher.className = 'chatbot-launcher';
  chatbotLauncher.innerHTML = '<i class="fas fa-paw"></i>';
  document.body.appendChild(chatbotLauncher);

  const chatbotContainer = document.createElement('div');
  chatbotContainer.className = 'chatbot-container';
  chatbotContainer.id = 'chatbot-container';
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

  // DOM elements
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const closeBtn = document.getElementById('close-chatbot');
  const launcher = document.querySelector('.chatbot-launcher');

  // Toggle chatbot visibility
  launcher.addEventListener('click', function() {
    chatbotContainer.classList.add('active');
    launcher.style.display = 'none';
    // Ensure proper scrolling on mobile
    if (window.innerWidth <= 480) {
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = 'hidden';
      }, 50);
    }
  });

  closeBtn.addEventListener('click', function() {
    chatbotContainer.classList.remove('active');
    setTimeout(() => {
      launcher.style.display = 'flex';
      document.documentElement.style.overflow = '';
    }, 300);
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
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    userInput.value = '';
    sendBtn.disabled = true;

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      // Simulate API response
      const response = await simulateAPIResponse(message);
      chatBox.removeChild(typingIndicator);
      appendMessage('bot', response);
    } catch (error) {
      chatBox.removeChild(typingIndicator);
      appendMessage('error', '⚠️ Sorry, I encountered an error. Please try again later.');
    } finally {
      sendBtn.disabled = false;
    }
  }

  function simulateAPIResponse(message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = {
          "How often should I feed my puppy?": "Puppies typically need 3-4 small meals per day. The exact amount depends on their breed and age.",
          "What's the best way to groom a long-haired cat?": "Regular brushing (2-3 times a week) is essential. Use a wide-toothed comb and be gentle around sensitive areas.",
          "How much exercise does my dog need daily?": "Most dogs need 30 minutes to 2 hours of exercise daily, depending on breed and age.",
          "default": "I'm sorry, I can't answer that right now. Please try asking about pet care, grooming, or feeding."
        };
        resolve(responses[message] || responses["default"]);
      }, 1500);
    });
  }

  function appendMessage(sender, content) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.innerHTML = content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 480) {
      document.documentElement.style.overflow = '';
    }
  });
});
