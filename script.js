// =========================================================================
// EmailJS Configuration
// PASTE YOUR ACTUAL CREDENTIALS IN THE CORRESPONDING STRINGS BELOW
// =========================================================================
const EMAILJS_SERVICE_ID = "service_jnu51a3";
const EMAILJS_TEMPLATE_ID = "template_0qbpjdh";
const EMAILJS_PUBLIC_KEY = "gdGSnoW2ltD8i_oVJ";

// Initialize EmailJS SDK
if (typeof emailjs !== 'undefined') {
  emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY,
  });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const body = document.body;
const loadingScreen = document.querySelector(".loading-screen");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const themeToggle = document.querySelector(".theme-toggle");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const magneticItems = [...document.querySelectorAll(".magnetic")];
const achievementCarousel = document.querySelector(".achievement-carousel-container");
const achievementSlides = [...document.querySelectorAll(".achievement-slide")];
const prevArrow = document.querySelector(".carousel-arrow.prev");
const nextArrow = document.querySelector(".carousel-arrow.next");
const progressBarFill = document.querySelector(".carousel-progress-fill");
const counterLabel = document.querySelector(".carousel-counter");
const certificateZoom = document.querySelector(".certificate-zoom");
const certificateZoomBody = document.querySelector(".certificate-zoom-body");
const certificateZoomClose = document.querySelector(".certificate-zoom-close");

const canvas = document.getElementById("scene");
const ctx = canvas?.getContext("2d");

const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const glassCards = [...document.querySelectorAll(".profile-card, .status-card, .stats-grid, .project-card, .achievement-card, .purpose-statement, .purpose-path article, .purpose-values, .contact-card, .social-link")];

let mousePos = { x: -100, y: -100 };
let ringPos = { x: -100, y: -100 };
let dotPos = { x: -100, y: -100 };
let isCursorInitialized = false;

let lastScrollY = window.scrollY;

// Event Throttling Optimization
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      window.setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Custom cursor positioning animation loop with spring-damper/lerp physics
function updateCursor() {
  if (prefersReducedMotion) return;

  if (!isCursorInitialized && mousePos.x !== -100) {
    ringPos.x = mousePos.x;
    ringPos.y = mousePos.y;
    dotPos.x = mousePos.x;
    dotPos.y = mousePos.y;
    isCursorInitialized = true;
  }

  const ringLerp = 0.14;
  const dotLerp = 0.35;

  ringPos.x += (mousePos.x - ringPos.x) * ringLerp;
  ringPos.y += (mousePos.y - ringPos.y) * ringLerp;

  dotPos.x += (mousePos.x - dotPos.x) * dotLerp;
  dotPos.y += (mousePos.y - dotPos.y) * dotLerp;

  const isHovering = body.classList.contains("cursor-hovering");
  if (cursorRing) {
    const scale = isHovering ? 1.555 : 1;
    cursorRing.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
  }
  if (cursorDot) {
    const scale = isHovering ? 0.5 : 1;
    cursorDot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
  }

  requestAnimationFrame(updateCursor);
}

// Handle cursor size and styling adjustments on link hover states
function initCursorInteractions() {
  const hoverables = document.querySelectorAll("a, button, .certificate-dot, .certificate-control");
  hoverables.forEach(item => {
    item.addEventListener("mouseenter", () => {
      body.classList.add("cursor-hovering");
    }, { passive: true });
    item.addEventListener("mouseleave", () => {
      body.classList.remove("cursor-hovering");
    }, { passive: true });
  });
}

// Hyperoptimized Mouse Coordinate tracking with cached bounding boxes to prevent style thrashing / reflows
function initCardGlows() {
  if (prefersReducedMotion) return;

  glassCards.forEach(card => {
    let rect = null;

    card.addEventListener("mouseenter", () => {
      rect = card.getBoundingClientRect();
    }, { passive: true });

    card.addEventListener("mousemove", (e) => {
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    }, { passive: true });

    card.addEventListener("mouseleave", () => {
      rect = null;
    }, { passive: true });
  });
}
let activeCertificateIndex = 0;
let certificateInterval = null;
let autoplayResumeTimeout = null;
let isCertificateTransitioning = false;
let isAchievementVisible = false;
let isWindowLoaded = false;

