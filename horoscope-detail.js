const initializeHoroscopeDetailNavbar = () => {
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

initializeHoroscopeDetailNavbar();

const horoscopeApiResponse = {
    data: {
        aquarius: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: "The Sun in Taurus keeps you practical, helping you stay productive, though moments of self-indulgent behavior may influence your choices. The Moon in Aquarius enhances your imaginative side, but may also bring erratic tendencies and an aloof mood. Saturn in conjunction with Neptune can trigger self-doubt, create a sense of detachment, and lead to subtle perception shifts, making it important to stay grounded and clear-headed.",
            symbol: "♒",
            zodiac_sign: "Aquarius",
            zodiac_sign_hindi: "कुंभ"
        },
        aries: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: "Your resourceful nature is heightened by the Sun in Taurus. You may find yourself quite productive, yet be cautious of possessive tendencies. The Moon in Aquarius might make you feel detached, leading to unpredictable and erratic emotional shifts. With Mars square Jupiter, successful activity is within reach, but beware of recklessness. Your physical strength will propel you forward.",
            symbol: "♈",
            zodiac_sign: "Aries",
            zodiac_sign_hindi: "मेष"
        },
        cancer: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: "The Sun in Taurus makes you resourceful, guiding a conservative approach, though moments of self-indulgent behavior may surface. The Moon in Aquarius keeps you courteous, yet you may feel dispassionate and somewhat aloof. Moon trine Uranus makes you feel alive, brings constructive changes, and may leave you slightly startled. Moon in conjunction with Pluto triggers intense emotional experiences, creating overwhelm and influencing your mood deeply.",
            symbol: "♋",
            zodiac_sign: "Cancer",
            zodiac_sign_hindi: "कर्क"
        },
        capricorn: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: "You may find yourself feeling a bit conservative, as the influence of the Sun in Taurus prompts you to hold onto familiar routines. However, your imaginative side, guided by the Moon in Aquarius, may inspire new ideas. Be aware of potential self-doubt, as Saturn&#039;s influence brings anxiety. Stay courteous in interactions to navigate any erratic situations with grace, and remember to avoid self-indulgent tendencies.",
            symbol: "♑",
            zodiac_sign: "Capricorn",
            zodiac_sign_hindi: "मकर"
        },
        gemini: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: "The Sun in Taurus encourages a practical approach, guiding you to stay conservative, though stubborn tendencies may influence your actions. The Moon in Aquarius keeps you courteous, enhances your imaginative side, and may bring erratic moods. Sun conjunction Mercury highlights the Mercury transit, supports conversations, and encourages a new business venture. Mercury square Pluto may bring coercion in conversations, reveal hidden forces, and deepen psychological awareness.",
            symbol: "♊",
            zodiac_sign: "Gemini",
            zodiac_sign_hindi: "मिथुन"
        },
        leo: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: "The Sun in Taurus makes you resourceful, helping you stay productive, though stubborn tendencies may influence your decisions. The Moon in Aquarius enhances your imaginative side, but may also bring erratic behavior and an aloof mood. Sun conjunction with Mercury, sparks initiative, supports a new business venture, and encourages plans for the future. Sun in sextile Jupiter brings a positive outlook, aiding integration and enriching your experience.",
            symbol: "♌",
            zodiac_sign: "Leo",
            zodiac_sign_hindi: "सिंह"
        },
        libra: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: " The Sun in Taurus encourages a conservative approach, though possessive tendencies may arise, and stubborn behavior could influence your actions. The Moon in Aquarius may make you feel detached, with a dispassionate outlook and moments of aloofness. Venus in Libra helps restore balance, softening your mood and guiding you toward harmony, allowing you to navigate the day with grace and emotional awareness.",
            symbol: "♎",
            zodiac_sign: "Libra",
            zodiac_sign_hindi: "तुला"
        },
        pisces: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: "The Sun in Taurus keeps you practical, helping you stay productive, though stubborn tendencies may influence your decisions. The Moon in Aquarius may make you feel dispassionate, with moments of erratic behavior and an aloof attitude. Sun in sextile to Jupiter brings a positive outlook, encouraging group activities and supporting idealism. Mars square Jupiter drives energetic activity, awakens a desire for inclusion, and may involve testing efforts throughout the day.",
            symbol: "♓",
            zodiac_sign: "Pisces",
            zodiac_sign_hindi: "मीन"
        },
        sagittarius: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: "The Sun in Taurus keeps you practical, encouraging a conservative approach, though moments of self-indulgent behavior may arise. The Moon in Aquarius makes you courteous, yet you may feel dispassionate and somewhat aloof. Sun sextile Jupiter supports participation, strengthens your sense of authority, and adds valuable experience. Mars square Jupiter drives energetic activity, expands your sphere of influence, and may trigger impulsiveness in your actions.",
            symbol: "♐",
            zodiac_sign: "Sagittarius",
            zodiac_sign_hindi: "धनु"
        },
        scorpio: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: "The Sun in Taurus encourages a practical approach, guiding you to stay conservative, though stubborn tendencies may influence your decisions. The Moon in Aquarius may make you feel detached, while maintaining a courteous attitude, with moments of erratic behavior. Mars square Jupiter supports intelligent planning, encourages personal growth, and brings situations that involve testing efforts throughout the day.",
            symbol: "♏",
            zodiac_sign: "Scorpio",
            zodiac_sign_hindi: "वृश्चिक"
        },
        taurus: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: "Taurus, the Sun in your sign encourages a practical approach, though stubborn tendencies may influence your decisions, and moments of self-indulgent behavior could arise. The Moon in Aquarius may bring an unpredictable mood, with erratic thoughts and an aloof attitude shaping your interactions. Venus in Taurus helps restore emotional balance, guiding you toward comfort, stability, and a more grounded approach throughout the day.",
            symbol: "♉",
            zodiac_sign: "Taurus",
            zodiac_sign_hindi: "वृषभ"
        },
        virgo: {
            compatibility: "N/A",
            date: "2026-05-09",
            date_formatted: "Saturday, May 09, 2026",
            lucky_color: "N/A",
            lucky_number: "N/A",
            lucky_time: "N/A",
            mood: "N/A",
            overall_rating: 0,
            prediction: " Virgos will find their practical nature harmonizing with a detached perspective, thanks to the Sun in Taurus and Moon in Aquarius. This blend encourages productive conversations and courteous interactions. However, be mindful of potential arguments and frustrations due to Mercury Square Pluto, as psychological awareness and the study of hidden aspects are highlighted. Maintain a conservative approach to balance your mood.",
            symbol: "♍",
            zodiac_sign: "Virgo",
            zodiac_sign_hindi: "कन्या"
        }
    },
    date: "2026-05-09",
    status: "success",
    type: "general"
};

