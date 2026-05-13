const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { adminProtect } = require('../middleware/adminAuth');
const ctrl = require('../controllers/adminController');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../assets/uploads');
const reportUploadDir = path.join(__dirname, '../../assets/reports');

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(reportUploadDir, { recursive: true });

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
        const allowed = /jpeg|jpg|png|gif|webp|svg/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);

        if (ext && mime) {
            return cb(null, true);
        }

        return cb(new Error('Only image files are allowed'));
    }
});

const reportStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, reportUploadDir);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname) || '.pdf';
        const uniqueName = `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${extension}`;
        cb(null, uniqueName);
    }
});

const reportUpload = multer({
    storage: reportStorage,
    limits: { fileSize: 12 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /pdf|jpeg|jpg|png|gif|webp/;
        const extension = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
        const allowedMime = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ].includes(file.mimetype);

        if (extension && allowedMime) {
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

router.get('/kundali-submissions', adminProtect, ctrl.getKundaliSubmissions);
router.put('/kundali-submissions/:id/status', adminProtect, ctrl.updateKundaliStatus);
router.put('/kundali-submissions/:id/report', adminProtect, reportUpload.single('report'), ctrl.uploadKundaliReport);
router.get('/contact-submissions', adminProtect, ctrl.getContactSubmissions);
router.put('/contact-submissions/:id/read', adminProtect, ctrl.markContactRead);

router.get('/config', adminProtect, ctrl.getConfig);
router.put('/config', adminProtect, ctrl.updateConfig);
router.post('/config/prokerala/test', adminProtect, ctrl.testProkeralaCredentials);

router.post('/upload', adminProtect, upload.single('image'), ctrl.uploadImage);

module.exports = router;
