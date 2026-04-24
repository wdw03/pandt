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

const zodiacGrid = document.querySelector("[data-zodiac-grid]");
const reviewTrack = document.querySelector("[data-review-track]");
const videoTrack = document.querySelector("[data-video-track]");
const videoDots = document.querySelector("[data-video-dots]");
const blogTrack = document.querySelector("[data-blog-track]");
const blogDots = document.querySelector("[data-blog-dots]");
const productsGrid = document.querySelector("[data-products-grid]");
const accordionToggle = document.querySelector("[data-gallery-accordion-toggle]");
const accordionContent = document.querySelector("[data-gallery-accordion-content]");

const zodiacSigns = [
    { name: "Aries", short: "Ar", start: "#ff7f73", end: "#dc493f" },
    { name: "Taurus", short: "Ta", start: "#b4b95b", end: "#7a7f26" },
    { name: "Gemini", short: "Ge", start: "#6cd0d2", end: "#30979a" },
    { name: "Cancer", short: "Ca", start: "#7cb7f2", end: "#4a7ed5" },
    { name: "Leo", short: "Le", start: "#ffbf4f", end: "#e68a13" },
    { name: "Virgo", short: "Vi", start: "#7fbf8f", end: "#3f8b57" },
    { name: "Libra", short: "Li", start: "#d39bd9", end: "#a460ac" },
    { name: "Scorpio", short: "Sc", start: "#c25d74", end: "#8c2f49" },
    { name: "Sagittarius", short: "Sg", start: "#ff9f68", end: "#e06b29" },
    { name: "Capricorn", short: "Cp", start: "#b48462", end: "#7a4d2d" },
    { name: "Aquarius", short: "Aq", start: "#53b7b3", end: "#247b78" },
    { name: "Pisces", short: "Pi", start: "#7b9cff", end: "#4f6cd8" }
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
        text: "Products, blogs, videos sab ek jagah dekhna easy ho gaya. Overall page design bahut sundar bana hai."
    }
];

const videoItems = [
    {
        title: "Daily Astrology Guidance",
        description: "Watch a sample spiritual video with a real YouTube thumbnail. Future links can be added to the same array.",
        url: "https://youtu.be/SyqgAt-T0iQ?si=5nkmY-a5iSJEzV35"
    },
    {
        title: "Weekly Energy Insights",
        description: "Placeholder-ready card for another YouTube link from your admin panel later.",
        url: ""
    },
    {
        title: "Remedy and Ritual Tips",
        description: "Use this slot for stronger remedy guidance or puja-related video explainers.",
        url: ""
    },
    {
        title: "Relationship and Horoscope Reading",
        description: "Another future-ready video block so you can keep extending the gallery without changing markup.",
        url: ""
    },
    {
        title: "Career and Prosperity Astrology",
        description: "Ideal for a future business-growth or career-timing astrology video.",
        url: ""
    }
];

const products = [
    {
        title: "5 Mukhi Rudraksha White Crystal Bracelet",
        description: "The five Mukhi Rudraksha brings positive energy to the wearer. This Rudraksha improves the respiratory...",
        price: "₹ 80",
        seller: "Energised spiritual product",
        images: [
            "./assets/images/astromallProduct_291713351741.png",
            "./assets/images/images.jpg"
        ]
    },
    {
        title: "Green Cut Natural Emerald Beryl Gemstone",
        description: "barmunda gems Green Cut Natural Emerald Beryl Gemstone (11.5 carat)",
        price: "Selling at ₹ 4500",
        seller: "Customer image",
        images: [
            "./assets/images/astromallProduct_281709056206.png",
            "./assets/images/images.jpg"
        ]
    },
    {
        title: "Gold Art India Lord Ganesha Decorative Gift",
        description: "Lord Ganesha for Gift Ganesha for car Dashboard Ganesha Showpiece Diwali Gifts Birthday Gifts Decorative...",
        price: "Selling at ₹ 750",
        seller: "Customer image",
        images: [
            "./assets/images/astromallProduct_271709056132.png",
            "./assets/images/images.jpg"
        ]
    }
];

