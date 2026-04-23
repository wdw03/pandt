(() => {
    const createPoojaSlug = (value = "") => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

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
    ].map((pooja) => {
        return {
            ...pooja,
            slug: pooja.slug || createPoojaSlug(pooja.title)
        };
    });

    window.poojaSlidesData = poojaSlidesData;
})();
