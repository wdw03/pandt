const initializeProductsNavbar = () => {
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

initializeProductsNavbar();

const productsApiOrigin = (() => {
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

const productsApiUrl = (path) => `${productsApiOrigin}${path}`;
const productsGrid = document.querySelector("[data-products-grid]");
const productsEmptyState = document.querySelector("[data-products-empty]");
const productsSearchInput = document.getElementById("productsSearchInput");
const productsTotalCount = document.querySelector("[data-products-total-count]");
const productsResultCount = document.querySelector("[data-products-result-count]");
const productsResultCopy = document.querySelector("[data-products-result-copy]");

const productsState = {
    all: [],
    filtered: []
};

const getProductImages = (product) => {
    const images = Array.isArray(product.images)
        ? product.images.filter(Boolean)
        : [];

    if (images.length) {
        return images;
    }

    return ["./assets/images/images.jpg"];
};

const getProductActionLink = (product) => {
    if (product.productLink) {
        return product.productLink;
    }

    const message = encodeURIComponent(`Namaste, I want details for ${product.title} (${product.price}).`);
    return `https://wa.me/919743045807?text=${message}`;
};

const updateProductsStatus = () => {
    const total = productsState.all.length;
    const filtered = productsState.filtered.length;
    const sellerCount = new Set(
        productsState.all
            .map((product) => String(product.seller || "").trim())
            .filter(Boolean)
    ).size;

    if (productsTotalCount) {
        productsTotalCount.textContent = String(total);
    }

    if (productsResultCount) {
        productsResultCount.textContent = `${filtered} Product${filtered === 1 ? "" : "s"}`;
    }

    if (productsResultCopy) {
        productsResultCopy.textContent = total
            ? `Showing ${filtered} of ${total} items from ${sellerCount || total} seller source${sellerCount === 1 ? "" : "s"}.`
            : "No products are available from the backend yet.";
    }
};

const initializeProductCarousel = (gallery, images) => {
    const track = gallery.querySelector(".products-product-track");
    const prevButton = gallery.querySelector("[data-product-prev]");
    const nextButton = gallery.querySelector("[data-product-next]");
    const dots = Array.from(gallery.querySelectorAll(".products-product-dot"));

    if (!track || images.length <= 1) {
        return;
    }

    let currentIndex = 0;
    let timerId = null;

    const render = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === currentIndex);
        });
    };

    const next = () => {
        currentIndex = (currentIndex + 1) % images.length;
        render();
    };

    const prev = () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        render();
    };

    const restart = () => {
        window.clearInterval(timerId);
        timerId = window.setInterval(next, 2600);
    };

    prevButton?.addEventListener("click", () => {
        prev();
        restart();
    });

    nextButton?.addEventListener("click", () => {
        next();
        restart();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            currentIndex = index;
            render();
            restart();
        });
    });

    gallery.addEventListener("mouseenter", () => window.clearInterval(timerId));
    gallery.addEventListener("mouseleave", restart);

    render();
    restart();
};

