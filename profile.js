const initializeProfileNavbar = () => {
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

initializeProfileNavbar();

const API_URL = "/api";
const token = localStorage.getItem("tmToken");

if (!token) {
    window.location.href = "login.html";
}

const profileForm = document.getElementById("profileForm");
const feedbackNode = document.querySelector("[data-profile-feedback]");
const avatarNode = document.getElementById("profileAvatarPreview");
const avatarInitialsNode = document.getElementById("profileAvatarInitials");
const nameInput = document.getElementById("profileName");
const emailInput = document.getElementById("profileEmail");
const whatsappInput = document.getElementById("profileWhatsapp");
const displayNameNode = document.getElementById("profileDisplayName");
const displayEmailNode = document.getElementById("profileDisplayEmail");
const verificationStateNode = document.getElementById("profileVerificationState");
const whatsappStateNode = document.getElementById("profileWhatsappState");
const photoInput = document.getElementById("profilePhotoInput");
const removePhotoButton = document.getElementById("removeProfilePhotoBtn");
const logoutButton = document.getElementById("logoutBtn");

let pendingProfilePhoto = "";
const PROFILE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
const PROFILE_IMAGE_MAX_DIMENSION = 720;

const setFeedback = (message, color) => {
    if (!feedbackNode) {
        return;
    }

    feedbackNode.textContent = message;
    feedbackNode.style.color = color;
};

const getInitials = (name = "") => {
    const parts = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (!parts.length) {
        return "TM";
    }

    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
};

const normaliseWhatsapp = (value = "") => {
    return String(value || "").replace(/\D/g, "").slice(0, 15);
};

const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(String(reader.result || ""));
        };

        reader.onerror = () => {
            reject(new Error("Unable to read the selected image."));
        };

        reader.readAsDataURL(file);
    });
};

const compressImageDataUrl = (dataUrl, mimeType) => {
    if (mimeType === "image/gif" || mimeType === "image/svg+xml") {
        return Promise.resolve(dataUrl);
    }

    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
            const scale = Math.min(
                1,
                PROFILE_IMAGE_MAX_DIMENSION / Math.max(image.width || 1, image.height || 1)
            );
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));

            const context = canvas.getContext("2d");

            if (!context) {
                resolve(dataUrl);
                return;
            }

            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.86));
        };

        image.onerror = () => {
            reject(new Error("Unable to process the selected image."));
        };

        image.src = dataUrl;
    });
};

const updateAvatarPreview = (photo, name) => {
    if (!avatarNode || !avatarInitialsNode) {
        return;
    }

    if (photo) {
        avatarNode.style.backgroundImage = `url("${photo}")`;
        avatarNode.style.backgroundSize = "cover";
        avatarNode.style.backgroundPosition = "center";
        avatarInitialsNode.style.display = "none";
    } else {
        avatarNode.style.backgroundImage = "";
        avatarNode.style.backgroundSize = "";
        avatarNode.style.backgroundPosition = "";
        avatarInitialsNode.textContent = getInitials(name);
        avatarInitialsNode.style.display = "block";
    }
};

const populateProfile = (user) => {
    const profileName = user?.name || "";
    const profileEmail = user?.email || "";
    const profileWhatsapp = user?.whatsappNumber || "";
    const profilePhoto = user?.profilePhoto || "";

    pendingProfilePhoto = profilePhoto;

    if (nameInput) {
        nameInput.value = profileName;
    }

    if (emailInput) {
        emailInput.value = profileEmail;
    }

    if (whatsappInput) {
        whatsappInput.value = profileWhatsapp;
    }

    if (displayNameNode) {
        displayNameNode.textContent = profileName || "Thanathu Member";
    }

    if (displayEmailNode) {
        displayEmailNode.textContent = profileEmail || "your-email@example.com";
    }

    if (verificationStateNode) {
        verificationStateNode.textContent = user?.isVerified ? "Verified Account" : "Pending Verification";
    }

    if (whatsappStateNode) {
        whatsappStateNode.textContent = profileWhatsapp || "Not added yet";
    }

    updateAvatarPreview(profilePhoto, profileName);

    if (window.tmProfileSync) {
        window.tmProfileSync.saveUser(user);
        window.tmProfileSync.applyProfileToNav(user);
    }
};

const fetchProfile = async () => {
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load profile");
        }

        populateProfile(data.user);
    } catch (error) {
        if (String(error.message || "").toLowerCase().includes("not authorized")) {
            localStorage.removeItem("tmToken");
            localStorage.removeItem("tmUser");
            window.location.href = "login.html";
            return;
        }

        setFeedback(error.message || "Unable to load profile right now.", "#b34b1e");
    }
};

const cachedProfileUser = window.tmProfileSync?.loadStoredUser?.();

if (cachedProfileUser) {
    populateProfile(cachedProfileUser);
}

if (photoInput) {
    photoInput.addEventListener("change", async () => {
        const file = photoInput.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setFeedback("Please choose a valid image file.", "#b34b1e");
            return;
        }

        if (file.size > PROFILE_IMAGE_MAX_BYTES) {
            setFeedback("Please choose an image smaller than 4 MB.", "#b34b1e");
            photoInput.value = "";
            return;
        }

        try {
            setFeedback("Optimising your profile photo...", "#7b5a21");
            const rawImage = await readFileAsDataUrl(file);
            pendingProfilePhoto = await compressImageDataUrl(rawImage, file.type);
            updateAvatarPreview(pendingProfilePhoto, nameInput?.value || "");
            setFeedback("Profile photo selected. Save profile to keep the change.", "#7b5a21");
        } catch (error) {
            setFeedback(error.message || "Unable to process your image right now.", "#b34b1e");
            photoInput.value = "";
        }
    });
}

if (removePhotoButton) {
    removePhotoButton.addEventListener("click", () => {
        pendingProfilePhoto = "";
        updateAvatarPreview("", nameInput?.value || "");
        setFeedback("Profile photo removed. Save profile to update your account.", "#7b5a21");
    });
}

if (nameInput) {
    nameInput.addEventListener("input", () => {
        if (!pendingProfilePhoto) {
            updateAvatarPreview("", nameInput.value);
        }

        if (displayNameNode) {
            displayNameNode.textContent = nameInput.value.trim() || "Thanathu Member";
        }
    });
}

if (whatsappInput) {
    whatsappInput.addEventListener("input", () => {
        whatsappInput.value = normaliseWhatsapp(whatsappInput.value);

        if (whatsappStateNode) {
            whatsappStateNode.textContent = whatsappInput.value.trim() || "Not added yet";
        }
    });
}

if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {
            name: String(nameInput?.value || "").trim(),
            whatsappNumber: normaliseWhatsapp(whatsappInput?.value || ""),
            profilePhoto: pendingProfilePhoto
        };

        if (!payload.name) {
            setFeedback("Please enter your name before saving.", "#b34b1e");
            return;
        }

        setFeedback("Saving your profile...", "#7b5a21");

        try {
            const response = await fetch(`${API_URL}/user/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to save profile");
            }

            populateProfile(data.user);
            setFeedback("Profile updated successfully.", "#3f7a2a");
        } catch (error) {
            setFeedback(error.message || "Unable to save your profile right now.", "#b34b1e");
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("tmToken");
        localStorage.removeItem("tmUser");
        window.location.href = "login.html";
    });
}

fetchProfile();
