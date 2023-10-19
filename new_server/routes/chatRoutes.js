const express = require('express');
const router = express.Router();
const { requireAuth, requireRole, requireAdmin, requireModWithRestrictions } = require('../middleware/auth');
const Group = require('../models/Group');
const Channel = require('../models/Channel');
const User = require('../models/User');

// Route to retrieve all groups - accessible to everyone
router.get('/groups', async (req, res) => {
    try {
        const groups = await Group.find({});
        return res.status(200).json(groups);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Route to retrieve channels of a group - accessible to mods of the group and admins
router.get('/groups/:groupId/channels', requireModWithRestrictions(), async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId).populate('channels');
        if (!group) return res.status(404).json({ message: 'Group not found' });

        return res.status(200).json(group.channels);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Route to retrieve messages of a channel - accessible to members of the channel, mods of the group, and admins
router.get('/channels/:channelId/messages', requireAuth, async (req, res) => {
    try {
        const { channelId } = req.params;
        const channel = await Channel.findById(channelId).populate('messages.sender');
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        // Ensure the user is a member of the channel, or a mod/admin
        const userIsMember = channel.members.includes(req.user._id);
        const userIsMod = channel.group.mods.includes(req.user._id); // You might need to populate `group` field or make an additional query to get the group
        const userIsAdmin = req.user.role === 'admin';

        if (!userIsMember && !userIsMod && !userIsAdmin) {
            return res.status(403).json({ message: 'Forbidden, you do not have access to this channel' });
        }

        return res.status(200).json(channel.messages);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


// Route to send a message in a channel
router.post('/channels/:channelId/messages', requireAuth, async (req, res) => {
    try {
        const { channelId } = req.params;
        const { content, image } = req.body; // Assuming the message has content and optionally an image

        const channel = await Channel.findById(channelId).populate('group');
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        // Ensure the user is a member of the channel, or a mod/admin
        const userIsMember = channel.members.includes(req.user._id);
        const userIsMod = channel.group.mods.includes(req.user._id);
        const userIsAdmin = req.user.role === 'admin';

        if (!userIsMember && !userIsMod && !userIsAdmin) {
            return res.status(403).json({ message: 'Forbidden, you do not have access to this channel' });
        }

        // Create a message object
        const message = {
            sender: req.user._id,
            role: req.user.role,
            content,
            image,
        };

        // Add the message to the channel's messages
        channel.messages.push(message);
        await channel.save();

        return res.status(201).json(message);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;