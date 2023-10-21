const express = require('express');
const router = express.Router();
const { requireAuth, requireRole, requireAdmin,requireGroupMember, requireModWithRestrictions } = require('../middleware/auth');

const Group = require('../models/Group');
const Channel = require('../models/Channel');
const User = require('../models/User');
const Request = require('../models/Request');
const socket = require('../socket');

// Route to retrieve messages of a channel - accessible to members of the channel, mods of the group, and admins
router.get('/channels/:channelId/messages', requireAuth, async (req, res) => {
    try {
        const { channelId } = req.params;
        const channel = await Channel.findById(channelId).populate('messages.sender');
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        // Ensure the user is a member of the channel, or a mod/admin
        const userIsMember = channel.members.includes(req.user._id);
        const userIsMod = channel.group.mods.includes(req.user._id); 
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

module.exports = router;
