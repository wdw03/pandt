(async () => {
    const apiOrigin = (() => {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;

        if (protocol === 'file:') {
            return 'http://localhost:5000';
        }

        if (hostname === '127.0.0.1' || hostname === 'localhost') {
            if (!port || port === '5000') {
                return `${window.location.protocol}//${window.location.hostname}${port ? `:${port}` : ''}`;
            }

            return `${window.location.protocol}//${window.location.hostname}:5000`;
        }

        return '';
    })();

    const resolveAssetPath = (value = '') => {
        if (!value) {
            return '';
        }

        if (
            value.startsWith('http://') ||
            value.startsWith('https://') ||
            value.startsWith('data:')
        ) {
            return value;
        }

        if (value.startsWith('/')) {
            return apiOrigin ? `${apiOrigin}${value}` : value;
        }

        if (value.startsWith('./')) {
            return value;
        }

        if (value.startsWith('assets/')) {
            return `./${value}`;
        }

        return value;
    };

    try {
        const response = await fetch(`${apiOrigin}/api/public/pooja-slides`);
        const data = await response.json();

        if (data.success) {
            window.poojaSlidesData = Array.isArray(data.data)
                ? data.data.map((slide) => ({
                    ...slide,
                    image: resolveAssetPath(slide.image)
                }))
                : [];
        } else {
            console.error('Failed to load pooja slides:', data.message);
            window.poojaSlidesData = [];
        }
    } catch (error) {
        console.error('Error fetching pooja slides:', error);
        window.poojaSlidesData = [];
    }

    window.dispatchEvent(new Event('poojaDataLoaded'));
})();
