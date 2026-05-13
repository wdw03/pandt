const express = require('express');
const { getProfile, updateProfile } = require('../controllers/authController');
const {
    getUserReports,
    getUserReportSummary,
    markUserReportSeen,
    downloadUserReportFile
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/reports', protect, getUserReports);
router.get('/reports/summary', protect, getUserReportSummary);
router.get('/reports/:id/file', protect, downloadUserReportFile);
router.put('/reports/:id/seen', protect, markUserReportSeen);

module.exports = router;
