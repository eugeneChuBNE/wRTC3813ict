const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');

// JWT secret for token verification, ideally fetched from environment variables
const jwtSecret = process.env.JWT_SECRET || 'secret';

// Middleware for general authentication without role checking
const requireAuth = async (req, res, next) => {
    try {
        // Retrieve token from cookies
        const token = req.cookies['jwt'];
        if (!token) throw new Error('No token provided');

        // Decode and verify the received JWT
        const decoded = jwt.verify(token, jwtSecret);
        // Fetch the user with the corresponding ID from the database
        const user = await User.findById(decoded._id);
        if (!user) throw new Error('User not found');

        // Add the user object to the request
        req.user = user;
        next();
    } catch (error) {
        // Handle errors related to token verification or user retrieval
        return res.status(401).send({ message: 'Unauthorized, invalid token' });
    }
};

// Middleware to validate if a user has a specific role
const requireRole = (role) => {
    return async (req, res, next) => {
        try {
            // Retrieve token from cookies
            const token = req.cookies['jwt'];
            if (!token) throw new Error('No token provided');

            // Decode and verify the received JWT
            const decoded = jwt.verify(token, jwtSecret);
            // Fetch the user with the corresponding ID from the database
            const user = await User.findById(decoded._id);
            if (!user) throw new Error('User not found');

            // Check if the user's role matches the required role or if the user is an admin
            if (user.role !== role && user.role !== 'admin') {
                return res.status(403).send({ message: 'Forbidden, incorrect role' });
            }

            // Add the user object to the request
            req.user = user;
            next();
        } catch (error) {
            // Handle errors related to token verification or user retrieval
            return res.status(401).send({ message: 'Unauthorized, invalid token' });
        }
    };
};

// Middleware to specifically validate if the user is an admin
const requireAdmin = async (req, res, next) => {
    try {
        const token = req.cookies['jwt'];
        if (!token) throw new Error('No token provided');

        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findById(decoded._id);
        if (!user) throw new Error('User not found');

        // Verify user's role is 'admin'
        if (user.role !== 'admin') {
            return res.status(403).send({ message: 'Forbidden, you must be an admin to proceed' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Unauthorized, invalid token' });
    }
};

const requireModWithRestrictions = () => {
    return async (req, res, next) => {
        try {
            const token = req.cookies['jwt'];
            if (!token) throw new Error('No token provided');

            const decoded = jwt.verify(token, jwtSecret);
            const user = await User.findById(decoded._id);
            if (!user) throw new Error('User not found');

            // Grant access if user is an admin
            if (user.role === 'admin') {
                req.user = user;
                next();
            } else if (user.role === 'mod') {
                // Retrieve group ID from request parameters
                const groupId = req.params.groupId;
                // Fetch the corresponding group from the database
                const group = await Group.findById(groupId);

                if (!group) {
                    return res.status(404).send({ message: 'Group not found' });
                }

                // Check if the mod is part of this group's mods
                const isModForGroup = group.mods.includes(user._id);
                if (!isModForGroup) {
                    return res.status(403).send({ message: 'Forbidden, you do not have permission for this group' });
                }

                // Add the user object to the request
                req.user = user;
                next();
            } else {
                return res.status(403).send({ message: 'Forbidden, you must be an admin or mod to proceed' });
            }
        } catch (error) {
            return res.status(401).send({ message: 'Unauthorized, invalid token' });
        }
    };
};

// Exporting the middleware functions for use in routes
module.exports = { requireRole, requireAdmin, requireModWithRestrictions, requireAuth };
