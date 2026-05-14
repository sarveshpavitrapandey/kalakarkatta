const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const yearSlot = document.getElementById("currentYear");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.classList.toggle("open");
    navMenu.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("open");
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (yearSlot) {
  yearSlot.textContent = new Date().getFullYear();
}

const eventTrack = document.querySelector(".event-track");
const prevButton = document.querySelector(".slider-control.prev");
const nextButton = document.querySelector(".slider-control.next");

if (eventTrack && prevButton && nextButton) {
  const cards = Array.from(eventTrack.children);
  let currentIndex = 0;
  const visibleCards = () => {
    if (window.innerWidth <= 720) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 4;
  };

  const updateSlider = () => {
    const width = cards[0].getBoundingClientRect().width + 18;
    eventTrack.style.transform = `translateX(-${currentIndex * width}px)`;
  };

  prevButton.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateSlider();
  });

  nextButton.addEventListener("click", () => {
    const maxIndex = Math.max(0, cards.length - visibleCards());
    currentIndex = Math.min(maxIndex, currentIndex + 1);
    updateSlider();
  });

  window.addEventListener("resize", () => {
    currentIndex = Math.min(currentIndex, Math.max(0, cards.length - visibleCards()));
    updateSlider();
  });
}

const forms = document.querySelectorAll("form");
forms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.classList.add("submitted");
    const button = form.querySelector("button[type='submit']") || form.querySelector("button");
    if (button) {
      const originalText = button.textContent;
      button.textContent = "Thanks!";
      button.disabled = true;
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        form.reset();
        form.classList.remove("submitted");
      }, 2400);
    }
  });
});