const signOrder = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces"
];

const signVisuals = {
    aries: {
        start: "#ff7f73",
        end: "#dc493f",
        short: "Ar",
        vibe: "Bold action and decisive movement",
        mainImage: "./assets/images/panditpujakete.jpg",
        sideImage: "./assets/images/deeppics.png",
        panelImage: "./assets/images/home-analyze.png"
    },
    taurus: {
        start: "#b4b95b",
        end: "#7a7f26",
        short: "Ta",
        vibe: "Comfort, grounding, and inner steadiness",
        mainImage: "./assets/images/ganeshjii.png",
        sideImage: "./assets/images/mala-removebg-preview.png",
        panelImage: "./assets/images/lakshmipooja.jpg"
    },
    gemini: {
        start: "#6cd0d2",
        end: "#30979a",
        short: "Ge",
        vibe: "Conversation, ideas, and quick perception",
        mainImage: "./assets/images/Gemini_Generated_Image_alcwplalcwplalcw.png",
        sideImage: "./assets/images/deeppics.png",
        panelImage: "./assets/images/blog_551752043771.jpg"
    },
    cancer: {
        start: "#7cb7f2",
        end: "#4a7ed5",
        short: "Ca",
        vibe: "Emotions, protection, and intuitive care",
        mainImage: "./assets/images/gharouaj.jpg",
        sideImage: "./assets/images/deeppics.png",
        panelImage: "./assets/images/59491847daf75b5a38666c2b62087f37.jpg"
    },
    leo: {
        start: "#ffbf4f",
        end: "#e68a13",
        short: "Le",
        vibe: "Confidence, visibility, and strong momentum",
        mainImage: "./assets/images/blog_85_1760531089.jpg",
        sideImage: "./assets/images/mala-removebg-preview.png",
        panelImage: "./assets/images/31ca24ee924d2118046e58d87017459d.png"
    },
    virgo: {
        start: "#7fbf8f",
        end: "#3f8b57",
        short: "Vi",
        vibe: "Practical clarity and careful observation",
        mainImage: "./assets/images/blog_611759214029.jpg",
        sideImage: "./assets/images/deeppics.png",
        panelImage: "./assets/images/660653dcb3d9102d311dadc4ea4155f7.png"
    },
    libra: {
        start: "#d39bd9",
        end: "#a460ac",
        short: "Li",
        vibe: "Harmony, balance, and graceful choices",
        mainImage: "./assets/images/e9a71c4cf2b7b6f3a1c4ae4f3ae92a38.png",
        sideImage: "./assets/images/mala-removebg-preview.png",
        panelImage: "./assets/images/panditpujakete.jpg"
    },
    scorpio: {
        start: "#c25d74",
        end: "#8c2f49",
        short: "Sc",
        vibe: "Depth, instinct, and inner transformation",
        mainImage: "./assets/images/home-analyze.png",
        sideImage: "./assets/images/deeppics.png",
        panelImage: "./assets/images/59491847daf75b5a38666c2b62087f37.jpg"
    },
    sagittarius: {
        start: "#ff9f68",
        end: "#e06b29",
        short: "Sg",
        vibe: "Expansion, courage, and wider perspective",
        mainImage: "./assets/images/31ca24ee924d2118046e58d87017459d.png",
        sideImage: "./assets/images/mala-removebg-preview.png",
        panelImage: "./assets/images/Gemini_Generated_Image_alcwplalcwplalcw.png"
    },
    capricorn: {
        start: "#b48462",
        end: "#7a4d2d",
        short: "Cp",
        vibe: "Discipline, patience, and solid structure",
        mainImage: "./assets/images/59491847daf75b5a38666c2b62087f37.jpg",
        sideImage: "./assets/images/deeppics.png",
        panelImage: "./assets/images/home-analyze.png"
    },
    aquarius: {
        start: "#53b7b3",
        end: "#247b78",
        short: "Aq",
        vibe: "Original thinking and fresh perspective",
        mainImage: "./assets/images/660653dcb3d9102d311dadc4ea4155f7.png",
        sideImage: "./assets/images/mala-removebg-preview.png",
        panelImage: "./assets/images/blog_85_1760531089.jpg"
    },
    pisces: {
        start: "#7b9cff",
        end: "#4f6cd8",
        short: "Pi",
        vibe: "Sensitivity, imagination, and spiritual depth",
        mainImage: "./assets/images/blog_551752043771.jpg",
        sideImage: "./assets/images/deeppics.png",
        panelImage: "./assets/images/ganeshjii.png"
    }
};

