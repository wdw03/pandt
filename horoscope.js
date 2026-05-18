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

const API_BASE = "/api";
const TOKEN_KEY = "tmToken";
const USER_KEY = "tmUser";

const zodiacGrid = document.querySelector("[data-zodiac-grid]");
const successTrack = document.querySelector("[data-success-track]");
const successIndicators = document.querySelector("[data-success-indicators]");
const successSlider = document.querySelector("[data-success-slider]");
const reviewTrack = document.querySelector("[data-review-track]");
const videoTrack = document.querySelector("[data-video-track]");
const videoDots = document.querySelector("[data-video-dots]");
const blogTrack = document.querySelector("[data-blog-track]");
const blogDots = document.querySelector("[data-blog-dots]");
const accordionToggle = document.querySelector("[data-gallery-accordion-toggle]");
const accordionContent = document.querySelector("[data-gallery-accordion-content]");
const serviceGrid = document.querySelector("[data-astrology-services]");
const astrologyFeedbackNode = document.querySelector("[data-astrology-feedback]");
const panchangDateNode = document.querySelector("[data-panchang-date]");

const zodiacSigns = [
    { slug: "pisces", name: "Pisces", initials: "Pi", label: "Today", subtitle: "Read your daily flow", start: "#7b9cff", end: "#4f6cd8" },
    { slug: "aquarius", name: "Aquarius", initials: "Aq", label: "Today", subtitle: "See your direction", start: "#53b7b3", end: "#247b78" },
    { slug: "capricorn", name: "Capricorn", initials: "Cp", label: "Today", subtitle: "Find grounded timing", start: "#b48462", end: "#7a4d2d" },
    { slug: "sagittarius", name: "Sagittarius", initials: "Sg", label: "Today", subtitle: "Watch new chances", start: "#ff9f68", end: "#e06b29" },
    { slug: "scorpio", name: "Scorpio", initials: "Sc", label: "Today", subtitle: "Trust your instincts", start: "#c25d74", end: "#8c2f49" },
    { slug: "libra", name: "Libra", initials: "Li", label: "Today", subtitle: "Balance your moves", start: "#d39bd9", end: "#a460ac" },
    { slug: "virgo", name: "Virgo", initials: "Vi", label: "Today", subtitle: "Plan with clarity", start: "#7fbf8f", end: "#3f8b57" },
    { slug: "leo", name: "Leo", initials: "Le", label: "Today", subtitle: "Step into confidence", start: "#ffbf4f", end: "#e68a13" },
    { slug: "cancer", name: "Cancer", initials: "Ca", label: "Today", subtitle: "Protect your peace", start: "#7cb7f2", end: "#4a7ed5" },
    { slug: "gemini", name: "Gemini", initials: "Ge", label: "Today", subtitle: "Use your insight", start: "#6cd0d2", end: "#30979a" },
    { slug: "taurus", name: "Taurus", initials: "Ta", label: "Today", subtitle: "Move with patience", start: "#b4b95b", end: "#7a7f26" },
    { slug: "aries", name: "Aries", initials: "Ar", label: "Today", subtitle: "Take bold action", start: "#ff7f73", end: "#dc493f" }
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
        description: "Use this premium slot for broader life direction and prosperity-focused storytelling.",
        label: "Slide 03",
        image: "./assets/images/home-analyze.png",
        start: "#6a4a73",
        end: "#bb8ad0"
    }
];

const reviews = [
    {
        name: "Meera S",
        initials: "MS",
        stars: "★★★★★",
        text: "Daily guidance and puja support dono bahut genuine lage. Reading clear thi aur experience peaceful tha."
    },
    {
        name: "Rohan V",
        initials: "RV",
        stars: "★★★★★",
        text: "Kundali aur Panchang details ka layout samajhna easy hai. Thanathu Madom ka trust feel hota hai."
    },
    {
        name: "Anjali P",
        initials: "AP",
        stars: "★★★★★",
        text: "Puja booking ke baad jo clarity mili aur ritual process ka explanation mila, wo really helpful tha."
    },
    {
        name: "Suresh K",
        initials: "SK",
        stars: "★★★★★",
        text: "Horoscope aur astrology content bahut premium lag raha hai. Reading smooth hai aur cards clean hain."
    },
    {
        name: "Divya N",
        initials: "DN",
        stars: "★★★★★",
        text: "Blogs, videos aur daily astrology content sab ek jagah dekhna easy ho gaya. Overall page design bahut sundar bana hai."
    }
];

