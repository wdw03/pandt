const toggle = document.getElementById("profileToggle");
const drawer = document.getElementById("profileDrawer");
const overlay = document.getElementById("drawerOverlay");

const items = document.querySelectorAll(
    ".profile-drawer h3, .profile-drawer p, .profile-drawer h4, .drawer-item, .footer-btn"
);

let isOpen = false;

// initial state
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

gsap.set(items, {
    opacity: 0,
    y: 20
});

function openDrawer() {
    isOpen = true;

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

    gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.05,
        delay: 0.1,
        ease: "power2.out"
    });
}

function closeDrawer() {
    isOpen = false;

    gsap.to(items, {
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
}

toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    isOpen ? closeDrawer() : openDrawer();
});

overlay.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
        closeDrawer();
    }
});


const kundaliToggle = document.getElementById("kundaliToggle");
const kundaliSubmenu = document.getElementById("kundaliSubmenu");
const kundaliAccordion = document.getElementById("kundaliAccordion");

gsap.set(kundaliSubmenu, {
    height: 0,
    opacity: 0,
    display: "none"
});

let kundaliOpen = false;

kundaliToggle.addEventListener("click", () => {
    kundaliOpen = !kundaliOpen;

    if (kundaliOpen) {
        kundaliAccordion.classList.add("open");
        gsap.set(kundaliSubmenu, { display: "flex" });
        gsap.fromTo(
            kundaliSubmenu,
            { height: 0, opacity: 0 },
            {
                height: "auto",
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            }
        );
    } else {
        kundaliAccordion.classList.remove("open");
        gsap.to(kundaliSubmenu, {
            height: 0,
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                gsap.set(kundaliSubmenu, { display: "none" });
            }
        });
    }
});