const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { adminProtect } = require('../middleware/adminAuth');
const ctrl = require('../controllers/adminController');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../assets/uploads');
const allowedImageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']);
const allowedImageMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/avif'
]);

fs.mkdirSync(uploadDir, { recursive: true });

const getFileExtension = (file = {}) => path.extname(file.originalname || '').toLowerCase().replace('.', '');
const hasAllowedImageExtension = (file = {}) => allowedImageExtensions.has(getFileExtension(file));
const hasAllowedImageMime = (file = {}) => {
    const mime = String(file.mimetype || '').toLowerCase();

    if (allowedImageMimeTypes.has(mime)) {
        return true;
    }

    if (mime === 'application/octet-stream' && hasAllowedImageExtension(file)) {
        return true;
    }

    return mime.startsWith('image/') && hasAllowedImageExtension(file);
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname) || '.png';
        const uniqueName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${extension}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (hasAllowedImageExtension(file) && hasAllowedImageMime(file)) {
            return cb(null, true);
        }

        return cb(new Error('Only image files are allowed'));
    }
});

const reportUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 12 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const extension = getFileExtension(file);
        const isPdf = extension === 'pdf' && String(file.mimetype || '').toLowerCase() === 'application/pdf';
        const isImage = hasAllowedImageExtension(file) && hasAllowedImageMime(file);

        if (isPdf || isImage) {
            return cb(null, true);
        }

        return cb(new Error('Only PDF or image report files are allowed'));
    }
});

router.post('/login', ctrl.adminLogin);
router.get('/verify', adminProtect, ctrl.adminVerify);

router.get('/stats', adminProtect, ctrl.getDashboardStats);

router.get('/pooja-slides', adminProtect, ctrl.getPoojaSlides);
router.post('/pooja-slides', adminProtect, ctrl.createPoojaSlide);
router.put('/pooja-slides/:id', adminProtect, ctrl.updatePoojaSlide);
router.delete('/pooja-slides/:id', adminProtect, ctrl.deletePoojaSlide);

router.get('/route-sections', adminProtect, ctrl.getRouteSections);
router.put('/route-sections/:id', adminProtect, ctrl.updateRouteSection);

router.get('/products', adminProtect, ctrl.getProducts);
router.post('/products', adminProtect, ctrl.createProduct);
router.put('/products/:id', adminProtect, ctrl.updateProduct);
router.delete('/products/:id', adminProtect, ctrl.deleteProduct);

router.get('/videos', adminProtect, ctrl.getVideos);
router.post('/videos', adminProtect, ctrl.createVideo);
router.put('/videos/:id', adminProtect, ctrl.updateVideo);
router.delete('/videos/:id', adminProtect, ctrl.deleteVideo);

router.get('/astrology-services', adminProtect, ctrl.getAstrologyServices);
router.post('/astrology-services', adminProtect, ctrl.createAstrologyService);
router.put('/astrology-services/:id', adminProtect, ctrl.updateAstrologyService);
router.delete('/astrology-services/:id', adminProtect, ctrl.deleteAstrologyService);

router.get('/kundali-submissions', adminProtect, ctrl.getKundaliSubmissions);
router.put('/kundali-submissions/:id/status', adminProtect, ctrl.updateKundaliStatus);
router.put('/kundali-submissions/:id/report', adminProtect, reportUpload.single('report'), ctrl.uploadKundaliReport);
router.get('/kundali-submissions/:id/report/file', adminProtect, ctrl.downloadAdminKundaliReport);
router.get('/contact-submissions', adminProtect, ctrl.getContactSubmissions);
router.put('/contact-submissions/:id/read', adminProtect, ctrl.markContactRead);

router.get('/config', adminProtect, ctrl.getConfig);
router.put('/config', adminProtect, ctrl.updateConfig);
router.post('/config/prokerala/test', adminProtect, ctrl.testProkeralaCredentials);

router.post('/upload', adminProtect, upload.single('image'), ctrl.uploadImage);

module.exports = router;
