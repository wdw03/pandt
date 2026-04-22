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


const bookKundaliToggle = document.getElementById("bookKundaliToggle");
const bookKundaliSubmenu = document.getElementById("bookKundaliSubmenu");
const bookKundaliAccordion = document.getElementById("bookKundaliAccordion");

gsap.set(bookKundaliSubmenu, {
    height: 0,
    opacity: 0,
    display: "none"
});

let bookKundaliOpen = false;

bookKundaliToggle.addEventListener("click", () => {
    bookKundaliOpen = !bookKundaliOpen;

    if (bookKundaliOpen) {
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
    } else {
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
    }
});




const topImage = document.querySelector(".slidetopleft");

if (topImage) {
    gsap.set(topImage, {
        y: -220,
        opacity: 0,
        rotation: -6
    });

    gsap.to(topImage, {
        y: 0,
        opacity: 1,
        rotation: 0,
        duration: 1.4,
        ease: "power3.out",
        delay: 0.25
    });

    topImage.addEventListener("mouseenter", () => {
        gsap.to(topImage, {
            y: -22,
            duration: 0.45,
            ease: "power2.out"
        });
    });

    topImage.addEventListener("mouseleave", () => {
        gsap.to(topImage, {
            y: 0,
            duration: 0.45,
            ease: "power2.out"
        });
    });
}

const poojaSliders = document.querySelectorAll("[data-pooja-slider]");

// Add future pooja entries here and the slider will render them automatically.
const poojaSlidesData = [
    {
        title: "Maha Yag Pooja",
        image: "./assets/images/panditpujakete.jpg",
        imageTag: "Sacred Ritual",
        cardDescription:
            "Maha Yag Pooja ek pavitra Vedic anushthan hai jo ghar me shanti, positivity aur divine blessings lane ke liye kiya jata hai.",
        priceLabel: "MRP 300",
        subtitle: "Sacred ritual for peace and prosperity",
        aboutPreview:
            "Maha Yag Pooja ek pavitra Vedic anushthan hai jo ghar me shanti aur positivity lane ke liye kiya jata hai.",
        aboutHeading: "About Maha Yag Pooja",
        aboutBody:
            "Maha Yag Pooja ek pavitra Vedic anushthan hai jo ghar me shanti, positivity aur divine blessings lane ke liye kiya jata hai. Is pooja ko vidhi-vidhan ke saath karne se spiritual shakti, sukh-samriddhi aur ghar ka mahaul aur adhik shubh hota hai.",
        benefits: [
            {
                preview: "Peace and positive energy",
                heading: "Peace and Positive Energy",
                body:
                    "Ye pooja ghar ke mahaul ko shaant, pavitra aur positive banane me sahayak mani jati hai."
            },
            {
                preview: "Prosperity and spiritual growth",
                heading: "Prosperity and Growth",
                body:
                    "Is anushthan se unnati, aarthik sthirta aur spiritual connection dono ko majbooti milti hai."
            },
            {
                preview: "Removes negative influence",
                heading: "Negative Influence Removal",
                body:
                    "Is pooja ko nakaratmak prabhav kam karne aur ghar me shubh urja badhane ke roop me dekha jata hai."
            }
        ]
    },
    {
        title: "Lakshmi Pooja",
        image: "./assets/images/lakshmipooja.jpg",
        imageTag: "Prosperity Blessing",
        cardDescription:
            "Lakshmi Pooja Maa Lakshmi ki kripa, dhan, saubhagya aur ghar ki samriddhi ke liye shraddha ke saath ki jaati hai.",
        priceLabel: "MRP 500",
        subtitle: "Blessings for wealth, harmony and abundance",
        aboutPreview:
            "Lakshmi Pooja Maa Lakshmi ko prasann karne ke liye ki jaati hai, jisse ghar me dhan, saubhagya aur samriddhi ka vaas hota hai.",
        aboutHeading: "About Lakshmi Pooja",
        aboutBody:
            "Lakshmi Pooja Maa Lakshmi ki kripa aur aarthik samriddhi ke liye ki jaati hai. Is pooja ko shraddha aur vidhi ke saath karne se ghar me sukh, saubhagya, safalta aur pavitra urja ka pravah badhta hai.",
        benefits: [
            {
                preview: "Attracts wealth and abundance",
                heading: "Wealth and Abundance",
                body:
                    "Ye pooja dhan, pragati aur aarthik sthirta ke liye bahut shubh mani jati hai."
            },
            {
                preview: "Brings harmony at home",
                heading: "Harmony at Home",
                body:
                    "Maa Lakshmi ki upasana ghar ke mahaul ko komal, shaant aur sukhmay banane me madad karti hai."
            },
            {
                preview: "Invites auspicious energy",
                heading: "Auspicious Energy",
                body:
                    "Ye anushthan ghar me shubh urja, roshni aur utsav ka bhav aur adhik majboot karta hai."
            }
        ]
    },
    {
        title: "Ghar Pooja",
        image: "./assets/images/gharouaj.jpg",
        imageTag: "Home Harmony",
        cardDescription:
            "Ghar Pooja griha shanti, pavitrata aur nayi shuruaat ke liye ki jaati hai, jisse poore parivar ko sukoon aur suraksha ka ehsaas hota hai.",
        priceLabel: "MRP 800",
        subtitle: "Purifies the home with peace and protection",
        aboutPreview:
            "Ghar Pooja ek pavitra griha anushthan hai jo ghar ko shuddh, shaant aur sakaratmak urja se bharne ke liye kiya jata hai.",
        aboutHeading: "About Ghar Pooja",
        aboutBody:
            "Ghar Pooja griha shanti, pavitrata aur parivarik sukh ke liye ki jaati hai. Is vidhi ko sahi reeti se karne par ghar se nakaratmakta kam hoti hai aur ek surakshit, shubh aur santulit mahaul banta hai.",
        benefits: [
            {
                preview: "Purifies the living space",
                heading: "Purifies the Living Space",
                body:
                    "Ye pooja ghar ke vatavaran ko pavitra, halka aur sakaratmak banane me madad karti hai."
            },
            {
                preview: "Strengthens family harmony",
                heading: "Family Harmony",
                body:
                    "Parivar ke sadasyon ke beech prem, samvedansheelata aur samanjasya ko badhava milta hai."
            },
            {
                preview: "Supports new beginnings",
                heading: "New Beginnings",
                body:
                    "Naye ghar, naye kaam ya kisi bhi nayi shuruaat ke liye ye pooja bahut shubh mani jati hai."
            }
        ]
    }
];

