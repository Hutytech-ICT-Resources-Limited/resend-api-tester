(function () {
  "use strict";

  const form = document.getElementById("form");
  const btn = document.getElementById("btn");
  const keyInput = document.getElementById("apiKey");
  const toggleKey = document.getElementById("toggleKey");

  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("modal");
  const modalBadge = document.getElementById("modalBadge");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");
  const modalDetail = document.getElementById("modalDetail");
  const modalClose = document.getElementById("modalClose");

  function showModal(opts) {
    modal.className = "modal " + (opts.ok ? "ok" : "err");
    modalBadge.textContent = opts.ok ? "✔" : "✖";
    modalTitle.textContent = opts.title;
    modalText.textContent = opts.text;
    if (opts.detail) {
      modalDetail.classList.remove("hidden");
      modalDetail.textContent = opts.detail;
    } else {
      modalDetail.classList.add("hidden");
    }
    overlay.classList.add("show");
  }

  function hideModal() {
    overlay.classList.remove("show");
  }

  modalClose.addEventListener("click", hideModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) hideModal();
  });

  toggleKey.addEventListener("click", function () {
    const showing = keyInput.type === "text";
    keyInput.type = showing ? "password" : "text";
    toggleKey.textContent = showing ? "Show" : "Hide";
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = "Sending...";

    const payload = {
      apiKey: keyInput.value,
      from: document.getElementById("from").value,
      to: document.getElementById("to").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
    };

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.ok) {
        showModal({
          ok: true,
          title: "Email sent!",
          text: "Your API key is valid and the test email was delivered successfully.",
          detail: "Email ID: " + (data.id || "(none)"),
        });
      } else {
        const msg = (data.error && data.error.message) || "Something went wrong.";
        showModal({
          ok: false,
          title: "Could not send",
          text: msg,
          detail: JSON.stringify(data.error, null, 2),
        });
      }
    } catch (err) {
      showModal({
        ok: false,
        title: "Network error",
        text: "Could not reach the server. Please try again.",
        detail: err.message,
      });
    } finally {
      btn.disabled = false;
      btn.textContent = "Send test email";
    }
  });
})();