const blogs = [
    {
        tag: "Spiritual Timing",
        title: "How Daily Rashi Reading Helps Before Important Decisions",
        excerpt: "Learn why a short daily reading can help you move with more clarity and calm.",
        image: "./assets/images/blog_85_1760531089.jpg",
        link: "#"
    },
    {
        tag: "Remedies",
        title: "When To Choose A Full Astrology Analysis Instead Of A Short Reading",
        excerpt: "See the difference between a quick forecast and a deeper manual report with remedies.",
        image: "./assets/images/blog_611759214029.jpg",
        link: "#"
    },
    {
        tag: "Devotional Insight",
        title: "Simple Spiritual Habits That Support Focus, Peace And Better Timing",
        excerpt: "Small consistent practices can help you align better with your day and reduce confusion.",
        image: "./assets/images/blog_551752043771.jpg",
        link: "#"
    }
];

let videoItems = [];
let activeSuccessSlide = 0;
let successSliderTimer = null;

const escapeHtml = (value = "") => {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
};

const assetUrl = (value = "") => {
    if (!value) {
        return "";
    }

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:")
    ) {
        return value;
    }

    if (value.startsWith("/")) {
        return value;
    }

    if (value.startsWith("./")) {
        return value;
    }

    return `./${value.replace(/^\/+/, "")}`;
};

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch (error) {
        return null;
    }
};

const getAuthHeaders = () => {
    const headers = {
        "Content-Type": "application/json"
    };
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

const setAstrologyFeedback = (message = "", type = "info") => {
    if (!astrologyFeedbackNode) {
        return;
    }

    astrologyFeedbackNode.textContent = message;
    astrologyFeedbackNode.hidden = !message;
    astrologyFeedbackNode.dataset.state = type;
};

const setFormFeedback = (form, message = "", type = "info") => {
    const feedbackNode = form.querySelector("[data-service-feedback]");

    if (!feedbackNode) {
        return;
    }

    feedbackNode.textContent = message;
    feedbackNode.hidden = !message;
    feedbackNode.dataset.state = type;
};

const getYouTubeId = (url) => {
    if (!url) {
        return "";
    }

    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);

    if (shortMatch) {
        return shortMatch[1];
    }

    const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    return longMatch ? longMatch[1] : "";
};

const createDots = (container, total, onClick) => {
    if (!container) {
        return [];
    }

    container.innerHTML = "";

    return Array.from({ length: total }, (_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "gallery-carousel-dot";
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dot.addEventListener("click", () => onClick(index));
        container.append(dot);
        return dot;
    });
};

const initializeSimpleCarousel = ({
    items,
    track,
    dotsContainer,
    prevSelector,
    nextSelector,
    slideRenderer,
    intervalMs = 2600
}) => {
    if (!track || !Array.isArray(items) || !items.length) {
        return;
    }

    let currentIndex = 0;
    let timerId = null;

    track.innerHTML = "";
    items.forEach((item) => {
        track.append(slideRenderer(item));
    });

    const dots = createDots(dotsContainer, items.length, (index) => {
        currentIndex = index;
        render();
        restart();
    });

    const render = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === currentIndex);
        });
    };

    const next = () => {
        currentIndex = (currentIndex + 1) % items.length;
        render();
    };

    const prev = () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        render();
    };

    const restart = () => {
        window.clearInterval(timerId);
        if (items.length > 1) {
            timerId = window.setInterval(next, intervalMs);
        }
    };

    const prevButton = document.querySelector(prevSelector);
    const nextButton = document.querySelector(nextSelector);

    if (prevButton) {
        prevButton.addEventListener("click", () => {
            prev();
            restart();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            next();
            restart();
        });
    }

    const viewport = track.parentElement;

    if (viewport) {
        viewport.addEventListener("mouseenter", () => window.clearInterval(timerId));
        viewport.addEventListener("mouseleave", restart);
    }

    render();
    restart();
};

