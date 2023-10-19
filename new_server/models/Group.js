var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    mods: [{ // Array of users who are mods for this group
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    members: [{ // Array of users who are members of this group
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    channels: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Channel' 
    }]
}, { timestamps: true });


module.exports = mongoose.model('Group', groupSchema);
