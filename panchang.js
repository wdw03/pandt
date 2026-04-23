const initializePanchangNavbar = () => {
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

initializePanchangNavbar();

const panchangDateInput = document.getElementById("panchangDateInput");
const selectedDateLabel = document.querySelector("[data-selected-date-label]");
const selectedSummary = document.querySelector("[data-selected-summary]");
const heroDateShort = document.querySelector("[data-hero-date-short]");
const heroTithi = document.querySelector("[data-hero-tithi]");
const heroPaksha = document.querySelector("[data-hero-paksha]");
const cardDateShort = document.querySelector("[data-card-date-short]");
const modeLabel = document.querySelector("[data-mode-label]");
const primaryList = document.querySelector("[data-primary-list]");
const additionalList = document.querySelector("[data-additional-list]");
const jumpButtons = document.querySelectorAll("[data-jump]");

const stripTime = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const shiftDate = (date, days) => {
    const shiftedDate = new Date(date);
    shiftedDate.setDate(shiftedDate.getDate() + days);
    return stripTime(shiftedDate);
};

const formatIsoDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const parseIsoDateLocal = (value) => {
    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day);
};

const isSameDay = (firstDate, secondDate) => {
    return formatIsoDateLocal(firstDate) === formatIsoDateLocal(secondDate);
};

const formatLongDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(date);
};

const formatShortDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
};

