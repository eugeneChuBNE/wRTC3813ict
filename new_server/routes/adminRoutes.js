const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const Channel = require('../models/Channel');
const { requireAdmin } = require('../middleware/auth');

// Promote a user to admin or mod (Only an admin can do this)
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
    try {
        const { role, groupId } = req.body; // groupId is the ID of the group to which the user will be assigned

        if (!groupId && role === 'mod') {
            return res.status(400).send({ message: 'groupId is required to promote a user to mod' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // If the user is being promoted to 'mod', we need to handle group assignment
        if (role === 'mod') {
            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).send({ message: 'Group not found' });
            }

            // Check if the user is already a member of the group; if not, add them
            if (!group.members.includes(user._id)) {
                group.members.push(user._id);
            }

            // If the user is not already a mod, add them to the mods list
            if (!group.mods.includes(user._id)) {
                group.mods.push(user._id);
            }

            // Save the updated group information
            await group.save();
        }

        // Update the user's role
        user.role = role;
        await user.save();

        res.send({ message: 'Role updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
});

// Route to fetch all users (accessible only by admins)
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
});


// Delete a user (Only an admin can do this)
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const result = await User.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;