const renderProducts = () => {
    if (!productsGrid) {
        return;
    }

    productsGrid.innerHTML = "";
    updateProductsStatus();

    if (!productsState.filtered.length) {
        if (productsEmptyState) {
            productsEmptyState.hidden = false;
        }
        return;
    }

    if (productsEmptyState) {
        productsEmptyState.hidden = true;
    }

    productsState.filtered.forEach((product) => {
        const images = getProductImages(product);
        const card = document.createElement("article");
        card.className = "products-product-card";

        const gallery = document.createElement("div");
        gallery.className = "products-product-gallery";

        const track = document.createElement("div");
        track.className = "products-product-track";

        images.forEach((imagePath) => {
            const image = document.createElement("div");
            image.className = "products-product-image";
            image.style.backgroundImage = `url("${imagePath}")`;
            track.append(image);
        });

        gallery.append(track);

        if (images.length > 1) {
            const navs = document.createElement("div");
            navs.className = "products-product-navs";

            const prevButton = document.createElement("button");
            prevButton.type = "button";
            prevButton.className = "products-product-nav";
            prevButton.dataset.productPrev = "true";
            prevButton.textContent = "Prev";

            const nextButton = document.createElement("button");
            nextButton.type = "button";
            nextButton.className = "products-product-nav";
            nextButton.dataset.productNext = "true";
            nextButton.textContent = "Next";

            navs.append(prevButton, nextButton);
            gallery.append(navs);

            const dots = document.createElement("div");
            dots.className = "products-product-dots";

            images.forEach((_, dotIndex) => {
                const dot = document.createElement("button");
                dot.type = "button";
                dot.className = "products-product-dot";
                dot.setAttribute("aria-label", `View product image ${dotIndex + 1}`);
                dots.append(dot);
            });

            gallery.append(dots);
        }

        const price = document.createElement("div");
        price.className = "products-product-price";
        price.textContent = product.price || "Price on request";

        const head = document.createElement("div");
        head.className = "products-product-head";

        const sellerMeta = document.createElement("div");
        sellerMeta.className = "products-product-meta";

        const sellerLabel = document.createElement("span");
        sellerLabel.textContent = "Seller / Tag";

        const sellerValue = document.createElement("strong");
        sellerValue.textContent = product.seller || "Sacred Store";

        sellerMeta.append(sellerLabel, sellerValue);
        head.append(sellerMeta, price);

        const title = document.createElement("h3");
        title.textContent = product.title || "Spiritual Product";

        const description = document.createElement("p");
        description.textContent = product.description || "Details will be updated from the admin panel.";

        const actions = document.createElement("div");
        actions.className = "products-product-actions";

        const primaryAction = document.createElement("a");
        primaryAction.className = "products-product-action is-primary";
        primaryAction.href = getProductActionLink(product);
        primaryAction.target = "_blank";
        primaryAction.rel = "noreferrer";
        primaryAction.textContent = product.productLink ? "View Product" : "Enquire on WhatsApp";

        const shareButton = document.createElement("button");
        shareButton.type = "button";
        shareButton.className = "products-product-action";
        shareButton.textContent = "Share";
        shareButton.addEventListener("click", async () => {
            const shareText = `${product.title || "Product"} - ${product.price || "Price on request"}`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: product.title || "Thanathu Madom Product",
                        text: shareText,
                        url: getProductActionLink(product)
                    });
                    return;
                } catch (error) {
                    // Fallback below.
                }
            }

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareText);
                shareButton.textContent = "Copied";
                window.setTimeout(() => {
                    shareButton.textContent = "Share";
                }, 1400);
            }
        });

        actions.append(primaryAction, shareButton);

        card.append(gallery, head, title, description, actions);
        productsGrid.append(card);

        initializeProductCarousel(gallery, images);
    });
};

const filterProducts = () => {
    const query = String(productsSearchInput?.value || "")
        .trim()
        .toLowerCase();

    if (!query) {
        productsState.filtered = [...productsState.all];
        renderProducts();
        return;
    }

    productsState.filtered = productsState.all.filter((product) => {
        const searchableText = [
            product.title,
            product.description,
            product.seller,
            product.price,
            product.productId
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(query);
    });

    renderProducts();
};

const loadProducts = async () => {
    try {
        const response = await fetch(productsApiUrl("/api/public/products"));
        const result = await response.json();

        if (!result?.success || !Array.isArray(result.data)) {
            productsState.all = [];
            productsState.filtered = [];
            renderProducts();
            return;
        }

        productsState.all = result.data;
        productsState.filtered = [...result.data];
        renderProducts();
    } catch (error) {
        console.error("Unable to load products", error);
        productsState.all = [];
        productsState.filtered = [];
        renderProducts();
    }
};

productsSearchInput?.addEventListener("input", filterProducts);

loadProducts();
