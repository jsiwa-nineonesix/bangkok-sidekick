/* Light / Dark switch. Loaded in <head> so the saved theme is applied before first paint (no flash).
   Default is Light; the phone's system setting is deliberately ignored. The choice is saved on this device only. */
(function () {
  var KEY = "sidekick-theme", root = document.documentElement;
  var COLORS = { light: "#dcebfa", dark: "#0b1424" };
  function saved() { try { var v = localStorage.getItem(KEY); return v === "dark" ? "dark" : "light"; } catch (e) { return "light"; } }
  function apply(t) {
    root.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", COLORS[t]);
    var c = document.querySelector('meta[name="color-scheme"]'); if (c) c.setAttribute("content", t);
    var b = document.getElementById("theme-btn");
    if (b) { b.setAttribute("aria-pressed", t === "dark"); b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode"); b.title = b.getAttribute("aria-label"); }
  }
  apply(saved());
  document.addEventListener("DOMContentLoaded", function () {
    var b = document.getElementById("theme-btn"); if (!b) return;
    apply(saved());
    b.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.classList.add("theme-fade"); apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      setTimeout(function () { root.classList.remove("theme-fade"); }, 500);
    });
  });
})();