const buildTimeFromMinutes = (totalMinutes) => {
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const meridian = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, "0")}:00 ${meridian}`;
};

const buildBadgeLabel = (label) => {
    return label
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

const today = stripTime(new Date());
const tomorrow = shiftDate(today, 1);

const todayKey = formatIsoDateLocal(today);
const tomorrowKey = formatIsoDateLocal(tomorrow);

const seededPanchangData = {
    [todayKey]: {
        primary: [
            { label: "Tithi", value: "Sapthami", icon: "TI" },
            { label: "Nakshatra", value: "Punarvasu", icon: "NA" },
            { label: "Yoga", value: "Dhrithi", icon: "YO" },
            { label: "Karana", value: "Garaja", icon: "KA" },
            { label: "Rasi", value: "Gemini", icon: "RA" }
        ],
        additional: [
            { label: "Sunrise", value: "5:49:01 AM", icon: "SR" },
            { label: "Sunset", value: "6:52:06 PM", icon: "SS" },
            { label: "Moonrise", value: "10:44:24 AM", icon: "MR" },
            { label: "Moonset", value: "1:19:03 AM", icon: "MS" },
            { label: "Next Full Moon", value: "Fri May 01 2026", icon: "FM" },
            { label: "Next New Moon", value: "Sat May 16 2026", icon: "NM" },
            { label: "Amanta Month", value: "Vaisakha", icon: "AM" },
            { label: "Paksha", value: "Shukla Paksha", icon: "PK" },
            { label: "Purnimanta", value: "Jyeshta", icon: "PM" }
        ]
    },
    [tomorrowKey]: {
        primary: [
            { label: "Tithi", value: "Ashtami", icon: "TI" },
            { label: "Nakshatra", value: "Pushya", icon: "NA" },
            { label: "Yoga", value: "Shoola", icon: "YO" },
            { label: "Karana", value: "Vanija", icon: "KA" },
            { label: "Rasi", value: "Cancer", icon: "RA" }
        ],
        additional: [
            { label: "Sunrise", value: "5:48:34 AM", icon: "SR" },
            { label: "Sunset", value: "6:52:29 PM", icon: "SS" },
            { label: "Moonrise", value: "11:27:16 AM", icon: "MR" },
            { label: "Moonset", value: "2:03:11 AM", icon: "MS" },
            { label: "Next Full Moon", value: "Fri May 01 2026", icon: "FM" },
            { label: "Next New Moon", value: "Sat May 16 2026", icon: "NM" },
            { label: "Amanta Month", value: "Vaisakha", icon: "AM" },
            { label: "Paksha", value: "Shukla Paksha", icon: "PK" },
            { label: "Purnimanta", value: "Jyeshta", icon: "PM" }
        ]
    }
};

const tithiValues = [
    "Pratipada",
    "Dwitiya",
    "Tritiya",
    "Chaturthi",
    "Panchami",
    "Shashthi",
    "Sapthami",
    "Ashtami",
    "Navami",
    "Dashami",
    "Ekadashi",
    "Dwadashi",
    "Trayodashi",
    "Chaturdashi",
    "Purnima"
];

const nakshatraValues = [
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashira",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni"
];

const yogaValues = [
    "Vishkambha",
    "Priti",
    "Ayushman",
    "Saubhagya",
    "Shobhana",
    "Atiganda",
    "Sukarma",
    "Dhrithi",
    "Shoola",
    "Ganda",
    "Vriddhi",
    "Dhruva"
];

const karanaValues = [
    "Bava",
    "Balava",
    "Kaulava",
    "Taitila",
    "Garaja",
    "Vanija",
    "Vishti"
];

const rasiValues = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces"
];

const amantaMonths = [
    "Chaitra",
    "Vaisakha",
    "Jyeshta",
    "Ashadha",
    "Shravana",
    "Bhadrapada",
    "Ashwin",
    "Kartika",
    "Margashirsha",
    "Pausha",
    "Magha",
    "Phalguna"
];

const purnimantaMonths = [
    "Chaitra",
    "Vaisakha",
    "Jyeshta",
    "Ashadha",
    "Shravana",
    "Bhadrapada",
    "Ashwin",
    "Kartika",
    "Margashirsha",
    "Pausha",
    "Magha",
    "Phalguna"
];

const fallbackMoonDates = [
    "Fri May 01 2026",
    "Sat May 16 2026",
    "Sun Jun 14 2026",
    "Mon Jul 13 2026"
];

const buildFallbackData = (date) => {
    const daySeed = date.getDate() + date.getMonth() * 3;
    const sunriseMinutes = 348 + (daySeed % 5);
    const sunsetMinutes = 1110 + (daySeed % 7);
    const moonriseMinutes = 620 + (daySeed * 7 % 180);
    const moonsetMinutes = 58 + (daySeed * 9 % 180);
    const pakshaValue = daySeed % 2 === 0 ? "Shukla Paksha" : "Krishna Paksha";

    return {
        primary: [
            { label: "Tithi", value: tithiValues[daySeed % tithiValues.length], icon: "TI" },
            { label: "Nakshatra", value: nakshatraValues[daySeed % nakshatraValues.length], icon: "NA" },
            { label: "Yoga", value: yogaValues[daySeed % yogaValues.length], icon: "YO" },
            { label: "Karana", value: karanaValues[daySeed % karanaValues.length], icon: "KA" },
            { label: "Rasi", value: rasiValues[daySeed % rasiValues.length], icon: "RA" }
        ],
        additional: [
            { label: "Sunrise", value: buildTimeFromMinutes(sunriseMinutes), icon: "SR" },
            { label: "Sunset", value: buildTimeFromMinutes(sunsetMinutes), icon: "SS" },
            { label: "Moonrise", value: buildTimeFromMinutes(moonriseMinutes), icon: "MR" },
            { label: "Moonset", value: buildTimeFromMinutes(moonsetMinutes), icon: "MS" },
            { label: "Next Full Moon", value: fallbackMoonDates[daySeed % fallbackMoonDates.length], icon: "FM" },
            { label: "Next New Moon", value: fallbackMoonDates[(daySeed + 1) % fallbackMoonDates.length], icon: "NM" },
            { label: "Amanta Month", value: amantaMonths[date.getMonth() % amantaMonths.length], icon: "AM" },
            { label: "Paksha", value: pakshaValue, icon: "PK" },
            { label: "Purnimanta", value: purnimantaMonths[(date.getMonth() + 1) % purnimantaMonths.length], icon: "PM" }
        ]
    };
};

const getPanchangData = (date) => {
    const key = formatIsoDateLocal(date);
    return seededPanchangData[key] || buildFallbackData(date);
};

let selectedDate = today;

const renderDataList = (container, items) => {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    items.forEach((item) => {
        const row = document.createElement("article");
        row.className = "panchang-list-row";

        const left = document.createElement("div");
        left.className = "panchang-row-main";

        const iconBadge = document.createElement("span");
        iconBadge.className = "panchang-icon-badge";
        iconBadge.textContent = item.icon || buildBadgeLabel(item.label);

        const copy = document.createElement("div");
        copy.className = "panchang-row-copy";

        const label = document.createElement("span");
        label.className = "panchang-row-label";
        label.textContent = item.label;

        const value = document.createElement("p");
        value.className = "panchang-row-value";
        value.textContent = item.value;

        copy.append(label, value);
        left.append(iconBadge, copy);
        row.append(left);
        container.append(row);
    });
};

const updateJumpButtons = () => {
    jumpButtons.forEach((button) => {
        const jumpType = button.dataset.jump;
        const shouldActivate =
            (jumpType === "today" && isSameDay(selectedDate, today)) ||
            (jumpType === "tomorrow" && isSameDay(selectedDate, tomorrow));

        button.classList.toggle("is-active", shouldActivate);
    });
};

const renderSelectedPanchang = () => {
    const data = getPanchangData(selectedDate);
    const pakshaData = data.additional.find((item) => item.label === "Paksha");

    if (panchangDateInput) {
        panchangDateInput.value = formatIsoDateLocal(selectedDate);
    }

    if (selectedDateLabel) {
        selectedDateLabel.textContent = formatLongDate(selectedDate);
    }

    if (selectedSummary) {
        selectedSummary.textContent = `${data.primary[0].value} | ${data.primary[1].value}`;
    }

    if (heroDateShort) {
        heroDateShort.textContent = formatShortDate(selectedDate);
    }

    if (heroTithi) {
        heroTithi.textContent = data.primary[0].value;
    }

    if (heroPaksha) {
        heroPaksha.textContent = pakshaData ? pakshaData.value : "Daily Panchang";
    }

    if (cardDateShort) {
        cardDateShort.textContent = formatShortDate(selectedDate);
    }

    if (modeLabel) {
        modeLabel.textContent = isSameDay(selectedDate, today)
            ? "Today Snapshot"
            : isSameDay(selectedDate, tomorrow)
                ? "Tomorrow Snapshot"
                : "Selected Date Snapshot";
    }

    renderDataList(primaryList, data.primary);
    renderDataList(additionalList, data.additional);
    updateJumpButtons();
};

if (panchangDateInput) {
    panchangDateInput.value = formatIsoDateLocal(selectedDate);

    panchangDateInput.addEventListener("change", (event) => {
        const nextDate = parseIsoDateLocal(event.target.value);

        if (!nextDate) {
            return;
        }

        selectedDate = stripTime(nextDate);
        renderSelectedPanchang();
    });
}

jumpButtons.forEach((button) => {
    button.addEventListener("click", () => {
        selectedDate = button.dataset.jump === "tomorrow" ? tomorrow : today;
        renderSelectedPanchang();
    });
});

renderSelectedPanchang();
