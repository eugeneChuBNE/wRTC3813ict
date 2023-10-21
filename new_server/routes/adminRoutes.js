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
        const { role, groupIds } = req.body; // groupIds is an array of IDs of the groups to which the user will be assigned as a mod

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Promoting a user to 'mod'
        if (role === 'mod') {
            // If groupIds are provided, we'll add the user as a mod and a member to these groups
            if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
                await Promise.all(groupIds.map(async (groupId) => {
                    const group = await Group.findById(groupId);
                    if (!group) {
                        return Promise.reject({ message: `Group not found with ID: ${groupId}` });
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

                    // Ensure the user is part of these groups in the user's document as well
                    if (!user.groups.includes(groupId)) {
                        user.groups.push(groupId);
                    }
                }));
            }
        }

        // Update the user's role
        user.role = [role];
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