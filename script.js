(function () {
  var storageKey = "site-theme";
  var root = document.documentElement;
  var themeButtons = document.querySelectorAll(".theme-toggle");
  var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function getActiveTheme() {
    return root.getAttribute("data-theme") || "light";
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);

    if (persist) {
      localStorage.setItem(storageKey, theme);
    }

    themeButtons.forEach(function (button) {
      var pressed = theme === "dark";
      var label = pressed ? "Day Mode" : "Night Mode";
      button.setAttribute("aria-pressed", String(pressed));

      var text = button.querySelector(".theme-toggle-text");
      if (text) {
        text.textContent = label;
      }
    });
  }

  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var nextTheme = getActiveTheme() === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  });

  applyTheme(getActiveTheme(), false);

  mediaQuery.addEventListener("change", function (event) {
    if (localStorage.getItem(storageKey)) {
      return;
    }

    applyTheme(event.matches ? "dark" : "light", false);
  });
})();