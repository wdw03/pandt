const initializeProductDetailNavbar = () => {
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

initializeProductDetailNavbar();

const escapeHtml = (value = "") => {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
};

const productDetailApiOrigin = (() => {
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

const productDetailApiUrl = (path) => `${productDetailApiOrigin}${path}`;
const productDetailContainer = document.querySelector("[data-product-detail]");
const productLoadingState = document.querySelector("[data-product-loading]");
const productEmptyState = document.querySelector("[data-product-empty]");
const productQuery = new URLSearchParams(window.location.search);
const productId = productQuery.get("id");

const getProductDetailImages = (product) => {
    const images = Array.isArray(product.images)
        ? product.images.filter(Boolean)
        : [];

    if (images.length) {
        return images;
    }

    return ["./assets/images/images.jpg"];
};

const getProductDetailActionLink = (product) => {
    if (product.productLink) {
        return product.productLink;
    }

    const detailUrl = new URL(window.location.href).toString();
    const message = encodeURIComponent(
        `Namaste, I want to buy ${product.title} (${product.price || "Price on request"}). Product details: ${detailUrl}`
    );
    return `https://wa.me/919743045807?text=${message}`;
};

const renderProductDetail = (product) => {
    const images = getProductDetailImages(product);
    const intro = product.detailIntro || product.description || "Full product explanation will be updated from the admin dashboard.";
    const story = product.detailBody || product.description || intro;
    const highlights = Array.isArray(product.highlights) ? product.highlights.filter(Boolean) : [];
    const detailPoints = Array.isArray(product.detailPoints) ? product.detailPoints.filter(Boolean) : [];
    const safeTitle = escapeHtml(product.title || "Spiritual Product");
    const safeSeller = escapeHtml(product.seller || "Sacred Store");
    const safePrice = escapeHtml(product.price || "Price on request");
    const safeIntro = escapeHtml(intro);
    const safeStory = escapeHtml(story);

    document.title = `${product.title || "Product Details"} | Thanathu Madom Devasthanam`;
    if (productLoadingState) {
        productLoadingState.hidden = true;
    }
    productEmptyState.hidden = true;
    productDetailContainer.hidden = false;

    productDetailContainer.innerHTML = `
        <section class="product-detail-shell">
            <div class="product-detail-gallery">
                <div class="product-detail-main-image">
                    <img src="${images[0]}" alt="${safeTitle}" id="productDetailMainImage">
                </div>
                ${images.length > 1 ? `
                    <div class="product-detail-thumbs" id="productDetailThumbs">
                        ${images.map((image, index) => `
                            <button class="product-detail-thumb${index === 0 ? " is-active" : ""}" type="button" data-detail-thumb="${index}" aria-label="View product image ${index + 1}">
                                <img src="${image}" alt="${safeTitle} image ${index + 1}">
                            </button>
                        `).join("")}
                    </div>
                ` : ""}
            </div>

            <div class="product-detail-copy">
                <a class="product-detail-back" href="products.html">Back to Products</a>
                <div class="product-detail-topline">
                    <span class="product-detail-seller">${safeSeller}</span>
                    <span class="product-detail-price">${safePrice}</span>
                </div>
                <h1>${safeTitle}</h1>
                <p class="product-detail-intro">${safeIntro}</p>
                <div class="product-detail-actions">
                    <a class="product-detail-action is-primary" href="${getProductDetailActionLink(product)}" target="_blank" rel="noreferrer">Buy Now</a>
                    <button class="product-detail-action" type="button" id="productDetailShareBtn">Share</button>
                </div>
                ${highlights.length ? `
                    <div class="product-detail-highlights">
                        ${highlights.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
                    </div>
                ` : ""}
            </div>
        </section>

        <section class="product-detail-story">
            <div class="product-detail-story-copy">
                <div class="products-section-tag">Product Details</div>
                <h2>Everything the devotee should know before buying.</h2>
                <p class="product-detail-body">${safeStory}</p>
            </div>
            <div class="product-detail-help">
                <h3>Why this product stands out</h3>
                <ul class="product-detail-list">
                    ${(detailPoints.length ? detailPoints : [
            "This product is connected to the live admin-managed catalog.",
            "Its pricing, images and detailed notes can be updated from the admin dashboard.",
            "Use Buy Now for direct enquiry or share the page with family members."
        ]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
            </div>
        </section>
    `;

    const mainImage = document.getElementById("productDetailMainImage");
    const thumbs = Array.from(document.querySelectorAll("[data-detail-thumb]"));
    const shareButton = document.getElementById("productDetailShareBtn");
    const detailUrl = new URL(window.location.href).toString();

    if (thumbs.length > 1) {
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener("click", () => {
                mainImage.src = images[index];
                thumbs.forEach((entry) => entry.classList.remove("is-active"));
                thumb.classList.add("is-active");
            });
        });
    }

    shareButton?.addEventListener("click", async () => {
        const shareText = `${product.title || "Product"} - ${product.price || "Price on request"}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.title || "Thanathu Madom Product",
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
                shareButton.textContent = "Share";
            }, 1400);
        }
    });
};

const showMissingProduct = () => {
    if (productLoadingState) {
        productLoadingState.hidden = true;
    }
    productDetailContainer.hidden = true;
    productEmptyState.hidden = false;
};

const loadProductDetail = async () => {
    if (!productId) {
        showMissingProduct();
        return;
    }

    try {
        const response = await fetch(productDetailApiUrl(`/api/public/products/${encodeURIComponent(productId)}`));
        const result = await response.json();

        if (!response.ok || !result?.success || !result.data) {
            showMissingProduct();
            return;
        }

        renderProductDetail(result.data);
    } catch (error) {
        console.error("Unable to load product details", error);
        showMissingProduct();
    }
};

loadProductDetail();
