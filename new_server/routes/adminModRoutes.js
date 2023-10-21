const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const Channel = require('../models/Channel');
const { requireRole, requireModWithRestrictions } = require('../middleware/auth');

// Create a group (Only an admin or mod can do)
router.post('/groups', requireRole('mod'), async (req, res) => {
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

// Delete a group (Only an admin or mod of the group can do this)
router.delete('/groups/:groupId', requireModWithRestrictions(), async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send({ message: 'Group not found' });
        }

        // If the user is an admin, they can delete any group
        // If the user is a mod, they must be a mod of this specific group to delete it
        const userIsModOfGroup = group.mods.includes(req.user._id);
        if (req.user.role.includes('admin') || (req.user.role.includes('mod') && userIsModOfGroup)) {
            
            // Find all channels that belong to this group
            const channels = await Channel.find({ group: group._id });

            // Delete all channels associated with this group
            for (const channel of channels) {
                await channel.deleteOne();
            }

            // Now that all channels have been deleted, delete the group itself
            await group.deleteOne();

            res.send({ message: 'Group and its channels deleted successfully' });
        } else {
            return res.status(403).send({ message: 'You do not have permission to delete this group' });
        }
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
        
        if (!group.mods.includes(req.user._id) && !req.user.role.includes('admin')) {
            console.log(!req.user.role.includes('admin'));
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

// Delete a channel within a group (Only an admin or mod of the group can do this)
router.delete('/groups/:groupId/channels/:channelId', requireModWithRestrictions(), async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send({ message: 'Group not found' });
        }

        // Check if the current user is a mod of the group
        if (!group.mods.includes(req.user._id) && !req.user.role.includes('admin')) {
            return res.status(403).send({ message: 'You do not have permission to delete channels in this group' });
        }

        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).send({ message: 'Channel not found' });
        }

        // Delete the channel
        await channel.deleteOne();

        // Remove the channel from the group's channels list
        group.channels.pull(channel._id);
        await group.save();

        res.send({ message: 'Channel deleted successfully' });
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