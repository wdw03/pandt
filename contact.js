const initializeContactNavbar = () => {
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

initializeContactNavbar();

const contactServicesGrid = document.querySelector("[data-contact-services-grid]");
const contactSocialGrid = document.querySelector("[data-contact-social-grid]");
const contactSupportForm = document.getElementById("contactSupportForm");
const contactFeedback = document.querySelector("[data-contact-feedback]");

const serviceItems = [
    {
        title: "Online Vedic Puja",
        body: "Book authentic Vedic Puja and Homam rituals performed by experienced Kerala priests with personal sankalp and sacred procedure.",
        image: "./assets/images/lakshmipooja.jpg",
        href: "pooja.html",
        button: "Open Puja Service"
    },
    {
        title: "Online Astrology Consultation",
        body: "Connect for kundali guidance, prediction-based support, and detailed spiritual direction from trusted Thanathu Madom services.",
        image: "./assets/images/home-analyze.png",
        href: "kundali-matching.html",
        button: "Open Astrology Service"
    },
    {
        title: "Online Energy Healing",
        body: "Reach out through the consultation form for healing-related support and guided spiritual assistance from the comfort of your home.",
        image: "./assets/images/gharouaj.jpg",
        href: "#consultation-form",
        button: "Ask for Energy Healing"
    }
];

const socialItems = [
    {
        icon: "YT",
        title: "Click to Join Youtube Channel",
        caption: "Open YouTube",
        href: "https://www.youtube.com/"
    },
    {
        icon: "WA",
        title: "Click to Join WhatsApp Channel",
        caption: "Open WhatsApp",
        href: "https://www.whatsapp.com/"
    },
    {
        icon: "FB",
        title: "Click to Join Facebook Page",
        caption: "Open Facebook",
        href: "https://www.facebook.com/"
    },
    {
        icon: "IG",
        title: "Click to Join Instagram",
        caption: "Open Instagram",
        href: "https://www.instagram.com/"
    }
];

const renderContactServices = () => {
    if (!contactServicesGrid) {
        return;
    }

    contactServicesGrid.innerHTML = "";

    serviceItems.forEach((service) => {
        const card = document.createElement("article");
        card.className = "contact-service-card";

        const visual = document.createElement("div");
        visual.className = "contact-service-visual";

        const image = document.createElement("div");
        image.className = "contact-service-image";
        image.style.backgroundImage = `linear-gradient(rgba(16, 8, 2, 0.08), rgba(16, 8, 2, 0.18)), url("${service.image}")`;

        visual.append(image);

        const title = document.createElement("h3");
        title.textContent = service.title;

        const body = document.createElement("p");
        body.textContent = service.body;

        const link = document.createElement("a");
        link.className = "contact-service-btn";
        link.href = service.href;
        link.textContent = service.button;

        card.append(visual, title, body, link);
        contactServicesGrid.append(card);
    });
};

const renderContactSocials = () => {
    if (!contactSocialGrid) {
        return;
    }

    contactSocialGrid.innerHTML = "";

    socialItems.forEach((item) => {
        const link = document.createElement("a");
        link.className = "contact-social-link";
        link.href = item.href;
        link.target = "_blank";
        link.rel = "noreferrer";

        const icon = document.createElement("span");
        icon.className = "contact-icon-badge";
        icon.textContent = item.icon;

        const copy = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = item.title;

        const caption = document.createElement("p");
        caption.textContent = item.caption;

        copy.append(title, caption);
        link.append(icon, copy);
        contactSocialGrid.append(link);
    });
};

if (contactSupportForm) {
    contactSupportForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(contactSupportForm);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const message = String(formData.get("message") || "").trim();

        if (!name || !email || !message) {
            if (contactFeedback) {
                contactFeedback.textContent = "Please fill in all fields before sending your message.";
                contactFeedback.style.color = "#b34b1e";
            }
            return;
        }

        if (contactFeedback) {
            contactFeedback.textContent = `Thank you, ${name}. Your message has been recorded and we will reach out soon.`;
            contactFeedback.style.color = "#3f7a2a";
        }

        contactSupportForm.reset();
    });
}

renderContactServices();
renderContactSocials();
