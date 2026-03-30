// Shared DOM references
const body = document.body;
const nav = document.querySelector(".site-nav");
const menuButton = document.querySelector(".menu-toggle");
const menuBackdrop = document.querySelector(".menu-backdrop");
const drawerNavLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const floatingNavLinks = document.querySelectorAll('.floating-nav a[href^="#"]');
const allNavLinks = [...drawerNavLinks, ...floatingNavLinks];
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const yearNode = document.getElementById("year");
let unlockMenuTimer = null;
const MENU_CLOSE_ANIMATION_MS = 460;

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (menuButton && nav) {
  const setMenuState = (open) => {
    if (unlockMenuTimer) {
      clearTimeout(unlockMenuTimer);
      unlockMenuTimer = null;
    }

    nav.classList.toggle("is-open", open);
    menuButton.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    if (open) {
      body.classList.add("nav-open");
      if (menuBackdrop) {
        menuBackdrop.hidden = false;
      }
    } else {
      // Keep page locked until the close transition finishes.
      unlockMenuTimer = setTimeout(() => {
        if (nav.classList.contains("is-open")) return;
        body.classList.remove("nav-open");
        if (menuBackdrop) {
          menuBackdrop.hidden = true;
        }
      }, MENU_CLOSE_ANIMATION_MS);
    }
    menuButton.setAttribute("aria-label", open ? "Cerrar menu principal" : "Abrir menu principal");
    if (menuBackdrop) {
      menuBackdrop.classList.toggle("is-open", open);
    }
  };

  // Animated hamburger menu toggle
  menuButton.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    setMenuState(open);
  });

  drawerNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  if (menuBackdrop) {
    menuBackdrop.addEventListener("click", () => setMenuState(false));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenuState(false);
    }
  });
}

const revealObserver = new IntersectionObserver(
  // Fade-in on scroll for sections and cards
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

const animateCounter = (element) => {
  const target = Number.parseFloat(element.dataset.counter || "0");
  if (!Number.isFinite(target) || target <= 0) return;
  const suffix = element.dataset.suffix ?? (target >= 90 ? "%" : "+");
  const decimals = Number.parseInt(element.dataset.decimals || "0", 10);

  const duration = 1300;
  const start = performance.now();

  const tick = (currentTime) => {
    const progress = Math.min((currentTime - start) / duration, 1);
    const rawValue = progress * target;
    const value = decimals > 0 ? rawValue.toFixed(decimals) : `${Math.floor(rawValue)}`;
    element.textContent = `${value}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      const finalValue = decimals > 0 ? target.toFixed(decimals) : `${Math.round(target)}`;
      element.textContent = `${finalValue}${suffix}`;
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  // Trigger counter animation once when metrics become visible
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const sectionNodes = [...document.querySelectorAll("main section[id]")];
const activeObserver = new IntersectionObserver(
  // Keep nav item in sync with active section
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute("id");
      allNavLinks.forEach((link) => {
        const isTarget = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", isTarget);
      });
    });
  },
  { threshold: 0.45 }
);

sectionNodes.forEach((section) => activeObserver.observe(section));
