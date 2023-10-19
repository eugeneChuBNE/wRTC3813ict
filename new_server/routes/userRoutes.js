const router = require('express').Router();
const User = require('../models/User');
const Group = require('../models/Group');
const Channel = require('../models/Channel');
const { requireAuth } = require('../middleware/auth');

// Users register an interest in a group (Any authenticated user can do this)
router.post('/groups/:groupId/register-interest', requireAuth, async (req, res) => {
    try {
        // Find the group with the specified ID
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send({ message: 'Group not found' });
        }

        // Check if the user has already registered interest
        if (group.interestedUsers.includes(req.user._id)) {
            return res.status(400).send({ message: 'already registered interest in this group' });
        }

        // Add the user's ID to the interestedUsers array
        group.interestedUsers.push(req.user._id);
        await group.save();
        res.send({ message: 'successfully registered interest in this group' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Users leave a group (Any authenticated user can do this)
router.post('/groups/:groupId/leave', requireAuth, async (req, res) => {
    try {
        // Find the group with the specified ID
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send({ message: 'Group not found' });
        }

        // Check if the user is actually a member of the group
        if (!group.members.includes(req.user._id)) {
            return res.status(403).send({ message: 'not a member of this group' });
        }

        // Remove the user's ID from the members array
        group.members.pull(req.user._id);
        await group.save();
        res.send({ message: 'successfully left this group' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Users delete their own account (Any authenticated user can do this)
router.delete('/users/me', requireAuth, async (req, res) => {
    try {
        // Find the authenticated user and delete their account
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        await user.remove();
        res.send({ message: ' account has been deleted' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Users join a channel in a group (Any group member can do this)
router.post('/groups/:groupId/channels/:channelId/join', requireAuth, async (req, res) => {
    try {
        // Find the group with the specified ID
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send({ message: 'Group not found' });
        }

        // Check if the user is a member of the group
        if (!group.members.includes(req.user._id)) {
            return res.status(403).send({ message: ' must be a member of the group to join its channels' });
        }

        // Find the channel with the specified ID
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).send({ message: 'Channel not found' });
        }

        // Check if the channel belongs to the group
        if (channel.group.toString() !== req.params.groupId) {
            return res.status(403).send({ message: 'Channel does not belong to the specified group' });
        }

        // Check if the user is already a member of the channel
        if (channel.members.includes(req.user._id)) {
            return res.status(400).send({ message: 'already a member of this channel' });
        }

        // Add the user to the channel's members and save
        channel.members.push(req.user._id);
        await channel.save();

        res.send({ message: 'successfully joined the channel' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Users submit a request to join a group
router.post('/groups/:groupId/requests', requireAuth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send({ message: 'Group not found' });
        }

        const existingRequest = await Request.findOne({ user: req.user._id, group: req.params.groupId });
        if (existingRequest) {
            return res.status(400).send({ message: 'You have already submitted a request to join this group' });
        }

        const joinRequest = new Request({
            user: req.user._id,
            group: req.params.groupId
        });
        await joinRequest.save();

        res.send({ message: 'Request to join group submitted successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
