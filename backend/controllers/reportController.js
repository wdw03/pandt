const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const KundaliSubmission = require('../models/KundaliSubmission');
const { cleanString } = require('../utils/contentManager');

const buildOwnerConditions = (user) => {
    const conditions = [];

    if (user?._id) {
        conditions.push({ userId: user._id });
    }

    if (user?.email) {
        conditions.push({ 'userProfile.email': user.email });
    }

    return conditions;
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

const normalizeSubmissionReport = (submission) => {
    const source = submission.toObject ? submission.toObject() : submission;
    const report = source.report || {};
    const displayName = source.type === 'matching'
        ? [source.boyData?.name, source.girlData?.name].filter(Boolean).join(' & ')
        : source.singleData?.name || source.userProfile?.name || 'Kundali Report';

    return {
        ...source,
        displayName,
        report: {
            title: report.title || '',
            note: report.note || '',
            storage: report.storage || (report.fileData?.length ? 'database' : report.fileUrl ? 'file' : ''),
            fileSize: Number(report.fileSize || (report.fileData?.length || 0)),
            originalName: report.originalName || '',
            mimeType: report.mimeType || '',
            uploadedAt: report.uploadedAt || null,
            isSeen: !!report.isSeen,
            hasFile: submissionHasReport(source),
            fileEndpoint: submissionHasReport(source) ? `/api/user/reports/${source._id}/file` : ''
        }
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

exports.getUserReports = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('email name');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const ownerConditions = buildOwnerConditions(user);

        if (!ownerConditions.length) {
            return res.json({
                success: true,
                data: [],
                summary: {
                    totalSubmissions: 0,
                    readyReports: 0,
                    unseenReports: 0
                }
            });
        }

        const submissions = await KundaliSubmission.find({
            $or: ownerConditions
        }).sort({ createdAt: -1 });

        const normalized = submissions.map(normalizeSubmissionReport);
        const readyReports = normalized.filter((entry) => entry.report?.hasFile).length;
        const unseenReports = normalized.filter((entry) => entry.report?.hasFile && !entry.report?.isSeen).length;

        return res.json({
            success: true,
            data: normalized,
            summary: {
                totalSubmissions: normalized.length,
                readyReports,
                unseenReports
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserReportSummary = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('email');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const ownerConditions = buildOwnerConditions(user);

        if (!ownerConditions.length) {
            return res.json({
                success: true,
                data: {
                    totalSubmissions: 0,
                    readyReports: 0,
                    unseenReports: 0
                }
            });
        }

        const submissions = await KundaliSubmission.find({
            $or: ownerConditions
        }).select('report');

        const summary = submissions.reduce((accumulator, submission) => {
            const hasFile = submissionHasReport(submission);

            accumulator.totalSubmissions += 1;

            if (hasFile) {
                accumulator.readyReports += 1;
            }

            if (hasFile && !submission.report?.isSeen) {
                accumulator.unseenReports += 1;
            }

            return accumulator;
        }, {
            totalSubmissions: 0,
            readyReports: 0,
            unseenReports: 0
        });

        return res.json({ success: true, data: summary });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.markUserReportSeen = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid report id' });
        }

        const user = await User.findById(req.user.id).select('email');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const ownerConditions = buildOwnerConditions(user);

        const submission = await KundaliSubmission.findOne({
            _id: req.params.id,
            $or: ownerConditions
        });

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        if (submissionHasReport(submission)) {
            submission.report.isSeen = true;
            await submission.save();
        }

        return res.json({
            success: true,
            data: normalizeSubmissionReport(submission)
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.downloadUserReportFile = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid report id' });
        }

        const user = await User.findById(req.user.id).select('email');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const ownerConditions = buildOwnerConditions(user);
        const submission = await KundaliSubmission.findOne({
            _id: req.params.id,
            $or: ownerConditions
        }).select('+report.fileData');

        if (!submission || !submissionHasReport(submission)) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        return streamSubmissionReport(res, submission, req.query.download === '1');
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
