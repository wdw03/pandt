const initializePoojaNavbar = () => {
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

initializePoojaNavbar();

const initPoojaPage = () => {
    const poojaPageData = Array.isArray(window.poojaSlidesData) ? window.poojaSlidesData : [];
    const searchInput = document.querySelector("[data-pooja-search]");
    const emptyState = document.querySelector("[data-pooja-empty]");
    const clearSearchButton = document.querySelector("[data-pooja-clear-search]");
    const quickSearchButtons = document.querySelectorAll("[data-pooja-quick-search]");
    const servicesGrid = document.querySelector("[data-pooja-services-grid]");

    if (!servicesGrid || !searchInput || !emptyState) {
        return;
    }

    const escapeHtml = (value = "") => {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    const normalizeSearchValue = (value = "") => {
        return value.toLowerCase().trim();
    };

    const normalizePoojaSlug = (value = "") => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const formatPujaText = (value = "") => {
        return String(value)
            .replace(/\bPoojas\b/g, "Pujas")
            .replace(/\bPooja\b/g, "Puja")
            .replace(/\bpoojas\b/g, "pujas")
            .replace(/\bpooja\b/g, "puja");
    };

    const getPoojaDetailUrl = (slug = "") => {
        const normalizedSlug = normalizePoojaSlug(slug);

        if (!normalizedSlug) {
            return "pooja.html";
        }

        if (window.location.protocol === "file:") {
            return `puja-detail.html?slug=${encodeURIComponent(normalizedSlug)}`;
        }

        return `/puja/${encodeURIComponent(normalizedSlug)}`;
    };

    const highlightMatch = (value = "", query = "") => {
        const searchQuery = normalizeSearchValue(query);

        if (!searchQuery) {
            return escapeHtml(formatPujaText(value));
        }

        const rawValue = formatPujaText(value);
        const normalizedValue = rawValue.toLowerCase();
        const matchIndex = normalizedValue.indexOf(searchQuery);

        if (matchIndex === -1) {
            return escapeHtml(rawValue);
        }

        return [
            escapeHtml(rawValue.slice(0, matchIndex)),
            `<mark>${escapeHtml(rawValue.slice(matchIndex, matchIndex + searchQuery.length))}</mark>`,
            escapeHtml(rawValue.slice(matchIndex + searchQuery.length))
        ].join("");
    };

    const getSearchPriority = (pooja, query) => {
        const normalizedTitle = normalizeSearchValue(pooja.title);

        if (normalizedTitle === query) {
            return 0;
        }

        if (normalizedTitle.startsWith(query)) {
            return 1;
        }

        if (normalizedTitle.split(/\s+/).some((word) => word.startsWith(query))) {
            return 2;
        }

        return 3;
    };

    const getFilteredPoojas = (query = "") => {
        const normalizedQuery = normalizeSearchValue(query);

        if (!normalizedQuery) {
            return [...poojaPageData];
        }

        return poojaPageData
            .filter((pooja) => normalizeSearchValue(pooja.title).includes(normalizedQuery))
            .sort((firstPooja, secondPooja) => {
                const firstPriority = getSearchPriority(firstPooja, normalizedQuery);
                const secondPriority = getSearchPriority(secondPooja, normalizedQuery);

                if (firstPriority !== secondPriority) {
                    return firstPriority - secondPriority;
                }

                return firstPooja.title.localeCompare(secondPooja.title);
            });
    };

    const resolvePoojaImage = (value = "") => {
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

        if (value.startsWith("assets/")) {
            return `./${value}`;
        }

        return value;
    };

    const createPoojaServiceCardMarkup = (pooja, index, query = "") => {
        const slideSlug = escapeHtml(pooja.slug || normalizePoojaSlug(pooja.title));
        const slideImage = escapeHtml(resolvePoojaImage(pooja.image));
        const title = highlightMatch(pooja.title || "Puja Service", query);
        const description = escapeHtml(
            formatPujaText(
                pooja.cardDescription ||
                pooja.aboutPreview ||
                pooja.subtitle ||
                "Book this puja with sacred procedure, personal sankalp and guided support."
            )
        );
        const tag = escapeHtml(formatPujaText(pooja.imageTag || "Sacred Puja"));
        const price = escapeHtml(formatPujaText(pooja.priceLabel || "Booking Open"));

        return `
            <article class="pooja-service-card" style="--pooja-service-index: ${index};">
                <div class="pooja-service-visual">
                    <div class="pooja-service-image" style="background-image: linear-gradient(rgba(16, 8, 2, 0.08), rgba(16, 8, 2, 0.18)), url('${slideImage}')"></div>
                    <span class="pooja-service-chip">${tag}</span>
                    <span class="pooja-service-price">${price}</span>
                </div>
                <h3>${title}</h3>
                <p>${description}</p>
                <a class="pooja-service-btn" href="${getPoojaDetailUrl(slideSlug)}">View Full Puja</a>
            </article>
        `;
    };

    const updateSearchUrl = (query = "") => {
        if (!window.history || typeof window.history.replaceState !== "function") {
            return;
        }

        const nextSearchParams = new URLSearchParams();

        if (query) {
            nextSearchParams.set("search", query);
        }

        const nextQueryString = nextSearchParams.toString();
        const nextUrl = `${window.location.pathname}${nextQueryString ? `?${nextQueryString}` : ""}`;
        window.history.replaceState({}, "", nextUrl);
    };

    const renderPoojaServiceCards = (query = "") => {
        const trimmedQuery = query.trim();
        const filteredPoojas = getFilteredPoojas(trimmedQuery);

        servicesGrid.innerHTML = filteredPoojas
            .map((pooja, index) => createPoojaServiceCardMarkup(pooja, index, trimmedQuery))
            .join("");

        servicesGrid.hidden = filteredPoojas.length === 0;
        emptyState.hidden = filteredPoojas.length !== 0;
        updateSearchUrl(trimmedQuery);
    };

    const initialSearchValue = formatPujaText(new URLSearchParams(window.location.search).get("search") || "").trim();

    quickSearchButtons.forEach((button) => {
        button.addEventListener("click", () => {
            searchInput.value = button.dataset.poojaQuickSearch || "";
            renderPoojaServiceCards(searchInput.value);
            searchInput.focus();
        });
    });

    searchInput.addEventListener("input", () => {
        renderPoojaServiceCards(searchInput.value);
    });

    clearSearchButton?.addEventListener("click", () => {
        searchInput.value = "";
        renderPoojaServiceCards("");
        searchInput.focus();
    });

    searchInput.value = initialSearchValue;
    renderPoojaServiceCards(initialSearchValue);
};

if (window.poojaSlidesData) {
    initPoojaPage();
} else {
    window.addEventListener('poojaDataLoaded', initPoojaPage);
}
