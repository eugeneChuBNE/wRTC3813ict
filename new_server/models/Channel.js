var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the structure of the Channel document.
var channelSchema = new Schema({
    // The name of the channel.
    name: {
        type: String,
        required: true // This field is mandatory.
    },
    // Reference to the group that this channel belongs to.
    group: { 
        type: Schema.Types.ObjectId, 
        ref: 'Group', // Establishes a relationship with the Group model.
        required: true // The channel must be associated with a group.
    },
    // Array of users who are members of this channel.
    members: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User', // Establishes a relationship with the User model.
    }],
    // messages within the channel.
    messages: [{ 
        // User who sent the message.
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Establishes a relationship with the User model.
            required: true // Every message must have a sender.
        },
        // Role of the user, useful for frontend display purposes.
        role: { 
            type: String, 
        },
        // Text content of the message.
        content: { 
            type: String,
            required: false // Content is optional; a message might be an image only.
        },
        // Optional image content for the message, represented as a URL or file path.
        image: { 
            type: String,
            required: false // Images are optional in messages.
        }
    }]
}, 
{ 
    timestamps: true // Enable automatic createdAt and updatedAt timestamps for tracking when documents are modified.
});

// Export the model with the associated schema.
module.exports = mongoose.model('Channel', channelSchema);
