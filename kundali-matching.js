const initializeKundaliNavbar = () => {
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

initializeKundaliNavbar();

const kundaliForm = document.getElementById("kundaliMatchingForm");
const feedbackElement = document.querySelector("[data-kundali-feedback]");

const populateSelectOptions = (select, options, placeholder) => {
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

const buildRangeOptions = (start, end, formatter) => {
    const values = [];
    const direction = start <= end ? 1 : -1;

    for (let value = start; direction > 0 ? value <= end : value >= end; value += direction) {
        values.push({
            value: formatter(value, "value"),
            label: formatter(value, "label")
        });
    }

    return values;
};

const initializeKundaliForm = () => {
    if (!kundaliForm) {
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

    const dayOptions = buildRangeOptions(1, 31, (value, type) => {
        return String(value).padStart(2, "0");
    });
    const monthOptions = monthNames.map((monthName, index) => {
        return {
            value: String(index + 1).padStart(2, "0"),
            label: monthName
        };
    });
    const yearOptions = buildRangeOptions(currentYear, 1950, (value) => String(value));
    const hourOptions = buildRangeOptions(0, 23, (value) => String(value).padStart(2, "0"));
    const minuteOptions = buildRangeOptions(0, 59, (value) => String(value).padStart(2, "0"));

    kundaliForm.querySelectorAll("[data-kundali-day]").forEach((select) => {
        populateSelectOptions(select, dayOptions, "DD");
    });

    kundaliForm.querySelectorAll("[data-kundali-month]").forEach((select) => {
        populateSelectOptions(select, monthOptions, "MM");
    });

    kundaliForm.querySelectorAll("[data-kundali-year]").forEach((select) => {
        populateSelectOptions(select, yearOptions, "YYYY");
    });

    kundaliForm.querySelectorAll("[data-kundali-hour]").forEach((select) => {
        populateSelectOptions(select, hourOptions, "Hour");
    });

    kundaliForm.querySelectorAll("[data-kundali-minute]").forEach((select) => {
        populateSelectOptions(select, minuteOptions, "Minute");
    });

    kundaliForm.querySelectorAll("[data-kundali-time-unknown]").forEach((checkbox) => {
        const timeField = checkbox.closest(".kundali-field");
        const relatedSelects = timeField ? timeField.querySelectorAll("select") : [];

        const syncUnknownTimeState = () => {
            const shouldDisable = checkbox.checked;

            relatedSelects.forEach((select) => {
                select.disabled = shouldDisable;
                select.required = !shouldDisable;

                if (shouldDisable) {
                    select.value = "";
                }
            });

            timeField?.classList.toggle("is-time-unknown", shouldDisable);
        };

        checkbox.addEventListener("change", syncUnknownTimeState);
        syncUnknownTimeState();
    });

    const whatsappInput = kundaliForm.querySelector('input[name="whatsappNumber"]');

    whatsappInput?.addEventListener("input", () => {
        whatsappInput.value = whatsappInput.value.replace(/\D/g, "").slice(0, 10);
    });
};

const showKundaliFeedback = (message, state) => {
    if (!feedbackElement) {
        return;
    }

    feedbackElement.hidden = false;
    feedbackElement.textContent = message;
    feedbackElement.dataset.feedbackState = state;
};

const collectKundaliPayload = (form) => {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (payload.boyTimeUnknown === "on") {
        payload.boyBirthHour = "unknown";
        payload.boyBirthMinute = "unknown";
    }

    if (payload.girlTimeUnknown === "on") {
        payload.girlBirthHour = "unknown";
        payload.girlBirthMinute = "unknown";
    }

    return payload;
};

const handleKundaliSubmit = () => {
    if (!kundaliForm) {
        return;
    }

    kundaliForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!kundaliForm.reportValidity()) {
            showKundaliFeedback(
                "Please fill in all required details correctly before submitting the Kundali Matching form.",
                "error"
            );
            return;
        }

        const payload = collectKundaliPayload(kundaliForm);
        const paymentUrl = kundaliForm.dataset.paymentUrl?.trim() || "";

        sessionStorage.setItem("kundaliMatchingLead", JSON.stringify(payload));

        showKundaliFeedback(
            "Details submitted successfully. Your Kundali Matching information is ready, and you can now connect this form to your payment page redirect whenever you want.",
            "success"
        );

        feedbackElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });

        if (!paymentUrl) {
            return;
        }

        const paymentDestination = new URL(paymentUrl, window.location.href);
        paymentDestination.searchParams.set("service", "kundali-matching");
        paymentDestination.searchParams.set("price", "800");
        paymentDestination.searchParams.set("whatsapp", payload.whatsappNumber || "");

        window.setTimeout(() => {
            window.location.href = paymentDestination.toString();
        }, 700);
    });
};

const animateKundaliPage = () => {
    if (typeof gsap === "undefined") {
        return;
    }

    const targets = document.querySelectorAll(
        ".kundali-hero, .kundali-intro-grid > *, .kundali-form-section, .kundali-analysis-banner, .kundali-process-section, .kundali-guidance-section"
    );

    gsap.from(targets, {
        opacity: 0,
        y: 28,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out"
    });
};

initializeKundaliForm();
handleKundaliSubmit();
animateKundaliPage();
