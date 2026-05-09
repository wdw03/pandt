const jwt = require('jsonwebtoken');

exports.adminProtect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Admin not authorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not an admin account' });
        }
        req.admin = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Admin token expired or invalid' });
    }
};