const renderZodiacCards = () => {
    if (!zodiacGrid) {
        return;
    }

    zodiacGrid.innerHTML = "";

    zodiacSigns.forEach((sign) => {
        const card = document.createElement("a");
        card.className = "horoscope-sign-card";
        card.href = `horoscope-detail.html?sign=${sign.slug}`;
        card.setAttribute("aria-label", `Open detailed ${sign.name} horoscope`);

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

        const linkMeta = document.createElement("span");
        linkMeta.className = "horoscope-sign-link-meta";
        linkMeta.textContent = "Open detailed reading";

        card.append(art, name, subtitle, linkMeta);
        zodiacGrid.append(card);
    });
};

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

    window.clearInterval(successSliderTimer);
    successSliderTimer = window.setInterval(() => {
        showSuccessSlide(activeSuccessSlide + 1);
    }, 2400);
};

const stopSuccessSlider = () => {
    window.clearInterval(successSliderTimer);
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

const renderReviewMarquee = () => {
    if (!reviewTrack) {
        return;
    }

    reviewTrack.innerHTML = "";

    const createReviewCard = (review) => {
        const card = document.createElement("article");
        card.className = "gallery-review-card";

        const head = document.createElement("div");
        head.className = "gallery-review-head";

        const avatar = document.createElement("span");
        avatar.className = "gallery-review-avatar";
        avatar.textContent = review.initials;

        const nameWrap = document.createElement("div");
        const name = document.createElement("div");
        name.className = "gallery-review-name";
        name.textContent = review.name;

        const stars = document.createElement("div");
        stars.className = "gallery-review-stars";
        stars.textContent = review.stars;

        nameWrap.append(name, stars);
        head.append(avatar, nameWrap);

        const text = document.createElement("p");
        text.textContent = review.text;

        card.append(head, text);
        return card;
    };

    for (let index = 0; index < 2; index += 1) {
        const group = document.createElement("div");
        group.className = "gallery-review-group";

        reviews.forEach((review) => {
            group.append(createReviewCard(review));
        });

        reviewTrack.append(group);
    }
};

const renderVideoCarousel = () => {
    initializeSimpleCarousel({
        items: videoItems,
        track: videoTrack,
        dotsContainer: videoDots,
        prevSelector: "[data-video-prev]",
        nextSelector: "[data-video-next]",
        intervalMs: 2600,
        slideRenderer: (item) => {
            const slide = document.createElement("article");
            slide.className = "gallery-video-slide";

            const card = document.createElement(item.url ? "a" : "div");
            card.className = "gallery-video-card";

            if (item.url) {
                card.href = item.url;
                card.target = "_blank";
                card.rel = "noreferrer";
            }

            const thumb = document.createElement("div");
            thumb.className = "gallery-video-thumb";

            const videoId = getYouTubeId(item.url);
            if (videoId) {
                thumb.style.backgroundImage = `linear-gradient(rgba(16, 8, 2, 0.08), rgba(16, 8, 2, 0.2)), url("https://i.ytimg.com/vi/${videoId}/hqdefault.jpg")`;
            } else {
                thumb.style.backgroundImage = `linear-gradient(rgba(16, 8, 2, 0.08), rgba(16, 8, 2, 0.2)), url("./assets/images/Gemini_Generated_Image_alcwplalcwplalcw.png")`;
            }

            const copy = document.createElement("div");
            copy.className = "gallery-video-copy";

            const meta = document.createElement("span");
            meta.className = "gallery-video-meta";
            meta.textContent = videoId ? "YouTube video thumbnail" : "Future admin-ready video slot";

            const title = document.createElement("h3");
            title.textContent = item.title || "Astrology video";

            const description = document.createElement("p");
            description.textContent = item.description || "Video details can be managed from the admin dashboard.";

            const link = document.createElement("span");
            link.className = "gallery-inline-link";
            link.textContent = item.url ? "Watch video" : "Add future link";

            copy.append(meta, title, description, link);
            card.append(thumb, copy);
            slide.append(card);
            return slide;
        }
    });
};

const renderBlogCarousel = () => {
    initializeSimpleCarousel({
        items: blogs,
        track: blogTrack,
        dotsContainer: blogDots,
        prevSelector: "[data-blog-prev]",
        nextSelector: "[data-blog-next]",
        intervalMs: 2800,
        slideRenderer: (item) => {
            const slide = document.createElement("article");
            slide.className = "gallery-blog-slide";

            const card = document.createElement("a");
            card.className = "gallery-blog-card";
            card.href = item.link;

            const thumb = document.createElement("div");
            thumb.className = "gallery-blog-thumb";
            thumb.style.backgroundImage = `linear-gradient(rgba(16, 8, 2, 0.08), rgba(16, 8, 2, 0.2)), url("${item.image}")`;

            const copy = document.createElement("div");
            copy.className = "gallery-blog-copy";

            const meta = document.createElement("span");
            meta.className = "gallery-blog-meta";
            meta.textContent = item.tag;

            const title = document.createElement("h3");
            title.textContent = item.title;

            const description = document.createElement("p");
            description.textContent = item.excerpt;

            const link = document.createElement("span");
            link.className = "gallery-inline-link";
            link.textContent = "Read More";

            copy.append(meta, title, description, link);
            card.append(thumb, copy);
            slide.append(card);
            return slide;
        }
    });
};

const initializeAccordion = () => {
    if (!accordionToggle || !accordionContent) {
        return;
    }

    accordionToggle.addEventListener("click", () => {
        const isOpen = accordionToggle.classList.toggle("is-open");
        accordionToggle.setAttribute("aria-expanded", String(isOpen));
        accordionContent.classList.toggle("is-open", isOpen);

        if (isOpen) {
            accordionContent.style.height = `${accordionContent.scrollHeight}px`;
            return;
        }

        if (accordionContent.style.height === "auto") {
            accordionContent.style.height = `${accordionContent.scrollHeight}px`;
            window.requestAnimationFrame(() => {
                accordionContent.style.height = "0px";
            });
            return;
        }

        accordionContent.style.height = "0px";
    });

    accordionContent.addEventListener("transitionend", () => {
        if (accordionToggle.classList.contains("is-open")) {
            accordionContent.style.height = "auto";
        }
    });
};

const setPanchangDateLabel = () => {
    if (!panchangDateNode) {
        return;
    }

    panchangDateNode.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const createConcernOptions = (options = []) => {
    return options
        .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
        .join("");
};

const createListItems = (items = []) => {
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
};

const renderAstrologyServices = (services = []) => {
    if (!serviceGrid) {
        return;
    }

    if (!services.length) {
        serviceGrid.innerHTML = `
            <article class="horoscope-service-empty">
                <h3>Astrology services are being prepared.</h3>
                <p>The admin can activate and edit overall analysis and one-topic analysis from the dashboard.</p>
            </article>
        `;
        return;
    }

    serviceGrid.innerHTML = services.map((service) => `
        <article class="horoscope-service-card">
            <div class="horoscope-service-media">
                <div class="horoscope-service-image" style="background-image:url('${escapeHtml(assetUrl(service.image || ''))}')"></div>
                <div class="horoscope-service-secondary" style="background-image:url('${escapeHtml(assetUrl(service.secondaryImage || service.image || ''))}')"></div>
                <div class="horoscope-service-badges">
                    <span>${escapeHtml(service.badge || (service.serviceType === 'topic' ? 'One Topic Analysis' : 'Overall Analysis'))}</span>
                    <span>${escapeHtml(service.priceLabel || 'Price on request')}</span>
                </div>
            </div>
            <div class="horoscope-service-copy">
                <span class="horoscope-service-type">${escapeHtml(service.serviceType === 'topic' ? 'One Topic Analysis' : 'Manual Full Analysis')}</span>
                <h3>${escapeHtml(service.title || 'Astrology Service')}</h3>
                <p>${escapeHtml(service.shortDescription || '')}</p>
                <div class="horoscope-service-meta">
                    <span>${escapeHtml(service.turnaround || 'Admin managed report upload')}</span>
                    <span>${escapeHtml(service.priceLabel || '')}</span>
                </div>
                <div class="horoscope-service-detail-block">
                    <strong>${escapeHtml(service.introHeading || 'Service overview')}</strong>
                    <p>${escapeHtml(service.introBody || '')}</p>
                </div>
                <div class="horoscope-service-lists">
                    <div>
                        <h4>Highlights</h4>
                        <ul>${createListItems(service.highlights || [])}</ul>
                    </div>
                    <div>
                        <h4>What user gets</h4>
                        <ul>${createListItems(service.deliverables || [])}</ul>
                    </div>
                </div>
            </div>
            <form class="horoscope-service-form" data-service-form data-service-slug="${escapeHtml(service.slug || '')}" data-service-type="${escapeHtml(service.serviceType || 'overall')}">
                <div class="horoscope-service-form-head">
                    <h4>${escapeHtml(service.formTitle || 'Submit your astrology request')}</h4>
                    <p>${escapeHtml(service.formDescription || 'Fill your birth details carefully for an accurate manual review.')}</p>
                </div>
                <div class="horoscope-service-form-grid">
                    <label class="horoscope-form-field">
                        <span>Name</span>
                        <input type="text" name="fullName" required>
                    </label>
                    <label class="horoscope-form-field">
                        <span>Birth Place</span>
                        <input type="text" name="birthPlace" required>
                    </label>
                    <label class="horoscope-form-field">
                        <span>D.O.B Day</span>
                        <input type="text" name="birthDay" required>
                    </label>
                    <label class="horoscope-form-field">
                        <span>D.O.B Month</span>
                        <input type="text" name="birthMonth" required>
                    </label>
                    <label class="horoscope-form-field">
                        <span>D.O.B Year</span>
                        <input type="text" name="birthYear" required>
                    </label>
                    <label class="horoscope-form-field">
                        <span>Birth Hour</span>
                        <input type="text" name="birthHour">
                    </label>
                    <label class="horoscope-form-field">
                        <span>Birth Minute</span>
                        <input type="text" name="birthMinute">
                    </label>
                    <label class="horoscope-form-field horoscope-form-field--checkbox">
                        <span>Time Unknown</span>
                        <input type="checkbox" name="timeUnknown">
                    </label>
                    <label class="horoscope-form-field">
                        <span>WhatsApp Number</span>
                        <input type="text" name="whatsappNumber" required>
                    </label>
                    <label class="horoscope-form-field">
                        <span>Concerned For</span>
                        <select name="concernedFor" required>
                            <option value="">Choose focus</option>
                            ${createConcernOptions(service.dropdownOptions || [])}
                        </select>
                    </label>
                    ${service.serviceType === "topic" ? `
                        <label class="horoscope-form-field horoscope-form-field--full">
                            <span>One Topic Note</span>
                            <textarea name="customTopic" placeholder="${escapeHtml(service.topicPlaceholder || 'Write your exact topic here')}" rows="4"></textarea>
                        </label>
                    ` : ""}
                </div>
                <div class="horoscope-service-form-foot">
                    <p>${escapeHtml(service.whatsappNote || 'Stay logged in before submitting if you want the final report to appear directly in your profile.')}</p>
                    <p>Login recommended for automatic report sync in your profile.</p>
                </div>
                <p class="horoscope-service-feedback" data-service-feedback hidden></p>
                <button class="horoscope-primary-btn horoscope-service-submit" type="submit" data-default-label="${escapeHtml(service.buttonLabel || 'Submit Request')}">${escapeHtml(service.buttonLabel || 'Submit Request')}</button>
            </form>
        </article>
    `).join("");

    bindAstrologyForms();
};

const bindAstrologyForms = () => {
    const storedUser = getStoredUser();

    document.querySelectorAll("[data-service-form]").forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            setFormFeedback(form, "");

            const payload = {
                serviceSlug: form.dataset.serviceSlug || "",
                serviceType: form.dataset.serviceType || "overall",
                fullName: form.fullName.value.trim(),
                birthPlace: form.birthPlace.value.trim(),
                birthDay: form.birthDay.value.trim(),
                birthMonth: form.birthMonth.value.trim(),
                birthYear: form.birthYear.value.trim(),
                birthHour: form.timeUnknown.checked ? "" : form.birthHour.value.trim(),
                birthMinute: form.timeUnknown.checked ? "" : form.birthMinute.value.trim(),
                timeUnknown: form.timeUnknown.checked,
                whatsappNumber: form.whatsappNumber.value.trim(),
                concernedFor: form.concernedFor.value.trim(),
                customTopic: form.customTopic ? form.customTopic.value.trim() : "",
                userName: storedUser?.name || "",
                userEmail: storedUser?.email || ""
            };

            if (!payload.fullName || !payload.birthPlace || !payload.birthDay || !payload.birthMonth || !payload.birthYear || !payload.whatsappNumber || !payload.concernedFor) {
                setFormFeedback(form, "Please fill all required fields before submitting.", "error");
                return;
            }

            if (payload.serviceType === "topic" && !payload.customTopic) {
                setFormFeedback(form, "Please describe the one topic you want the admin to analyze.", "error");
                return;
            }

            if (!payload.timeUnknown && (!payload.birthHour || !payload.birthMinute)) {
                setFormFeedback(form, "Add birth hour and minute, or mark time unknown.", "error");
                return;
            }

            const submitButton = form.querySelector(".horoscope-service-submit");

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";
            }

            try {
                const response = await fetch(`${API_BASE}/public/astrology-submit`, {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Unable to submit astrology request.");
                }

                form.reset();
                setFormFeedback(form, "Your astrology request has been submitted. The admin can now review it and upload the final report to your profile.", "success");
                setAstrologyFeedback("Astrology request submitted successfully. Admin can now upload the final report for this user.", "success");
            } catch (error) {
                setFormFeedback(form, error.message || "Unable to submit astrology request.", "error");
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = submitButton.dataset.defaultLabel || "Submit Request";
                }
            }
        });
    });
};