// Particle system variables
let width = 0;
let height = 0;
let particles = [];
let particlesActive = true;
let floatingShapes = [];
let mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };

function startCertificateAutoplay() {
  stopCertificateAutoplay();
  if (prefersReducedMotion) return;
  if ("IntersectionObserver" in window && !isAchievementVisible) return;

  certificateInterval = window.setInterval(() => {
    showCertificate(activeCertificateIndex + 1, false);
  }, 4000);
}

function stopCertificateAutoplay() {
  if (certificateInterval) {
    window.clearInterval(certificateInterval);
    certificateInterval = null;
  }
}

function openCertificateZoom(src, isPdf = false) {
  if (!certificateZoom || !certificateZoomBody) return;

  stopCertificateAutoplay();
  certificateZoomBody.innerHTML = "";

  if (isPdf) {
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = "Certificate PDF";
    certificateZoomBody.appendChild(iframe);
  } else {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Certificate Preview";
    certificateZoomBody.appendChild(img);
  }

  certificateZoom.hidden = false;
  window.requestAnimationFrame(() => {
    certificateZoom.classList.add("is-visible");
  });
}

function closeCertificateZoom() {
  if (!certificateZoom) return;

  certificateZoom.classList.remove("is-visible");
  window.setTimeout(() => {
    if (!certificateZoom.classList.contains("is-visible")) {
      certificateZoom.hidden = true;
      if (certificateZoomBody) {
        certificateZoomBody.innerHTML = "";
      }
    }
  }, 250);
  startCertificateAutoplay();
}

function showCertificate(index, resetAutoplay = true) {
  if (!achievementSlides.length) return;

  const prevSlideIndex = activeCertificateIndex;
  const targetIndex = (index + achievementSlides.length) % achievementSlides.length;

  const isInitialLoad = !achievementSlides.some(slide => slide.classList.contains("is-active"));
  if (!isInitialLoad && prevSlideIndex === targetIndex) return;

  // Calculate navigation direction (Next vs Prev)
  let isNext = true;
  if (!isInitialLoad) {
    if (targetIndex < prevSlideIndex) {
      isNext = false;
      // Account for wrap-around from slide 0 backward to last slide
      if (prevSlideIndex === 0 && targetIndex === achievementSlides.length - 1) {
        isNext = true;
      }
    } else {
      // Account for wrap-around from last slide forward to slide 0
      if (prevSlideIndex === achievementSlides.length - 1 && targetIndex === 0) {
        isNext = true;
      }
    }
  }

  // Toggle direction classes on the carousel track
  const track = document.querySelector(".achievement-carousel-track");
  if (track) {
    track.classList.toggle("nav-dir-next", isNext);
    track.classList.toggle("nav-dir-prev", !isNext);
  }

  // Transition old active slide to exiting state
  if (!isInitialLoad) {
    isCertificateTransitioning = true;
    const prevSlide = achievementSlides[prevSlideIndex];
    prevSlide.classList.remove("is-active");
    prevSlide.classList.add("is-exiting");

    if (prevSlide._exitTimeout) {
      window.clearTimeout(prevSlide._exitTimeout);
    }
    prevSlide._exitTimeout = window.setTimeout(() => {
      prevSlide.classList.remove("is-exiting");
      prevSlide._exitTimeout = null;
      isCertificateTransitioning = false;
    }, 550); // Matches CSS transition duration
  }

  // Activate target slide
  activeCertificateIndex = targetIndex;
  const activeSlide = achievementSlides[activeCertificateIndex];
  activeSlide.classList.add("is-active");

  if (progressBarFill) {
    const percent = ((activeCertificateIndex + 1) / achievementSlides.length) * 100;
    progressBarFill.style.width = `${percent}%`;
  }

  if (counterLabel) {
    counterLabel.textContent = `${activeCertificateIndex + 1} / ${achievementSlides.length}`;
  }

  if (achievementCarousel) {
    let glowColor = "rgba(56, 189, 248, 0.08)";
    if (activeCertificateIndex === 0) glowColor = "rgba(52, 211, 153, 0.08)";
    else if (activeCertificateIndex === 1) glowColor = "rgba(56, 189, 248, 0.08)";
    else if (activeCertificateIndex === 2) glowColor = "rgba(167, 139, 250, 0.08)";
    else if (activeCertificateIndex === 3) glowColor = "rgba(251, 191, 36, 0.08)";
    else if (activeCertificateIndex === 4) glowColor = "rgba(244, 114, 182, 0.08)";
    else if (activeCertificateIndex === 5) glowColor = "rgba(129, 140, 248, 0.08)";

    achievementCarousel.style.setProperty("--carousel-glow", glowColor);
  }

  if (resetAutoplay) {
    startCertificateAutoplay();
  }
}


