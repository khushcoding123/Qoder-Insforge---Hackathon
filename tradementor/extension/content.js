// TradeMentor content script — injects a floating trigger button on trading platforms

(function () {
  if (document.getElementById("tm-coach-trigger")) return;

  const trigger = document.createElement("div");
  trigger.id = "tm-coach-trigger";
  trigger.innerHTML = `
    <div class="tm-dot"></div>
    <span class="tm-label">TradeMentor</span>
  `;
  trigger.title = "Open TradeMentor AI Coach";
  document.body.appendChild(trigger);

  trigger.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
  });
})();
