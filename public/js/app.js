/**
 * Dashboard/detail behaviour: the AJAX delete with its confirm dialog
 * (issue 18) — no page reload after confirming; the card is removed in place.
 */
(function () {
  "use strict";

  var dialog = document.getElementById("confirm-dialog");
  if (!dialog) return;

  var pending = null; // {id, card, goto}
  var confirmButton = document.getElementById("confirm-delete");
  var confirmCopy = dialog.querySelector(".confirm-copy");

  document.addEventListener("click", function (event) {
    var target = event.target.closest(".js-delete");
    if (target) {
      var card = target.closest(".app-card");
      var badge = card ? card.querySelector(".status") : null;
      pending = {
        id: target.dataset.id,
        card: card,
        goto: target.dataset.goto || null,
        status: badge ? (badge.className.match(/st-(\w+)/) || [])[1] : "",
      };
      var company = target.dataset.company;
      confirmCopy.textContent =
        "删除后无法恢复，相关备注也会一并移除。" + (company ? "（" + company + "）" : "");
      dialog.showModal();
      return;
    }
    if (event.target.closest("[data-close]") || event.target === dialog) {
      dialog.close();
    }
  });

  confirmButton.addEventListener("click", function () {
    if (!pending) return;
    confirmButton.disabled = true;

    fetch("/applications/" + pending.id, { method: "DELETE" })
      .then(function (response) {
        if (!response.ok) return response.json().then(function (body) { throw new Error(body.error || "删除失败"); });
        return response.json();
      })
      .then(function () {
        dialog.close();
        if (pending.goto) {
          window.location.href = pending.goto; // detail page: nothing left to show
        } else if (pending.card) {
          var wasLast = document.querySelectorAll(".app-card").length === 1;
          pending.card.remove(); // dashboard: remove the row without a reload
          if (wasLast) {
            window.location.reload(); // re-render the 空状态 with fresh counts
          } else {
            bumpCounts(pending.status);
          }
        }
      })
      .catch(function (error) {
        dialog.close();
        window.alert(error.message);
      })
      .finally(function () {
        confirmButton.disabled = false;
        pending = null;
      });
  });

  /** Keep the filter chips and the page subtitle in step with the deletion. */
  function bumpCounts(status) {
    var statusClass = { applied: "已投递", interviewing: "面试机会", offer: "Offer", rejected: "已拒绝" }[status];
    document.querySelectorAll(".chip").forEach(function (chip) {
      var counter = chip.querySelector("b");
      if (!counter) return;
      var isTotal = chip.textContent.indexOf("全部") === 0;
      var matches = statusClass && chip.textContent.indexOf(statusClass) !== -1;
      if (isTotal || matches) counter.textContent = String(Math.max(0, Number(counter.textContent) - 1));
    });

    var sub = document.querySelector(".page-sub");
    if (sub) {
      var text = sub.textContent;
      text = text.replace(/共 (\d+) 条投递/, function (_, n) { return "共 " + (Number(n) - 1) + " 条投递"; });
      if (status === "interviewing") text = text.replace(/(\d+) 个面试机会/, function (_, n) { return (Number(n) - 1) + " 个面试机会"; });
      if (status === "offer") text = text.replace(/(\d+) 个 Offer/, function (_, n) { return (Number(n) - 1) + " 个 Offer"; });
      sub.textContent = text;
    }
  }
})();
