const mongoose = require('mongoose');
const User = require('../models/User');
const KundaliSubmission = require('../models/KundaliSubmission');
const { toWebAssetPath } = require('../utils/contentManager');

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
            ...report,
            fileUrl: toWebAssetPath(report.fileUrl)
        }
    };
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
        const readyReports = normalized.filter((entry) => entry.report?.fileUrl).length;
        const unseenReports = normalized.filter((entry) => entry.report?.fileUrl && !entry.report?.isSeen).length;

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
            const hasFile = !!submission.report?.fileUrl;

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

        if (submission.report?.fileUrl) {
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
