const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const Channel = require('../models/Channel');
const Request = require('../models/Request');

const { requireRole, requireModWithRestrictions, requireAuth } = require('../middleware/auth');

//======================== GROUP =================================

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

// Retrieve all users (members) in a group
router.get('/groups/:groupId/members', async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).send({ message: 'Group not found' });
        }

        // Fetch the user details for the members of the group
        const members = await User.find({ _id: { $in: group.members } });

        res.send({ members });
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
            
            // find and delete all channels that belong to this group
            const channels = await Channel.find({ group: group._id });
            for (const channel of channels) {
                await channel.deleteOne();
            }

            // thendelete the group itself
            await group.deleteOne();

            res.send({ message: 'Group and its channels deleted successfully' });
        } else {
            return res.status(403).send({ message: 'You do not have permission to delete this group' });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Remove a user from a group (and associated channels)
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

        // Remove the user from the channels within this group
        const channels = await Channel.find({ group: group._id });
        for (const channel of channels) {
            if (channel.members.includes(req.params.userId)) {
                channel.members.pull(req.params.userId);
                await channel.save();
            }
        }

        await group.save();

        res.send({ message: 'User removed from the group and associated channels successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


//============================ CHANNEL ==============================
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
            members: [req.user]
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

// Remove a user from a channel (Only a mod or admin of the channel can do this)
router.delete('/groups/:groupId/channels/:channelId/members/:userId', requireModWithRestrictions(), async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).send({ message: 'Channel not found' });
        }

        // Check if the current user is a mod of the channel or an admin
        if (!(channel.mods.includes(req.user._id) || req.user.role.includes('admin'))) {
            return res.status(403).send({ message: 'You do not have permission to remove users from this channel' });
        }

        // Check if the user to be removed exists in the channel
        if (!channel.members.includes(req.params.userId)) {
            return res.status(404).send({ message: 'User not found in this channel' });
        }

        // Remove the user from the channel
        channel.members.pull(req.params.userId);
        await channel.save();

        res.send({ message: 'User removed from the channel successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Retrieve a channel
router.get('/groups/:groupId/channels/:channelId/', async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).send({ message: 'Channel not found' });
        }
        res.send({ channel });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Retrieve all users (members) in a channel
router.get('/groups/:groupId/channels/:channelId/members', async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).send({ message: 'Channel not found' });
        }
        // Fetch the user details for the members of the channel
        const members = await User.find({ _id: { $in: channel.members } });

        res.send({ members });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

//============================= REQUEST ==============================

// Retrieve all join requests (admin can view all, mods only for their groups)
router.get('/join-requests', requireRole('mod'), async (req, res) => {
    try {
        let groupQuery = {};
        if (req.user.role.includes('mod')) {
            // If the user is a mod, we'll change our query to look for groups where they're a moderator.
            groupQuery = { mods: req.user._id };
        }

        // Fetch the groups where the current user is a mod.
        const modGroups = await Group.find(groupQuery, '_id');

        // Extract the group IDs from the query result.
        const groupIds = modGroups.map(group => group._id);

        // Now, find the requests that belong to these groups.
        const requests = await Request.find({ 'group': { $in: groupIds } })
            .populate('user', 'username email _id')
            .populate('group', 'name _id');

        res.send({ requests });
    } catch (error) {
        console.error('Error fetching requests:', error); // Log any errors
        res.status(500).send({ message: error.message });
    }
});


// Approve or decline join request
router.post('/join-requests/:requestId', requireRole('mod'), async (req, res) => {
    try {
        const requestId = req.params.requestId;

        // get the join request
        const joinRequest = await Request.findById(requestId).populate('group');
        if (!joinRequest) {
            return res.status(404).send({ message: 'Request not found' });
        }

        // check if they're a mod for this group.
        if (req.user.role.includes('mod')) {
            const group = await Group.findOne({ _id: joinRequest.group._id, mods: req.user._id });
            if (!group) {
                return res.status(403).send({ message: 'You do not have permission to manage this request' });
            }
        }

        // Handle the approval or decline
        if (req.body.action === 'approve') {
            // Add the user to the group's members
            joinRequest.group.members.push(joinRequest.user);
            await joinRequest.group.save();
        }

        // Regardless of approve/decline, remove the request
        await Request.deleteOne({ _id: requestId });

        res.send({ message: `Request has been ${req.body.action}d successfully` });
    } catch (error) {
        console.error('Error join request:', error);
        res.status(500).send({ message: error.message });
    }
});


module.exports = router;