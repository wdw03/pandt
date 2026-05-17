const initializePujaDetailNavbar = () => {
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

initializePujaDetailNavbar();

const pujaDetailApiOrigin = (() => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    if (protocol === "file:") {
        return "http://localhost:5000";
    }

    if (hostname === "127.0.0.1" || hostname === "localhost") {
        if (!port || port === "5000") {
            return `${window.location.protocol}//${window.location.hostname}${port ? `:${port}` : ""}`;
        }

        return `${window.location.protocol}//${window.location.hostname}:5000`;
    }

    return "";
})();

const pujaDetailApiUrl = (path) => `${pujaDetailApiOrigin}${path}`;
const pujaDetailRoot = document.querySelector("[data-puja-detail-root]");
const pujaDetailEmpty = document.querySelector("[data-puja-detail-empty]");
const isFileProtocol = window.location.protocol === "file:";

const escapeHtml = (value = "") => {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
};

const formatPujaText = (value = "") => {
    return String(value)
        .replace(/\bPoojas\b/g, "Pujas")
        .replace(/\bPooja\b/g, "Puja")
        .replace(/\bpoojas\b/g, "pujas")
        .replace(/\bpooja\b/g, "puja");
};

const normalizePoojaSlug = (value = "") => {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const resolvePujaImage = (value = "") => {
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
        return pujaDetailApiOrigin ? `${pujaDetailApiOrigin}${value}` : value;
    }

    if (value.startsWith("./")) {
        if (isFileProtocol) {
            return value;
        }

        return `/${value.replace(/^\.\/+/, "")}`;
    }

    if (value.startsWith("assets/")) {
        return isFileProtocol ? `./${value}` : `/${value}`;
    }

    return isFileProtocol ? value : `/${value.replace(/^\/+/, "")}`;
};

const getRequestedPujaSlug = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const fromQuery = searchParams.get("slug") || searchParams.get("pooja");

    if (fromQuery) {
        return normalizePoojaSlug(fromQuery);
    }

    if (window.location.protocol !== "file:") {
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const lastPart = pathParts[pathParts.length - 1] || "";

        if (pathParts.includes("puja") || pathParts.includes("pooja")) {
            return normalizePoojaSlug(lastPart);
        }
    }

    return "";
};

const getBookingUrl = (slug = "") => {
    const url = isFileProtocol
        ? new URL("index.html", window.location.href)
        : new URL("/index.html", window.location.origin);

    if (slug) {
        url.searchParams.set("pooja", slug);
    }

    url.hash = "pooja";
    return url.toString();
};

const showMissingPuja = () => {
    pujaDetailRoot.hidden = true;
    pujaDetailEmpty.hidden = false;
};

const renderListItems = (items = [], fallbackItems = []) => {
    const source = Array.isArray(items) && items.length ? items : fallbackItems;
    return source
        .filter(Boolean)
        .map((item) => `<li>${escapeHtml(formatPujaText(item))}</li>`)
        .join("");
};

const renderBenefits = (benefits = []) => {
    return benefits
        .map((benefit) => `
            <article class="puja-detail-benefit-card">
                <span class="puja-detail-benefit-tag">${escapeHtml(formatPujaText(benefit.preview || "Benefit"))}</span>
                <h3>${escapeHtml(formatPujaText(benefit.heading || benefit.preview || "Puja Benefit"))}</h3>
                <p>${escapeHtml(formatPujaText(benefit.body || "Detailed benefit information will be updated from the dashboard."))}</p>
            </article>
        `)
        .join("");
};

