(function () {
  function slugify(text, seen) {
    var base = text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (!base) {
      base = "section";
    }

    var slug = base;
    var count = 2;

    while (seen[slug]) {
      slug = base + "-" + count;
      count += 1;
    }

    seen[slug] = true;
    return slug;
  }

  function buildToc(article, tocList) {
    var headings = article.querySelectorAll("h2, h3");
    var seen = {};

    tocList.innerHTML = "";

    headings.forEach(function (heading) {
      if (!heading.id) {
        heading.id = slugify(heading.textContent || "section", seen);
      }

      var item = document.createElement("li");
      item.className = heading.tagName.toLowerCase() === "h3" ? "toc-subitem" : "";

      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent;
      item.appendChild(link);
      tocList.appendChild(item);
    });

    return Array.prototype.slice.call(headings);
  }

  function setActiveSection(headings, tocList) {
    if (!headings.length || !("IntersectionObserver" in window)) {
      return;
    }

    var links = Array.prototype.slice.call(tocList.querySelectorAll("a"));
    var map = {};

    links.forEach(function (link) {
      map[link.getAttribute("href").slice(1)] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          links.forEach(function (link) {
            link.classList.remove("is-active");
          });

          var activeLink = map[entry.target.id];
          if (activeLink) {
            activeLink.classList.add("is-active");
          }
        });
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0
      }
    );

    headings.forEach(function (heading) {
      observer.observe(heading);
    });
  }

  function renderMarkdown(container) {
    var source = container.getAttribute("data-markdown");
    var shell = container.closest(".tutorial-notes-layout") || container.closest(".tutorial-shell");
    var tocList = shell ? shell.querySelector(".tutorial-toc-list") : null;

    if (!source || !window.marked) {
      container.innerHTML = '<p class="tutorial-error">Markdown renderer is unavailable.</p>';
      return;
    }

    fetch(source)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Unable to load markdown file.");
        }

        return response.text();
      })
      .then(function (markdown) {
        container.innerHTML = window.marked.parse(markdown);

        if (tocList) {
          var headings = buildToc(container, tocList);
          setActiveSection(headings, tocList);
        }
      })
      .catch(function () {
        container.innerHTML =
          '<p class="tutorial-error">This markdown file could not be loaded. If you are opening the site directly from the filesystem, use a local server or VS Code preview so markdown files can be fetched correctly.</p>';
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.marked) {
      window.marked.setOptions({
        mangle: false,
        headerIds: false
      });
    }

    document.querySelectorAll("[data-markdown]").forEach(renderMarkdown);
  });
})();