function setTheme(mode) {
  const isLight = mode === "light";

  body.classList.toggle("light-mode", isLight);
  themeToggle?.setAttribute("aria-pressed", String(isLight));
  themeToggle?.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  localStorage.setItem("portfolio-theme", mode);
}

function initPreloader() {
  const progressFill = document.querySelector(".loader-progress-fill");
  const progressPercent = document.querySelector(".loader-percentage");
  const statusTextEl = document.querySelector(".loader-status-text");

  const statusMessages = [
    "Crafting Your Experience...",
    "Preparing the Interface...",
    "Building Something Amazing...",
    "Optimizing Performance...",
    "Almost Ready..."
  ];
  let statusIndex = 0;
  let progress = 0;

  // Status text message crossfade interval (700ms)
  const statusInterval = setInterval(() => {
    if (progress >= 100) {
      clearInterval(statusInterval);
      return;
    }

    if (statusTextEl) {
      statusTextEl.style.opacity = "0";
      statusTextEl.style.transform = "translate3d(0, -8px, 0)";

      setTimeout(() => {
        statusIndex = (statusIndex + 1) % statusMessages.length;
        statusTextEl.textContent = statusMessages[statusIndex];
        statusTextEl.style.opacity = "0.8";
        statusTextEl.style.transform = "translate3d(0, 0, 0)";
      }, 250);
    }
  }, 700);

  if (statusTextEl) {
    statusTextEl.style.opacity = "0.8";
    statusTextEl.style.transform = "translate3d(0, 0, 0)";
  }

  function simulateProgress() {
    const maxProgress = isWindowLoaded ? 100 : 88;

    if (progress < maxProgress) {
      // Accelerate progress completion immediately when window has loaded
      const increment = isWindowLoaded ? (100 - progress) : (Math.random() * 1.8 + 0.6);
      progress = Math.min(progress + increment, maxProgress);

      if (progressPercent) {
        progressPercent.textContent = `${Math.floor(progress)}%`;
      }
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
    }

    if (progress >= 100) {
      clearInterval(statusInterval);

      setTimeout(() => {
        const loadingScreen = document.querySelector(".loading-screen");
        if (loadingScreen) {
          loadingScreen.classList.add("is-exiting");

          loadingScreen.addEventListener("transitionend", () => {
            loadingScreen.setAttribute("hidden", "");
            body.classList.remove("is-loading");
            body.classList.add("is-loaded");


            // Stop favicon rotation animation and restore static favicon
            isFaviconPageLoaded = true;
            stopFaviconRotation();

            // Trigger hero stat counters explicitly on load after preloader vanishes
            document.querySelectorAll(".stats-grid [data-count]").forEach(counter => {
              if (!counter.dataset.done) {
                counter.dataset.done = "true";
                animateCounter(counter);
              }
            });
          }, { once: true });
        }
      }, 300);
    } else {
      requestAnimationFrame(simulateProgress);
    }
  }

  requestAnimationFrame(simulateProgress);
}

// Hyperoptimized background particles logic (neural constellation grid)
function resizeParticlesCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const isMobile = width < 768;
  if (isMobile || prefersReducedMotion) {
    particles = [];
    ctx.clearRect(0, 0, width, height);
    return;
  }

  // Single lightweight particle system with 30 particles
  const count = 30;
  particles = Array.from({ length: count }, () => {
    const isPurple = Math.random() > 0.5;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      radius: Math.random() * 1.3 + 0.7,
      color: isPurple ? "167, 139, 250" : "56, 189, 248",
      opacity: Math.random() * 0.15 + 0.08
    };
  });
}

