(function () {
    const navbar = document.getElementById('navbar');
    const navShell = navbar?.querySelector('.navbarmain');
    const navLinks = document.getElementById('navbarlinks');
    const utilityWrap = navbar?.querySelector('.loglongu');
    const profileButton = document.getElementById('profileToggle');

    if (!navbar || !navShell || !navLinks || !utilityWrap) {
        return;
    }

    const mobileQuery = window.matchMedia('(max-width: 980px)');

    let menuToggle = navbar.querySelector('.site-nav-menu-toggle');
    if (!menuToggle) {
        menuToggle = document.createElement('button');
        menuToggle.type = 'button';
        menuToggle.className = 'site-nav-menu-toggle';
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = `
            <span class="site-nav-menu-lines" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
            </span>
        `;
        utilityWrap.prepend(menuToggle);
    }

    let navScrim = document.querySelector('.site-nav-scrim');
    if (!navScrim) {
        navScrim = document.createElement('button');
        navScrim.type = 'button';
        navScrim.className = 'site-nav-scrim';
        navScrim.setAttribute('aria-label', 'Close navigation menu');
        document.body.appendChild(navScrim);
    }

    const dropdownLinks = Array.from(navLinks.querySelectorAll('.dropdown > a'));
    const closableLinks = Array.from(navLinks.querySelectorAll('a')).filter((link) => !dropdownLinks.includes(link));

    const closeMenu = () => {
        document.body.classList.remove('site-mobile-nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.querySelectorAll('.dropdown.site-mobile-open').forEach((item) => {
            item.classList.remove('site-mobile-open');
        });
    };

    const openMenu = () => {
        if (!mobileQuery.matches) {
            return;
        }

        document.body.classList.add('site-mobile-nav-open');
        menuToggle.setAttribute('aria-expanded', 'true');
    };

    const toggleMenu = () => {
        if (!mobileQuery.matches) {
            return;
        }

        if (document.body.classList.contains('site-mobile-nav-open')) {
            closeMenu();
            return;
        }

        openMenu();
    };

    menuToggle.addEventListener('click', toggleMenu);
    navScrim.addEventListener('click', closeMenu);

    profileButton?.addEventListener('click', () => {
        if (mobileQuery.matches) {
            closeMenu();
        }
    });

    dropdownLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            if (!mobileQuery.matches) {
                return;
            }

            event.preventDefault();
            const parent = link.closest('.dropdown');
            if (!parent) {
                return;
            }

            const shouldOpen = !parent.classList.contains('site-mobile-open');
            navLinks.querySelectorAll('.dropdown.site-mobile-open').forEach((item) => {
                item.classList.remove('site-mobile-open');
            });

            if (shouldOpen) {
                parent.classList.add('site-mobile-open');
            }
        });
    });

    closableLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (mobileQuery.matches) {
                closeMenu();
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    const syncDesktopState = () => {
        if (!mobileQuery.matches) {
            closeMenu();
        }
    };

    if (typeof mobileQuery.addEventListener === 'function') {
        mobileQuery.addEventListener('change', syncDesktopState);
    } else if (typeof mobileQuery.addListener === 'function') {
        mobileQuery.addListener(syncDesktopState);
    }

    window.addEventListener('resize', syncDesktopState);
})();
