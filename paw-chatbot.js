document.addEventListener('DOMContentLoaded', function() {
  const chatbotContainer = document.getElementById('chatbot-container');
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotIframe = document.getElementById('chatbot-iframe');
  
  let isChatbotOpen = false;
  
  // Toggle chatbot visibility
  chatbotToggle.addEventListener('click', function() {
    isChatbotOpen = !isChatbotOpen;
    if (isChatbotOpen) {
      chatbotContainer.style.display = 'flex';
      setTimeout(() => {
        chatbotContainer.classList.add('active');
      }, 10);
      // Reload the iframe to ensure fresh state
      chatbotIframe.src = chatbotIframe.src;
    } else {
      chatbotContainer.classList.remove('active');
      // Hide after transition completes
      setTimeout(() => {
        chatbotContainer.style.display = 'none';
      }, 300);
    }
  });
  
  // Close chatbot
  chatbotClose.addEventListener('click', function() {
    isChatbotOpen = false;
    chatbotContainer.classList.remove('active');
    // Hide after transition completes
    setTimeout(() => {
      chatbotContainer.style.display = 'none';
    }, 300);
  });
  
  // Optional: Add resize handler for mobile
  window.addEventListener('resize', function() {
    if (window.innerWidth < 768) {
      chatbotContainer.style.width = '90%';
      chatbotContainer.style.right = '5%';
    } else {
      chatbotContainer.style.width = '350px';
      chatbotContainer.style.right = '20px';
    }
  });
});
