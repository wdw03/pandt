const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const PoojaSlide = require('../models/PoojaSlide');
const Product = require('../models/Product');
const VideoItem = require('../models/VideoItem');
const RouteSection = require('../models/RouteSection');
const KundaliSubmission = require('../models/KundaliSubmission');
const ContactSubmission = require('../models/ContactSubmission');
const SiteConfig = require('../models/SiteConfig');
const {
    cleanString,
    normalizePoojaSlidePayload,
    normalizeProductPayload,
    normalizeVideoPayload,
    toWebAssetPath
} = require('../utils/contentManager');
const {
    ensurePoojaSlidesSeeded,
    ensureProductsSeeded,
    ensureVideosSeeded,
    ensureSiteConfigSeeded
} = require('../utils/contentBootstrap');
const { resetTokenCache } = require('../utils/prokeralaService');

const generateAdminToken = (id) => {
    return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const submissionHasReport = (submission) => {
    const report = submission?.report || {};
    return !!(
        report.fileData?.length ||
        report.fileUrl ||
        (report.storage === 'database' && (Number(report.fileSize || 0) > 0 || cleanString(report.originalName)))
    );
};

const resolveLegacyReportPath = (fileUrl = '') => {
    const normalized = cleanString(fileUrl).replace(/\\/g, '/').replace(/^\/+/, '');

    if (!normalized) {
        return '';
    }

    return path.join(__dirname, '../../', normalized);
};

const buildReportMeta = (submission, endpointBase) => {
    const report = submission?.report || {};

    return {
        title: report.title || '',
        note: report.note || '',
        storage: report.storage || (report.fileData?.length ? 'database' : report.fileUrl ? 'file' : ''),
        fileSize: Number(report.fileSize || (report.fileData?.length || 0)),
        originalName: report.originalName || '',
        mimeType: report.mimeType || '',
        uploadedAt: report.uploadedAt || null,
        isSeen: !!report.isSeen,
        hasFile: submissionHasReport(submission),
        fileEndpoint: submissionHasReport(submission) ? endpointBase : ''
    };
};

const normalizeSubmission = (submission) => {
    const source = submission.toObject ? submission.toObject() : submission;

    return {
        ...source,
        report: buildReportMeta(source, `/api/admin/kundali-submissions/${source._id}/report/file`)
    };
};

const streamSubmissionReport = (res, submission, forceDownload = false) => {
    const report = submission?.report || {};
    const mimeType = cleanString(report.mimeType) || 'application/octet-stream';
    const originalName = cleanString(report.originalName) || 'kundali-report';

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
        'Content-Disposition',
        `${forceDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(originalName)}"`
    );

    if (report.fileData?.length) {
        return res.send(report.fileData);
    }

    if (report.fileUrl) {
        const legacyPath = resolveLegacyReportPath(report.fileUrl);

        if (legacyPath && fs.existsSync(legacyPath)) {
            return res.sendFile(legacyPath);
        }
    }

    return res.status(404).json({ success: false, message: 'Report file not found' });
};

exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const admin = await Admin.findOne({ username: username.toLowerCase().trim() }).select('+password');

        if (!admin || !(await admin.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateAdminToken(admin._id);
        return res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                username: admin.username
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.adminVerify = async (req, res) => {
    return res.json({ success: true, admin: req.admin });
};

exports.getPoojaSlides = async (req, res) => {
    try {
        await ensurePoojaSlidesSeeded();
        const slides = await PoojaSlide.find().sort({ order: 1, createdAt: -1 });
        const normalizedSlides = slides.map((slide) => ({
            ...slide.toObject(),
            image: toWebAssetPath(slide.image)
        }));
        return res.json({ success: true, data: normalizedSlides });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPoojaSlide = async (req, res) => {
    try {
        const payload = normalizePoojaSlidePayload(req.body);

        if (!payload.title) {
            return res.status(400).json({ success: false, message: 'Pooja title is required' });
        }

        const slide = await PoojaSlide.create(payload);
        return res.status(201).json({ success: true, data: slide });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.updatePoojaSlide = async (req, res) => {
    try {
        const slide = await PoojaSlide.findById(req.params.id);

        if (!slide) {
            return res.status(404).json({ success: false, message: 'Slide not found' });
        }

        const payload = normalizePoojaSlidePayload(req.body, slide.toObject());
        Object.assign(slide, payload);
        await slide.save();

        return res.json({ success: true, data: slide });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.deletePoojaSlide = async (req, res) => {
    try {
        const slide = await PoojaSlide.findByIdAndDelete(req.params.id);

        if (!slide) {
            return res.status(404).json({ success: false, message: 'Slide not found' });
        }

        return res.json({ success: true, message: 'Slide deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRouteSections = async (req, res) => {
    try {
        const sections = await RouteSection.find().sort({ order: 1 });
        const normalizedSections = sections.map((section) => ({
            ...section.toObject(),
            image: toWebAssetPath(section.image)
        }));
        return res.json({ success: true, data: normalizedSections });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRouteSection = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            title: cleanString(req.body.title),
            description: cleanString(req.body.description),
            image: toWebAssetPath(req.body.image)
        };

        const section = await RouteSection.findByIdAndUpdate(
            req.params.id,
            payload,
            { returnDocument: 'after', runValidators: true }
        );

        if (!section) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        return res.json({ success: true, data: section });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        await ensureProductsSeeded();
        const products = await Product.find().sort({ order: 1, createdAt: -1 });
        const normalizedProducts = products.map((product) => ({
            ...product.toObject(),
            images: Array.isArray(product.images) ? product.images.map(toWebAssetPath) : []
        }));
        return res.json({ success: true, data: normalizedProducts });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const payload = normalizeProductPayload(req.body);

        if (!payload.title) {
            return res.status(400).json({ success: false, message: 'Product title is required' });
        }

        const product = await Product.create(payload);
        return res.status(201).json({ success: true, data: product });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const payload = normalizeProductPayload(req.body, product.toObject());
        Object.assign(product, payload);
        await product.save();

        return res.json({ success: true, data: product });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        return res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getVideos = async (req, res) => {
    try {
        await ensureVideosSeeded();
        const videos = await VideoItem.find().sort({ order: 1, createdAt: -1 });
        return res.json({ success: true, data: videos });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createVideo = async (req, res) => {
    try {
        const payload = normalizeVideoPayload(req.body);

        if (!payload.title) {
            return res.status(400).json({ success: false, message: 'Video title is required' });
        }

        const video = await VideoItem.create(payload);
        return res.status(201).json({ success: true, data: video });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateVideo = async (req, res) => {
    try {
        const video = await VideoItem.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        const payload = normalizeVideoPayload(req.body, video.toObject());
        Object.assign(video, payload);
        await video.save();

        return res.json({ success: true, data: video });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const video = await VideoItem.findByIdAndDelete(req.params.id);

        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        return res.json({ success: true, message: 'Video deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getKundaliSubmissions = async (req, res) => {
    try {
        const typeFilter = req.query.type;
        const query = typeFilter ? { type: typeFilter } : {};
        const submissions = await KundaliSubmission.find(query).sort({ createdAt: -1 });
        return res.json({ success: true, data: submissions.map(normalizeSubmission) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateKundaliStatus = async (req, res) => {
    try {
        const submission = await KundaliSubmission.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { returnDocument: 'after' }
        );

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        return res.json({ success: true, data: submission });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.uploadKundaliReport = async (req, res) => {
    try {
        const submission = await KundaliSubmission.findById(req.params.id).select('+report.fileData');

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        const title = cleanString(req.body.title) || cleanString(submission.report?.title);
        const note = cleanString(req.body.note);
        const nextStatus = cleanString(req.body.status);

        if (!req.file && !title && !note && !nextStatus) {
            return res.status(400).json({
                success: false,
                message: 'Choose a report file or add report details before saving.'
            });
        }

        if (req.file) {
            submission.report = {
                title: title || `${submission.type === 'matching' ? 'Kundali Matching' : 'Janam Kundali'} Report`,
                note,
                storage: 'database',
                fileUrl: '',
                fileData: req.file.buffer,
                fileSize: Number(req.file.size || req.file.buffer?.length || 0),
                originalName: req.file.originalname || '',
                mimeType: req.file.mimetype || '',
                uploadedAt: new Date(),
                isSeen: false
            };
        } else {
            submission.report = submission.report || {};
            submission.report.title = title;
            submission.report.note = note || submission.report?.note || '';
        }

        if (nextStatus) {
            submission.status = nextStatus;
        }

        await submission.save();

        return res.json({
            success: true,
            message: 'Report uploaded successfully',
            data: normalizeSubmission(submission)
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.downloadAdminKundaliReport = async (req, res) => {
    try {
        const submission = await KundaliSubmission.findById(req.params.id).select('+report.fileData');

        if (!submission || !submissionHasReport(submission)) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        return streamSubmissionReport(res, submission, req.query.download === '1');
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getContactSubmissions = async (req, res) => {
    try {
        const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
        return res.json({ success: true, data: submissions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.markContactRead = async (req, res) => {
    try {
        const submission = await ContactSubmission.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { returnDocument: 'after' }
        );

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        return res.json({ success: true, data: submission });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.getConfig = async (req, res) => {
    try {
        await ensureSiteConfigSeeded();
        const configs = await SiteConfig.find();
        const configMap = {};

        configs.forEach((entry) => {
            configMap[entry.key] = entry.value;
        });

        return res.json({ success: true, data: configMap });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.testProkeralaCredentials = async (req, res) => {
    try {
        const { clientId, clientSecret } = req.body || {};
        const trimmedId = cleanString(clientId);
        const trimmedSecret = cleanString(clientSecret);

        if (!trimmedId || !trimmedSecret) {
            return res.status(400).json({
                success: false,
                message: 'Both Client ID and Client Secret are required to test the connection.'
            });
        }

        const tokenResponse = await fetch('https://api.prokerala.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: trimmedId,
                client_secret: trimmedSecret
            })
        });

        const tokenData = await tokenResponse.json().catch(() => ({}));

        if (!tokenResponse.ok || !tokenData.access_token) {
            return res.status(400).json({
                success: false,
                message:
                    tokenData.error_description ||
                    tokenData.message ||
                    'ProKerala rejected these credentials. Double-check the Client ID and Secret.'
            });
        }

        // Decode JWT payload (no signature check) to surface remaining credits.
        let creditsRemaining = null;
        try {
            const payload = JSON.parse(
                Buffer.from(tokenData.access_token.split('.')[1], 'base64').toString('utf-8')
            );
            if (typeof payload?.credits_remaining === 'number') {
                creditsRemaining = payload.credits_remaining;
            }
        } catch (_) {
            // ignore decode errors
        }

        return res.json({
            success: true,
            message: 'ProKerala credentials are valid. Token received.',
            data: {
                expiresIn: tokenData.expires_in || null,
                creditsRemaining
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Could not reach ProKerala: ${error.message}`
        });
    }
};

exports.updateConfig = async (req, res) => {
    try {
        const updates = req.body || {};
        const shouldResetProkeralaToken =
            Object.prototype.hasOwnProperty.call(updates, 'panchangClientId') ||
            Object.prototype.hasOwnProperty.call(updates, 'panchangClientSecret');
        const operations = Object.entries(updates).map(([key, value]) =>
            SiteConfig.setVal(key, cleanString(value))
        );

        await Promise.all(operations);

        if (shouldResetProkeralaToken) {
            resetTokenCache();
        }

        const configs = await SiteConfig.find();
        const configMap = {};

        configs.forEach((entry) => {
            configMap[entry.key] = entry.value;
        });

        return res.json({ success: true, data: configMap });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        await Promise.all([
            ensurePoojaSlidesSeeded(),
            ensureProductsSeeded(),
            ensureVideosSeeded()
        ]);

        const [
            poojaCount,
            productCount,
            videoCount,
            kundaliCount,
            janamCount,
            contactCount,
            unreadCount
        ] = await Promise.all([
            PoojaSlide.countDocuments(),
            Product.countDocuments(),
            VideoItem.countDocuments(),
            KundaliSubmission.countDocuments({ type: 'matching' }),
            KundaliSubmission.countDocuments({ type: 'janam' }),
            ContactSubmission.countDocuments(),
            ContactSubmission.countDocuments({ isRead: false })
        ]);

        return res.json({
            success: true,
            data: {
                poojaCount,
                productCount,
                videoCount,
                kundaliCount,
                janamCount,
                contactCount,
                unreadCount
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const imageUrl = `/assets/uploads/${req.file.filename}`;
        return res.json({
            success: true,
            url: imageUrl,
            data: {
                url: imageUrl,
                originalName: req.file.originalname
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