const detailElements = {
    title: document.querySelector("[data-detail-sign-name]"),
    hindi: document.querySelector("[data-detail-sign-hindi]"),
    metaChips: document.querySelector("[data-detail-meta-chips]"),
    mainArt: document.querySelector("[data-detail-main-art]"),
    sideArt: document.querySelector("[data-detail-side-art]"),
    symbol: document.querySelector("[data-detail-symbol]"),
    date: document.querySelector("[data-detail-date]"),
    zodiacNav: document.querySelector("[data-detail-zodiac-nav]"),
    readingTitle: document.querySelector("[data-detail-reading-title]"),
    prediction: document.querySelector("[data-detail-prediction]"),
    highlights: document.querySelector("[data-detail-highlights]"),
    stats: document.querySelector("[data-detail-stats]"),
    focusList: document.querySelector("[data-detail-focus-list]"),
    panelImage: document.querySelector("[data-detail-panel-image]"),
    panelTitle: document.querySelector("[data-detail-panel-title]"),
    panelCopy: document.querySelector("[data-detail-panel-copy]"),
    prevLink: document.querySelector("[data-detail-prev-link]"),
    nextLink: document.querySelector("[data-detail-next-link]")
};

const decodeEntities = (value) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value ?? "";
    return textarea.value;
};