function animateParticles() {
  if (!ctx || !canvas) return;

  const isMobile = window.innerWidth < 768;
  if (isMobile || prefersReducedMotion) {
    ctx.clearRect(0, 0, width, height);
    return; // Pauses requestAnimationFrame loop on mobile/reduced-motion
  }

  // Stop rendering completely if tab is inactive
  if (document.hidden) {
    requestAnimationFrame(animateParticles);
    return;
  }

  // Pause rendering completely if scrolled out of Hero & About sections
  if (!particlesActive) {
    ctx.clearRect(0, 0, width, height);
    requestAnimationFrame(animateParticles);
    return;
  }

  ctx.clearRect(0, 0, width, height);

  if (mouse.active) {
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
  }

  // Draw and update lightweight particle nodes
  particles.forEach(p => {
    if (mouse.active) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 110) {
        const force = (110 - dist) / 110;
        // Gentle repulsion
        p.x += (dx / dist) * force * 0.6;
        p.y += (dy / dist) * force * 0.6;
      }
    }

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
    ctx.fill();
  });

  // Render thin network connection lines
  ctx.lineWidth = 0.4;
  const maxDist = 75;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      if (dist < maxDist) {
        const alpha = ((maxDist - dist) / maxDist) * 0.07;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateParticles);
}

function initNavObserver() {
  const sections = [...document.querySelectorAll("main section")];
  const navLinksMap = {};
  navLinks.forEach(link => {
    if (link.hash) {
      navLinksMap[link.hash.slice(1)] = link;
    }
  });

  const observerOptions = {
    root: null,
    rootMargin: "-25% 0px -55% 0px",
    threshold: 0
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => link.classList.remove("is-active"));
        if (navLinksMap[id]) {
          navLinksMap[id].classList.add("is-active");
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

function initParticlesObserver() {
  const hero = document.getElementById("home");
  const about = document.getElementById("about");
  if (!hero || !about) return;

  const observerOptions = {
    root: null,
    threshold: 0
  };

  let heroVisible = true;
  let aboutVisible = true;

  function updateParticlesState() {
    particlesActive = heroVisible || aboutVisible;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target === hero) {
        heroVisible = entry.isIntersecting;
      } else if (entry.target === about) {
        aboutVisible = entry.isIntersecting;
      }
    });
    updateParticlesState();
  }, observerOptions);

  observer.observe(hero);
  observer.observe(about);
}

function updateHeaderVisibility() {
  const currentScrollY = window.scrollY;
  const isScrollingDown = currentScrollY > lastScrollY;
  const isNearTop = currentScrollY < 80;

  body.classList.toggle("nav-hidden", isScrollingDown && !isNearTop && !body.classList.contains("nav-open"));
  lastScrollY = currentScrollY;
}

function animateCounter(counter) {
  const target = Number(counter.dataset.count || 0);
  const duration = 1600; // 1.6s duration (between 1.5 and 2.0s)
  const start = performance.now();
  const format = counter.dataset.format;
  const suffix = counter.dataset.suffix || "";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Respect user motion accessibility preference
  if (prefersReduced) {
    if (format === "k" && target >= 1000) {
      counter.textContent = (target / 1000).toFixed(1) + "K" + suffix;
    } else {
      counter.textContent = target + suffix;
    }
    return;
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const currentVal = Math.round(target * eased);

    // Render pure numbers during animation (do not append suffix like "+")
    if (format === "k" && currentVal >= 1000) {
      counter.textContent = (currentVal / 1000).toFixed(1) + "K";
    } else {
      counter.textContent = currentVal;
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      // Append the suffix (e.g., "+") only after the animation completes
      if (format === "k") {
        counter.textContent = (target / 1000).toFixed(1) + "K" + suffix;
      } else if (target === 100 && !format) {
        counter.textContent = "100%";
      } else {
        counter.textContent = target + suffix;
      }
    }
  }

  requestAnimationFrame(tick);
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      entry.target.querySelectorAll("[data-count]").forEach(counter => {
        if (!counter.dataset.done) {
          counter.dataset.done = "true";
          animateCounter(counter);
        }
      });
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16 });

  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("is-visible"));
}

navToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

const navOverlay = document.querySelector(".nav-overlay");
navOverlay?.addEventListener("click", () => {
  body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Open menu");
});

nav?.addEventListener("click", event => {
  if (event.target.matches("a")) {
    body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open menu");
  }
});



magneticItems.forEach(item => {
  item.addEventListener("mousemove", event => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });

  item.addEventListener("mouseleave", () => {
    item.style.transform = "";
  });
});

// Carousel manual navigation helper to lock transitions and manage autoplay resume
function triggerManualCertificateChange(direction) {
  if (isCertificateTransitioning || !achievementSlides.length) return;

  stopCertificateAutoplay();
  if (autoplayResumeTimeout) {
    window.clearTimeout(autoplayResumeTimeout);
  }

  showCertificate(activeCertificateIndex + direction, false);

  autoplayResumeTimeout = window.setTimeout(() => {
    startCertificateAutoplay();
  }, 6000); // Resume autoplay after 6 seconds of inactivity
}

// Carousel manual navigation arrows
prevArrow?.addEventListener("click", () => {
  triggerManualCertificateChange(-1);
});

nextArrow?.addEventListener("click", () => {
  triggerManualCertificateChange(1);
});

// Autoplay slide control on hover
achievementCarousel?.addEventListener("mouseenter", stopCertificateAutoplay);
achievementCarousel?.addEventListener("mouseleave", () => {
  if (autoplayResumeTimeout) return; // Wait for manual resume if active
  startCertificateAutoplay();
});

// Keyboard arrow navigation support
achievementCarousel?.addEventListener("keydown", event => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  triggerManualCertificateChange(event.key === "ArrowRight" ? 1 : -1);
});

// View Full Certificate modal handlers
document.querySelectorAll(".view-cert-modal-btn").forEach(button => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const src = button.getAttribute("data-src") || "";
    const isPdf = button.getAttribute("data-is-pdf") === "true";
    openCertificateZoom(src, isPdf);
  });
});

// Touch swipe support on mobile devices
let touchStartX = 0;
let touchEndX = 0;

achievementCarousel?.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

achievementCarousel?.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const threshold = 55;
  if (touchStartX - touchEndX > threshold) {
    triggerManualCertificateChange(1); // swipe left (next)
  } else if (touchEndX - touchStartX > threshold) {
    triggerManualCertificateChange(-1); // swipe right (prev)
  }
}, { passive: true });

themeToggle?.addEventListener("click", (event) => {
  const isLight = body.classList.contains("light-mode");
  const nextTheme = isLight ? "dark" : "light";

  // Check if browser supports View Transition API and user prefers-reduced-motion is not active
  if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setTheme(nextTheme);
    return;
  }

  // Get coordinates of the click event, or default to center of the theme toggle button
  const rect = themeToggle.getBoundingClientRect();
  const x = event.clientX || (rect.left + rect.width / 2);
  const y = event.clientY || (rect.top + rect.height / 2);

  // Calculate radius to the furthest corner of the viewport
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = document.startViewTransition(() => {
    setTheme(nextTheme);
  });

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ];

    // Animate the new view (which is on top) expanding outward
    document.documentElement.animate(
      {
        clipPath: clipPath
      },
      {
        duration: 480,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        pseudoElement: "::view-transition-new(root)"
      }
    );
  });
});

