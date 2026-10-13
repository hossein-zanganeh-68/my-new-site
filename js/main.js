/* ============================
   HORIZON PROPERTIES — INTERACTIONS
   ============================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Header scroll state ----
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu ----
  const menuToggle = document.getElementById('menuToggle');
  const navMobile = document.getElementById('navMobile');
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    navMobile.classList.toggle('open');
  });
  navMobile.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      navMobile.classList.remove('open');
    });
  });

  // ---- Active nav link on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const setActive = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // ---- Carousel ----
  const carousel = document.getElementById('carousel');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const scrollAmount = () => {
    const card = carousel.querySelector('.property-card');
    const gap = 20;
    return card ? card.offsetWidth + gap : 320;
  };
  prevBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });

  // ---- Reveal on scroll ----
  const revealEls = document.querySelectorAll('.about-text, .about-images, .service-card, .team-card, .cta-bar, .section-head');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    io.observe(el);
  });

  // ---- About image next button ----
  const aboutImgs = document.querySelectorAll('.about-img-main img, .about-img-secondary img');
  let aboutIdx = 0;
  const aboutSources = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2c644?w=800&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe8c67138?w=800&q=80'
  ];
  const nextImgBtn = document.querySelector('.img-next-btn');
  if (nextImgBtn) {
    nextImgBtn.addEventListener('click', () => {
      aboutIdx = (aboutIdx + 1) % aboutSources.length;
      aboutImgs.forEach((img, i) => {
        const srcIdx = (aboutIdx + i) % aboutSources.length;
        img.src = aboutSources[srcIdx];
      });
    });
  }

});
