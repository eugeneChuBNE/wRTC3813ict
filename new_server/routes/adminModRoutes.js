const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const Channel = require('../models/Channel');
const { requireRole, requireModWithRestrictions } = require('../middleware/auth');

// Create a group (Only an admin or mod can do)
router.post('/groups', requireModWithRestrictions(), async (req, res) => {
    try {
        const group = new Group({
            name: req.body.name,
            mods: [req.user._id], // The creator becomes a mod
            members: [req.user._id] // The creator is the first member
        });
        await group.save();
        res.send({ message: 'Group created successfully', group });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Create a channel within a group (Only a mod or admin of the group can do this)
router.post('/groups/:groupId/channels', requireModWithRestrictions(), async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send({ message: 'Group not found' });
        }

        // Check if the current user is a mod of the group
        if (!group.mods.includes(req.user._id)) {
            return res.status(403).send({ message: 'You do not have permission to create a channel in this group' });
        }

        const channel = new Channel({
            name: req.body.name,
            group: group._id,
        });
        await channel.save();

        group.channels.push(channel._id); // Add the new channel to the group's channels
        await group.save();

        res.send({ message: 'Channel created successfully', channel });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Remove users from a group (Only a mod or admin of the group can do this)
router.delete('/groups/:groupId/users/:userId', requireModWithRestrictions(), async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send({ message: 'Group not found' });
        }

        // Check if the current user is a mod of the group
        if (!group.mods.includes(req.user._id)) {
            return res.status(403).send({ message: 'You do not have permission to remove users from this group' });
        }

        // Check if the user to be removed exists in the group
        if (!group.members.includes(req.params.userId)) {
            return res.status(404).send({ message: 'User not found in this group' });
        }

        // Remove the user from the group
        group.members.pull(req.params.userId);
        await group.save();

        res.send({ message: 'User removed from the group successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Retrieve all join requests (admin can view all, mods only for their groups)
router.get('/join-requests', requireRole('mod'), async (req, res) => {
    try {
        const requests = await Request.find({})
            .populate('user', 'username')
            .populate('group', 'name');
        res.send({ requests });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Approve or decline join request
router.post('/join-requests/:requestId', requireModWithRestrictions(), async (req, res) => {
    try {
        const joinRequest = await Request.findById(req.params.requestId)
            .populate('group');
        if (!joinRequest) {
            return res.status(404).send({ message: 'Request not found' });
        }

        // If the user is a mod but not for this group, they can't approve/decline the request
        if (req.user.role === 'mod' && !joinRequest.group.mods.includes(req.user._id)) {
            return res.status(403).send({ message: 'You do not have permission to manage this request' });
        }

        if (req.body.action === 'approve') {
            joinRequest.group.members.push(joinRequest.user);
            await joinRequest.group.save();
        }

        // Delete the request after approval/decline
        await joinRequest.remove();

        res.send({ message: `Request has been ${req.body.action}d successfully` });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;