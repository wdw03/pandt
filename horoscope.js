const initializeHoroscopeNavbar = () => {
    const toggle = document.getElementById("profileToggle");
    const drawer = document.getElementById("profileDrawer");
    const overlay = document.getElementById("drawerOverlay");
    const drawerItems = document.querySelectorAll(
        ".profile-drawer h3, .profile-drawer p, .profile-drawer h4, .drawer-item, .footer-btn"
    );
    const bookKundaliToggle = document.getElementById("bookKundaliToggle");
    const bookKundaliSubmenu = document.getElementById("bookKundaliSubmenu");
    const bookKundaliAccordion = document.getElementById("bookKundaliAccordion");

    if (!toggle || !drawer || !overlay || typeof gsap === "undefined") {
        return;
    }

    let isDrawerOpen = false;

    gsap.set(drawer, {
        y: -20,
        opacity: 0,
        scale: 0.96,
        visibility: "hidden"
    });

    gsap.set(overlay, {
        opacity: 0,
        visibility: "hidden"
    });

    gsap.set(drawerItems, {
        opacity: 0,
        y: 20
    });

    const openDrawer = () => {
        isDrawerOpen = true;

        gsap.set(drawer, { visibility: "visible" });
        gsap.set(overlay, { visibility: "visible" });

        gsap.to(overlay, {
            opacity: 1,
            duration: 0.25,
            ease: "power2.out"
        });

        gsap.to(drawer, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "power2.out"
        });

        gsap.to(drawerItems, {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.05,
            delay: 0.1,
            ease: "power2.out"
        });
    };

    const closeDrawer = () => {
        isDrawerOpen = false;

        gsap.to(drawerItems, {
            opacity: 0,
            y: 15,
            duration: 0.18,
            ease: "power2.in"
        });

        gsap.to(overlay, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        });

        gsap.to(drawer, {
            y: -20,
            opacity: 0,
            scale: 0.96,
            duration: 0.28,
            ease: "power2.in",
            onComplete: () => {
                gsap.set(drawer, { visibility: "hidden" });
                gsap.set(overlay, { visibility: "hidden" });
            }
        });
    };

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        isDrawerOpen ? closeDrawer() : openDrawer();
    });

    overlay.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isDrawerOpen) {
            closeDrawer();
        }
    });

    if (!bookKundaliToggle || !bookKundaliSubmenu || !bookKundaliAccordion) {
        return;
    }

    gsap.set(bookKundaliSubmenu, {
        height: 0,
        opacity: 0,
        display: "none"
    });

    let isBookKundaliOpen = false;

    bookKundaliToggle.addEventListener("click", () => {
        isBookKundaliOpen = !isBookKundaliOpen;

        if (isBookKundaliOpen) {
            bookKundaliAccordion.classList.add("open");
            gsap.set(bookKundaliSubmenu, { display: "flex" });
            gsap.fromTo(
                bookKundaliSubmenu,
                { height: 0, opacity: 0 },
                {
                    height: "auto",
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out"
                }
            );
            return;
        }

        bookKundaliAccordion.classList.remove("open");
        gsap.to(bookKundaliSubmenu, {
            height: 0,
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                gsap.set(bookKundaliSubmenu, { display: "none" });
            }
        });
    });
};

initializeHoroscopeNavbar();

const zodiacGrid = document.querySelector("[data-zodiac-grid]");
const successTrack = document.querySelector("[data-success-track]");
const successIndicators = document.querySelector("[data-success-indicators]");
const successSlider = document.querySelector("[data-success-slider]");

const zodiacSigns = [
    {
        name: "Pisces",
        initials: "Pi",
        label: "Today",
        subtitle: "Read your daily flow",
        start: "#7b9cff",
        end: "#4f6cd8"
    },
    {
        name: "Aquarius",
        initials: "Aq",
        label: "Today",
        subtitle: "See your direction",
        start: "#53b7b3",
        end: "#247b78"
    },
    {
        name: "Capricorn",
        initials: "Cp",
        label: "Today",
        subtitle: "Find grounded timing",
        start: "#b48462",
        end: "#7a4d2d"
    },
    {
        name: "Sagittarius",
        initials: "Sg",
        label: "Today",
        subtitle: "Watch new chances",
        start: "#ff9f68",
        end: "#e06b29"
    },
    {
        name: "Scorpio",
        initials: "Sc",
        label: "Today",
        subtitle: "Trust your instincts",
        start: "#c25d74",
        end: "#8c2f49"
    },
    {
        name: "Libra",
        initials: "Li",
        label: "Today",
        subtitle: "Balance your moves",
        start: "#d39bd9",
        end: "#a460ac"
    },
    {
        name: "Virgo",
        initials: "Vi",
        label: "Today",
        subtitle: "Plan with clarity",
        start: "#7fbf8f",
        end: "#3f8b57"
    },
    {
        name: "Leo",
        initials: "Le",
        label: "Today",
        subtitle: "Step into confidence",
        start: "#ffbf4f",
        end: "#e68a13"
    },
    {
        name: "Cancer",
        initials: "Ca",
        label: "Today",
        subtitle: "Protect your peace",
        start: "#7cb7f2",
        end: "#4a7ed5"
    },
    {
        name: "Gemini",
        initials: "Ge",
        label: "Today",
        subtitle: "Use your insight",
        start: "#6cd0d2",
        end: "#30979a"
    },
    {
        name: "Taurus",
        initials: "Ta",
        label: "Today",
        subtitle: "Move with patience",
        start: "#b4b95b",
        end: "#7a7f26"
    },
    {
        name: "Aries",
        initials: "Ar",
        label: "Today",
        subtitle: "Take bold action",
        start: "#ff7f73",
        end: "#dc493f"
    }
];