const sanitizeText = (value) => decodeEntities(String(value ?? "")).replace(/\s+/g, " ").trim();

const getSignFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const sign = sanitizeText(params.get("sign")).toLowerCase();
    return horoscopeApiResponse.data[sign] ? sign : "aries";
};

const getDisplayValue = (value, fallbackText = "Live update soon") => {
    const normalized = sanitizeText(value);

    if (!normalized || normalized.toUpperCase() === "N/A") {
        return {
            text: fallbackText,
            pending: true
        };
    }

    return {
        text: normalized,
        pending: false
    };
};

const getPredictionSentences = (prediction) => {
    const cleaned = sanitizeText(prediction);
    const matches = cleaned.match(/[^.!?]+[.!?]?/g) || [];
    return matches.map((sentence) => sentence.trim()).filter(Boolean);
};

const renderMetaChips = (signKey, signData, visual) => {
    if (!detailElements.metaChips) {
        return;
    }

    detailElements.metaChips.innerHTML = "";

    [
        signData.symbol,
        signData.date_formatted,
        `Type: ${sanitizeText(horoscopeApiResponse.type)}`,
        visual.vibe
    ].forEach((text) => {
        const chip = document.createElement("span");
        chip.className = "horoscope-detail-meta-chip";
        chip.textContent = text;
        detailElements.metaChips.append(chip);
    });
};

const renderZodiacNav = (activeSign) => {
    if (!detailElements.zodiacNav) {
        return;
    }

    detailElements.zodiacNav.innerHTML = "";

    signOrder.forEach((signKey) => {
        const signData = horoscopeApiResponse.data[signKey];

        if (!signData) {
            return;
        }

        const link = document.createElement("a");
        link.className = "horoscope-detail-zodiac-link";
        if (signKey === activeSign) {
            link.classList.add("is-active");
        }
        link.href = `horoscope-detail.html?sign=${signKey}`;
        link.setAttribute("aria-label", `Open ${signData.zodiac_sign} daily horoscope`);

        const symbol = document.createElement("span");
        symbol.className = "horoscope-detail-zodiac-symbol";
        symbol.textContent = signData.symbol;

        const copy = document.createElement("span");

        const title = document.createElement("strong");
        title.textContent = sanitizeText(signData.zodiac_sign);

        const subtitle = document.createElement("small");
        subtitle.textContent = sanitizeText(signData.zodiac_sign_hindi);

        copy.append(title, subtitle);
        link.append(symbol, copy);
        detailElements.zodiacNav.append(link);
    });
};

const renderHighlights = (prediction) => {
    if (!detailElements.highlights) {
        return;
    }

    const titles = [
        "Planetary Tone",
        "Emotional Layer",
        "Daily Advice"
    ];

    const sentences = getPredictionSentences(prediction);
    detailElements.highlights.innerHTML = "";

    sentences.slice(0, 3).forEach((sentence, index) => {
        const card = document.createElement("article");
        card.className = "horoscope-detail-highlight-card";

        const indexBadge = document.createElement("span");
        indexBadge.className = "horoscope-detail-highlight-index";
        indexBadge.textContent = `0${index + 1}`;

        const title = document.createElement("h3");
        title.textContent = titles[index] || `Insight ${index + 1}`;

        const body = document.createElement("p");
        body.textContent = sentence;

        card.append(indexBadge, title, body);
        detailElements.highlights.append(card);
    });
};

