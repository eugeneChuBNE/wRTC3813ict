const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const Channel = require('../models/Channel');
const Request = require('../models/Request');
const { requireRole, requireModWithRestrictions, requireAuth } = require('../middleware/auth');

