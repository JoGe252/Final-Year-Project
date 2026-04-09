// ======================================================
// FOOTER YEAR
// ======================================================
document.getElementById("year").textContent = new Date().getFullYear();

// ======================================================
// API ENDPOINTS
// ======================================================
const API_URL = "https://81nav0jgfa.execute-api.eu-west-1.amazonaws.com/prod/count";
const FEEDBACK_URL = "https://81nav0jgfa.execute-api.eu-west-1.amazonaws.com/prod/feedback";

// ======================================================
// VISITOR COUNTER
// ======================================================
const visitorCountElement = document.getElementById("visitor-count");

// Show loading text before API responds
if (visitorCountElement) {
  visitorCountElement.textContent = "Loading...";
}

async function updateVisitorCount() {
  try {
    const res = await fetch(API_URL, {
      method: "GET",
      mode: "cors"
    });

    const data = await res.json();
    visitorCountElement.textContent = data.count ?? "0";

  } catch (e) {
    console.error(e);
    visitorCountElement.textContent = "⚠";
  }
}

updateVisitorCount();

// ======================================================
// DARK MODE TOGGLE
// ======================================================
const themeToggle = document.getElementById("theme-toggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "Light Mode";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeToggle.textContent = "Light Mode";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "Dark Mode";
    localStorage.setItem("theme", "light");
  }
});

// ======================================================
// BACK TO TOP BUTTON
// ======================================================
const backToTopBtn = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
  backToTopBtn.style.display = window.scrollY > 200 ? "block" : "none";
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ======================================================
// CHARACTER COUNTER
// ======================================================
const messageInput = document.getElementById("message");
const messageCounter = document.getElementById("message-counter");

if (messageInput && messageCounter) {
  const updateCounter = () => {
    messageCounter.textContent = `${messageInput.value.length} / 1000`;
  };

  updateCounter();
  messageInput.addEventListener("input", updateCounter);
}

// ======================================================
// CONTACT FORM SUBMISSION
// ======================================================
const contactForm = document.getElementById("contact-form");
const formFeedback = document.getElementById("form-feedback");
const submitBtn = document.getElementById("submit-btn");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Prevent duplicate rapid submissions
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    formFeedback.textContent = "Sending...";
    formFeedback.style.color = "black";

    const payload = {
      name: contactForm.name.value.trim(),
      email: contactForm.email.value.trim(),
      message: contactForm.message.value.trim()
    };

    try {
      const res = await fetch(FEEDBACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        formFeedback.textContent = `Error: ${data.error || "Unknown error"}`;
        formFeedback.style.color = "red";
        return;
      }

      if (data.sentiment) {
        const confidencePercent =
          data.confidenceScore != null
            ? (Number(data.confidenceScore) * 100).toFixed(2) + "%"
            : "n/a";

        formFeedback.textContent =
          `Sent! Reference: ${data.feedbackId} | Sentiment: ${data.sentiment} (${confidencePercent})`;
      } else {
        formFeedback.textContent = `Sent! Reference: ${data.feedbackId}`;
      }

      formFeedback.style.color = "green";
      contactForm.reset();

      // Reset counter after form reset
      if (messageCounter) {
        messageCounter.textContent = "0 / 1000";
      }

    } catch (err) {
      console.error(err);
      formFeedback.textContent = "Network error. Please try again.";
      formFeedback.style.color = "red";
    } finally {
      // Restore button after request completes
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }
  });
}