const renderPujaDetail = (puja) => {
    const slug = normalizePoojaSlug(puja.slug || puja.title);
    const title = formatPujaText(puja.title || "Puja");
    const subtitle = formatPujaText(puja.subtitle || puja.aboutPreview || "Sacred Vedic ritual service");
    const intro = formatPujaText(
        puja.detailIntro ||
        puja.cardDescription ||
        puja.aboutPreview ||
        "This puja is performed with devotion, sacred procedure and guided ritual care."
    );
    const detailBody = formatPujaText(
        puja.detailBody ||
        puja.aboutBody ||
        puja.cardDescription ||
        "Detailed explanation will be updated from the admin dashboard."
    );
    const highlights = Array.isArray(puja.detailHighlights) ? puja.detailHighlights.filter(Boolean) : [];
    const benefits = Array.isArray(puja.benefits) ? puja.benefits : [];
    const benefitFallback = benefits.map((benefit) => benefit.heading || benefit.preview).filter(Boolean);
    const ritualSteps = Array.isArray(puja.ritualSteps) ? puja.ritualSteps.filter(Boolean) : [];
    const preparationNotes = Array.isArray(puja.preparationNotes) ? puja.preparationNotes.filter(Boolean) : [];
    const suitableFor = Array.isArray(puja.suitableFor) ? puja.suitableFor.filter(Boolean) : [];
    const image = resolvePujaImage(puja.image);

    document.title = `${escapeHtml(title)} | Thanathu Madom Devasthanam`;
    pujaDetailEmpty.hidden = true;
    pujaDetailRoot.hidden = false;

    pujaDetailRoot.innerHTML = `
        <section class="puja-detail-hero-shell">
            <div class="puja-detail-visual">
                <div class="puja-detail-image-wrap">
                    <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}">
                    <span class="puja-detail-image-tag">${escapeHtml(formatPujaText(puja.imageTag || "Sacred Puja"))}</span>
                    <span class="puja-detail-image-price">${escapeHtml(formatPujaText(puja.priceLabel || "Booking Open"))}</span>
                </div>
            </div>

            <div class="puja-detail-copy">
                <a class="puja-detail-back-link" href="${isFileProtocol ? "pooja.html" : "/pooja.html"}">Back to All Puja</a>
                <span class="puja-detail-kicker">Dedicated Puja Route</span>
                <h1>${escapeHtml(title)}</h1>
                <p class="puja-detail-subtitle">${escapeHtml(subtitle)}</p>
                <p class="puja-detail-intro">${escapeHtml(intro)}</p>

                <div class="puja-detail-actions">
                    <a class="puja-detail-primary-btn" href="${getBookingUrl(slug)}">Book This Puja</a>
                    <button class="puja-detail-secondary-btn" type="button" id="pujaDetailShareBtn">Share Puja</button>
                </div>

                <div class="puja-detail-highlights">
                    ${(highlights.length ? highlights : benefitFallback).slice(0, 4).map((item) => `
                        <span>${escapeHtml(formatPujaText(item))}</span>
                    `).join("")}
                </div>
            </div>
        </section>

        <section class="puja-detail-story">
            <article class="puja-detail-story-main">
                <span class="puja-detail-section-tag">About This Puja</span>
                <h2>${escapeHtml(formatPujaText(puja.aboutHeading || `About ${title}`))}</h2>
                <p>${escapeHtml(formatPujaText(puja.aboutBody || intro))}</p>
                <div class="puja-detail-long-copy">
                    <p>${escapeHtml(detailBody)}</p>
                </div>
            </article>

            <aside class="puja-detail-summary-card">
                <span class="puja-detail-section-tag">Quick Summary</span>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(formatPujaText(puja.cardDescription || subtitle))}</p>
                <ul class="puja-detail-mini-list">
                    <li><strong>Price</strong><span>${escapeHtml(formatPujaText(puja.priceLabel || "Booking Open"))}</span></li>
                    <li><strong>Tag</strong><span>${escapeHtml(formatPujaText(puja.imageTag || "Sacred Puja"))}</span></li>
                    <li><strong>Route</strong><span>/puja/${escapeHtml(slug)}</span></li>
                </ul>
            </aside>
        </section>

        <section class="puja-detail-benefits">
            <div class="puja-detail-section-head">
                <span class="puja-detail-section-tag">Benefits</span>
                <h2>Why devotees choose this puja</h2>
            </div>
            <div class="puja-detail-benefits-grid">
                ${renderBenefits(benefits)}
            </div>
        </section>

        <section class="puja-detail-content-grid">
            <article class="puja-detail-panel">
                <span class="puja-detail-section-tag">Ritual Flow</span>
                <h3>How the puja is performed</h3>
                <ul class="puja-detail-list">
                    ${renderListItems(
                        ritualSteps,
                        [
                            "The puja begins with sankalp and devotional intention in the name of the devotee.",
                            "Traditional mantra, offerings and sacred procedure are performed with discipline.",
                            "The ritual concludes with blessings, prayers and spiritual completion."
                        ]
                    )}
                </ul>
            </article>

            <article class="puja-detail-panel">
                <span class="puja-detail-section-tag">Before the Puja</span>
                <h3>Preparation notes for devotees</h3>
                <ul class="puja-detail-list">
                    ${renderListItems(
                        preparationNotes,
                        [
                            "Keep the devotee name and prayer intention ready before booking.",
                            "Prepare a clean and respectful prayer environment if participating from home.",
                            "Any additional instructions can be shared from the admin-managed booking guidance."
                        ]
                    )}
                </ul>
            </article>

            <article class="puja-detail-panel puja-detail-panel-wide">
                <span class="puja-detail-section-tag">Best For</span>
                <h3>Who usually books this puja</h3>
                <ul class="puja-detail-list">
                    ${renderListItems(
                        suitableFor,
                        [
                            "Devotees seeking peace, blessings and structured ritual support",
                            "Families booking for auspicious beginnings, harmony or prosperity prayers",
                            "Those wanting a more detailed and spiritually meaningful puja route"
                        ]
                    )}
                </ul>
            </article>
        </section>
    `;

    const shareButton = document.getElementById("pujaDetailShareBtn");
    const detailUrl = window.location.href;

    shareButton?.addEventListener("click", async () => {
        const shareText = `${title} - ${subtitle}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: shareText,
                    url: detailUrl
                });
                return;
            } catch (error) {
                // Fallback below.
            }
        }

        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(`${shareText}\n${detailUrl}`);
            shareButton.textContent = "Copied";
            window.setTimeout(() => {
                shareButton.textContent = "Share Puja";
            }, 1400);
        }
    });
};

const loadPujaDetail = async () => {
    const slug = getRequestedPujaSlug();

    if (!slug) {
        showMissingPuja();
        return;
    }

    try {
        const response = await fetch(pujaDetailApiUrl(`/api/public/pooja-slides/${encodeURIComponent(slug)}`));
        const result = await response.json();

        if (!response.ok || !result?.success || !result.data) {
            showMissingPuja();
            return;
        }

        renderPujaDetail(result.data);
    } catch (error) {
        console.error("Unable to load puja details", error);
        showMissingPuja();
    }
};

loadPujaDetail();
