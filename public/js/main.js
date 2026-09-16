// Diaporama du hero : fait defiler en fondu les images de fond toutes les
// 5 secondes. Vanilla JS, aucune dependance.
(function () {
  function initHeroSlideshow() {
    const slides = document.querySelectorAll(".hero-slide");
    if (slides.length < 2) return; // rien a faire s'il n'y a qu'une image
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }, 5000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroSlideshow);
  } else {
    initHeroSlideshow();
  }
})();
