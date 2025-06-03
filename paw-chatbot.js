// Create the chatbot paw icon
const pawIcon = document.createElement("div");
pawIcon.id = "paw-chatbot-icon";
pawIcon.innerHTML = '<i class="fas fa-paw"></i>';
document.body.appendChild(pawIcon);

// Open chatbot.html in a popup or modal (basic example)
pawIcon.addEventListener("click", () => {
  window.open("chatbot.html", "Chatbot", "width=400,height=600");
});

// Shake the icon every 4 minutes
function startShakeAnimation() {
  pawIcon.classList.add("shake");
  setTimeout(() => {
    pawIcon.classList.remove("shake");
  }, 1000); // Duration of shake
}

setInterval(() => {
  startShakeAnimation();
}, 240000); // 4 minutes = 240,000ms
