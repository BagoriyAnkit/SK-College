const { Tokenverify } = require('../utils/jwt');
const User = require('../model/fronted/register');

// Helper to identify public authentication endpoints that must never require a login token
const isPublicAuthRoute = (req) => {
    const url = (req.originalUrl || req.url || req.path || "").toLowerCase();
    return (
        url.includes("/uploads") ||
        url.includes("/forgot-password") ||
        url.includes("/reset-password") ||
        url.includes("/verify-reset-token") ||
        url.includes("/login") ||
        url.includes("/register") ||
        url.includes("/admission/apply") ||
        url.includes("/apply")
    );
};

const verifyToken = async (req, res, next) => {
    try {
        // Allow public password-reset and authentication endpoints without requiring an existing token
        if (isPublicAuthRoute(req)) {
            return next();
        }

        const authHeader = req.headers.authorization || req.headers.token;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                status: false,
                message: "Authentication token required"
            });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        if (!token) {
            return res.status(401).json({
                success: false,
                status: false,
                message: "Authentication token required"
            });
        }

        const decoded = await Tokenverify(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                status: false,
                message: "Invalid or expired token"
            });
        }

        // Invalidate active session/token if student password was reset after token issuance
        if (decoded.id && decoded.role === "student") {
            try {
                const userDoc = await User.findById(decoded.id).select("passwordChangedAt");
                if (userDoc && userDoc.passwordChangedAt && decoded.iat) {
                    const changedTimestamp = Math.floor(new Date(userDoc.passwordChangedAt).getTime() / 1000);
                    if (decoded.iat < changedTimestamp) {
                        return res.status(401).json({
                            success: false,
                            status: false,
                            message: "Password was recently reset. Please log in again with your new password."
                        });
                    }
                }
            } catch (userErr) {
                console.error("Token verification check error:", userErr);
            }
        }

        req.user = decoded;
        if (req.user && req.user.role) {
            req.user.role = String(req.user.role).toLowerCase();
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            status: false,
            message: "Invalid or expired token"
        });
    }
};

const authorizeRoles = (...allowedRoles) => {
    const roles = allowedRoles.flat().map((r) => String(r).toLowerCase());
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                status: false,
                message: "Authentication required"
            });
        }

        const userRole = String(req.user.role).toLowerCase();
        if (userRole === "admin" || roles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            status: false,
            message: "Access forbidden: Insufficient permissions"
        });
    };
};

const verifyAdmin = (req, res, next) => {
    return verifyToken(req, res, () => {
        return authorizeRoles("admin")(req, res, next);
    });
};

verifyToken.verifyToken = verifyToken;
verifyToken.verifyAdmin = verifyAdmin;
verifyToken.authorizeRoles = authorizeRoles;

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.verifyAdmin = verifyAdmin;
module.exports.authorizeRoles = authorizeRoles;