const successSlides = [
    {
        title: "Wealth Timing",
        description: "Discover how the right timing can support growth, recognition, and success.",
        label: "Slide 01",
        image: "./assets/images/Gemini_Generated_Image_alcwplalcwplalcw.png",
        start: "#6e4c3d",
        end: "#c67a48"
    },
    {
        title: "Career Momentum",
        description: "See when effort, leadership, and visibility align in your favor.",
        label: "Slide 02",
        image: "./assets/images/panditpujakete.jpg",
        start: "#3f5369",
        end: "#7b9cc0"
    },
    {
        title: "Future Prosperity",
        description: "Use this placeholder slot for your own success-focused business visual later.",
        label: "Slide 03",
        image: "",
        start: "#6a4a73",
        end: "#bb8ad0"
    },
    {
        title: "Opportunity Window",
        description: "Add another premium image here to highlight ambition, guidance, and growth.",
        label: "Slide 04",
        image: "",
        start: "#5d5b35",
        end: "#b6a75a"
    },
    {
        title: "Star-Led Direction",
        description: "Prepare a final success image slot for consultations, predictions, or CTA storytelling.",
        label: "Slide 05",
        image: "",
        start: "#7f4734",
        end: "#d88d64"
    }
];

const renderZodiacCards = () => {
    if (!zodiacGrid) {
        return;
    }

    zodiacGrid.innerHTML = "";

    zodiacSigns.forEach((sign) => {
        const card = document.createElement("article");
        card.className = "horoscope-sign-card";

        const art = document.createElement("div");
        art.className = "horoscope-sign-art";
        art.style.setProperty("--sign-start", sign.start);
        art.style.setProperty("--sign-end", sign.end);

        const badge = document.createElement("span");
        badge.className = "horoscope-sign-badge";
        badge.textContent = sign.label;

        const initials = document.createElement("span");
        initials.className = "horoscope-sign-initials";
        initials.textContent = sign.initials;

        art.append(badge, initials);

        const name = document.createElement("h3");
        name.className = "horoscope-sign-name";
        name.textContent = sign.name;

        const subtitle = document.createElement("p");
        subtitle.className = "horoscope-sign-subtitle";
        subtitle.textContent = sign.subtitle;

        card.append(art, name, subtitle);
        zodiacGrid.append(card);
    });
};

let activeSuccessSlide = 0;
let successSliderTimer = null;

const updateSuccessIndicators = () => {
    if (!successIndicators) {
        return;
    }

    successIndicators.querySelectorAll(".horoscope-success-dot").forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeSuccessSlide);
    });
};

const showSuccessSlide = (index) => {
    if (!successTrack) {
        return;
    }

    activeSuccessSlide = (index + successSlides.length) % successSlides.length;
    successTrack.style.transform = `translateX(-${activeSuccessSlide * 100}%)`;
    updateSuccessIndicators();
};

const startSuccessSlider = () => {
    if (!successTrack || successSlides.length <= 1) {
        return;
    }

    clearInterval(successSliderTimer);
    successSliderTimer = window.setInterval(() => {
        showSuccessSlide(activeSuccessSlide + 1);
    }, 2000);
};

const stopSuccessSlider = () => {
    clearInterval(successSliderTimer);
};

const renderSuccessSlides = () => {
    if (!successTrack || !successIndicators) {
        return;
    }

    successTrack.innerHTML = "";
    successIndicators.innerHTML = "";

    successSlides.forEach((slide, index) => {
        const slideItem = document.createElement("article");
        slideItem.className = "horoscope-success-slide";

        const frame = document.createElement("div");
        frame.className = "horoscope-success-frame";
        frame.style.setProperty("--slide-start", slide.start);
        frame.style.setProperty("--slide-end", slide.end);

        if (slide.image) {
            frame.classList.add("has-image");
            frame.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.12)), url("${slide.image}")`;
        }

        const label = document.createElement("span");
        label.className = "horoscope-success-label";
        label.textContent = slide.label;

        const placeholder = document.createElement("span");
        placeholder.className = "horoscope-success-placeholder";
        placeholder.textContent = slide.image ? "" : "Image Slot";

        const overlay = document.createElement("div");
        overlay.className = "horoscope-success-overlay";

        const title = document.createElement("strong");
        title.textContent = slide.title;

        const description = document.createElement("p");
        description.textContent = slide.description;

        overlay.append(title, description);
        frame.append(label, placeholder, overlay);
        slideItem.append(frame);
        successTrack.append(slideItem);

        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "horoscope-success-dot";
        dot.setAttribute("aria-label", `Go to ${slide.label}`);
        dot.addEventListener("click", () => {
            showSuccessSlide(index);
            startSuccessSlider();
        });

        successIndicators.append(dot);
    });

    showSuccessSlide(0);
    startSuccessSlider();
};

if (successSlider) {
    successSlider.addEventListener("mouseenter", stopSuccessSlider);
    successSlider.addEventListener("mouseleave", startSuccessSlider);
}

renderZodiacCards();
renderSuccessSlides();
