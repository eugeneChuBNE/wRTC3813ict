var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    password: { 
        type: String,
        required: true
    },
    role: [{
        type: String,
        enum: ['admin', 'mod', 'user'],
        default: 'user'
    }],
    groups: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Group' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
