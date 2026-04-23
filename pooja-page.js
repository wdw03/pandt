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

const poojaPageData = Array.isArray(window.poojaSlidesData) ? window.poojaSlidesData : [];
const poojaList = document.querySelector("[data-pooja-list]");
const searchInput = document.querySelector("[data-pooja-search]");
const resultsCount = document.querySelector("[data-pooja-results-count]");
const emptyState = document.querySelector("[data-pooja-empty]");
const clearSearchButton = document.querySelector("[data-pooja-clear-search]");
const quickSearchButtons = document.querySelectorAll("[data-pooja-quick-search]");

if (poojaList && searchInput && resultsCount && emptyState) {
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

    const highlightMatch = (value = "", query = "") => {
        const searchQuery = normalizeSearchValue(query);

        if (!searchQuery) {
            return escapeHtml(value);
        }

        const rawValue = String(value);
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

    const createBenefitsMarkup = (benefits = []) => {
        return benefits
            .map((benefit) => {
                return `
                    <div class="benefititem expandcard" tabindex="0">
                        <div class="benefithead sectiontrigger">
                            <span class="benefitarrow"></span>
                            <p>${escapeHtml(benefit.preview)}</p>
                        </div>
                        <div class="expandcontent">
                            <div class="innerexpandbox">
                                <h4>${escapeHtml(benefit.heading)}</h4>
                                <p>${escapeHtml(benefit.body)}</p>
                            </div>
                        </div>
                    </div>
                `;
            })
            .join("");
    };

    const createPoojaCardMarkup = (pooja, index, query, highlightedSlug) => {
        const isHighlighted = highlightedSlug && highlightedSlug === pooja.slug;
        const cardClasses = `midleftmain pooja-route-card${isHighlighted ? " is-highlighted" : ""}`;

        return `
            <article
                class="${cardClasses}"
                id="pooja-${escapeHtml(pooja.slug)}"
                data-pooja-card
                data-pooja-slug="${escapeHtml(pooja.slug)}"
                style="--pooja-card-index: ${index};"
            >
                <div
                    class="midleftimg"
                    data-pooja-tag="${escapeHtml(pooja.imageTag)}"
                    style="background-image: url('${escapeHtml(pooja.image)}');"
                ></div>

                <div class="midlefttexs">
                    <div class="midtextpooja">
                        <div class="pooja-route-card-header">
                            <span class="pooja-route-kicker">Pooja Service</span>
                            <div class="nameofpuja">
                                <h2>${highlightMatch(pooja.title, query)}</h2>
                            </div>
                            <p class="pooja-route-card-subtitle">${highlightMatch(pooja.subtitle, query)}</p>
                        </div>

                        <div class="detailspooja" tabindex="0">
                            <p>${escapeHtml(pooja.cardDescription)}</p>
                        </div>

                        <div class="pricepooja" data-price-label="${escapeHtml(pooja.priceLabel)}"></div>

                        <div class="pooja-route-card-panels">
                            <div class="rightaboutpooja expandcard pooja-route-about" tabindex="0">
                                <div class="sectiontitle sectiontrigger">
                                    <h2>About</h2>
                                    <span class="titlearrow"></span>
                                </div>

                                <p class="previewtext">${escapeHtml(pooja.aboutPreview)}</p>

                                <div class="expandcontent">
                                    <div class="innerexpandbox">
                                        <h4>${escapeHtml(pooja.aboutHeading)}</h4>
                                        <p>${escapeHtml(pooja.aboutBody)}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="rightbenefitswrap">
                                <div class="sectiontitle">
                                    <h2>Benefits</h2>
                                </div>

                                <div class="benefitslist">
                                    ${createBenefitsMarkup(pooja.benefits)}
                                </div>
                            </div>
                        </div>

                        <div class="poojabutonsd">
                            <div class="shareivutton">
                                <button type="button" data-pooja-share="${escapeHtml(pooja.slug)}">share</button>
                            </div>
                            <div class="booknowb">
                                <button type="button" data-pooja-book="${escapeHtml(pooja.slug)}">book now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        `;
    };

    const hoverPreview = document.createElement("div");
    hoverPreview.className = "pooja-hover-preview";
    hoverPreview.setAttribute("aria-hidden", "true");
    hoverPreview.innerHTML = `
        <div class="pooja-hover-preview-card">
            <span class="pooja-hover-preview-label">Full Details</span>
            <h4 class="pooja-hover-preview-title"></h4>
            <div class="pooja-hover-preview-scroll">
                <p class="pooja-hover-preview-body"></p>
            </div>
        </div>
    `;
    document.body.append(hoverPreview);

    const hoverPreviewLabel = hoverPreview.querySelector(".pooja-hover-preview-label");
    const hoverPreviewTitle = hoverPreview.querySelector(".pooja-hover-preview-title");
    const hoverPreviewBody = hoverPreview.querySelector(".pooja-hover-preview-body");
    const searchParams = new URLSearchParams(window.location.search);
    const requestedSlug = normalizePoojaSlug(searchParams.get("pooja") || "");
    const requestedPooja = poojaPageData.find((pooja) => {
        return normalizePoojaSlug(pooja.slug || pooja.title) === requestedSlug;
    });
    const initialSearchValue = (searchParams.get("search") || requestedPooja?.title || "").trim();
    let activeHighlightedSlug = requestedPooja?.slug || "";
    let shouldAutoScrollToHighlightedCard = !!activeHighlightedSlug;
    let activePreviewSource = null;
    let previewHideTimer = null;

    const closeHoverPreview = () => {
        if (previewHideTimer) {
            clearTimeout(previewHideTimer);
            previewHideTimer = null;
        }

        activePreviewSource = null;
        hoverPreview.classList.remove("is-visible");
        hoverPreview.setAttribute("aria-hidden", "true");
    };

    const positionHoverPreview = (sourceElement) => {
        const sourceBounds = sourceElement.getBoundingClientRect();
        const previewBounds = hoverPreview.getBoundingClientRect();
        const previewWidth = previewBounds.width || Math.min(720, window.innerWidth - 32);
        const previewHeight = previewBounds.height || 0;
        const sideGap = 16;
        const left = Math.min(
            Math.max(sourceBounds.left + sourceBounds.width / 2 - previewWidth / 2, sideGap),
            Math.max(sideGap, window.innerWidth - previewWidth - sideGap)
        );
        const preferredTop = sourceBounds.top - previewHeight - 18;
        const top = Math.max(24, Math.min(72, preferredTop));

        hoverPreview.style.left = `${left}px`;
        hoverPreview.style.top = `${top}px`;
    };

    const openHoverPreview = (sourceElement, payload) => {
        if (!payload || !payload.title || !payload.body) {
            return;
        }

        if (previewHideTimer) {
            clearTimeout(previewHideTimer);
            previewHideTimer = null;
        }

        activePreviewSource = sourceElement;
        hoverPreviewLabel.textContent = payload.label || "Full Details";
        hoverPreviewTitle.textContent = payload.title;
        hoverPreviewBody.textContent = payload.body;
        hoverPreview.setAttribute("aria-hidden", "false");
        positionHoverPreview(sourceElement);
        hoverPreview.classList.add("is-visible");
    };

    const scheduleHoverPreviewClose = (relatedTarget = null) => {
        if (
            relatedTarget &&
            (hoverPreview.contains(relatedTarget) || activePreviewSource?.contains(relatedTarget))
        ) {
            return;
        }

        if (previewHideTimer) {
            clearTimeout(previewHideTimer);
        }

        previewHideTimer = setTimeout(() => {
            const previewHovered = hoverPreview.matches(":hover");
            const sourceHovered = activePreviewSource?.matches(":hover");
            const sourceFocused =
                !!activePreviewSource && activePreviewSource.contains(document.activeElement);

            if (previewHovered || sourceHovered || sourceFocused) {
                return;
            }

            closeHoverPreview();
        }, 120);
    };

    const bindHoverPreviewSource = (element, getPayload) => {
        if (!element || element.dataset.hoverPreviewBound === "true") {
            return;
        }

        element.dataset.hoverPreviewBound = "true";

        const showPreview = () => {
            openHoverPreview(element, getPayload());
        };

        element.addEventListener("mouseenter", showPreview);
        element.addEventListener("focusin", showPreview);
        element.addEventListener("mouseleave", (event) => {
            scheduleHoverPreviewClose(event.relatedTarget);
        });
        element.addEventListener("focusout", (event) => {
            scheduleHoverPreviewClose(event.relatedTarget);
        });
    };

    const bindHoverPreviewSources = () => {
        poojaList.querySelectorAll("[data-pooja-card]").forEach((card) => {
            const title = card.querySelector(".nameofpuja h2")?.textContent?.trim() || "Pooja";
            const detailsElement = card.querySelector(".detailspooja");
            const aboutElement = card.querySelector(".rightaboutpooja.expandcard");

            bindHoverPreviewSource(detailsElement, () => {
                return {
                    label: "Pooja Details",
                    title,
                    body: detailsElement?.querySelector("p")?.textContent?.trim() || ""
                };
            });

            bindHoverPreviewSource(aboutElement, () => {
                return {
                    label: "About",
                    title: aboutElement?.querySelector(".innerexpandbox h4")?.textContent?.trim() || title,
                    body: aboutElement?.querySelector(".innerexpandbox p")?.textContent?.trim() || ""
                };
            });

            card.querySelectorAll(".benefititem.expandcard").forEach((benefitElement) => {
                bindHoverPreviewSource(benefitElement, () => {
                    return {
                        label: "Benefit",
                        title:
                            benefitElement.querySelector(".innerexpandbox h4")?.textContent?.trim() ||
                            "Benefit",
                        body:
                            benefitElement.querySelector(".innerexpandbox p")?.textContent?.trim() || ""
                    };
                });
            });
        });
    };

    const setTemporaryButtonLabel = (button, label) => {
        if (!button) {
            return;
        }

        if (!button.dataset.defaultLabel) {
            button.dataset.defaultLabel = button.textContent.trim();
        }

        if (button.dataset.labelTimerId) {
            window.clearTimeout(Number(button.dataset.labelTimerId));
        }

        button.textContent = label;

        const timerId = window.setTimeout(() => {
            button.textContent = button.dataset.defaultLabel || "share";
            delete button.dataset.labelTimerId;
        }, 1600);

        button.dataset.labelTimerId = String(timerId);
    };

    const bindCardActions = () => {
        poojaList.querySelectorAll("[data-pooja-book]").forEach((button) => {
            if (button.dataset.poojaActionBound === "true") {
                return;
            }

            button.dataset.poojaActionBound = "true";
            button.addEventListener("click", () => {
                const slug = button.dataset.poojaBook || "";
                const bookUrl = new URL("index.html", window.location.href);

                if (slug) {
                    bookUrl.searchParams.set("pooja", slug);
                }

                bookUrl.hash = "pooja";
                window.location.href = bookUrl.toString();
            });
        });

        poojaList.querySelectorAll("[data-pooja-share]").forEach((button) => {
            if (button.dataset.poojaActionBound === "true") {
                return;
            }

            button.dataset.poojaActionBound = "true";
            button.addEventListener("click", async () => {
                const slug = button.dataset.poojaShare || "";
                const shareUrl = new URL("pooja.html", window.location.href);

                if (slug) {
                    shareUrl.searchParams.set("pooja", slug);
                }

                try {
                    if (navigator.clipboard) {
                        await navigator.clipboard.writeText(shareUrl.toString());
                        setTemporaryButtonLabel(button, "copied");
                        return;
                    }
                } catch (error) {
                    // Fallback to opening the direct pooja route when clipboard is unavailable.
                }

                window.location.href = shareUrl.toString();
            });
        });
    };

    const updateResultsMeta = (visiblePoojaCount, query = "") => {
        if (query) {
            resultsCount.textContent = `${visiblePoojaCount} match${visiblePoojaCount === 1 ? "" : "es"} for "${query}"`;
        } else {
            resultsCount.textContent = `${visiblePoojaCount} pooja${visiblePoojaCount === 1 ? "" : "s"} available`;
        }
    };

    const updateSearchUrl = (query = "") => {
        if (!window.history || typeof window.history.replaceState !== "function") {
            return;
        }

        const nextSearchParams = new URLSearchParams();

        if (!query && activeHighlightedSlug) {
            nextSearchParams.set("pooja", activeHighlightedSlug);
        }

        if (query) {
            nextSearchParams.set("search", query);
        }

        const nextQueryString = nextSearchParams.toString();
        const nextUrl = `${window.location.pathname}${nextQueryString ? `?${nextQueryString}` : ""}`;
        window.history.replaceState({}, "", nextUrl);
    };

    const renderPoojaCards = (query = "") => {
        const trimmedQuery = query.trim();
        const filteredPoojas = getFilteredPoojas(trimmedQuery);

        closeHoverPreview();
        poojaList.innerHTML = filteredPoojas
            .map((pooja, index) => {
                return createPoojaCardMarkup(pooja, index, trimmedQuery, activeHighlightedSlug);
            })
            .join("");

        emptyState.hidden = filteredPoojas.length !== 0;
        poojaList.hidden = filteredPoojas.length === 0;
        updateResultsMeta(filteredPoojas.length, trimmedQuery);
        bindHoverPreviewSources();
        bindCardActions();
        updateSearchUrl(trimmedQuery);

        if (activeHighlightedSlug && shouldAutoScrollToHighlightedCard) {
            const highlightedCard = poojaList.querySelector(`#pooja-${activeHighlightedSlug}`);

            if (highlightedCard) {
                requestAnimationFrame(() => {
                    highlightedCard.scrollIntoView({ behavior: "smooth", block: "center" });
                });
            }

            shouldAutoScrollToHighlightedCard = false;
        }
    };

    hoverPreview.addEventListener("mouseenter", () => {
        if (previewHideTimer) {
            clearTimeout(previewHideTimer);
            previewHideTimer = null;
        }
    });

    hoverPreview.addEventListener("mouseleave", (event) => {
        scheduleHoverPreviewClose(event.relatedTarget);
    });

    window.addEventListener(
        "scroll",
        () => {
            if (activePreviewSource && hoverPreview.classList.contains("is-visible")) {
                positionHoverPreview(activePreviewSource);
            }
        },
        true
    );

    window.addEventListener("resize", () => {
        if (activePreviewSource && hoverPreview.classList.contains("is-visible")) {
            positionHoverPreview(activePreviewSource);
        }
    });

    quickSearchButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeHighlightedSlug = "";
            shouldAutoScrollToHighlightedCard = false;
            searchInput.value = button.dataset.poojaQuickSearch || "";
            renderPoojaCards(searchInput.value);
            searchInput.focus();
        });
    });

    searchInput.addEventListener("input", () => {
        activeHighlightedSlug = "";
        shouldAutoScrollToHighlightedCard = false;
        renderPoojaCards(searchInput.value);
    });

    clearSearchButton?.addEventListener("click", () => {
        activeHighlightedSlug = "";
        shouldAutoScrollToHighlightedCard = false;
        searchInput.value = "";
        renderPoojaCards("");
        searchInput.focus();
    });

    searchInput.value = initialSearchValue;
    renderPoojaCards(initialSearchValue);
}
