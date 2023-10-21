const Channel = require('./models/Channel');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join channel', async (channelId) => {
            try {
                socket.join(channelId);
                console.log(`User ${socket.id} joined channel ${channelId}`);
                socket.to(channelId).emit('user joined', { userId: socket.id, channelId }); 
            } catch (error) {
                console.error(`Error joining channel: ${error}`);
            }
        });

        socket.on('leave channel', (channelId) => {
            try {
                socket.leave(channelId);
                console.log(`User ${socket.id} left channel ${channelId}`);
                socket.to(channelId).emit('user left', { userId: socket.id, channelId });
            } catch (error) {
                console.error(`Error leaving channel: ${error}`);
            }
        });

        socket.on('chat message', async (data) => {
            const { content, channelId, sender, role, image } = data;
            try {
                const channel = await Channel.findById(channelId);

                if (!channel) {
                    return console.error('Channel not found');
                }

                const message = {
                    sender,
                    role,
                    content,
                    image,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                channel.messages.push(message);
                await channel.save();

                io.to(channelId).emit('chat message', message);

            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
