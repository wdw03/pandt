const initializeGalleryNavbar = () => {
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

initializeGalleryNavbar();

const API_BASE = "/api";
const TOKEN_KEY = "tmToken";
const USER_KEY = "tmUser";

const reviewTrack = document.querySelector("[data-review-track]");
const videoTrack = document.querySelector("[data-video-track]");
const videoDots = document.querySelector("[data-video-dots]");
const blogTrack = document.querySelector("[data-blog-track]");
const blogDots = document.querySelector("[data-blog-dots]");
const accordionToggle = document.querySelector("[data-gallery-accordion-toggle]");
const accordionContent = document.querySelector("[data-gallery-accordion-content]");
const serviceGrid = document.querySelector("[data-astrology-services]");
const astrologyFeedbackNode = document.querySelector("[data-astrology-feedback]");
let astrologyLoginRedirectPending = false;

const CONCERN_OPTIONS = [
    "Career & Financial Growth",
    "Health & Wellbeing Analysis",
    "Marriage & Relationship Guidance",
    "Complete Kundli & Horoscope Analysis"
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
        tag: "Manual Reading",
        title: "When Should You Choose A Full Astrology Analysis Instead Of A Quick Reading?",
        excerpt: "Understand when a detailed handwritten report with remedies gives more value than a short prediction.",
        image: "./assets/images/blog_85_1760531089.jpg",
        link: "#"
    },
    {
        tag: "Marriage Guidance",
        title: "How To Prepare Better Birth Details Before Asking For Marriage Guidance",
        excerpt: "Clear birth details help the admin review the request more carefully and write a better report.",
        image: "./assets/images/blog_611759214029.jpg",
        link: "#"
    },
    {
        tag: "Remedies",
        title: "Why Focused One Topic Analysis Works For Career, Health And Relationship Questions",
        excerpt: "A focused one-topic reading helps when one concern needs immediate clarity and practical remedies.",
        image: "./assets/images/blog_551752043771.jpg",
        link: "#"
    }
];

let videoItems = [];

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

const isAstrologyUserLoggedIn = () => Boolean(localStorage.getItem(TOKEN_KEY));

