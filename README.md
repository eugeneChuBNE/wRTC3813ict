# WebRTC simulation for 3813ICT

## Git Repository Organization

Firstly, about my using of GitHub: i create branches whenever there's in a big stage and only merge it into main once it works perfectly.
...

## Data Structures

### Server-side Data Structures

#### Channel

- **name**: The name of the channel (String).
- **group**: Reference to the group that this channel belongs to (Group ID).
- **members**: Array of users who are members of this channel (User IDs).
- **messages**: Array of messages within the channel.

#### Group

- **name**: The name of the group (String).
- **mods**: Array of users who are moderators for this group (User IDs).
- **members**: Array of users who are members of this group (User IDs).
- **channels**: Array of channels within the group (Channel IDs).

#### Request

- **user**: User making the request (User ID).
- **group**: Group to which the request is made (Group ID).
- **createdAt**: Timestamp of when the request was created (Date).

#### User

- **username**: User's username (String).
- **email**: User's email address (String).
- **password**: User's password (String).
- **role**: User's role, one of ['admin', 'mod', 'user'] (String, default: 'user').
- **groups**: Array of groups the user belongs to (Group IDs).

### Client-side Data Structures

Client-side data structures mirror the server-side data structures but are used for frontend display and interaction.

## Responsibilities Division

Client-side mostly shows them what they need to see, what data they need to put in, and pre-process data and then send it to server. 

As the limitation of time, I cant really validate on server side, mostly showing up the error as a message and the validation comes in the server side - it's easier at this stage, and safer as well. But if i have time, i'd implement something on server side as well.

Besides, server side also handles the connection to MongoDB, socket, and respond to requests sent from client side.


## REST API Routes

### Groups

#### Create a Group
- **URL**: `POST /groups`
- **Permission**: Only an admin or mod can create a group.
- **Description**: Create a new group, where the creator becomes a mod and the first member.

#### Retrieve Members of a Group
- **URL**: `GET /groups/:groupId/members`
- **Description**: Retrieve all users (members) in a group.

#### Delete a Group
- **URL**: `DELETE /groups/:groupId`
- **Permission**: Only an admin or mod of the group can delete it.
- **Description**: Delete a group and its associated channels.

#### Remove a User from a Group
- **URL**: `DELETE /groups/:groupId/users/:userId`
- **Permission**: Only a mod or admin of the group can remove users from it.
- **Description**: Remove a user from a group and associated channels.

### Channels

#### Create a Channel within a Group
- **URL**: `POST /groups/:groupId/channels`
- **Permission**: Only a mod or admin of the group can create a channel.
- **Description**: Create a new channel within a group.

#### Delete a Channel within a Group
- **URL**: `DELETE /groups/:groupId/channels/:channelId`
- **Permission**: Only an admin or mod of the group can delete a channel.
- **Description**: Delete a channel within a group.

#### Remove a User from a Channel
- **URL**: `DELETE /groups/:groupId/channels/:channelId/members/:userId`
- **Permission**: Only a mod or admin of the channel can remove users from it.
- **Description**: Remove a user from a channel.

#### Retrieve a Channel
- **URL**: `GET /groups/:groupId/channels/:channelId/`
- **Description**: Retrieve information about a specific channel.

#### Retrieve Members of a Channel
- **URL**: `GET /groups/:groupId/channels/:channelId/members`
- **Description**: Retrieve all users (members) in a channel.

### Requests

#### Retrieve All Join Requests
- **URL**: `GET /join-requests`
- **Permission**: Admins can view all, mods can view requests for their groups.
- **Description**: Retrieve all join requests, with the ability for admins to view all requests and mods to view requests for their groups.

#### Approve or Decline Join Request
- **URL**: `POST /join-requests/:requestId`
- **Permission**: Only mods can approve or decline join requests.
- **Description**: Approve or decline a join request, adding the user to the group's members upon approval.

### Users

#### Promote a User to Admin or Mod
- **URL**: `PATCH /users/:id/role`
- **Permission**: Only an admin can promote a user to admin or mod.
- **Description**: Promote a user to an admin, mod, or both roles. Optionally, assign the user to specific groups as a mod. This route allows for user role and group assignments.

#### Fetch All Users
- **URL**: `GET /users`
- **Permission**: Accessible only by admins.
- **Description**: Fetch all users in the system. This route provides access to user information for administrators.

#### Delete a User
- **URL**: `DELETE /users/:id`
- **Permission**: Only an admin can delete a user.
- **Description**: Delete a user from the system. This route allows administrators to remove users.

### Group and User Management

