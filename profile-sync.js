(function () {
    const API_URL = "/api";
    const TOKEN_KEY = "tmToken";
    const USER_KEY = "tmUser";
    const DEFAULT_PROFILE_ICON = "./assets/images/ic_user_profile.svg";
    const DEFAULT_DRAWER_TITLE = "Welcome to Thanathu Madom Devasthanam";
    const DEFAULT_DRAWER_SUBTITLE = "Thanathu Madom Devasthanam";
    const REPORT_LINK_SELECTOR = ".drawer-item--reports";

    const ensureReportsDrawerLink = () => {
        document.querySelectorAll(".profile-drawer-body").forEach((drawerBody) => {
            if (!drawerBody || drawerBody.querySelector(REPORT_LINK_SELECTOR)) {
                return;
            }

            const reportLink = document.createElement("a");
            reportLink.href = "report.html";
            reportLink.className = "drawer-item drawer-item--reports";
            reportLink.innerHTML = `
                <span class="drawer-left">
                    <span class="drawer-icon reports-item-icon"></span>
                    <span class="drawer-label-group">
                        <span>My Reports</span>
                    </span>
                    <span class="drawer-report-badge" hidden>0</span>
                </span>
                <span class="drawer-arrow"></span>
            `;

            const anchorAfter = drawerBody.querySelector('a[href="kundali-matching.html"]');

            if (anchorAfter?.parentNode === drawerBody) {
                anchorAfter.insertAdjacentElement("afterend", reportLink);
                return;
            }

            const serviceHeading = Array.from(drawerBody.querySelectorAll("h4")).find((node) =>
                String(node.textContent || "").toLowerCase().includes("services")
            );

            if (serviceHeading) {
                serviceHeading.insertAdjacentElement("beforebegin", reportLink);
                return;
            }

            drawerBody.appendChild(reportLink);
        });
    };

    const setReportBadge = (count = 0) => {
        const safeCount = Number.isFinite(Number(count)) ? Math.max(0, Number(count)) : 0;

        document.querySelectorAll(".drawer-report-badge").forEach((badge) => {
            badge.textContent = safeCount > 99 ? "99+" : String(safeCount);
            badge.hidden = safeCount <= 0;
        });

        document.querySelectorAll(".profileicons").forEach((icon) => {
            icon.classList.toggle("has-report-notification", safeCount > 0);

            if (safeCount > 0) {
                icon.setAttribute("data-report-count", safeCount > 99 ? "99+" : String(safeCount));
            } else {
                icon.removeAttribute("data-report-count");
            }
        });
    };

    const normalizeStoredUser = (user) => {
        if (!user || typeof user !== "object") {
            return null;
        }

        return {
            id: user.id || user._id || "",
            name: String(user.name || "").trim(),
            email: String(user.email || "").trim(),
            profilePhoto: String(user.profilePhoto || "").trim(),
            whatsappNumber: String(user.whatsappNumber || "").trim(),
            isVerified: !!user.isVerified
        };
    };

    const loadStoredUser = () => {
        try {
            return normalizeStoredUser(JSON.parse(localStorage.getItem(USER_KEY) || "null"));
        } catch (error) {
            localStorage.removeItem(USER_KEY);
            return null;
        }
    };

    const saveUser = (user) => {
        const normalized = normalizeStoredUser(user);

        if (!normalized) {
            localStorage.removeItem(USER_KEY);
            return null;
        }

        localStorage.setItem(USER_KEY, JSON.stringify(normalized));
        return normalized;
    };

    const resetProfileIcon = (node) => {
        node.style.backgroundImage = `url("${DEFAULT_PROFILE_ICON}")`;
        node.style.backgroundSize = "52%";
        node.style.backgroundPosition = "center";
        node.style.backgroundRepeat = "no-repeat";
        node.style.backgroundColor = "#fff7f0";
    };

    const applyProfileToNav = (user) => {
        const normalized = normalizeStoredUser(user);
        const drawerTitle = document.querySelector(".profile-drawer-header h3");
        const drawerSubtitle = document.querySelector(".profile-drawer-header p");
        const profileIcons = document.querySelectorAll(".profileicons");

        if (!normalized) {
            if (drawerTitle) {
                drawerTitle.textContent = DEFAULT_DRAWER_TITLE;
            }

            if (drawerSubtitle) {
                drawerSubtitle.textContent = DEFAULT_DRAWER_SUBTITLE;
            }

            profileIcons.forEach(resetProfileIcon);
            return;
        }

        if (drawerTitle) {
            drawerTitle.textContent = normalized.name
                ? `Welcome, ${normalized.name}`
                : DEFAULT_DRAWER_TITLE;
        }

        if (drawerSubtitle) {
            drawerSubtitle.textContent = normalized.email || DEFAULT_DRAWER_SUBTITLE;
        }

        profileIcons.forEach((node) => {
            if (normalized.profilePhoto) {
                node.style.backgroundImage = `url("${normalized.profilePhoto}")`;
                node.style.backgroundSize = "cover";
                node.style.backgroundPosition = "center";
                node.style.backgroundRepeat = "no-repeat";
                node.style.backgroundColor = "#ffffff";
                return;
            }

            resetProfileIcon(node);
        });
    };

    const fetchProfile = async () => {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            localStorage.removeItem(USER_KEY);
            applyProfileToNav(null);
            return null;
        }

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

            const user = saveUser(data.user);
            applyProfileToNav(user);
            return user;
        } catch (error) {
            if (String(error.message || "").toLowerCase().includes("not authorized")) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                applyProfileToNav(null);
            }

            return null;
        }
    };

    const fetchReportSummary = async () => {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            setReportBadge(0);
            return null;
        }

        try {
            const response = await fetch(`${API_URL}/user/reports/summary`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to load report summary");
            }

            setReportBadge(data.data?.unseenReports || 0);
            return data.data || null;
        } catch (error) {
            setReportBadge(0);
            return null;
        }
    };

    window.tmProfileSync = {
        applyProfileToNav,
        fetchProfile,
        fetchReportSummary,
        loadStoredUser,
        saveUser,
        refreshReportSummary: fetchReportSummary
    };

    ensureReportsDrawerLink();

    const cachedUser = loadStoredUser();

    if (cachedUser) {
        applyProfileToNav(cachedUser);
    } else {
        applyProfileToNav(null);
    }

    if (localStorage.getItem(TOKEN_KEY)) {
        fetchProfile();
        fetchReportSummary();
    } else {
        setReportBadge(0);
    }
})();
