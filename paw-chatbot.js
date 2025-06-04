// paw-chatbot.js
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const launcher = document.getElementById("chatbot-launcher");
  const chatbot = document.getElementById("chatbot-container");
  const closeBtn = document.getElementById("close-btn");
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  // Track conversation thread
  let currentThreadId = null;

  // Open chatbot
  launcher.addEventListener("click", () => {
    chatbot.style.display = "flex"; // Show chat
  });

  // Close chatbot
  closeBtn.addEventListener("click", () => {
    chatbot.style.display = "none"; // Hide chat
  });

  // Send message function
  async function sendMessage() {
    const input = userInput.value.trim();
    if (!input) return;

    appendMessage("user", input);
    userInput.value = "";
    sendBtn.disabled = true;

    // Show "PetBot is typing..."
    const typingIndicator = createTypingIndicator();
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      // Call Netlify Function
      const response = await fetch("/.netlify/functions/petbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          thread_id: currentThreadId 
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      chatBox.removeChild(typingIndicator);
      appendMessage("bot", data.reply);
      currentThreadId = data.thread_id; // Update thread ID
    } catch (err) {
      console.error("Error:", err);
      chatBox.removeChild(typingIndicator);
      appendMessage("error", "⚠️ Sorry, something went wrong. Try again!");
    } finally {
      sendBtn.disabled = false;
    }
  }

  // Helper: Add a message to chat
  function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}-message`;
    msg.innerHTML = text.replace(/\n/g, "<br>");
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Helper: Create typing indicator
  function createTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "typing-indicator";
    indicator.innerHTML = `<span></span><span></span><span></span>`;
    return indicator;
  }

  // Send message on button click or Enter key
  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});
