const initializeJanamNavbar = () => {
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

initializeJanamNavbar();

const janamForm = document.getElementById("janamKundaliForm");
const janamFeedback = document.querySelector("[data-janam-feedback]");

const fillSelectOptions = (select, options, placeholder) => {
    if (!select) {
        return;
    }

    select.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    select.append(placeholderOption);

    options.forEach((optionData) => {
        const option = document.createElement("option");
        option.value = optionData.value;
        option.textContent = optionData.label;
        select.append(option);
    });
};

const buildOptionRange = (start, end, formatter) => {
    const list = [];
    const step = start <= end ? 1 : -1;

    for (let value = start; step > 0 ? value <= end : value >= end; value += step) {
        list.push({
            value: formatter(value),
            label: formatter(value)
        });
    }

    return list;
};

const initializeJanamForm = () => {
    if (!janamForm) {
        return;
    }

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    const currentYear = new Date().getFullYear();
    const dayOptions = buildOptionRange(1, 31, (value) => String(value).padStart(2, "0"));
    const monthOptions = monthNames.map((monthName, index) => {
        return {
            value: String(index + 1).padStart(2, "0"),
            label: monthName
        };
    });
    const yearOptions = buildOptionRange(currentYear, 1950, (value) => String(value));
    const hourOptions = buildOptionRange(0, 23, (value) => String(value).padStart(2, "0"));
    const minuteOptions = buildOptionRange(0, 59, (value) => String(value).padStart(2, "0"));

    janamForm.querySelectorAll("[data-janam-day]").forEach((select) => {
        fillSelectOptions(select, dayOptions, "DD");
    });

    janamForm.querySelectorAll("[data-janam-month]").forEach((select) => {
        fillSelectOptions(select, monthOptions, "MM");
    });

    janamForm.querySelectorAll("[data-janam-year]").forEach((select) => {
        fillSelectOptions(select, yearOptions, "YYYY");
    });

    janamForm.querySelectorAll("[data-janam-hour]").forEach((select) => {
        fillSelectOptions(select, hourOptions, "Hour");
    });

    janamForm.querySelectorAll("[data-janam-minute]").forEach((select) => {
        fillSelectOptions(select, minuteOptions, "Minute");
    });

    janamForm.querySelectorAll("[data-janam-time-unknown]").forEach((checkbox) => {
        const timeField = checkbox.closest(".janam-field");
        const relatedSelects = timeField ? timeField.querySelectorAll("select") : [];

        const syncTimeState = () => {
            const shouldDisable = checkbox.checked;

            relatedSelects.forEach((select) => {
                select.disabled = shouldDisable;
                select.required = !shouldDisable;

                if (shouldDisable) {
                    select.value = "";
                }
            });
        };

        checkbox.addEventListener("change", syncTimeState);
        syncTimeState();
    });

    const whatsappInput = janamForm.querySelector('input[name="whatsappNumber"]');

    whatsappInput?.addEventListener("input", () => {
        whatsappInput.value = whatsappInput.value.replace(/\D/g, "").slice(0, 10);
    });
};

const showJanamFeedback = (message, state) => {
    if (!janamFeedback) {
        return;
    }

    janamFeedback.hidden = false;
    janamFeedback.textContent = message;
    janamFeedback.dataset.feedbackState = state;
};

const collectJanamPayload = (form) => {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (payload.timeUnknown === "on") {
        payload.birthHour = "unknown";
        payload.birthMinute = "unknown";
    }

    return payload;
};

const handleJanamSubmit = () => {
    if (!janamForm) {
        return;
    }

    janamForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!janamForm.reportValidity()) {
            showJanamFeedback(
                "Please fill in all required Janam Kundali details correctly before submitting.",
                "error"
            );
            return;
        }

        const payload = collectJanamPayload(janamForm);
        const paymentUrl = janamForm.dataset.paymentUrl?.trim() || "";

        sessionStorage.setItem("freeJanamKundaliLead", JSON.stringify(payload));

        showJanamFeedback(
            "Details submitted successfully. Your Free Janam Kundali information is saved, and you can now connect this flow to your payment page whenever you want.",
            "success"
        );

        janamFeedback?.scrollIntoView({ behavior: "smooth", block: "nearest" });

        if (!paymentUrl) {
            return;
        }

        const paymentDestination = new URL(paymentUrl, window.location.href);
        paymentDestination.searchParams.set("service", "free-janam-kundali");
        paymentDestination.searchParams.set("price", "300");
        paymentDestination.searchParams.set("whatsapp", payload.whatsappNumber || "");

        window.setTimeout(() => {
            window.location.href = paymentDestination.toString();
        }, 700);
    });
};

const initializeJanamFaq = () => {
    document.querySelectorAll(".janam-faq-item").forEach((faqItem) => {
        const toggle = faqItem.querySelector(".janam-faq-toggle");

        toggle?.addEventListener("click", () => {
            const isOpen = faqItem.classList.contains("is-open");

            document.querySelectorAll(".janam-faq-item.is-open").forEach((openItem) => {
                openItem.classList.remove("is-open");
            });

            if (!isOpen) {
                faqItem.classList.add("is-open");
            }
        });
    });
};

const animateJanamPage = () => {
    if (typeof gsap === "undefined") {
        return;
    }

    const targets = document.querySelectorAll(
        ".janam-hero, .janam-feature-grid > *, .janam-form-section, .janam-benefits-section, .janam-create-section, .janam-dosha-banner, .janam-faq-section"
    );

    gsap.from(targets, {
        opacity: 0,
        y: 28,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out"
    });
};

initializeJanamForm();
handleJanamSubmit();
initializeJanamFaq();
animateJanamPage();
