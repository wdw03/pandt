const API = '/api/admin';
const TOKEN_KEY = 'adminToken';

const getToken = () => localStorage.getItem(TOKEN_KEY);

const getAuthHeaders = (includeJson = true) => {
    const headers = {
        Authorization: `Bearer ${getToken()}`
    };

    if (includeJson) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

const escapeHtml = (value = '') => {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
};

const compactWhitespace = (value = '') => {
    return String(value).replace(/\s+/g, ' ').trim();
};

const chunkLongText = (value = '', maxLength = 120) => {
    const normalized = compactWhitespace(value);

    if (!normalized) {
        return [];
    }

    if (normalized.length <= maxLength) {
        return [normalized];
    }

    const words = normalized.split(' ');
    const chunks = [];
    let current = '';

    words.forEach((word) => {
        if (word.length > maxLength) {
            if (current) {
                chunks.push(current);
                current = '';
            }

            for (let index = 0; index < word.length; index += maxLength) {
                chunks.push(word.slice(index, index + maxLength));
            }
            return;
        }

        const nextValue = current ? `${current} ${word}` : word;

        if (nextValue.length <= maxLength) {
            current = nextValue;
            return;
        }

        if (current) {
            chunks.push(current);
        }

        current = word;
    });

    if (current) {
        chunks.push(current);
    }

    return chunks;
};

const toChunkedLineArray = (value = '', maxLength = 120) => {
    return String(value)
        .split(/\r?\n/)
        .map((entry) => compactWhitespace(entry))
        .filter(Boolean)
        .flatMap((entry) => chunkLongText(entry, maxLength));
};

const assetUrl = (value = '') => {
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
        return value;
    }

    if (value.startsWith('./')) {
        return value.slice(1);
    }

    if (value.startsWith('assets/')) {
        return `/${value}`;
    }

    return value;
};

if (!getToken()) {
    window.location.href = 'index.html';
}

const toastContainer = document.getElementById('toastContainer');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3600);
};

const openModal = (title, html) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modalOverlay.classList.add('is-visible');
};

const closeModal = () => {
    modalOverlay.classList.remove('is-visible');
    modalBody.innerHTML = '';
};

window.closeModal = closeModal;

document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

const apiRequest = async (url, options = {}) => {
    const response = await fetch(`${API}${url}`, options);

    if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('adminUser');
        window.location.href = 'index.html';
        return null;
    }

    return response.json();
};

const apiGet = (url) => apiRequest(url, { headers: getAuthHeaders(false) });
const apiPost = (url, body) => apiRequest(url, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(body)
});
const apiPut = (url, body) => apiRequest(url, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(body)
});
const apiDelete = (url) => apiRequest(url, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
});