#### Leave a Group
- **URL**: `POST /groups/:groupId/leave`
- **Permission**: Accessible to any authenticated user.
- **Description**: Allows authenticated users to leave a specific group. The user's ID will be removed from the group's members array.

#### Delete User Account
- **URL**: `DELETE /users/me`
- **Permission**: Accessible to any authenticated user.
- **Description**: Allows authenticated users to delete their own account. The user's account will be permanently removed.

#### Submit a Request to Join a Group
- **URL**: `POST /groups/:groupId/requests`
- **Permission**: Accessible to any authenticated user.
- **Description**: Allows authenticated users to submit a request to join a specific group. Users can only submit one request per group.

### Groups

#### Retrieve All Groups
- **URL**: `GET /groups`
- **Permission**: Accessible to authenticated users.
- **Description**: Retrieve a list of all groups. This route provides access to information about all groups in the system and is accessible to authenticated users.

#### Retrieve All Groups of a User
- **URL**: `GET /my-groups`
- **Permission**: Accessible to authenticated users.
- **Description**: Retrieve a list of groups that a user is a member of. This route allows users to see the groups they belong to.

#### Retrieve Channels of a Group
- **URL**: `GET /groups/:groupId/`
- **Permission**: Accessible to all members of the group.
- **Description**: Retrieve the channels of a specific group. This route is accessible to all members of the group and provides information about the channels within the group.

### Authentication

#### User Registration
- **URL**: `POST /register`
- **Permission**: Open to all users (public).
- **Description**: Register a new user. This route allows users to create an account by providing their username, email, password, and an optional role.

#### User Login
- **URL**: `POST /login`
- **Permission**: Open to all users (public).
- **Description**: Authenticate a user and generate a JWT token for future authentication. Users provide their email and password to log in.

#### Get User Profile
- **URL**: `GET /user`
- **Permission**: Accessible to authenticated users.
- **Description**: Retrieve the profile information of the currently authenticated user. Users must be authenticated using a valid JWT token to access their profile.

#### User Logout
- **URL**: `POST /logout`
- **Permission**: Accessible to authenticated users.
- **Description**: Log out the currently authenticated user by clearing the JWT token from the cookie.

### Channels and Messages (socket io)

#### Retrieve Messages of a Channel
- **URL**: `GET /channels/:channelId/messages`
- **Permission**: Accessible to members of the channel, mods of the group, and admins.
- **Description**: Retrieve messages from a specific channel. This route is accessible to members of the channel, group mods, and admins.

#### Send a Message in a Channel
- **URL**: `POST /channels/:channelId/messages`
- **Permission**: Accessible to members of the channel, mods of the group, and admins.
- **Description**: Send a message in a specific channel. Users can provide message content and optionally an image.

#### Join a Channel in a Group
- **URL**: `POST /groups/:groupId/channels/:channelId/join`
- **Permission**: Accessible to authenticated users who are members of the group.
- **Description**: Join a channel within a group. This route allows group members to join channels within the same group.


## Angular Architecture
This section provides an overview of the architecture of our Angular application. It covers the module structure and routing configuration.

### Modules

Our Angular application is structured using modules to organize and encapsulate different parts of the application. Here are the primary modules used in our application:

#### AppModule

- The `AppModule` is the root module of our Angular application.
- It imports other modules, components, and services.
- It defines the root component (`AppComponent`) and sets up the initial application.

#### Feature Modules

- Feature modules are used to group related components, services, and other functionality.
- These modules are organized based on different features or sections of the application.
- Example feature modules include `AuthModule` and `GroupModule`.

### Routing

Angular provides a powerful routing mechanism that allows us to navigate between different views (components) within our application. Here are some of the main routes in our application:

#### Home

- The default route that displays the home page of our application.
- URL Path: `/`

#### Login

- Allows users to log in to their accounts.
- URL Path: `/login`

#### Register

- Allows new users to create accounts.
- URL Path: `/register`

#### Promote User

- Provides the functionality to promote a user to admin or mod (Admin-only route).
- URL Path: `/promote-user`

#### Group Channels

- Displays channels within a group.
- URL Path: `/group/:groupId/channels`

#### Requests

- Shows join requests for groups (Mod-only route).
- URL Path: `/requests`

#### User List

- Lists users (Admin-only route).
- URL Path: `/list-user`

#### Channel

- Displays messages within a channel.
- URL Path: `/group/:groupId/channel/:channelId`

#### User Groups

- Lists user groups.
- URL Path: `/list-group`

...

## Interaction Between Client and Server

Client side will collect data from both users and server via requests (req) and responses (res). For this project, I chose jwt (jsonwebtoken) and mixed-use between cookies and sessions, so that the authentications and authorizations are quite safe and every functions work as (mostly) expected.

...
