const express = require('express');
const router = express.Router();
const { requireAuth, requireRole, requireAdmin,requireGroupMember, requireModWithRestrictions } = require('../middleware/auth');

const Group = require('../models/Group');
const Channel = require('../models/Channel');
const User = require('../models/User');


// Route to retrieve all groups - accessible to everyone
router.get('/groups',requireAuth, async (req, res) => {
    try {
        const groups = await Group.find({});
        return res.status(200).json(groups);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Route to retrieve all groups of a user
router.get('/my-groups', requireAuth, async (req, res) => {
    try {
        // req.user should have the user's information, including their ID, thanks to the requireAuth middleware.
        const userId = req.user._id;

        // Find all groups where this user is a member. This assumes that the 'members' field in the Group schema contains user IDs.
        const groups = await Group.find({ members: userId });
        
        return res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
});


// Route to retrieve channels of a group - accessible to all members of the group
router.get('/groups/:groupId/', requireGroupMember(), async (req, res) => {
    try {
        const { groupId } = req.params;
        
        // Find the group with the specified ID and populate its 'channels' field
        const group = await Group.findById(groupId).populate('channels');
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if the user is a member of the group,
        if (!group.members.includes(req.user._id)) {
            if(!req.user.role.includes('admin')){
                return res.status(403).json({ message: 'Forbidden, you are not a member of this group' });

            }
        }
        // If the user is a member, then return the channels
        return res.status(200).json(group);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