const loadAstrologyServices = async () => {
    if (!serviceGrid) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/public/astrology-services`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load astrology services.");
        }

        renderAstrologyServices(data.data || []);
    } catch (error) {
        serviceGrid.innerHTML = `
            <article class="horoscope-service-empty">
                <h3>Astrology services could not be loaded.</h3>
                <p>${escapeHtml(error.message || "Please try again later.")}</p>
            </article>
        `;
    }
};

const loadVideos = async () => {
    try {
        const response = await fetch(`${API_BASE}/public/videos`);
        const data = await response.json();

        if (response.ok && data.success) {
            videoItems = data.data || [];
        }
    } catch (error) {
        videoItems = [];
    }

    if (!videoItems.length) {
        videoItems = [
            {
                title: "Daily Astrology Guidance",
                description: "A future-ready video card managed from the admin dashboard.",
                url: ""
            }
        ];
    }

    renderVideoCarousel();
};

if (successSlider) {
    successSlider.addEventListener("mouseenter", stopSuccessSlider);
    successSlider.addEventListener("mouseleave", startSuccessSlider);
}

renderZodiacCards();
renderSuccessSlides();
renderReviewMarquee();
renderBlogCarousel();
initializeAccordion();
setPanchangDateLabel();
loadAstrologyServices();
loadVideos();
