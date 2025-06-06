document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const closeBtn = document.getElementById('close-btn');
  
  // Local knowledge base
  const localKnowledgeBase = {
    "how often should i feed my puppy": "Puppies need 3-4 meals per day...",
    "what's the best way to groom a long-haired cat": "Brush long-haired cats daily...",
    "how much exercise does my dog need daily": "Most dogs need 30 mins-2 hours...",
    "default": "I recommend consulting your veterinarian..."
  };

  // Event listeners
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      userInput.value = this.getAttribute('data-question');
      sendMessage();
    });
  });

  closeBtn.addEventListener('click', function() {
    document.querySelector('.chatbot-container').style.display = 'none';
  });

  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keydown', e => e.key === 'Enter' && sendMessage());

  // Main functions
  async function sendMessage() {
    const input = userInput.value.trim();
    if (!input) return appendMessage('error', 'Please enter a question');
    
    appendMessage('user', input);
    userInput.value = '';
    disableInputs(true);
    
    const typingIndicator = showTypingIndicator();

    try {
      const lowerInput = input.toLowerCase();
      const localMatch = Object.entries(localKnowledgeBase)
        .find(([key]) => lowerInput.includes(key))?.[1] || null;
      
      if (localMatch) {
        await simulateDelay(800);
        chatBox.removeChild(typingIndicator);
        appendMessage('bot', localMatch);
        addFollowUpQuestions(localMatch);
      } else {
        await callPetBotAPI(input, typingIndicator);
      }
    } catch (err) {
      console.error('Error:', err);
      chatBox.removeChild(typingIndicator);
      appendMessage('bot', localKnowledgeBase.default);
    } finally {
      disableInputs(false);
    }
  }

  async function callPetBotAPI(input, typingIndicator) {
    try {
      const response = await fetch('/.netlify/functions/petbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      const data = await response.json();
      chatBox.removeChild(typingIndicator);
      
      if (data.reply) {
        appendMessage('bot', data.reply);
        addFollowUpQuestions(data.reply);
      } else {
        throw new Error('No reply from API');
      }
    } catch (err) {
      console.error('API Error:', err);
      chatBox.removeChild(typingIndicator);
      appendMessage('bot', "Connection issue. " + localKnowledgeBase.default);
    }
  }

  // Helper functions
  function disableInputs(disabled) {
    sendBtn.disabled = disabled;
    userInput.disabled = disabled;
    if (!disabled) userInput.focus();
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatBox.appendChild(indicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    return indicator;
  }

  function appendMessage(sender, message) {
    const msg = document.createElement('div');
    msg.classList.add('message', `${sender}-message`);
    msg.innerHTML = message
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function addFollowUpQuestions(response) {
    const followUps = {
      'dog': ['Best dog toys?', 'Bathing frequency?'],
      'cat': ['Stop scratching furniture?', 'Signs of happy cat?']
    };
    
    const lowerResponse = response.toLowerCase();
    const petType = lowerResponse.includes('dog') ? 'dog' : 
                   lowerResponse.includes('cat') ? 'cat' : null;
    
    if (petType && followUps[petType]) {
      const quickActions = document.createElement('div');
      quickActions.className = 'quick-actions';
      
      followUps[petType].forEach(question => {
        const btn = document.createElement('button');
        btn.className = 'quick-action-btn';
        btn.textContent = question;
        btn.setAttribute('data-question', question);
        btn.addEventListener('click', function() {
          userInput.value = this.getAttribute('data-question');
          sendMessage();
        });
        quickActions.appendChild(btn);
      });
      
      chatBox.appendChild(quickActions);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
});