const openProtectedAdminFile = async (url, suggestedName = 'report', forceDownload = false) => {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    if (!response.ok) {
        throw new Error('Unable to open report file');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    if (forceDownload) {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = suggestedName || 'report';
        document.body.appendChild(link);
        link.click();
        link.remove();
    } else {
        window.open(objectUrl, '_blank', 'noopener');
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
};

const uploadImages = async (files) => {
    const urls = [];

    for (const file of Array.from(files || [])) {
        const formData = new FormData();
        formData.append('image', file);

        const result = await apiRequest('/upload', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${getToken()}`
            },
            body: formData
        });

        if (!result?.success || !result.url) {
            throw new Error(result?.message || `Failed to upload ${file.name}`);
        }

        urls.push(result.url);
    }

    return urls;
};

const setUploadPreview = (preview, url, placeholderText) => {
    if (!preview) {
        return;
    }

    const safeUrl = assetUrl(url);

    preview.classList.toggle('is-empty', !safeUrl);
    preview.innerHTML = safeUrl
        ? `<img src="${escapeHtml(safeUrl)}" alt="Uploaded preview">`
        : `<span>${escapeHtml(placeholderText)}</span>`;
};

const updateTextCounter = (field) => {
    const counter = field.closest('.admin-field')?.querySelector('.char-count');

    if (!counter || !field.hasAttribute('maxlength')) {
        return;
    }

    const max = Number(field.getAttribute('maxlength')) || 0;
    counter.textContent = `${field.value.length}/${max}`;
};

const bindTextCounters = (scope) => {
    scope.querySelectorAll('input[maxlength], textarea[maxlength]').forEach((field) => {
        updateTextCounter(field);
        field.addEventListener('input', () => updateTextCounter(field));
    });
};

const detailItem = (label, value, full = false) => {
    return `
        <div class="admin-detail-item${full ? ' admin-detail-full' : ''}">
            <label>${escapeHtml(label)}</label>
            <p>${escapeHtml(value || '-')}</p>
        </div>
    `;
};

const reportBadgeHtml = (submission) => {
    const hasReport = !!submission.report?.hasFile;

    if (!hasReport) {
        return '<span class="admin-badge admin-badge-warning">Pending</span>';
    }

    if (submission.report?.isSeen) {
        return '<span class="admin-badge admin-badge-success">Seen</span>';
    }

    return '<span class="admin-badge admin-badge-info">New</span>';
};

const sectionTitles = {
    overview: 'Dashboard Overview',
    'pooja-slides': 'Pooja Slides',
    products: 'Products',
    videos: 'Astrology Videos',
    'kundali-matching': 'Kundali Matching',
    'janam-kundali': 'Janam Kundali',
    contacts: 'Contact Messages',
    settings: 'Site Settings'
};

const sidebar = document.getElementById('adminSidebar');
const topbarTitle = document.getElementById('topbarTitle');

document.querySelectorAll('.admin-nav-item').forEach((button) => {
    button.addEventListener('click', () => {
        const section = button.dataset.section;

        document.querySelectorAll('.admin-nav-item').forEach((item) => {
            item.classList.toggle('is-active', item === button);
        });

        document.querySelectorAll('.admin-section').forEach((panel) => {
            panel.classList.toggle('is-active', panel.dataset.panel === section);
        });

        topbarTitle.textContent = sectionTitles[section] || 'Dashboard';
        sidebar.classList.remove('is-open');
        loadSectionData(section);
    });
});

document.getElementById('hamburgerBtn').addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('adminUser');
    window.location.href = 'index.html';
});

const adminUser = localStorage.getItem('adminUser');
if (adminUser) {
    try {
        document.getElementById('adminName').textContent = JSON.parse(adminUser).username || 'Admin';
    } catch (error) {
        document.getElementById('adminName').textContent = 'Admin';
    }
}

const loadSectionData = (section) => {
    if (section === 'overview') {
        return loadStats();
    }

    if (section === 'pooja-slides') {
        return loadSlides();
    }

    if (section === 'products') {
        return loadProducts();
    }

    if (section === 'videos') {
        return loadVideos();
    }

    if (section === 'kundali-matching') {
        return loadKundali('matching');
    }

    if (section === 'janam-kundali') {
        return loadKundali('janam');
    }

    if (section === 'contacts') {
        return loadContacts();
    }

    if (section === 'settings') {
        return loadSettings();
    }
};

const loadStats = async () => {
    const result = await apiGet('/stats');

    if (!result?.success) {
        showToast(result?.message || 'Unable to load stats', 'error');
        return;
    }

    const stats = [
        { icon: 'O', value: result.data.poojaCount, label: 'Pooja Slides' },
        { icon: 'P', value: result.data.productCount, label: 'Products' },
        { icon: 'V', value: result.data.videoCount, label: 'Videos' },
        { icon: 'K', value: result.data.kundaliCount, label: 'Kundali Matching' },
        { icon: 'J', value: result.data.janamCount, label: 'Janam Kundali' },
        { icon: 'C', value: result.data.contactCount, label: 'Contact Messages' },
        { icon: 'U', value: result.data.unreadCount, label: 'Unread Messages' }
    ];

    document.getElementById('statsGrid').innerHTML = stats
        .map((item) => `
            <div class="admin-stat-card">
                <span class="admin-stat-icon">${item.icon}</span>
                <span class="admin-stat-value">${item.value}</span>
                <span class="admin-stat-label">${item.label}</span>
            </div>
        `)
        .join('');
};

const getStatusBadge = (active) => {
    return active
        ? '<span class="admin-badge admin-badge-success">Active</span>'
        : '<span class="admin-badge admin-badge-danger">Inactive</span>';
};

const loadSlides = async () => {
    const result = await apiGet('/pooja-slides');

    if (!result?.success) {
        showToast(result?.message || 'Unable to load pooja slides', 'error');
        return;
    }

    const rows = result.data.map((slide) => `
        <tr>
            <td>
                <img class="table-img" src="${escapeHtml(assetUrl(slide.image || ''))}" alt="${escapeHtml(slide.title || 'Pooja slide')}" onerror="this.style.display='none'">
            </td>
            <td>
                <strong>${escapeHtml(slide.title)}</strong>
                <br>
                <small style="color:var(--text-muted)">${escapeHtml(slide.subtitle || 'No subtitle added')}</small>
                <br>
                <small style="color:var(--text-muted)">Slug: ${escapeHtml(slide.slug || '-')}</small>
            </td>
            <td>
                <strong>${escapeHtml(slide.priceLabel || '-')}</strong>
                <br>
                <small style="color:var(--text-muted)">Order: ${escapeHtml(String(slide.order ?? 0))}</small>
            </td>
            <td>${getStatusBadge(slide.isActive)}</td>
            <td class="table-actions">
                <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="editSlide('${slide._id}')">Edit</button>
                <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteSlide('${slide._id}')">Delete</button>
            </td>
        </tr>
    `);

    document.getElementById('slidesBody').innerHTML = rows.join('') || `
        <tr>
            <td colspan="5" style="text-align:center;color:var(--text-muted)">No pooja slides available yet.</td>
        </tr>
    `;
};

const benefitRowMarkup = (benefit = {}) => {
    return `
        <div class="admin-benefit-row" data-benefit-row>
            <div class="admin-benefit-head">
                <strong>Benefit</strong>
                <button type="button" class="admin-chip-btn admin-chip-btn-danger" data-remove-benefit>Remove</button>
            </div>
            <div class="admin-field">
                <label>Preview (max 100)</label>
                <input type="text" maxlength="100" data-benefit-preview value="${escapeHtml(benefit.preview || '')}">
                <div class="char-count"></div>
            </div>
            <div class="admin-field">
                <label>Heading (max 80)</label>
                <input type="text" maxlength="80" data-benefit-heading value="${escapeHtml(benefit.heading || '')}">
                <div class="char-count"></div>
            </div>
            <div class="admin-field">
                <label>Body (max 300)</label>
                <textarea maxlength="300" data-benefit-body>${escapeHtml(benefit.body || '')}</textarea>
                <div class="char-count"></div>
            </div>
        </div>
    `;
};

const slideFormHtml = (slide = {}) => {
    const benefits = Array.isArray(slide.benefits) && slide.benefits.length
        ? slide.benefits
        : [{}];
    const detailHighlights = Array.isArray(slide.detailHighlights) ? slide.detailHighlights : [];
    const ritualSteps = Array.isArray(slide.ritualSteps) ? slide.ritualSteps : [];
    const preparationNotes = Array.isArray(slide.preparationNotes) ? slide.preparationNotes : [];
    const suitableFor = Array.isArray(slide.suitableFor) ? slide.suitableFor : [];

    return `
        <form id="slideForm" class="admin-form-stack">
            <div class="admin-form-grid admin-form-grid-2">
                <div class="admin-field">
                    <label>Title (max 60)</label>
                    <input type="text" name="title" maxlength="60" required value="${escapeHtml(slide.title || '')}">
                    <div class="char-count"></div>
                </div>
                <div class="admin-field">
                    <label>Slug (optional)</label>
                    <input type="text" name="slug" maxlength="80" value="${escapeHtml(slide.slug || '')}" placeholder="auto-generated-from-title">
                    <div class="char-count"></div>
                </div>
                <div class="admin-field">
                    <label>Subtitle (max 80)</label>
                    <input type="text" name="subtitle" maxlength="80" value="${escapeHtml(slide.subtitle || '')}">
                    <div class="char-count"></div>
                </div>
                <div class="admin-field">
                    <label>Image Tag (max 40)</label>
                    <input type="text" name="imageTag" maxlength="40" value="${escapeHtml(slide.imageTag || '')}">
                    <div class="char-count"></div>
                </div>
                <div class="admin-field">
                    <label>Price Label (max 20)</label>
                    <input type="text" name="priceLabel" maxlength="20" value="${escapeHtml(slide.priceLabel || '')}">
                    <div class="char-count"></div>
                </div>
                <div class="admin-field">
                    <label>Display Order</label>
                    <input type="number" name="order" min="0" step="1" value="${escapeHtml(String(slide.order ?? 0))}">
                </div>
            </div>

            <div class="admin-upload-card">
                <div class="admin-upload-preview is-empty" id="slideImagePreview">
                    <span>Slide image preview</span>
                </div>
                <div class="admin-upload-panel">
                    <div class="admin-upload-top">
                        <div>
                            <h4>Pooja image</h4>
                            <p>Upload the main image that should appear on the home slider, puja route page and the new puja service cards section.</p>
                        </div>
                        <div class="admin-upload-actions">
                            <label class="admin-btn admin-btn-secondary admin-btn-sm">
                                Upload
                                <input type="file" id="slideImageFile" accept="image/*" hidden>
                            </label>
                            <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" id="slideImageRemove">Remove</button>
                        </div>
                    </div>
                    <input type="hidden" name="image" id="slideImageInput" value="${escapeHtml(slide.image || '')}">
                    <p class="admin-upload-path" id="slideImagePath">${escapeHtml(slide.image || 'No image selected')}</p>
                </div>
            </div>

            <div class="admin-field">
                <label>Service / Card Description (max 200)</label>
                <textarea name="cardDescription" maxlength="200">${escapeHtml(slide.cardDescription || '')}</textarea>
                <div class="char-count"></div>
            </div>

            <div class="admin-form-grid admin-form-grid-2">
                <div class="admin-field">
                    <label>About Preview (max 200)</label>
                    <textarea name="aboutPreview" maxlength="200">${escapeHtml(slide.aboutPreview || '')}</textarea>
                    <div class="char-count"></div>
                </div>
                <div class="admin-field">
                    <label>About Heading (max 80)</label>
                    <input type="text" name="aboutHeading" maxlength="80" value="${escapeHtml(slide.aboutHeading || '')}">
                    <div class="char-count"></div>
                </div>
            </div>

            <div class="admin-field">
                <label>About Body (max 500)</label>
                <textarea name="aboutBody" maxlength="500">${escapeHtml(slide.aboutBody || '')}</textarea>
                <div class="char-count"></div>
            </div>

            <div class="admin-field">
                <label>Detail Intro for Full Puja Page (max 500)</label>
                <textarea name="detailIntro" maxlength="500" placeholder="This short intro appears in the hero section of the full puja detail page.">${escapeHtml(slide.detailIntro || '')}</textarea>
                <div class="char-count"></div>
            </div>

            <div class="admin-field">
                <label>Full Detail Body for Puja Page (max 5000)</label>
                <textarea name="detailBody" maxlength="5000" rows="10" placeholder="Write the full long-form puja explanation here. This is the main rich content shown on the dedicated puja detail page.">${escapeHtml(slide.detailBody || '')}</textarea>
                <div class="char-count"></div>
            </div>

            <div class="admin-form-grid admin-form-grid-2">
                <div class="admin-field">
                    <label>Detail Highlights (one per line)</label>
                    <textarea name="detailHighlights" rows="6" placeholder="Authentic Vedic process&#10;Personal sankalp&#10;Suitable for family peace">${escapeHtml(detailHighlights.join('\n'))}</textarea>
                </div>
                <div class="admin-field">
                    <label>Ritual Steps (one per line)</label>
                    <textarea name="ritualSteps" rows="6" placeholder="Sankalp is taken&#10;Mantras and offerings are performed&#10;Blessings are concluded">${escapeHtml(ritualSteps.join('\n'))}</textarea>
                </div>
                <div class="admin-field">
                    <label>Preparation Notes (one per line)</label>
                    <textarea name="preparationNotes" rows="6" placeholder="Keep intention ready&#10;Prepare prayer space&#10;Share family details if needed">${escapeHtml(preparationNotes.join('\n'))}</textarea>
                </div>
                <div class="admin-field">
                    <label>Suitable For (one per line)</label>
                    <textarea name="suitableFor" rows="6" placeholder="Family peace&#10;Auspicious beginnings&#10;Prosperity prayers">${escapeHtml(suitableFor.join('\n'))}</textarea>
                </div>
            </div>

            <div class="admin-field">
                <label>Status</label>
                <select name="isActive">
                    <option value="true" ${slide.isActive !== false ? 'selected' : ''}>Active</option>
                    <option value="false" ${slide.isActive === false ? 'selected' : ''}>Inactive</option>
                </select>
            </div>

            <div class="admin-repeater-card">
                <div class="admin-repeater-head">
                    <div>
                        <h4>Benefits</h4>
                        <p>Add the expandable benefit cards visible on the pooja page.</p>
                    </div>
                    <button type="button" class="admin-btn admin-btn-primary admin-btn-sm" id="addBenefitBtn">+ Add benefit</button>
                </div>
                <div class="admin-benefits-stack" id="benefitsStack">
                    ${benefits.map(benefitRowMarkup).join('')}
                </div>
            </div>

            <div class="admin-modal-actions">
                <button type="button" class="admin-btn admin-btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="admin-btn admin-btn-primary">${slide._id ? 'Update slide' : 'Create slide'}</button>
            </div>
        </form>
    `;
};

const bindSlideForm = (slide = {}) => {
    const form = document.getElementById('slideForm');
    const preview = document.getElementById('slideImagePreview');
    const imageInput = document.getElementById('slideImageInput');
    const imagePath = document.getElementById('slideImagePath');
    const imageFile = document.getElementById('slideImageFile');
    const removeButton = document.getElementById('slideImageRemove');
    const benefitsStack = document.getElementById('benefitsStack');

    bindTextCounters(form);
    setUploadPreview(preview, slide.image || imageInput.value, 'Slide image preview');

    const refreshImageMeta = () => {
        imagePath.textContent = imageInput.value || 'No image selected';
        setUploadPreview(preview, imageInput.value, 'Slide image preview');
    };

    imageFile.addEventListener('change', async (event) => {
        const files = event.target.files;

        if (!files?.length) {
            return;
        }

        try {
            showToast('Uploading slide image...', 'info');
            const [uploadedUrl] = await uploadImages(files);
            imageInput.value = uploadedUrl;
            refreshImageMeta();
            showToast('Slide image uploaded successfully');
        } catch (error) {
            showToast(error.message || 'Slide image upload failed', 'error');
        } finally {
            imageFile.value = '';
        }
    });

    removeButton.addEventListener('click', () => {
        imageInput.value = '';
        refreshImageMeta();
    });

    const bindBenefitRow = (row) => {
        row.querySelector('[data-remove-benefit]').addEventListener('click', () => {
            if (benefitsStack.children.length === 1) {
                row.querySelectorAll('input, textarea').forEach((field) => {
                    field.value = '';
                    updateTextCounter(field);
                });
                return;
            }

            row.remove();
        });

        row.querySelectorAll('input[maxlength], textarea[maxlength]').forEach((field) => {
            updateTextCounter(field);
            field.addEventListener('input', () => updateTextCounter(field));
        });
    };

    benefitsStack.querySelectorAll('[data-benefit-row]').forEach(bindBenefitRow);

    document.getElementById('addBenefitBtn').addEventListener('click', () => {
        benefitsStack.insertAdjacentHTML('beforeend', benefitRowMarkup());
        bindBenefitRow(benefitsStack.lastElementChild);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const normalizedDetailHighlights = toChunkedLineArray(form.detailHighlights.value, 140);
        const normalizedRitualSteps = toChunkedLineArray(form.ritualSteps.value, 260);
        const normalizedPreparationNotes = toChunkedLineArray(form.preparationNotes.value, 240);
        const normalizedSuitableFor = toChunkedLineArray(form.suitableFor.value, 180);

        const payload = {
            title: form.title.value.trim(),
            slug: form.slug.value.trim(),
            subtitle: form.subtitle.value.trim(),
            imageTag: form.imageTag.value.trim(),
            priceLabel: form.priceLabel.value.trim(),
            order: Number(form.order.value || 0),
            image: imageInput.value.trim(),
            cardDescription: form.cardDescription.value.trim(),
            aboutPreview: form.aboutPreview.value.trim(),
            aboutHeading: form.aboutHeading.value.trim(),
            aboutBody: form.aboutBody.value.trim(),
            detailIntro: form.detailIntro.value.trim(),
            detailBody: form.detailBody.value.trim(),
            detailHighlights: normalizedDetailHighlights,
            ritualSteps: normalizedRitualSteps,
            preparationNotes: normalizedPreparationNotes,
            suitableFor: normalizedSuitableFor,
            isActive: form.isActive.value === 'true',
            benefits: Array.from(benefitsStack.querySelectorAll('[data-benefit-row]'))
                .map((row) => ({
                    preview: row.querySelector('[data-benefit-preview]').value.trim(),
                    heading: row.querySelector('[data-benefit-heading]').value.trim(),
                    body: row.querySelector('[data-benefit-body]').value.trim()
                }))
                .filter((benefit) => benefit.preview || benefit.heading || benefit.body)
        };

        const result = slide._id
            ? await apiPut(`/pooja-slides/${slide._id}`, payload)
            : await apiPost('/pooja-slides', payload);

        if (!result?.success) {
            showToast(result?.message || 'Unable to save pooja slide', 'error');
            return;
        }

        showToast(slide._id ? 'Pooja slide updated' : 'Pooja slide created');
        closeModal();
        await loadSlides();
        await loadStats();
    });
};

document.getElementById('btnAddSlide').addEventListener('click', () => {
    openModal('Create Pooja Slide', slideFormHtml());
    bindSlideForm();
});

window.editSlide = async (id) => {
    const result = await apiGet('/pooja-slides');
    const slide = result?.data?.find((entry) => entry._id === id);

    if (!slide) {
        showToast('Pooja slide not found', 'error');
        return;
    }

    openModal('Edit Pooja Slide', slideFormHtml(slide));
    bindSlideForm(slide);
};

window.deleteSlide = async (id) => {
    if (!window.confirm('Delete this pooja slide?')) {
        return;
    }

    const result = await apiDelete(`/pooja-slides/${id}`);

    if (!result?.success) {
        showToast(result?.message || 'Unable to delete pooja slide', 'error');
        return;
    }

    showToast('Pooja slide deleted');
    await loadSlides();
    await loadStats();
};

const renderProductImageItems = (container, images) => {
    container.innerHTML = images.length
        ? images
            .map((url) => `
                <div class="admin-image-chip" data-image-url="${escapeHtml(url)}">
                    <img src="${escapeHtml(assetUrl(url))}" alt="Product image" onerror="this.style.display='none'">
                    <span>${escapeHtml(url.split('/').pop() || url)}</span>
                    <button type="button" class="admin-chip-btn admin-chip-btn-danger" data-remove-image>Remove</button>
                </div>
            `)
            .join('')
        : '<div class="admin-empty-inline">No product images uploaded yet.</div>';
};

const productFormHtml = (product = {}) => {
    const productImages = Array.isArray(product.images) ? product.images : [];
    const productHighlights = Array.isArray(product.highlights) ? product.highlights : [];
    const productDetailPoints = Array.isArray(product.detailPoints) ? product.detailPoints : [];

    return `
        <form id="productForm" class="admin-form-stack">
            <div class="admin-form-grid admin-form-grid-2">
                <div class="admin-field">
                    <label>Title (max 100)</label>
                    <input type="text" name="title" maxlength="100" required value="${escapeHtml(product.title || '')}">
                    <div class="char-count"></div>
                </div>
                <div class="admin-field">
                    <label>Seller / Tag (max 80)</label>
                    <input type="text" name="seller" maxlength="80" value="${escapeHtml(product.seller || '')}">
                    <div class="char-count"></div>
                </div>
                <div class="admin-field">
                    <label>Price (max 30)</label>
                    <input type="text" name="price" maxlength="30" value="${escapeHtml(product.price || '')}">
                    <div class="char-count"></div>
                </div>
                <div class="admin-field">
                    <label>Product Link</label>
                    <input type="text" name="productLink" value="${escapeHtml(product.productLink || '')}">
                </div>
                <div class="admin-field">
                    <label>Display Order</label>
                    <input type="number" name="order" min="0" step="1" value="${escapeHtml(String(product.order ?? 0))}">
                </div>
                <div class="admin-field">
                    <label>Status</label>
                    <select name="isActive">
                        <option value="true" ${product.isActive !== false ? 'selected' : ''}>Active</option>
                        <option value="false" ${product.isActive === false ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </div>

            <div class="admin-field">
                <label>Description (max 300)</label>
                <textarea name="description" maxlength="300">${escapeHtml(product.description || '')}</textarea>
                <div class="char-count"></div>
            </div>

            <div class="admin-field">
                <label>Detail Intro (max 220)</label>
                <textarea name="detailIntro" maxlength="220">${escapeHtml(product.detailIntro || '')}</textarea>
                <div class="char-count"></div>
            </div>

            <div class="admin-field">
                <label>Full Detail Body (max 2000)</label>
                <textarea name="detailBody" maxlength="2000" rows="8">${escapeHtml(product.detailBody || '')}</textarea>
                <div class="char-count"></div>
            </div>

            <div class="admin-form-grid admin-form-grid-2">
                <div class="admin-field">
                    <label>Highlights (one per line)</label>
                    <textarea name="highlights" rows="6" placeholder="Premium finish&#10;Useful for gifting&#10;Best for daily devotional use">${escapeHtml(productHighlights.join('\n'))}</textarea>
                </div>
                <div class="admin-field">
                    <label>Extra Detail Points (one per line)</label>
                    <textarea name="detailPoints" rows="6" placeholder="Can be used in prayer corner&#10;Strong festival gifting option&#10;Admin can add richer use notes here">${escapeHtml(productDetailPoints.join('\n'))}</textarea>
                </div>
            </div>

            <div class="admin-repeater-card">
                <div class="admin-repeater-head">
                    <div>
                        <h4>Product images</h4>
                        <p>Upload one or multiple product images. The first image becomes the primary front-end cover.</p>
                    </div>
                    <label class="admin-btn admin-btn-primary admin-btn-sm">
                        Upload images
                        <input type="file" id="productImageFiles" accept="image/*" multiple hidden>
                    </label>
                </div>
                <div class="admin-image-list" id="productImageList"></div>
                <input type="hidden" id="productImagesState" value="${escapeHtml(JSON.stringify(productImages))}">
            </div>

            <div class="admin-modal-actions">
                <button type="button" class="admin-btn admin-btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="admin-btn admin-btn-primary">${product._id ? 'Update product' : 'Create product'}</button>
            </div>
        </form>
    `;
};

const bindProductForm = (product = {}) => {
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('productImageFiles');
    const stateInput = document.getElementById('productImagesState');
    const imageList = document.getElementById('productImageList');
    let images = Array.isArray(product.images) ? [...product.images] : [];

    bindTextCounters(form);
    renderProductImageItems(imageList, images);
    stateInput.value = JSON.stringify(images);

    const syncImages = () => {
        stateInput.value = JSON.stringify(images);
        renderProductImageItems(imageList, images);

        imageList.querySelectorAll('[data-remove-image]').forEach((button) => {
            button.addEventListener('click', () => {
                const url = button.closest('[data-image-url]')?.dataset.imageUrl;
                images = images.filter((entry) => entry !== url);
                syncImages();
            });
        });
    };

    imageInput.addEventListener('change', async (event) => {
        const files = event.target.files;

        if (!files?.length) {
            return;
        }

        try {
            showToast('Uploading product images...', 'info');
            const uploadedUrls = await uploadImages(files);
            images = [...images, ...uploadedUrls];
            syncImages();
            showToast('Product images uploaded successfully');
        } catch (error) {
            showToast(error.message || 'Product image upload failed', 'error');
        } finally {
            imageInput.value = '';
        }
    });

    syncImages();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const normalizedHighlights = toChunkedLineArray(form.highlights.value, 120);
        const normalizedDetailPoints = toChunkedLineArray(form.detailPoints.value, 180);
        const rawHighlightLines = form.highlights.value.split(/\r?\n/).map((entry) => compactWhitespace(entry)).filter(Boolean);
        const rawDetailPointLines = form.detailPoints.value.split(/\r?\n/).map((entry) => compactWhitespace(entry)).filter(Boolean);

        const payload = {
            title: form.title.value.trim(),
            seller: form.seller.value.trim(),
            price: form.price.value.trim(),
            productLink: form.productLink.value.trim(),
            order: Number(form.order.value || 0),
            isActive: form.isActive.value === 'true',
            description: form.description.value.trim(),
            detailIntro: form.detailIntro.value.trim(),
            detailBody: form.detailBody.value.trim(),
            highlights: normalizedHighlights,
            detailPoints: normalizedDetailPoints,
            images
        };

        if (
            normalizedHighlights.length > rawHighlightLines.length ||
            normalizedDetailPoints.length > rawDetailPointLines.length
        ) {
            showToast('Long highlight or detail lines were split automatically to fit the product layout.', 'info');
        }

        const result = product._id
            ? await apiPut(`/products/${product._id}`, payload)
            : await apiPost('/products', payload);

        if (!result?.success) {
            showToast(result?.message || 'Unable to save product', 'error');
            return;
        }

        showToast(product._id ? 'Product updated' : 'Product created');
        closeModal();
        await loadProducts();
        await loadStats();
    });
};

const loadProducts = async () => {
    const result = await apiGet('/products');

    if (!result?.success) {
        showToast(result?.message || 'Unable to load products', 'error');
        return;
    }

    document.getElementById('productsBody').innerHTML = result.data
        .map((product) => `
            <tr>
                <td>
                    <img class="table-img" src="${escapeHtml(assetUrl(product.images?.[0] || ''))}" alt="${escapeHtml(product.title || 'Product')}" onerror="this.style.display='none'">
                </td>
                <td>
                    <strong>${escapeHtml(product.title)}</strong>
                    <br>
                    <small style="color:var(--text-muted)">Seller: ${escapeHtml(product.seller || '-')}</small>
                    <br>
                    <small style="color:var(--text-muted)">Details: ${product.detailBody || product.detailIntro ? 'Added' : 'Pending'}</small>
                </td>
                <td>
                    <strong>${escapeHtml(product.price || '-')}</strong>
                    <br>
                    <small style="color:var(--text-muted)">Images: ${escapeHtml(String(product.images?.length || 0))}</small>
                </td>
                <td>
                    <small>${escapeHtml(product.productId || '-')}</small>
                    <br>
                    <small style="color:var(--text-muted)">Order: ${escapeHtml(String(product.order ?? 0))}</small>
                </td>
                <td class="table-actions">
                    <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="editProduct('${product._id}')">Edit</button>
                    <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteProduct('${product._id}')">Delete</button>
                </td>
            </tr>
        `)
        .join('') || `
            <tr>
                <td colspan="5" style="text-align:center;color:var(--text-muted)">No products available yet.</td>
            </tr>
        `;
};

document.getElementById('btnAddProduct').addEventListener('click', () => {
    openModal('Create Product', productFormHtml());
    bindProductForm();
});

window.editProduct = async (id) => {
    const result = await apiGet('/products');
    const product = result?.data?.find((entry) => entry._id === id);

    if (!product) {
        showToast('Product not found', 'error');
        return;
    }

    openModal('Edit Product', productFormHtml(product));
    bindProductForm(product);
};

window.deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) {
        return;
    }

    const result = await apiDelete(`/products/${id}`);

    if (!result?.success) {
        showToast(result?.message || 'Unable to delete product', 'error');
        return;
    }

    showToast('Product deleted');
    await loadProducts();
    await loadStats();
};

const videoFormHtml = (video = {}) => {
    return `
        <form id="videoForm" class="admin-form-stack">
            <div class="admin-form-grid admin-form-grid-2">
                <div class="admin-field">
                    <label>Title (max 80)</label>
                    <input type="text" name="title" maxlength="80" required value="${escapeHtml(video.title || '')}">
                    <div class="char-count"></div>
                </div>
                <div class="admin-field">
                    <label>Display Order</label>
                    <input type="number" name="order" min="0" step="1" value="${escapeHtml(String(video.order ?? 0))}">
                </div>
                <div class="admin-field admin-field-span-2">
                    <label>YouTube URL (max 500)</label>
                    <input type="text" name="url" maxlength="500" value="${escapeHtml(video.url || '')}">
                    <div class="char-count"></div>
                </div>
            </div>
            <div class="admin-field">
                <label>Description (max 200)</label>
                <textarea name="description" maxlength="200">${escapeHtml(video.description || '')}</textarea>
                <div class="char-count"></div>
            </div>
            <div class="admin-field">
                <label>Status</label>
                <select name="isActive">
                    <option value="true" ${video.isActive !== false ? 'selected' : ''}>Active</option>
                    <option value="false" ${video.isActive === false ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <div class="admin-modal-actions">
                <button type="button" class="admin-btn admin-btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="admin-btn admin-btn-primary">${video._id ? 'Update video' : 'Create video'}</button>
            </div>
        </form>
    `;
};

const bindVideoForm = (video = {}) => {
    const form = document.getElementById('videoForm');
    bindTextCounters(form);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = {
            title: form.title.value.trim(),
            order: Number(form.order.value || 0),
            url: form.url.value.trim(),
            description: form.description.value.trim(),
            isActive: form.isActive.value === 'true'
        };

        const result = video._id
            ? await apiPut(`/videos/${video._id}`, payload)
            : await apiPost('/videos', payload);

        if (!result?.success) {
            showToast(result?.message || 'Unable to save video', 'error');
            return;
        }

        showToast(video._id ? 'Video updated' : 'Video created');
        closeModal();
        await loadVideos();
        await loadStats();
    });
};

const loadVideos = async () => {
    const result = await apiGet('/videos');

    if (!result?.success) {
        showToast(result?.message || 'Unable to load videos', 'error');
        return;
    }

    document.getElementById('videosBody').innerHTML = result.data
        .map((video) => `
            <tr>
                <td>
                    <strong>${escapeHtml(video.title)}</strong>
                    <br>
                    <small style="color:var(--text-muted)">${escapeHtml(video.description || 'No description')}</small>
                </td>
                <td>
                    <small>${escapeHtml(video.url || 'No URL added')}</small>
                    <br>
                    <small style="color:var(--text-muted)">Order: ${escapeHtml(String(video.order ?? 0))} | ${video.isActive ? 'Active' : 'Inactive'}</small>
                </td>
                <td class="table-actions">
                    <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="editVideo('${video._id}')">Edit</button>
                    <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteVideo('${video._id}')">Delete</button>
                </td>
            </tr>
        `)
        .join('') || `
            <tr>
                <td colspan="3" style="text-align:center;color:var(--text-muted)">No videos available yet.</td>
            </tr>
        `;
};

document.getElementById('btnAddVideo').addEventListener('click', () => {
    openModal('Create Video', videoFormHtml());
    bindVideoForm();
});

window.editVideo = async (id) => {
    const result = await apiGet('/videos');
    const video = result?.data?.find((entry) => entry._id === id);

    if (!video) {
        showToast('Video not found', 'error');
        return;
    }

    openModal('Edit Video', videoFormHtml(video));
    bindVideoForm(video);
};

window.deleteVideo = async (id) => {
    if (!window.confirm('Delete this video?')) {
        return;
    }

    const result = await apiDelete(`/videos/${id}`);

    if (!result?.success) {
        showToast(result?.message || 'Unable to delete video', 'error');
        return;
    }

    showToast('Video deleted');
    await loadVideos();
    await loadStats();
};

const loadKundali = async (type) => {
    const result = await apiGet(`/kundali-submissions?type=${type}`);

    if (!result?.success) {
        showToast(result?.message || 'Unable to load submissions', 'error');
        return;
    }

    const targetId = type === 'matching' ? 'kundaliBody' : 'janamBody';
    const rows = result.data.map((submission, index) => {
        if (type === 'matching') {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(submission.boyData?.name || '-')}</td>
                    <td>${escapeHtml(submission.girlData?.name || '-')}</td>
                    <td>${escapeHtml(submission.whatsappNumber || '-')}</td>
                    <td>
                        ${escapeHtml(submission.userProfile?.name || '-')}
                        <br>
                        <small>${escapeHtml(submission.userProfile?.email || '')}</small>
                    </td>
                    <td><span class="admin-badge admin-badge-info">${escapeHtml(submission.status || 'pending')}</span></td>
                    <td>${reportBadgeHtml(submission)}</td>
                    <td><small>${new Date(submission.createdAt).toLocaleDateString()}</small></td>
                    <td><button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="viewKundali('${submission._id}', 'matching')">View</button></td>
                </tr>
            `;
        }

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(submission.singleData?.name || '-')}</td>
                <td>${escapeHtml(submission.singleData?.gender || '-')}</td>
                <td>${escapeHtml(submission.singleData?.birthPlace || '-')}</td>
                <td>${escapeHtml(submission.whatsappNumber || '-')}</td>
                <td><span class="admin-badge admin-badge-info">${escapeHtml(submission.status || 'pending')}</span></td>
                <td>${reportBadgeHtml(submission)}</td>
                <td><small>${new Date(submission.createdAt).toLocaleDateString()}</small></td>
                <td><button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="viewKundali('${submission._id}', 'janam')">View</button></td>
            </tr>
        `;
    });

    document.getElementById(targetId).innerHTML = rows.join('') || `
        <tr>
            <td colspan="9" style="text-align:center;color:var(--text-muted)">No submissions found.</td>
        </tr>
    `;
};

window.viewKundali = async (id, type) => {
    const result = await apiGet(`/kundali-submissions?type=${type}`);
    const submission = result?.data?.find((entry) => entry._id === id);

    if (!submission) {
        showToast('Submission not found', 'error');
        return;
    }

    let detailsHtml = '<div class="admin-detail-grid">';

    if (type === 'matching') {
        detailsHtml += detailItem('Boy Name', submission.boyData?.name);
        detailsHtml += detailItem('Boy Birth Date', `${submission.boyData?.birthDay || '-'}-${submission.boyData?.birthMonth || '-'}-${submission.boyData?.birthYear || '-'}`);
        detailsHtml += detailItem('Boy Birth Time', `${submission.boyData?.birthHour || '-'}:${submission.boyData?.birthMinute || '-'}`);
        detailsHtml += detailItem('Boy Birth City', submission.boyData?.birthCity);
        detailsHtml += detailItem('Boy Chart Type', submission.boyData?.chartType);
        detailsHtml += detailItem('Girl Name', submission.girlData?.name);
        detailsHtml += detailItem('Girl Birth Date', `${submission.girlData?.birthDay || '-'}-${submission.girlData?.birthMonth || '-'}-${submission.girlData?.birthYear || '-'}`);
        detailsHtml += detailItem('Girl Birth Time', `${submission.girlData?.birthHour || '-'}:${submission.girlData?.birthMinute || '-'}`);
        detailsHtml += detailItem('Girl Birth City', submission.girlData?.birthCity);
        detailsHtml += detailItem('Girl Chart Type', submission.girlData?.chartType);
    } else {
        detailsHtml += detailItem('Name', submission.singleData?.name);
        detailsHtml += detailItem('Gender', submission.singleData?.gender);
        detailsHtml += detailItem('Birth Place', submission.singleData?.birthPlace);
        detailsHtml += detailItem('Birth Date', `${submission.singleData?.birthDay || '-'}-${submission.singleData?.birthMonth || '-'}-${submission.singleData?.birthYear || '-'}`);
        detailsHtml += detailItem('Birth Time', `${submission.singleData?.birthHour || '-'}:${submission.singleData?.birthMinute || '-'}`);
    }

    detailsHtml += detailItem('WhatsApp', submission.whatsappNumber);
    detailsHtml += detailItem('User Name', submission.userProfile?.name);
    detailsHtml += detailItem('User Email', submission.userProfile?.email);
    detailsHtml += detailItem('Status', submission.status || 'pending');
    detailsHtml += detailItem('Report Availability', submission.report?.hasFile ? 'Uploaded' : 'Not uploaded');
    detailsHtml += '</div>';
    detailsHtml += `
        <div class="admin-report-panel">
            <div class="admin-report-panel-head">
                <div>
                    <h4>User Report Upload</h4>
                    <p>Upload PDF or image report for this submission. Once uploaded, it will appear on the user's Reports page.</p>
                </div>
                ${reportBadgeHtml(submission)}
            </div>
            ${submission.report?.hasFile ? `
                <div class="admin-report-current">
                    <div class="admin-report-current-copy">
                        <strong>${escapeHtml(submission.report.title || 'Uploaded report')}</strong>
                        <span>${escapeHtml(submission.report.originalName || 'Saved file')}</span>
                        <small>${submission.report.uploadedAt ? `Uploaded on ${new Date(submission.report.uploadedAt).toLocaleString()}` : 'Upload time unavailable'}</small>
                        ${submission.report.note ? `<p>${escapeHtml(submission.report.note)}</p>` : ''}
                    </div>
                    <div class="admin-report-current-actions">
                        <button class="admin-btn admin-btn-secondary admin-btn-sm" type="button" onclick="openAdminSubmissionReport('${submission._id}', false)">View File</button>
                        <button class="admin-btn admin-btn-primary admin-btn-sm" type="button" onclick="openAdminSubmissionReport('${submission._id}', true, '${escapeHtml(submission.report.originalName || 'report')}')">Download</button>
                    </div>
                </div>
            ` : `
                <div class="admin-report-empty">No report has been uploaded for this user yet.</div>
            `}
            <div class="admin-form-grid admin-form-grid-2">
                <label class="admin-field">
                    <span>Report Title</span>
                    <input type="text" id="reportTitleInput" maxlength="100" value="${escapeHtml(submission.report?.title || '')}" placeholder="Kundali analysis report">
                </label>
                <label class="admin-field">
                    <span>Upload Report File</span>
                    <input type="file" id="reportUploadInput" accept=".pdf,image/*">
                </label>
                <label class="admin-field admin-field-span-2">
                    <span>Admin Note</span>
                    <textarea id="reportNoteInput" maxlength="300" placeholder="Optional note for the user">${escapeHtml(submission.report?.note || '')}</textarea>
                </label>
            </div>
        </div>
    `;
    detailsHtml += `
        <div class="admin-modal-actions">
            <select id="statusSelect">
                <option value="pending" ${submission.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="processing" ${submission.status === 'processing' ? 'selected' : ''}>Processing</option>
                <option value="completed" ${submission.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
            <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="updateKStatus('${submission._id}', '${type}')">Update Status</button>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="uploadKundaliReport('${submission._id}', '${type}')">Upload Report</button>
        </div>
    `;

    openModal('Submission Details', detailsHtml);
};

window.updateKStatus = async (id, type) => {
    const status = document.getElementById('statusSelect').value;
    const result = await apiPut(`/kundali-submissions/${id}/status`, { status });

    if (!result?.success) {
        showToast(result?.message || 'Unable to update status', 'error');
        return;
    }

    showToast('Submission status updated');
    closeModal();
    await loadKundali(type);
};

window.uploadKundaliReport = async (id, type) => {
    const reportFileInput = document.getElementById('reportUploadInput');
    const reportTitleInput = document.getElementById('reportTitleInput');
    const reportNoteInput = document.getElementById('reportNoteInput');
    const statusSelect = document.getElementById('statusSelect');
    const file = reportFileInput?.files?.[0] || null;
    const title = String(reportTitleInput?.value || '').trim();
    const note = String(reportNoteInput?.value || '').trim();
    const status = String(statusSelect?.value || '').trim();

    if (!file && !title && !note && !status) {
        showToast('Choose a report file or add report details first', 'error');
        return;
    }

    const formData = new FormData();

    if (file) {
        formData.append('report', file);
    }

    formData.append('title', title);
    formData.append('note', note);
    formData.append('status', status);

    const result = await apiRequest(`/kundali-submissions/${id}/report`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${getToken()}`
        },
        body: formData
    });

    if (!result?.success) {
        showToast(result?.message || 'Unable to upload report', 'error');
        return;
    }

    showToast(file ? 'Report uploaded successfully' : 'Report details saved');
    closeModal();
    await loadKundali(type);
};

window.openAdminSubmissionReport = async (id, forceDownload = false, fileName = 'report') => {
    try {
        await openProtectedAdminFile(
            `${API}/kundali-submissions/${id}/report/file${forceDownload ? '?download=1' : ''}`,
            fileName,
            forceDownload
        );
    } catch (error) {
        showToast(error.message || 'Unable to open report file', 'error');
    }
};

const loadContacts = async () => {
    const result = await apiGet('/contact-submissions');

    if (!result?.success) {
        showToast(result?.message || 'Unable to load contact messages', 'error');
        return;
    }

    document.getElementById('contactsBody').innerHTML = result.data
        .map((message, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(message.name)}</td>
                <td>${escapeHtml(message.email)}</td>
                <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(message.message)}</td>
                <td>${message.isRead ? '<span class="admin-badge admin-badge-success">Read</span>' : '<span class="admin-badge admin-badge-warning">Unread</span>'}</td>
                <td>
                    <small>${new Date(message.createdAt).toLocaleDateString()}</small>
                    ${message.isRead ? '' : `<br><button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="markRead('${message._id}')">Mark Read</button>`}
                </td>
            </tr>
        `)
        .join('') || `
            <tr>
                <td colspan="6" style="text-align:center;color:var(--text-muted)">No contact messages found.</td>
            </tr>
        `;
};

window.markRead = async (id) => {
    const result = await apiPut(`/contact-submissions/${id}/read`, {});

    if (!result?.success) {
        showToast(result?.message || 'Unable to mark message as read', 'error');
        return;
    }

    showToast('Message marked as read');
    await loadContacts();
    await loadStats();
};

const loadSettings = async () => {
    const result = await apiGet('/config');

    if (!result?.success) {
        showToast(result?.message || 'Unable to load settings', 'error');
        return;
    }

    document.getElementById('cfgKundaliPrice').value = result.data.kundaliMatchingPrice || '';
    document.getElementById('cfgJanamPrice').value = result.data.janamKundaliPrice || '';
    document.getElementById('cfgClientId').value = result.data.panchangClientId || '';
    document.getElementById('cfgClientSecret').value = result.data.panchangClientSecret || '';
};

const testProkeralaBtn = document.getElementById('testProkeralaBtn');

if (testProkeralaBtn) {
    testProkeralaBtn.addEventListener('click', async () => {
        const msg = document.getElementById('prokeralaTestMsg');
        const clientId = document.getElementById('cfgClientId').value.trim();
        const clientSecret = document.getElementById('cfgClientSecret').value.trim();

        if (!clientId || !clientSecret) {
            msg.textContent = 'Enter both Client ID and Client Secret first.';
            msg.style.color = 'var(--danger)';
            return;
        }

        testProkeralaBtn.disabled = true;
        msg.textContent = 'Testing…';
        msg.style.color = 'var(--muted, #555)';

        const result = await apiPost('/config/prokerala/test', { clientId, clientSecret });

        testProkeralaBtn.disabled = false;

        if (!result?.success) {
            msg.textContent = result?.message || 'Connection test failed.';
            msg.style.color = 'var(--danger)';
            return;
        }

        const credits = result.data?.creditsRemaining;
        const creditsLabel =
            typeof credits === 'number' ? ` Credits remaining: ${credits}.` : '';
        msg.textContent = `Credentials valid.${creditsLabel}`;
        msg.style.color = 'var(--success)';
    });
}

document.getElementById('settingsForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
        kundaliMatchingPrice: document.getElementById('cfgKundaliPrice').value.trim(),
        janamKundaliPrice: document.getElementById('cfgJanamPrice').value.trim(),
        panchangClientId: document.getElementById('cfgClientId').value.trim(),
        panchangClientSecret: document.getElementById('cfgClientSecret').value.trim()
    };

    const result = await apiPut('/config', payload);
    const message = document.getElementById('settingsMsg');

    if (!result?.success) {
        message.textContent = result?.message || 'Unable to save settings';
        message.style.color = 'var(--danger)';
        showToast(result?.message || 'Unable to save settings', 'error');
        return;
    }

    message.textContent = 'Settings saved successfully';
    message.style.color = 'var(--success)';
    showToast('Settings saved successfully');

    setTimeout(() => {
        message.textContent = '';
    }, 3000);
});

loadStats();