const renderRatingCard = (value) => {
    const card = document.createElement("article");
    card.className = "horoscope-detail-stat-card";

    const label = document.createElement("span");
    label.className = "horoscope-detail-stat-label";
    label.textContent = "Overall Rating";

    const valueNode = document.createElement("strong");
    valueNode.className = "horoscope-detail-stat-value";
    valueNode.textContent = value > 0 ? `${value}/5` : "Awaiting live score";

    const row = document.createElement("div");
    row.className = "horoscope-detail-rating-row";

    for (let index = 0; index < 5; index += 1) {
        const dot = document.createElement("span");
        dot.className = "horoscope-detail-rating-dot";
        if (index < value) {
            dot.classList.add("is-filled");
        }
        row.append(dot);
    }

    const note = document.createElement("p");
    note.className = "horoscope-detail-stat-note";
    note.textContent = value > 0
        ? "This score can be fed directly by your API whenever the rating is available."
        : "The API field is ready and will show a live score as soon as rating data is available.";

    card.append(label, valueNode, row, note);
    return card;
};

const renderStats = (signData) => {
    if (!detailElements.stats) {
        return;
    }

    detailElements.stats.innerHTML = "";

    const statItems = [
        {
            label: "Compatibility",
            value: signData.compatibility,
            fallback: "Matching insight will update soon",
            note: "Useful for relationship and harmony based readings."
        },
        {
            label: "Lucky Color",
            value: signData.lucky_color,
            fallback: "Color guidance will update soon",
            note: "This field can later pull a daily color from the horoscope API."
        },
        {
            label: "Lucky Number",
            value: signData.lucky_number,
            fallback: "Number guidance will update soon",
            note: "A daily number can appear here as soon as the API sends it."
        },
        {
            label: "Lucky Time",
            value: signData.lucky_time,
            fallback: "Timing guidance will update soon",
            note: "Use this slot for daily decision-making windows."
        },
        {
            label: "Mood",
            value: signData.mood,
            fallback: "Mood insight will update soon",
            note: "A quick emotional tone can be shown here for the selected sign."
        }
    ];

    statItems.forEach((item) => {
        const status = getDisplayValue(item.value, item.fallback);
        const card = document.createElement("article");
        card.className = "horoscope-detail-stat-card";

        if (status.pending) {
            card.classList.add("is-pending");
        }

        const label = document.createElement("span");
        label.className = "horoscope-detail-stat-label";
        label.textContent = item.label;

        const valueNode = document.createElement("strong");
        valueNode.className = "horoscope-detail-stat-value";
        valueNode.textContent = status.text;

        const note = document.createElement("p");
        note.className = "horoscope-detail-stat-note";
        note.textContent = item.note;

        card.append(label, valueNode, note);
        detailElements.stats.append(card);
    });

    detailElements.stats.append(renderRatingCard(Number(signData.overall_rating) || 0));
};

const renderFocusList = (signData, visual) => {
    if (!detailElements.focusList) {
        return;
    }

    const mood = getDisplayValue(signData.mood, "Mood indicator will update soon");
    const compatibility = getDisplayValue(signData.compatibility, "Compatibility insight will update soon");
    const luckyTime = getDisplayValue(signData.lucky_time, "Timing window will update soon");
    const luckyColor = getDisplayValue(signData.lucky_color, "Color cue will update soon");
    const luckyNumber = getDisplayValue(signData.lucky_number, "Number cue will update soon");

    const focusItems = [
        {
            icon: "SY",
            title: "Sign Identity",
            copy: `${sanitizeText(signData.zodiac_sign)} (${sanitizeText(signData.zodiac_sign_hindi)}) is currently presented with the symbol ${sanitizeText(signData.symbol)} and a ${visual.vibe.toLowerCase()} visual tone.`
        },
        {
            icon: "MO",
            title: "Mood and Compatibility",
            copy: `${mood.text}. ${compatibility.text}. These fields are already placed for future live API enrichment without changing the design.`
        },
        {
            icon: "LK",
            title: "Luck and Timing",
            copy: `Lucky time: ${luckyTime.text}. Lucky color: ${luckyColor.text}. Lucky number: ${luckyNumber.text}. These quick slots are ideal for daily glanceable data.`
        }
    ];

    detailElements.focusList.innerHTML = "";

    focusItems.forEach((item) => {
        const article = document.createElement("article");
        article.className = "horoscope-detail-focus-item";

        const icon = document.createElement("span");
        icon.className = "horoscope-detail-focus-icon";
        icon.textContent = item.icon;

        const copy = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = item.title;

        const text = document.createElement("p");
        text.textContent = item.copy;

        copy.append(title, text);
        article.append(icon, copy);
        detailElements.focusList.append(article);
    });
};

