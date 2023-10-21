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
            if (!user.role.includes(role) && !user.role.includes('admin')) {
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

const requireAdmin = async (req, res, next) => {
    try {
        console.log('Cookies:', req.cookies);  // Log cookies to check if the token is received
        const token = req.cookies['jwt'];
        if (!token) throw new Error('No token provided');

        console.log('Token:', token);  // Log the token
        const decoded = jwt.verify(token, jwtSecret);
        console.log('Decoded token:', decoded);  // Log the decoded token

        const user = await User.findById(decoded._id);
        console.log('User found:', user);  // Log the user retrieved from the database

        if (!user) throw new Error('User not found');

        // Verify user's role is 'admin'
        if (!user.role.includes('admin')) {
            console.error('User is not an admin:', user);  // Log when the user is not an admin
            return res.status(403).send({ message: 'Forbidden, you must be an admin to proceed' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Middleware error:', error);  // Log the caught error
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
            if (user.role.includes('admin')) {
                req.user = user;
                next();
            } else if (user.role.includes('mod')) {
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

// Middleware to validate if a user is a member of a specific group
const requireGroupMember = () => {
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

            // Retrieve group ID from request parameters
            const groupId = req.params.groupId;

            // Fetch the corresponding group from the database
            const group = await Group.findById(groupId);

            if (!group) {
                return res.status(404).send({ message: 'Group not found' });
            }

            // Check if the user is a member of this group
            isMemberOfGroup = group.members.includes(user._id) || user.role.includes('admin');
            console.log('isMemofG: ',isMemberOfGroup);

            if (!isMemberOfGroup) {
                return res.status(403).send({ message: 'Forbidden, you are not a member of this group' });
            }
            // If the user is a member, add the user object to the request and proceed
            req.user = user;
            next();
        } catch (error) {
            // Handle errors related to token verification or user retrieval
            return res.status(401).send({ message: 'Unauthorized, invalid token' });
        }
    };
};

// Export the new middleware function for use in routes
module.exports = { requireRole, requireAdmin, requireModWithRestrictions, requireAuth, requireGroupMember };