// Contact Form Submission Handler
const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const successMsg = contactForm.querySelector(".form-success-msg");
  const errorMsg = contactForm.querySelector(".form-error-msg");
  const submitBtn = contactForm.querySelector("button[type='submit']");
  const resetFormBtn = contactForm.querySelector(".reset-form-btn");
  const retryFormBtn = contactForm.querySelector(".form-retry-btn");
  const formFields = contactForm.querySelectorAll("input, textarea, button");
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Reset visibility states and show loader
    errorMsg?.setAttribute("hidden", "true");
    contactForm.classList.add("is-loading");

    // Disable inputs during submission
    formFields.forEach(field => field.disabled = true);
    if (submitBtn) submitBtn.textContent = "Sending...";

    // Prepare template parameters (mapping both standard and custom EmailJS variables)
    const templateParams = {
      name: contactForm.querySelector('[name="name"]').value,
      from_name: contactForm.querySelector('[name="name"]').value,
      email: contactForm.querySelector('[name="email"]').value,
      from_email: contactForm.querySelector('[name="email"]').value,
      message: contactForm.querySelector('[name="message"]').value
    };

    // Send the email using EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        // Handle Success
        contactForm.classList.remove("is-loading");
        contactForm.classList.add("is-success");
        successMsg?.removeAttribute("hidden");
        contactForm.reset();
      })
      .catch((error) => {
        // Handle Error
        console.error("EmailJS Submission Error:", error);

        contactForm.classList.remove("is-loading");

        // Re-enable form fields
        formFields.forEach(field => field.disabled = false);
        if (submitBtn) submitBtn.textContent = "Send Message";

        // Show error message
        if (errorMsg) {
          const errorSpan = errorMsg.querySelector("span");
          if (errorSpan) {
            errorSpan.textContent = "Something went wrong. Please check your credentials or try again.";
          }
          errorMsg.removeAttribute("hidden");
        } else {
          alert("Something went wrong. Please try again.");
        }
      });
  });

  // Handle "Send Another" reset button click
  resetFormBtn?.addEventListener("click", () => {
    contactForm.classList.remove("is-success");
    successMsg?.setAttribute("hidden", "true");
    formFields.forEach(field => field.disabled = false);
    if (submitBtn) submitBtn.textContent = "Send Message";
  });

  // Handle "Retry" button click inside error message
  retryFormBtn?.addEventListener("click", () => {
    contactForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  });
}



certificateZoomClose?.addEventListener("click", closeCertificateZoom);
certificateZoom?.addEventListener("click", event => {
  if (event.target === certificateZoom) {
    closeCertificateZoom();
  }
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCertificateZoom();
  }
});

// Mousemove and resize scene hooks
window.addEventListener("mousemove", (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;

  mouse.tx = e.clientX;
  mouse.ty = e.clientY;
  mouse.active = true;
}, { passive: true });

window.addEventListener("mouseleave", () => {
  mouse.active = false;
  // Move custom cursor out of view
  mousePos.x = -100;
  mousePos.y = -100;
}, { passive: true });

window.addEventListener("resize", throttle(() => {
  const isMobile = window.innerWidth < 768;
  const wasStopped = isMobile || prefersReducedMotion;
  resizeParticlesCanvas();
  const isMobileNow = window.innerWidth < 768;
  if (wasStopped && !isMobileNow) {
    requestAnimationFrame(animateParticles);
  }
}, 150));

window.addEventListener("scroll", throttle(() => {
  updateHeaderVisibility();
}, 24), { passive: true });

window.addEventListener("load", () => {
  isWindowLoaded = true;
});

// Video sound toggle logic
document.querySelectorAll(".video-sound-toggle").forEach(button => {
  const video = button.previousElementSibling;
  if (!(video instanceof HTMLVideoElement)) return;

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isMuted = video.muted;
    video.muted = !isMuted;
    button.classList.toggle("is-unmuted", isMuted);

    // If unmuting, ensure video is playing
    if (isMuted && video.paused) {
      video.play();
    }
  });
});

// Initializations
resizeParticlesCanvas();
const isMobileDevice = window.innerWidth < 768;

if (!prefersReducedMotion && !isMobileDevice) {
  requestAnimationFrame(animateParticles);
} else {
  animateParticles(); // will clear and halt early if mobile
}

if (!prefersReducedMotion) {
  requestAnimationFrame(updateCursor);
}

// Pause offscreen autoplay using Intersection Observer
if ("IntersectionObserver" in window) {
  const achievementSection = document.getElementById("achievement");
  const achievementObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      isAchievementVisible = entry.isIntersecting;
      if (isAchievementVisible) {
        startCertificateAutoplay();
      } else {
        stopCertificateAutoplay();
      }
    });
  }, { threshold: 0.05 });
  if (achievementSection) {
    achievementObserver.observe(achievementSection);
  }
}