const renderPoojaSlides = (slides) => {
    return slides
        .map((pooja, index) => {
            return `
                <article
                    class="midleftmain pooja-slide"
                    data-pooja-slide
                    role="group"
                    aria-roledescription="slide"
                    aria-label="${index + 1} of ${slides.length}"
                >
                    <div
                        class="midleftimg"
                        data-pooja-tag="${pooja.imageTag}"
                        style="background-image: url('${pooja.image}');"
                    ></div>
                    <div class="midlefttexs">
                        <div class="midtextpooja">
                            <div class="nameofpuja">
                                <h2>${pooja.title}</h2>
                            </div>
                            <div class="detailspooja">
                                <p>${pooja.cardDescription}</p>
                            </div>
                            <div class="pricepooja" data-price-label="${pooja.priceLabel}"></div>
                            <div class="poojabutonsd">
                                <div class="shareivutton"><button type="button">share</button></div>
                                <div class="booknowb"><button type="button">book now</button></div>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        })
        .join("");
};

const renderPoojaBenefits = (benefits) => {
    return benefits
        .map((benefit) => {
            return `
                <div class="benefititem expandcard">
                    <div class="benefithead sectiontrigger">
                        <span class="benefitarrow"></span>
                        <p>${benefit.preview}</p>
                    </div>

                    <div class="expandcontent">
                        <div class="innerexpandbox">
                            <h4>${benefit.heading}</h4>
                            <p>${benefit.body}</p>
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
};

poojaSliders.forEach((slider) => {
    const track = slider.querySelector("[data-pooja-track]");
    const prevButton = slider.querySelector(".pooja-slider-btn-prev");
    const nextButton = slider.querySelector(".pooja-slider-btn-next");
    const title = slider.querySelector("[data-pooja-title]");
    const subtitle = slider.querySelector("[data-pooja-subtitle]");
    const aboutPreview = slider.querySelector("[data-pooja-about-preview]");
    const aboutHeading = slider.querySelector("[data-pooja-about-heading]");
    const aboutBody = slider.querySelector("[data-pooja-about-body]");
    const benefitsContainer = slider.querySelector("[data-pooja-benefits]");

    if (
        !track ||
        !prevButton ||
        !nextButton ||
        !title ||
        !subtitle ||
        !aboutPreview ||
        !aboutHeading ||
        !aboutBody ||
        !benefitsContainer ||
        !poojaSlidesData.length
    ) {
        return;
    }

    track.innerHTML = renderPoojaSlides(poojaSlidesData);

    const slides = Array.from(track.querySelectorAll("[data-pooja-slide]"));
    let activeIndex = 0;

    const animatePanel = () => {
        if (typeof gsap === "undefined") {
            return;
        }

        const targets = [
            title,
            subtitle,
            aboutPreview,
            aboutHeading,
            aboutBody,
            ...benefitsContainer.querySelectorAll(".benefititem")
        ];

        gsap.killTweensOf(targets);
        gsap.fromTo(
            targets,
            { opacity: 0, y: 16 },
            {
                opacity: 1,
                y: 0,
                duration: 0.38,
                stagger: 0.04,
                ease: "power2.out",
                overwrite: true
            }
        );
    };

    const updateRightPanel = (pooja) => {
        title.textContent = pooja.title;
        subtitle.textContent = pooja.subtitle;
        aboutPreview.textContent = pooja.aboutPreview;
        aboutHeading.textContent = pooja.aboutHeading;
        aboutBody.textContent = pooja.aboutBody;
        benefitsContainer.innerHTML = renderPoojaBenefits(pooja.benefits);
        animatePanel();
    };

    const updateButtons = () => {
        const shouldDisable = slides.length <= 1;
        prevButton.disabled = shouldDisable;
        nextButton.disabled = shouldDisable;
    };

    const updateSlider = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        track.style.transform = `translateX(-${activeIndex * 100}%)`;

        slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === activeIndex;
            slide.classList.toggle("is-active", isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
            slide.toggleAttribute("inert", !isActive);
        });

        updateRightPanel(poojaSlidesData[activeIndex]);
    };

    prevButton.addEventListener("click", () => {
        updateSlider(activeIndex - 1);
    });

    nextButton.addEventListener("click", () => {
        updateSlider(activeIndex + 1);
    });

    updateButtons();
    updateSlider(0);
});