const renderNavLinks = (activeSign) => {
    const activeIndex = signOrder.indexOf(activeSign);
    const previousKey = signOrder[(activeIndex - 1 + signOrder.length) % signOrder.length];
    const nextKey = signOrder[(activeIndex + 1) % signOrder.length];
    const previousData = horoscopeApiResponse.data[previousKey];
    const nextData = horoscopeApiResponse.data[nextKey];

    if (detailElements.prevLink) {
        detailElements.prevLink.href = `horoscope-detail.html?sign=${previousKey}`;
        detailElements.prevLink.textContent = `Previous: ${sanitizeText(previousData.zodiac_sign)}`;
    }

    if (detailElements.nextLink) {
        detailElements.nextLink.href = `horoscope-detail.html?sign=${nextKey}`;
        detailElements.nextLink.textContent = `Next: ${sanitizeText(nextData.zodiac_sign)}`;
    }
};

const renderSelectedSign = () => {
    const activeSign = getSignFromQuery();
    const signData = horoscopeApiResponse.data[activeSign];
    const visual = signVisuals[activeSign];

    if (!signData || !visual) {
        return;
    }

    const signName = sanitizeText(signData.zodiac_sign);
    const signHindi = sanitizeText(signData.zodiac_sign_hindi);
    const prediction = sanitizeText(signData.prediction);

    document.title = `${signName} Horoscope | Thanathu Madom Devasthanam`;

    if (detailElements.title) {
        detailElements.title.textContent = `${signName} Horoscope`;
    }

    if (detailElements.hindi) {
        detailElements.hindi.textContent = signHindi;
    }

    if (detailElements.symbol) {
        detailElements.symbol.textContent = sanitizeText(signData.symbol);
    }

    if (detailElements.date) {
        detailElements.date.textContent = sanitizeText(signData.date_formatted);
    }

    if (detailElements.readingTitle) {
        detailElements.readingTitle.textContent = `${signName} Reading for ${sanitizeText(signData.date_formatted)}`;
    }

    if (detailElements.prediction) {
        detailElements.prediction.textContent = prediction;
    }

    if (detailElements.mainArt) {
        detailElements.mainArt.style.backgroundImage =
            `linear-gradient(rgba(255, 248, 230, 0.08), rgba(255, 238, 210, 0.16)), url("${visual.mainImage}")`;
    }

    if (detailElements.sideArt) {
        detailElements.sideArt.style.backgroundImage =
            `linear-gradient(rgba(255, 248, 230, 0.08), rgba(255, 238, 210, 0.16)), url("${visual.sideImage}")`;
    }

    if (detailElements.panelImage) {
        detailElements.panelImage.style.backgroundImage =
            `linear-gradient(rgba(21, 12, 4, 0.08), rgba(21, 12, 4, 0.2)), url("${visual.panelImage}")`;
    }

    if (detailElements.panelTitle) {
        detailElements.panelTitle.textContent = `${signName} energy in focus`;
    }

    if (detailElements.panelCopy) {
        detailElements.panelCopy.textContent =
            `${signName} carries a ${visual.vibe.toLowerCase()} tone today. This visual panel is ready to sit beside live API data while keeping the page attractive, readable, and easy to scale for all twelve signs.`;
    }

    const visualCard = document.querySelector(".horoscope-detail-visual-card");
    if (visualCard) {
        visualCard.style.background =
            `linear-gradient(180deg, ${visual.start}22 0%, ${visual.end}44 100%)`;
    }

    renderMetaChips(activeSign, signData, visual);
    renderZodiacNav(activeSign);
    renderHighlights(prediction);
    renderStats(signData);
    renderFocusList(signData, visual);
    renderNavLinks(activeSign);
};

renderSelectedSign();