const blogs = [
    {
        tag: "testing",
        title: "Best Astrologer in Varanasi 2025: Real Predictions by Sarica Ji That Work HELLO",
        excerpt: "Read More ->",
        image: "./assets/images/blog_85_1760531089.jpg",
        link: "#"
    },
    {
        tag: "Best Astrologer in Varanasi 2025: Real Predictions by Sarica Ji That Work HELLO",
        title: "Best Astrologer in Varanasi 2025: Real Predictions by Sarica Ji That Work HELLO",
        excerpt: "efsd",
        image: "./assets/images/blog_611759214029.jpg",
        link: "#"
    },
    {
        tag: "9 Names of Shri Krishna and the Stories Behind Them Shri Krishna loved deities of Sanatan Dharma",
        title: "9 Names of Shri Krishna and the Stories Behind Them",
        excerpt: "But have you ever thought why there are so many names to call Krishna? Is it...",
        image: "./assets/images/blog_551752043771.jpg",
        link: "#"
    }
];

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

const renderZodiacCards = () => {
    if (!zodiacGrid) {
        return;
    }

    zodiacGrid.innerHTML = "";

    zodiacSigns.forEach((sign) => {
        const card = document.createElement("a");
        card.className = "gallery-zodiac-card";
        card.href = "horoscope.html";

        const art = document.createElement("div");
        art.className = "gallery-zodiac-art";
        art.style.setProperty("--zodiac-start", sign.start);
        art.style.setProperty("--zodiac-end", sign.end);

        const icon = document.createElement("span");
        icon.className = "gallery-zodiac-icon";
        icon.textContent = sign.short;

        art.append(icon);

        const title = document.createElement("h3");
        title.textContent = sign.name;

        const subtitle = document.createElement("p");
        subtitle.className = "gallery-zodiac-subtitle";
        subtitle.textContent = sign.name;

        card.append(art, title, subtitle);
        zodiacGrid.append(card);
    });
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
    if (!track || !items.length) {
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
            title.textContent = item.title;

            const description = document.createElement("p");
            description.textContent = item.description;

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

const initializeProductCarousel = (gallery, images) => {
    const track = gallery.querySelector(".gallery-product-track");
    const prevButton = gallery.querySelector("[data-product-prev]");
    const nextButton = gallery.querySelector("[data-product-next]");
    const dots = Array.from(gallery.querySelectorAll(".gallery-product-dot"));

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
        timerId = window.setInterval(next, 2000);
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

    products.forEach((product) => {
        const card = document.createElement("article");
        card.className = "gallery-product-card";

        const gallery = document.createElement("div");
        gallery.className = "gallery-product-gallery";

        const track = document.createElement("div");
        track.className = "gallery-product-track";

        product.images.forEach((imagePath) => {
            const image = document.createElement("div");
            image.className = "gallery-product-image";
            image.style.backgroundImage = `url("${imagePath}")`;
            track.append(image);
        });

        const navs = document.createElement("div");
        navs.className = "gallery-product-navs";

        const prevButton = document.createElement("button");
        prevButton.type = "button";
        prevButton.className = "gallery-product-nav";
        prevButton.dataset.productPrev = "true";
        prevButton.textContent = "Prev";

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "gallery-product-nav";
        nextButton.dataset.productNext = "true";
        nextButton.textContent = "Next";

        navs.append(prevButton, nextButton);

        const dots = document.createElement("div");
        dots.className = "gallery-product-dots";

        product.images.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "gallery-product-dot";
            dot.setAttribute("aria-label", `Product image ${index + 1}`);
            dots.append(dot);
        });

        gallery.append(track, navs, dots);

        const meta = document.createElement("span");
        meta.className = "gallery-product-meta";
        meta.textContent = product.seller;

        const title = document.createElement("h3");
        title.textContent = product.title;

        const description = document.createElement("p");
        description.textContent = product.description;

        const price = document.createElement("div");
        price.className = "gallery-product-price";
        price.textContent = product.price;

        const actions = document.createElement("div");
        actions.className = "gallery-product-actions";

        const buyButton = document.createElement("button");
        buyButton.type = "button";
        buyButton.className = "gallery-product-action is-primary";
        buyButton.textContent = "Buy Now";

        const shareButton = document.createElement("button");
        shareButton.type = "button";
        shareButton.className = "gallery-product-action";
        shareButton.textContent = "Share";
        shareButton.addEventListener("click", async () => {
            const shareText = `${product.title} - ${product.price}`;
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: product.title,
                        text: shareText
                    });
                    return;
                } catch (error) {
                    // Fallback to clipboard below when share is cancelled or unavailable.
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

        actions.append(buyButton, shareButton);
        card.append(gallery, meta, title, description, price, actions);
        productsGrid.append(card);

        initializeProductCarousel(gallery, product.images);
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
            link.textContent = "Read More ->";

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

renderZodiacCards();
renderReviewMarquee();
renderVideoCarousel();
renderProducts();
renderBlogCarousel();
initializeAccordion();
