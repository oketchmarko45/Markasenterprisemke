// Create the chatbot paw icon
const pawIcon = document.createElement("div");
pawIcon.id = "paw-chatbot-icon";
pawIcon.innerHTML = '<i class="fas fa-paw"></i>';
pawIcon.setAttribute("tabindex", "0");
pawIcon.setAttribute("aria-label", "Open PetBot Chat");
pawIcon.setAttribute("role", "button");
document.body.appendChild(pawIcon);

// Keyboard accessibility
pawIcon.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") pawIcon.click();
});

// Inject chatbot UI into the page if it doesn't exist yet
if (!document.getElementById("inline-chatbot")) {
  const chatContainer = document.createElement("div");
  chatContainer.id = "inline-chatbot";
  chatContainer.className = "chatbot-container";

  chatContainer.innerHTML = `
    <div class="chat-header">🐾 PetBot</div>
    <div class="chat-box" id="chat-box"></div>
    <div class="chat-input-area">
      <input type="text" id="user-input" placeholder="Ask me about pets..." autocomplete="off" />
      <button id="send-btn">Send</button>
    </div>
    <div style="text-align: center; margin-top: 10px;">
      <button id="close-chat-btn" style="padding: 8px 12px; background-color: #ccc; border: none; cursor: pointer;">
        Close Chat
      </button>
    </div>
  `;
  document.body.appendChild(chatContainer);
}

// Toggle chat visibility on paw click
pawIcon.addEventListener("click", () => {
  const chat = document.getElementById("inline-chatbot");

  if (chat.classList.contains("active")) {
    chat.classList.remove("active");
    setTimeout(() => chat.style.display = "none", 300);
  } else {
    chat.style.display = "flex";
    setTimeout(() => chat.classList.add("active"), 10);
  }
});

// Close chat button functionality
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "close-chat-btn") {
    const chat = document.getElementById("inline-chatbot");
    chat.classList.remove("active");
    setTimeout(() => chat.style.display = "none", 300);
  }
});

// Shake the icon every 4 minutes
function startShakeAnimation() {
  pawIcon.classList.add("shake");
  setTimeout(() => {
    pawIcon.classList.remove("shake");
  }, 1000); // Duration of shake
}
setInterval(startShakeAnimation, 240000); // every 4 minutes