initCursorInteractions();
initCardGlows();
showCertificate(0);

initNavObserver();
initParticlesObserver();
setTheme(localStorage.getItem("portfolio-theme") || "dark");
// Upgraded role switcher animation (CSS grid handles width, JS handles interval/visibility)
function initRoleSwitcher() {
  const items = [...document.querySelectorAll(".role-item")];
  if (items.length === 0) return;

  let currentIndex = 0;
  let intervalId = null;

  function rotateRoles() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (document.hidden) return; // Pause when tab is inactive!
      
      const nextIndex = (currentIndex + 1) % items.length;
      const currentItem = items[currentIndex];
      const nextItem = items[nextIndex];

      currentItem.classList.remove("active");
      currentItem.classList.add("exiting");

      nextItem.classList.add("active");

      setTimeout(() => {
        currentItem.classList.remove("exiting");
      }, 500); // matches the 500ms CSS transition duration

      currentIndex = nextIndex;
    }, 2500); // Rotate every 2.5 seconds
  }

  // Start rotation
  rotateRoles();

  // Pause and resume on visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (intervalId) clearInterval(intervalId);
    } else {
      rotateRoles();
    }
  });
}

initRoleSwitcher();

// Timeline progress scrolling fill animation
function initTimelineProgress() {
  const container = document.querySelector(".purpose-path-container");
  const progress = document.querySelector(".timeline-progress");
  if (!container || !progress) return;

  let containerTop = 0;
  let containerHeight = 0;

  function cacheDimensions() {
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    containerTop = rect.top + scrollTop;
    containerHeight = rect.height;
  }

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const triggerPoint = scrollTop + window.innerHeight * 0.6; // Trigger line is at 60% of viewport height
    const scrolledAmount = triggerPoint - containerTop;
    
    let percent = (scrolledAmount / containerHeight) * 100;
    percent = Math.max(0, Math.min(100, percent));
    
    progress.style.height = `${percent}%`;
  }

  // Cache dimensions initially
  cacheDimensions();

  // Re-cache dimensions on resize and load
  window.addEventListener("resize", throttle(cacheDimensions, 150), { passive: true });
  window.addEventListener("load", cacheDimensions, { passive: true });

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateProgress();
}

initTimelineProgress();

// Projects Progress Bar & Counter Animation
function initProgressAnimations() {
  const progressSection = document.querySelector(".currently-building-grid");
  if (!progressSection) return;

  const fills = progressSection.querySelectorAll(".progress-fill");
  const counters = progressSection.querySelectorAll(".progress-counter");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateProgressElements(fills, counters);
        observer.unobserve(entry.target); // Only trigger once
      }
    });
  }, { threshold: 0.15 });

  observer.observe(progressSection);
}

function animateProgressElements(fills, counters) {
  const duration = 1500; // 1.5s
  const start = performance.now();
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Add animating class for active shimmer sweep
  fills.forEach(fill => {
    if (parseFloat(fill.dataset.progress || 0) > 0) {
      fill.classList.add("animating");
    }
  });

  if (prefersReduced) {
    fills.forEach(fill => {
      fill.style.transform = "scaleX(1)";
    });
    counters.forEach(counter => {
      const target = counter.dataset.target || 0;
      counter.textContent = `${target}%`;
    });
    fills.forEach(fill => fill.classList.remove("animating"));
    return;
  }

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    
    // Cubic ease-out
    const ease = 1 - Math.pow(1 - progress, 3);

    fills.forEach(fill => {
      fill.style.transform = `scaleX(${ease})`;
    });

    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target || 0);
      const currentVal = Math.round(target * ease);
      counter.textContent = `${currentVal}%`;
    });

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      // Remove shimmer once complete
      fills.forEach(fill => fill.classList.remove("animating"));
    }
  }

  requestAnimationFrame(tick);
}

initProgressAnimations();

// Weather Dashboard animation viewport observer
function initWeatherAnimationObserver() {
  const grid = document.querySelector(".currently-building-grid");
  if (!grid) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      grid.classList.toggle("in-view", entry.isIntersecting);
    });
  }, { threshold: 0.05 });

  observer.observe(grid);
}

