const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Use an environment variable for the secret key
const jwtSecret = process.env.JWT_SECRET || 'secret'; // Make sure to set this in your environment

// Middleware for role-based access control
// This function returns a middleware function tailored for a specific role
// that checks the user's role before allowing them to continue
function requireRole(role) {
    return async (req, res, next) => {
        try {
            const token = req.cookies['jwt'];
            if (!token) throw new Error('No token provided');

            const decoded = jwt.verify(token, jwtSecret);
            const user = await User.findById(decoded._id);
            if (!user) throw new Error('User not found');

            // Check if user role matches the required role
            if (user.role !== role) {
                return res.status(403).send({ message: 'Forbidden, incorrect role' });
            }
            
            // Store user in the request
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).send({ message: 'Unauthorized, invalid token' });
        }
    };
}

// Registration route
router.post('/register', async (req, res) => {
    try {
        // Input validation would go here...

        const { name, email, password, role } = req.body;
        
        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'User already exists' });
        }

        // If the user does not exist, proceed with saving new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Creating new user instance. Assign a role if provided, otherwise default to 'user'
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user', // default role
        });

        // Saving the user in the database
        const result = await user.save();
        const {password: _, ...data} = result.toJSON();

        res.status(201).send(data);
    } catch (error) {
        // Handle errors gracefully
        res.status(500).send({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        // Input validation would go here...

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Check if the provided password matches the one in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid credentials' });
        }

        // If the user is authenticated, then create a JWT token
        const token = jwt.sign({ _id: user._id }, jwtSecret);

        // Set the JWT token in a HTTP-only cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.send({ message: 'Success' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Get user route (User profile)
router.get('/user', async (req, res) => {
    try {
        const cookie = req.cookies['jwt'];

        const claims = jwt.verify(cookie, jwtSecret);
        if (!claims) {
            return res.status(401).send({ message: 'Unauthenticated' });
        }

        const user = await User.findOne({ _id: claims._id });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const {password, ...data} = user.toJSON();
        res.send(data);
    } catch (error) {
        return res.status(401).send({ message: 'Unauthenticated, invalid token' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    // Clear the JWT token from the cookie
    res.cookie('jwt', '', { maxAge: 0 });
    res.send({ message: 'Successfully logged out' });
});

// Example of a route that requires a user to be an admin
router.get('/admin-route', requireRole('admin'), (req, res) => {
    // If middleware doesn't send a response, the user has the correct role
    res.send('Welcome, admin!');
});

// Export the router to be used in server.js
module.exports = router;
