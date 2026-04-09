const SUMMARY_URL = "https://81nav0jgfa.execute-api.eu-west-1.amazonaws.com/prod/admin/summary";
const ALERTS_URL = "https://81nav0jgfa.execute-api.eu-west-1.amazonaws.com/prod/admin/alerts";
const FEEDBACK_URL = "https://81nav0jgfa.execute-api.eu-west-1.amazonaws.com/prod/feedback";

// Load summary metrics
async function loadSummary() {
  try {
    const res = await fetch(SUMMARY_URL);
    const data = await res.json();

    document.getElementById("metric-visitors").textContent = data.totalVisitors ?? 0;
    document.getElementById("metric-feedback").textContent = data.feedbackCount ?? 0;
    document.getElementById("metric-positive").textContent =
      `${data.sentimentPercentages?.positive ?? 0}%`;
    document.getElementById("metric-alerts").textContent = data.activeAlerts ?? 0;

    document.getElementById("bar-positive").style.width =
      `${data.sentimentPercentages?.positive ?? 0}%`;
    document.getElementById("bar-neutral").style.width =
      `${data.sentimentPercentages?.neutral ?? 0}%`;
    document.getElementById("bar-negative").style.width =
      `${data.sentimentPercentages?.negative ?? 0}%`;
    document.getElementById("bar-mixed").style.width =
      `${data.sentimentPercentages?.mixed ?? 0}%`;

  } catch (err) {
    console.error(err);
  }
}

// Load recent alerts
async function loadAlerts() {
  try {
    const res = await fetch(ALERTS_URL);
    const data = await res.json();

    const alertsList = document.getElementById("alerts-list");

    if (!data.alerts || data.alerts.length === 0) {
      alertsList.innerHTML = "<p>No active alerts.</p>";
      return;
    }

    alertsList.innerHTML = data.alerts.slice(0, 5).map(alert => {
      let color = "orange";
      if (alert.severity === "high") color = "red";
      if (alert.severity === "low") color = "green";

      return `
        <div style="border-left: 5px solid ${color}; padding: 10px; margin-bottom: 10px;">
          <strong>${alert.type}</strong><br>
          ${alert.message}<br>
          <small>${alert.createdAt}</small>
        </div>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
  }
}

// Load feedback table
async function loadFeedback() {
  try {
    const res = await fetch(FEEDBACK_URL);
    const data = await res.json();

    const tbody = document.querySelector("#feedback-table tbody");

    if (!data.items || data.items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No feedback found.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.items.map(item => {
      const message = item.message?.length > 60
        ? item.message.substring(0, 60) + "..."
        : item.message || "";

      const sentiment = item.sentiment || "UNKNOWN";
      const confidence = item.confidenceScore != null
        ? (Number(item.confidenceScore) * 100).toFixed(2) + "%"
        : "n/a";

      let badgeColor = "gray";
      if (sentiment === "POSITIVE") badgeColor = "green";
      if (sentiment === "NEGATIVE") badgeColor = "red";
      if (sentiment === "NEUTRAL") badgeColor = "goldenrod";
      if (sentiment === "MIXED") badgeColor = "orange";

      return `
        <tr>
          <td>${item.name || ""}</td>
          <td>${item.email || ""}</td>
          <td>${message}</td>
          <td><span style="color: white; background: ${badgeColor}; padding: 4px 8px; border-radius: 6px;">${sentiment}</span></td>
          <td>${confidence}</td>
          <td>${item.createdAt || ""}</td>
        </tr>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
  }
}

loadSummary();
loadAlerts();
loadFeedback();