const getAstrologyLoginRedirectUrl = () => {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return `login.html?returnTo=${encodeURIComponent(returnTo)}`;
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

const redirectAstrologyLoginRequired = (form = null) => {
    if (astrologyLoginRedirectPending) {
        return;
    }

    astrologyLoginRedirectPending = true;

    if (form) {
        setFormFeedback(form, "Please login first to continue with Astrology Analysis.", "error");
    }

    setAstrologyFeedback("Please login first to continue with Astrology Analysis.", "error");

    window.setTimeout(() => {
        window.location.href = getAstrologyLoginRedirectUrl();
    }, 120);
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

const mergeServiceFallback = (service, fallback) => {
    const source = service || {};
    return {
        ...fallback,
        ...source,
        title: source.title || fallback.title,
        badge: source.badge || fallback.badge,
        priceLabel: source.priceLabel || fallback.priceLabel,
        turnaround: source.turnaround || fallback.turnaround,
        image: source.image || fallback.image,
        secondaryImage: source.secondaryImage || source.image || fallback.secondaryImage || fallback.image,
        shortDescription: source.shortDescription || fallback.shortDescription,
        introHeading: source.introHeading || fallback.introHeading,
        introBody: source.introBody || fallback.introBody,
        detailHeading: source.detailHeading || fallback.detailHeading,
        detailBody: source.detailBody || fallback.detailBody,
        highlights: Array.isArray(source.highlights) && source.highlights.length ? source.highlights : fallback.highlights,
        deliverables: Array.isArray(source.deliverables) && source.deliverables.length ? source.deliverables : fallback.deliverables,
        dropdownOptions: Array.isArray(source.dropdownOptions) ? source.dropdownOptions : [],
        whatsappNote: source.whatsappNote || fallback.whatsappNote,
        formTitle: source.formTitle || fallback.formTitle,
        formDescription: source.formDescription || fallback.formDescription,
        topicPlaceholder: source.topicPlaceholder || fallback.topicPlaceholder,
        buttonLabel: source.buttonLabel || fallback.buttonLabel,
        slug: source.slug || fallback.slug,
        serviceType: source.serviceType || fallback.serviceType
    };
};

const createConcernOptions = (options = []) => {
    return options
        .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
        .join("");
};

const populateSelectOptions = (select, options, placeholder) => {
    if (!select) {
        return;
    }

    select.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    select.append(placeholderOption);

    options.forEach((optionData) => {
        const option = document.createElement("option");
        option.value = optionData.value;
        option.textContent = optionData.label;
        select.append(option);
    });
};

const buildRangeOptions = (start, end, formatter) => {
    const values = [];
    const direction = start <= end ? 1 : -1;

    for (let value = start; direction > 0 ? value <= end : value >= end; value += direction) {
        values.push({
            value: formatter(value, "value"),
            label: formatter(value, "label")
        });
    }

    return values;
};

const initializeAstrologyFormSelects = () => {
    const forms = document.querySelectorAll("[data-service-form]");

    if (!forms.length) {
        return;
    }

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    const currentYear = new Date().getFullYear();
    const dayOptions = buildRangeOptions(1, 31, (value) => String(value).padStart(2, "0"));
    const monthOptions = monthNames.map((monthName, index) => ({
        value: String(index + 1).padStart(2, "0"),
        label: monthName
    }));
    const yearOptions = buildRangeOptions(currentYear, 1950, (value) => String(value));
    const hourOptions = buildRangeOptions(0, 23, (value) => String(value).padStart(2, "0"));
    const minuteOptions = buildRangeOptions(0, 59, (value) => String(value).padStart(2, "0"));

    forms.forEach((form) => {
        populateSelectOptions(form.querySelector("[data-astro-day]"), dayOptions, "DD");
        populateSelectOptions(form.querySelector("[data-astro-month]"), monthOptions, "MM");
        populateSelectOptions(form.querySelector("[data-astro-year]"), yearOptions, "YYYY");
        populateSelectOptions(form.querySelector("[data-astro-hour]"), hourOptions, "HH");
        populateSelectOptions(form.querySelector("[data-astro-minute]"), minuteOptions, "MM");

        const timeUnknownCheckbox = form.querySelector('input[name="timeUnknown"]');
        const hourSelect = form.querySelector('select[name="birthHour"]');
        const minuteSelect = form.querySelector('select[name="birthMinute"]');

        const syncTimeUnknownState = () => {
            const isUnknown = !!timeUnknownCheckbox?.checked;

            [hourSelect, minuteSelect].forEach((select) => {
                if (!select) {
                    return;
                }

                select.disabled = isUnknown;

                if (isUnknown) {
                    select.value = "";
                }
            });
        };

        syncTimeUnknownState();
        timeUnknownCheckbox?.addEventListener("change", syncTimeUnknownState);
    });
};

const createConcernChoiceCards = (options = []) => {
    return options
        .map((option, index) => `
            <label class="horoscope-form-option">
                <input type="radio" name="concernedFor" value="${escapeHtml(option)}" ${index === 0 ? "checked" : ""}>
                <span>${escapeHtml(option)}</span>
            </label>
        `)
        .join("");
};

const createListItems = (items = []) => {
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
};

const getDisplayServices = (allServices = []) => {
    const overallServices = allServices.filter((service) => service.serviceType === "overall");
    const topicServices = allServices.filter((service) => service.serviceType === "topic");

    const overallFallback = {
        title: "Manual Astrology Analysis and Remedies",
        slug: "manual-analysis-report",
        serviceType: "overall",
        badge: "Overall Analysis",
        priceLabel: "Rs 501",
        turnaround: "Written analysis within 24 hours",
        image: "/assets/images/home-analyze.png",
        secondaryImage: "/assets/images/Gemini_Generated_Image_alcwplalcwplalcw.png",
        shortDescription: "Book a full handwritten astrology report with remedies and practical guidance based on the birth details you submit here.",
        introHeading: "Overall analysis for complete life direction",
        introBody: "Use this one form when you want a full report for career, health, relationship or complete life direction. The admin can later upload your final written report directly into your profile.",
        detailHeading: "What the overall analysis covers",
        detailBody: "This full analysis request is meant for users who want broader guidance instead of a short answer. The report can focus on one selected concern area while still considering the wider life picture and remedies.",
        highlights: [
            "Written analysis with remedies",
            "Designed for complete life direction",
            "Admin uploaded report syncs to profile",
            "WhatsApp number collected for updates"
        ],
        deliverables: [
            "Overall astrology reading",
            "Concern-specific guidance",
            "Written remedies and practical suggestions",
            "Report visible in profile after admin upload"
        ],
        dropdownOptions: CONCERN_OPTIONS,
        whatsappNote: "Use an active WhatsApp number so the team can share service updates if needed.",
        formTitle: "Submit your overall astrology analysis request",
        formDescription: "Fill all birth details carefully and choose the concern area you want the report to focus on.",
        topicPlaceholder: "",
        buttonLabel: "Submit Overall Analysis"
    };

    const topicFallback = {
        title: "One Topic Analysis and Remedies",
        slug: "one-topic-analysis",
        serviceType: "topic",
        badge: "One Topic Analysis",
        priceLabel: "Rs 101",
        turnaround: "Focused written answer and remedies",
        image: "/assets/images/panditpujakete.jpg",
        secondaryImage: "/assets/images/home-analyze.png",
        shortDescription: "Choose one main concern from the dropdown or type your topic manually and receive a focused written astrology response with remedies.",
        introHeading: "One topic guidance with dropdown and manual typing",
        introBody: "This service is for users who want clarity on one specific concern. You can choose a topic from the list or also describe the exact issue manually for better context.",
        detailHeading: "What the one topic analysis covers",
        detailBody: "The admin reviews the selected concern, the custom note and the birth details together before preparing a written response. This keeps the service focused, practical and easier to act on.",
        highlights: [
            "Best for one urgent life question",
            "Dropdown and manual topic support",
            "Focused remedies and suggestions",
            "Admin uploaded report syncs to profile"
        ],
        deliverables: [
            "Single topic astrology reading",
            "Custom issue note support",
            "Written remedies",
            "Profile report delivery after admin upload"
        ],
        dropdownOptions: CONCERN_OPTIONS,
        whatsappNote: "Add your active WhatsApp number so the team can coordinate if any clarification is needed.",
        formTitle: "Submit your one topic astrology request",
        formDescription: "Choose a concern from the list or type the exact topic manually. You can use both for better context.",
        topicPlaceholder: "Write your exact issue manually here if you want the admin to focus on a specific topic",
        buttonLabel: "Submit One Topic Analysis"
    };

    const overallPrimarySource = overallServices.find((service) => service.slug === "manual-analysis-report")
        || overallServices[0]
        || null;
    const topicPrimarySource = topicServices.find((service) => service.slug === "one-topic-analysis")
        || topicServices[0]
        || null;

    const overallPrimary = mergeServiceFallback(overallPrimarySource, overallFallback);
    const topicPrimary = mergeServiceFallback(topicPrimarySource, topicFallback);
    const legacyConcernOptions = ["Love Life", "Marriage", "Career", "Full Life Analysis"];
    const isLegacyOptionSet = (options = []) =>
        options.length === legacyConcernOptions.length &&
        options.every((option, index) => option === legacyConcernOptions[index]);
    const resolveConcernOptions = (options = []) => {
        const cleanedOptions = Array.from(
            new Set(
                options
                    .map((option) => String(option || "").trim())
                    .filter(Boolean)
            )
        );

        if (!cleanedOptions.length || isLegacyOptionSet(cleanedOptions)) {
            return CONCERN_OPTIONS;
        }

        return cleanedOptions;
    };

    overallPrimary.dropdownOptions = resolveConcernOptions(overallPrimary.dropdownOptions);
    topicPrimary.dropdownOptions = resolveConcernOptions(topicPrimary.dropdownOptions);

    return [overallPrimary, topicPrimary];
};

const renderAstrologyServices = (services = []) => {
    if (!serviceGrid) {
        return;
    }

    const displayServices = getDisplayServices(services);

    serviceGrid.innerHTML = displayServices.map((service) => `
        <article class="horoscope-service-card">
            <div class="horoscope-service-media">
                <div class="horoscope-service-image" style="background-image:url('${escapeHtml(assetUrl(service.image || ''))}')"></div>
                <div class="horoscope-service-secondary" style="background-image:url('${escapeHtml(assetUrl(service.secondaryImage || service.image || ''))}')"></div>
                <div class="horoscope-service-badges">
                    <span>${escapeHtml(service.badge)}</span>
                    <span class="horoscope-service-price-badge">Price ${escapeHtml(service.priceLabel)}</span>
                </div>
            </div>
            <div class="horoscope-service-copy">
                <span class="horoscope-service-type">${escapeHtml(service.serviceType === "topic" ? "One Topic Analysis" : "Manual Full Analysis")}</span>
                <h3>${escapeHtml(service.title)}</h3>
                <p>${escapeHtml(service.shortDescription)}</p>
                <div class="horoscope-service-meta">
                    <span>${escapeHtml(service.turnaround)}</span>
                    <span class="horoscope-service-price-chip">Price: ${escapeHtml(service.priceLabel)}</span>
                </div>
                <div class="horoscope-service-detail-block">
                    <strong>${escapeHtml(service.introHeading)}</strong>
                    <p>${escapeHtml(service.introBody)}</p>
                </div>
                <div class="horoscope-service-lists">
                    <div>
                        <h4>Highlights</h4>
                        <ul>${createListItems(service.highlights)}</ul>
                    </div>
                    <div>
                        <h4>What user gets</h4>
                        <ul>${createListItems(service.deliverables)}</ul>
                    </div>
                </div>
            </div>
            <form class="horoscope-service-form" data-service-form data-service-slug="${escapeHtml(service.slug)}" data-service-type="${escapeHtml(service.serviceType)}">
                <div class="horoscope-service-form-head">
                    <h4>${escapeHtml(service.formTitle)}</h4>
                    <p>${escapeHtml(service.formDescription)}</p>
                    <div class="horoscope-service-price-banner">
                        <span>Service Price</span>
                        <strong>${escapeHtml(service.priceLabel)}</strong>
                    </div>
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
                    <div class="horoscope-form-field horoscope-form-field--full">
                        <span>Birth Date</span>
                        <div class="horoscope-form-inline-grid horoscope-form-inline-grid-date">
                            <select name="birthDay" data-astro-day required></select>
                            <select name="birthMonth" data-astro-month required></select>
                            <select name="birthYear" data-astro-year required></select>
                        </div>
                        <small>Choose DD - MM - YYYY</small>
                    </div>
                    <div class="horoscope-form-field horoscope-form-field--full">
                        <span>Birth Time</span>
                        <div class="horoscope-form-inline-grid horoscope-form-inline-grid-time">
                            <select name="birthHour" data-astro-hour required></select>
                            <select name="birthMinute" data-astro-minute required></select>
                        </div>
                        <label class="horoscope-check-row">
                            <input type="checkbox" name="timeUnknown">
                            <span>Don't know birth time</span>
                        </label>
                        <small>Choose HH - MM or mark time unknown</small>
                    </div>
                    <label class="horoscope-form-field">
                        <span>WhatsApp Number</span>
                        <input type="text" name="whatsappNumber" required>
                    </label>
                    <div class="horoscope-form-field horoscope-form-field--full">
                        <span>${service.serviceType === "topic" ? "Choose Topic" : "Concerned For"}</span>
                        ${service.serviceType === "topic" ? `
                            <select name="concernedFor">
                                <option value="">Choose focus</option>
                                ${createConcernOptions(service.dropdownOptions)}
                            </select>
                        ` : `
                            <div class="horoscope-form-option-group">
                                ${createConcernChoiceCards(service.dropdownOptions)}
                            </div>
                        `}
                    </div>
                    ${service.serviceType === "topic" ? `
                        <label class="horoscope-form-field horoscope-form-field--full">
                            <span>Manual Topic</span>
                            <textarea name="customTopic" placeholder="${escapeHtml(service.topicPlaceholder)}" rows="4"></textarea>
                        </label>
                    ` : ""}
                </div>
                <div class="horoscope-service-form-foot">
                    <p>${escapeHtml(service.whatsappNote)}</p>
                    <p>Login recommended so the final admin uploaded report comes directly to your profile reports page.</p>
                </div>
                <p class="horoscope-service-feedback" data-service-feedback hidden></p>
                <button class="horoscope-primary-btn horoscope-service-submit" type="submit" data-default-label="${escapeHtml(service.buttonLabel)}">${escapeHtml(service.buttonLabel)}</button>
            </form>
        </article>
    `).join("");

    initializeAstrologyFormSelects();
    bindAstrologyForms();
};

const bindAstrologyForms = () => {
    const storedUser = getStoredUser();

    document.querySelectorAll("[data-service-form]").forEach((form) => {
        if (!isAstrologyUserLoggedIn()) {
            const blockUntilLogin = (event) => {
                const interactiveTarget = event.target instanceof Element
                    ? event.target.closest("input, select, textarea, button, label")
                    : null;

                if (!interactiveTarget) {
                    return;
                }

                if (event.cancelable) {
                    event.preventDefault();
                }

                if (event.type === "focusin" && typeof interactiveTarget.blur === "function") {
                    interactiveTarget.blur();
                }

                event.stopPropagation?.();
                redirectAstrologyLoginRequired(form);
            };

            form.addEventListener("pointerdown", blockUntilLogin, true);
            form.addEventListener("focusin", blockUntilLogin, true);
            form.addEventListener("keydown", blockUntilLogin, true);
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            setFormFeedback(form, "");

            if (!isAstrologyUserLoggedIn()) {
                redirectAstrologyLoginRequired(form);
                return;
            }

            const serviceType = form.dataset.serviceType || "overall";
            const selectedConcernRadio = form.querySelector('input[name="concernedFor"]:checked');
            const concernSelect = form.querySelector('select[name="concernedFor"]');
            const payload = {
                serviceSlug: form.dataset.serviceSlug || "",
                serviceType,
                fullName: form.fullName.value.trim(),
                birthPlace: form.birthPlace.value.trim(),
                birthDay: form.birthDay.value.trim(),
                birthMonth: form.birthMonth.value.trim(),
                birthYear: form.birthYear.value.trim(),
                birthHour: form.timeUnknown.checked ? "" : form.birthHour.value.trim(),
                birthMinute: form.timeUnknown.checked ? "" : form.birthMinute.value.trim(),
                timeUnknown: form.timeUnknown.checked,
                whatsappNumber: form.whatsappNumber.value.trim(),
                concernedFor: selectedConcernRadio?.value?.trim() || concernSelect?.value?.trim() || "",
                customTopic: form.customTopic ? form.customTopic.value.trim() : "",
                userName: storedUser?.name || "",
                userEmail: storedUser?.email || ""
            };

            if (!payload.fullName || !payload.birthPlace || !payload.birthDay || !payload.birthMonth || !payload.birthYear || !payload.whatsappNumber) {
                setFormFeedback(form, "Please fill all required personal details before submitting.", "error");
                return;
            }

            if (!payload.timeUnknown && (!payload.birthHour || !payload.birthMinute)) {
                setFormFeedback(form, "Add birth hour and minute, or mark time unknown.", "error");
                return;
            }

            if (serviceType === "overall" && !payload.concernedFor) {
                setFormFeedback(form, "Please choose one overall concern area first.", "error");
                return;
            }

            if (serviceType === "topic" && !payload.concernedFor && !payload.customTopic) {
                setFormFeedback(form, "Choose a topic from the dropdown or write your topic manually.", "error");
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
                setFormFeedback(form, "Request submitted successfully. The admin team can now review the details and upload the final report to your profile.", "success");
                setAstrologyFeedback("Astrology request submitted successfully. The final report can be uploaded from the admin dashboard and will appear in the user's profile reports page.", "success");
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

        renderAstrologyServices(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
        renderAstrologyServices([]);
        setAstrologyFeedback(error.message || "Unable to load astrology services.", "error");
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
                description: "A future-ready spiritual video card managed from the admin dashboard.",
                url: ""
            }
        ];
    }

    renderVideoCarousel();
};

renderReviewMarquee();
initializeAccordion();
loadAstrologyServices();
