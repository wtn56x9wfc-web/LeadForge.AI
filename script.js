document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll for anchor links
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      const targetID = this.getAttribute("href");
      const targetEl = document.querySelector(targetID);

      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});