initWeatherAnimationObserver();

// Premium page scroll progress bar
function initScrollProgress() {
  const progressBar = document.querySelector(".scroll-progress");
  if (!progressBar) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;

  function updateWidth() {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progressPercent = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
    
    progressBar.style.width = `${progressPercent}%`;
    ticking = false;
  }

  // Bind scroll with requestAnimationFrame throttling
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateWidth);
      ticking = true;
    }
  }, { passive: true });

  // Handle resizing or height updates
  window.addEventListener("resize", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateWidth);
      ticking = true;
    }
  }, { passive: true });

  updateWidth();
}

initScrollProgress();

initPreloader();

// Premium Favicon Manager (Loader Rotation & Tab Glow Switch)
let isFaviconPageLoaded = false;
let rotationAngle = 0;
let rotationInterval = null;
let logoImg = null;
let canvasEl = null;
let ctxEl = null;
const faviconLink = document.getElementById("favicon") || document.querySelector("link[rel*='icon']");
const defaultFaviconUrl = "assets/logo/tushar-pfp.svg";

function initFaviconManager() {
  if (!faviconLink) return;

  // Ensure default static favicon path
  faviconLink.href = defaultFaviconUrl;

  // Create offscreen canvas for dynamic favicon generation
  canvasEl = document.createElement("canvas");
  canvasEl.width = 32;
  canvasEl.height = 32;
  ctxEl = canvasEl.getContext("2d");

  // Load the logo image
  logoImg = new Image();
  logoImg.onload = () => {
    if (!isFaviconPageLoaded) {
      startFaviconRotation();
    }
  };
  logoImg.src = defaultFaviconUrl;

  // Tab visibility changes
  let originalTitle = document.title;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      originalTitle = document.title;
      document.title = "Come Back | Tushar Kumar Suthar";
      applyGlowFavicon();
    } else {
      document.title = originalTitle;
      restoreStaticFavicon();
    }
  });
}

function startFaviconRotation() {
  if (prefersReducedMotion) return;

  // Run at 15 FPS (every ~66ms) to keep it extremely lightweight and performant
  rotationInterval = setInterval(() => {
    if (isFaviconPageLoaded) {
      stopFaviconRotation();
      return;
    }
    
    rotationAngle = (rotationAngle + 10) % 360;
    drawRotatedFavicon(rotationAngle);
  }, 66);
}

function stopFaviconRotation() {
  if (rotationInterval) {
    clearInterval(rotationInterval);
    rotationInterval = null;
  }
  restoreStaticFavicon();
}

function drawRotatedFavicon(angle) {
  if (!logoImg || !ctxEl || !canvasEl) return;

  ctxEl.clearRect(0, 0, 32, 32);
  ctxEl.save();
  ctxEl.translate(16, 16);
  ctxEl.rotate((angle * Math.PI) / 180);
  ctxEl.drawImage(logoImg, -16, -16, 32, 32);
  ctxEl.restore();

  try {
    faviconLink.href = canvasEl.toDataURL("image/png");
  } catch (e) {
    // Cross-origin fallback
  }
}

function applyGlowFavicon() {
  if (!logoImg || !ctxEl || !canvasEl) return;

  ctxEl.clearRect(0, 0, 32, 32);
  ctxEl.save();
  
  if ('filter' in ctxEl) {
    ctxEl.filter = "drop-shadow(0px 0px 4px #38bdf8)";
  } else {
    ctxEl.shadowColor = "#38bdf8";
    ctxEl.shadowBlur = 4;
    ctxEl.shadowOffsetX = 0;
    ctxEl.shadowOffsetY = 0;
  }

  ctxEl.drawImage(logoImg, 2, 2, 28, 28);
  ctxEl.restore();

  try {
    faviconLink.href = canvasEl.toDataURL("image/png");
  } catch (e) {
    // Fallback
  }
}

function restoreStaticFavicon() {
  if (faviconLink) {
    faviconLink.href = defaultFaviconUrl;
  }
}

initFaviconManager();

// Register Service Worker for offline and cache support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully.', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
