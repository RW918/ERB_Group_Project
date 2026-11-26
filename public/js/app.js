/**
 * Dashboard/detail behaviour: the AJAX delete with its confirm dialog
 * (issue 18) — no page reload after confirming; the card is removed in place.
 */
(function () {
  "use strict";

  // Theme toggle: tri-state per the dark-mode-toggle guide — "system"
  // (no stored value) or a pinned literal. The target is the opposite of
  // what is rendered right now; pinning stops when the target equals the
  // system preference (the stored value is removed, never kept). Colors and
  // color-scheme come from CSS/media queries off the <meta>, not from JS.
  
  // var themeToggle = document.querySelector(".theme-toggle");
  // if (themeToggle) {
  //   themeToggle.addEventListener("click", function () {                        //EDITED
  document.querySelectorAll(".theme-toggle").forEach(function (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var meta = document.querySelector('meta[name="color-scheme"]');
      var systemPref = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      var stored = meta.content; // "light dark" | "light" | "dark"
      var rendered = stored === "light dark" ? systemPref : stored;
      var target = rendered === "dark" ? "light" : "dark";
      try {
        if (target === systemPref) {
          localStorage.removeItem("color-scheme"); // back to system
          meta.content = "light dark";
        } else {
          localStorage.setItem("color-scheme", target);
          meta.content = target;
        }
      } catch (error) {
        meta.content = target; // applies this session even if storage fails
      }
    });
  });

  // A pinned scheme can be changed from another tab: stay in sync.
  window.addEventListener("storage", function (event) {
    if (event.key === "color-scheme") {
      var meta = document.querySelector('meta[name="color-scheme"]');
      meta.content = localStorage.getItem("color-scheme") ?? "light dark";
    }
  });

  // Forms marked data-fetch submit via fetch: validation errors re-render
  // inline with the typed values intact; success follows the redirect. The
  // native POST stays as the no-JS fallback.
  function showError(form, message) {
    var anchor = form.querySelector(".modal-body") || form;
    var alert = anchor.querySelector(".alert-error");
    if (!alert) {
      alert = document.createElement("div");
      alert.className = "alert-error span-2";
      alert.setAttribute("role", "alert");
      alert.innerHTML = '<svg class="ic"><use href="#i-alert" /></svg><span></span>';
      anchor.prepend(alert);
    }
    alert.querySelector("span:last-child").textContent = message;
  }

  document.querySelectorAll("form[data-fetch]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;

      var prepare = Promise.resolve();
      // data-hash-field: the wire carries SHA-256(field) instead of the
      // plaintext — the real password never leaves the browser; the server
      // still applies its own scrypt to what it receives.
      var hashField = form.dataset.hashField;
      if (hashField) {
        var input = form.elements[hashField];
        prepare = window.crypto.subtle
          .digest("SHA-256", new TextEncoder().encode(input.value))
          .then(function (digest) {
            input.value = [...new Uint8Array(digest)]
              .map(function (b) { return b.toString(16).padStart(2, "0"); })
              .join("");
          });
      }

      prepare
        .then(function () {
          // urlencoded, not multipart: express.urlencoded parses this natively
          return fetch(form.action, {
            method: "POST",
            body: new URLSearchParams(new FormData(form)),
          });
        })
        .then(function (response) {
          // The server answers with a redirect: the success target, or the
          // same page carrying ?error=… (login failures carry ?error=1 and
          // the wording comes from data-error-text).
          var url = new URL(response.url, window.location.origin);
          var message = url.searchParams.get("error");
          if (message) {
            if (message === "1") message = form.dataset.errorText || message;
            showError(form, message);
            return;
          }
          window.location.href = url.pathname + url.search;
        })
        .catch(function () {
          showError(form, "保存失败，请重试");
        })
        .finally(function () {
          if (button) button.disabled = false;
        });
    });
  });

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
    if (event.target.closest("[data-close]")) {
      dialog.close();
    }
  });

  // closedby="any" is native in current Chromium/Firefox; where it is missing,
  // light-dismiss degrades to Esc-only — add the manual fallback, testing the
  // pointer position (the dialog is also the target for its own padding, so a
  // target check would close on clicks inside the dialog's own gaps).
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    for (const d of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      d.addEventListener("pointerdown", function (e) {
        var r = d.getBoundingClientRect();
        pressedOutside =
          e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      });
      // Require the press AND the release outside, so a text-selection drag
      // that ends on the backdrop does not dismiss.
      d.addEventListener("pointerup", function (e) {
        var r = d.getBoundingClientRect();
        var outside =
          e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (pressedOutside && outside) d.close();
      });
    }
  }

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
