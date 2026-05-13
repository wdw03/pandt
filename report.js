const initializeReportNavbar = () => {
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

initializeReportNavbar();

const API_URL = "/api";
const token = localStorage.getItem("tmToken");

if (!token) {
    window.location.href = "login.html";
}

const reportListNode = document.querySelector("[data-report-list]");
const reportFeedbackNode = document.querySelector("[data-report-feedback]");
const totalReportsNode = document.querySelector("[data-report-total]");
const readyReportsNode = document.querySelector("[data-report-ready]");
const unseenReportsNode = document.querySelector("[data-report-unseen]");

const escapeHtml = (value = "") => {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
};

const openProtectedUserFile = async (endpoint = "", suggestedName = "report", forceDownload = false) => {
    const response = await fetch(`${endpoint}${forceDownload ? "?download=1" : ""}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Unable to open your report file right now.");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    if (forceDownload) {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = suggestedName || "report";
        document.body.appendChild(link);
        link.click();
        link.remove();
    } else {
        window.open(objectUrl, "_blank", "noopener");
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
};

const setReportFeedback = (message = "", color = "#4b3a28", visible = true) => {
    if (!reportFeedbackNode) {
        return;
    }

    reportFeedbackNode.textContent = message;
    reportFeedbackNode.style.color = color;
    reportFeedbackNode.hidden = !visible || !message;
};

const statusClassName = (status = "") => {
    const safeStatus = String(status || "").toLowerCase();

    if (safeStatus === "completed") {
        return "report-status-chip report-status-chip--completed";
    }

    if (safeStatus === "processing") {
        return "report-status-chip report-status-chip--processing";
    }

    return "report-status-chip report-status-chip--pending";
};

const renderEmptyState = () => {
    if (!reportListNode) {
        return;
    }

    reportListNode.innerHTML = `
        <article class="report-empty-state">
            <span class="report-section-tag">Nothing Yet</span>
            <h3>No reports have been submitted from this account yet.</h3>
            <p>Once you submit Kundali Matching or Janam Kundali details, the request will appear here. When the admin uploads your PDF or image report, it will show up with direct view and download buttons.</p>
            <div class="report-card-actions">
                <a href="kundali-matching.html" class="report-primary-btn">Submit Kundali Matching</a>
                <a href="free-janam-kundali.html" class="report-secondary-btn">Submit Janam Kundali</a>
            </div>
        </article>
    `;
};

const renderReports = (reports = []) => {
    if (!reportListNode) {
        return;
    }

    if (!reports.length) {
        renderEmptyState();
        return;
    }

    reportListNode.innerHTML = reports.map((entry) => {
        const hasReport = !!entry.report?.hasFile;
        const birthPlace = entry.type === "matching"
            ? [entry.boyData?.birthCity, entry.girlData?.birthCity].filter(Boolean).join(" / ")
            : entry.singleData?.birthPlace || "-";
        const title = entry.displayName || (entry.type === "matching" ? "Kundali Matching Submission" : "Janam Kundali Submission");
        const readyLabel = hasReport
            ? (entry.report?.isSeen ? "Viewed" : "New Report")
            : "Pending Upload";

        return `
            <article class="report-card">
                <div class="report-card-head">
                    <div>
                        <span class="report-type-chip">${escapeHtml(entry.type === "matching" ? "Kundali Matching" : "Janam Kundali")}</span>
                        <h3>${escapeHtml(title)}</h3>
                    </div>
                    <div class="report-card-actions">
                        <span class="${escapeHtml(statusClassName(entry.status))}">${escapeHtml(entry.status || "pending")}</span>
                        <span class="report-ready-chip${entry.report?.isSeen ? " report-ready-chip--seen" : ""}">${escapeHtml(readyLabel)}</span>
                    </div>
                </div>

                <div class="report-card-meta">
                    <article class="report-meta-item">
                        <span>Submitted On</span>
                        <strong>${escapeHtml(new Date(entry.createdAt).toLocaleDateString())}</strong>
                    </article>
                    <article class="report-meta-item">
                        <span>WhatsApp Number</span>
                        <strong>${escapeHtml(entry.whatsappNumber || "Not provided")}</strong>
                    </article>
                    <article class="report-meta-item">
                        <span>Birth Place / City</span>
                        <strong>${escapeHtml(birthPlace || "-")}</strong>
                    </article>
                    <article class="report-meta-item">
                        <span>Registered Email</span>
                        <strong>${escapeHtml(entry.userProfile?.email || "Not available")}</strong>
                    </article>
                </div>

                ${hasReport ? `
                    <div class="report-file-card">
                        <strong>${escapeHtml(entry.report?.title || "Uploaded report ready for download")}</strong>
                        <p>${escapeHtml(entry.report?.originalName || "Saved file is available now.")}</p>
                        ${entry.report?.note ? `<p class="report-report-note">${escapeHtml(entry.report.note)}</p>` : ""}
                        <div class="report-file-actions">
                            <button type="button" class="report-view-btn" onclick="openUserReportFile('${entry._id}', false, '${escapeHtml(entry.report?.originalName || "report")}')">View Report</button>
                            <button type="button" class="report-download-btn" onclick="openUserReportFile('${entry._id}', true, '${escapeHtml(entry.report?.originalName || "report")}')">Download Report</button>
                        </div>
                    </div>
                ` : `
                    <div class="report-file-card">
                        <strong>Your report is not uploaded yet.</strong>
                        <p>The admin team can still review your details. As soon as a PDF or image report is uploaded, it will appear here automatically.</p>
                    </div>
                `}
            </article>
        `;
    }).join("");
};

const updateSummary = (summary = {}) => {
    if (totalReportsNode) {
        totalReportsNode.textContent = String(summary.totalSubmissions || 0);
    }

    if (readyReportsNode) {
        readyReportsNode.textContent = String(summary.readyReports || 0);
    }

    if (unseenReportsNode) {
        unseenReportsNode.textContent = String(summary.unseenReports || 0);
    }
};

const markReportsAsSeen = async (reports = []) => {
    const targets = reports.filter((entry) => entry.report?.hasFile && !entry.report?.isSeen);

    if (!targets.length) {
        return;
    }

    await Promise.all(targets.map(async (entry) => {
        try {
            await fetch(`${API_URL}/user/reports/${entry._id}/seen`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Unable to mark report as seen", error);
        }
    }));

    if (window.tmProfileSync?.refreshReportSummary) {
        window.tmProfileSync.refreshReportSummary();
    }
};

const loadReports = async (markNewReports = true) => {
    try {
        setReportFeedback("Loading your reports...", "#7b552f", true);

        const response = await fetch(`${API_URL}/user/reports`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load your reports right now.");
        }

        updateSummary(result.summary || {});
        renderReports(result.data || []);

        if (markNewReports) {
            await markReportsAsSeen(result.data || []);

            if ((result.summary?.unseenReports || 0) > 0) {
                await loadReports(false);
                return;
            }
        }

        setReportFeedback("Your report dashboard is up to date.", "#2f6f3e", true);
    } catch (error) {
        console.error(error);
        updateSummary({});
        renderEmptyState();
        setReportFeedback(error.message || "Unable to load reports right now.", "#b34b1e", true);
    }
};

const animateReportPage = () => {
    if (typeof gsap === "undefined") {
        return;
    }

    const targets = document.querySelectorAll(
        ".report-hero, .report-summary-card, .report-board, .report-support-card"
    );

    gsap.from(targets, {
        opacity: 0,
        y: 24,
        duration: 0.58,
        stagger: 0.08,
        ease: "power2.out"
    });
};

animateReportPage();
loadReports();

window.openUserReportFile = async (id, forceDownload = false, fileName = "report") => {
    try {
        await openProtectedUserFile(`${API_URL}/user/reports/${id}/file`, fileName, forceDownload);
    } catch (error) {
        console.error(error);
        setReportFeedback(error.message || "Unable to open your report right now.", "#b34b1e", true);
    }
};
