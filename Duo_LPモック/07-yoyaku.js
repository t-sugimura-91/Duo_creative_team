(() => {
  "use strict";
  const table = document.querySelector(".cal");
  const slots = Array.from(table.querySelectorAll(".slot--open"));
  const dateLabel = document.getElementById("picked-date");
  const timeLabel = document.getElementById("picked-time");
  const reviewButton = document.getElementById("review-booking");
  const dialog = document.getElementById("booking-review");
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  let selected = null;

  function describeSlot(button) {
    const row = button.closest("tr");
    const column = button.closest("td").cellIndex;
    const time = row.querySelector(".rowlabel").textContent.replace("翌", "");
    const [hour, minute] = time.split(":").map(Number);
    // The sample uses business-day columns; midnight belongs to the following day.
    const nextDay = hour === 0;
    const day = 5 + column + (nextDay ? 1 : 0);
    const weekday = weekdays[(column + (nextDay ? 1 : 0)) % 7];
    const end = hour * 60 + minute + 30;
    const endTime = String(Math.floor(end / 60) % 24).padStart(2, "0") + ":" + String(end % 60).padStart(2, "0");
    return { date: "10月" + day + "日（" + weekday + "）", time: time + "〜" + endTime };
  }

  function selectSlot(button) {
    if (selected) {
      selected.setAttribute("aria-pressed", "false");
      selected.textContent = "空";
    }
    selected = button;
    selected.setAttribute("aria-pressed", "true");
    selected.textContent = "選択中";
    const value = describeSlot(selected);
    dateLabel.textContent = value.date;
    timeLabel.textContent = value.time;
    reviewButton.disabled = false;
  }

  slots.forEach((button) => {
    const value = describeSlot(button);
    button.setAttribute("aria-label", value.date + " " + value.time + "の相談枠（サンプル）");
    button.addEventListener("click", () => selectSlot(button));
  });
  const initial = slots.find((button) => button.getAttribute("aria-pressed") === "true");
  if (initial) selectSlot(initial);
  reviewButton.addEventListener("click", () => {
    if (!selected) return;
    document.getElementById("review-date").textContent = dateLabel.textContent + " " + timeLabel.textContent;
    dialog.showModal();
  });
  document.getElementById("close-review").addEventListener("click", () => dialog.close());
})();
