import { Router } from 'express';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /users — create profile after Firebase signup
router.post('/', authenticate, async (req, res) => {
  const { username, displayName, accountType, birthdate } = req.body;

  if (!username || !displayName) {
    res.status(400).json({ error: 'username and displayName are required' });
    return;
  }

  try {
    const existing = await User.findOne({ firebaseUid: req.user!.uid });
    if (existing) {
      res.status(409).json({ error: 'User profile already exists' });
      return;
    }

    const user = await User.create({
      firebaseUid: req.user!.uid,
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      accountType: accountType ?? 'user',
      birthdate: birthdate ? new Date(birthdate) : undefined,
    });

    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: 'Username is already taken' });
      return;
    }
    res.status(500).json({ error: 'Failed to create user profile' });
  }
});

// GET /users/me — current user profile with friends populated
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user!.uid }).populate(
      'friends',
      'username displayName avatarUrl accountType'
    );
    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PATCH /users/me — update profile fields
router.patch('/me', authenticate, async (req, res) => {
  const { displayName, avatarUrl, accountType, birthdate, interests } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user!.uid },
      {
        ...(displayName && { displayName }),
        ...(avatarUrl && { avatarUrl }),
        ...(accountType && { accountType }),
        ...(birthdate && { birthdate: new Date(birthdate) }),
        ...(interests && { interests }),
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// POST /users/me/push-token — register Expo push token for notifications
router.post('/me/push-token', authenticate, async (req, res) => {
  const { pushToken } = req.body;
  if (!pushToken) {
    res.status(400).json({ error: 'pushToken is required' });
    return;
  }
  try {
    await User.findOneAndUpdate({ firebaseUid: req.user!.uid }, { pushToken });
    res.json({ message: 'Push token registered' });
  } catch {
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

// GET /users/search?q= — search users by username or displayName
router.get('/search', authenticate, async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    res.status(400).json({ error: 'Query must be at least 2 characters' });
    return;
  }

  try {
    const currentUser = await User.findOne({ firebaseUid: req.user!.uid });
    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $or: [{ username: regex }, { displayName: regex }],
      _id: { $ne: currentUser?._id },
    })
      .select('username displayName avatarUrl accountType verified')
      .limit(20);
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /users/me/invites — get pending event invites for current user
router.get('/me/invites', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const Event = (await import('../models/Event')).default;
    const pendingInvites = user.invites.filter(inv => inv.status === 'pending');
    const eventIds = pendingInvites.map(inv => inv.eventId);
    const events = await Event.find({ _id: { $in: eventIds } })
      .populate('creator', 'username displayName avatarUrl')
      .select('title startTime address category');

    const result = pendingInvites.map(inv => ({
      eventId: inv.eventId,
      invitedBy: inv.invitedBy,
      status: inv.status,
      createdAt: inv.createdAt,
      event: events.find(e => e._id.toString() === inv.eventId.toString()),
    }));

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

// PATCH /users/me/invites/:eventId — accept or decline an invite
router.patch('/me/invites/:eventId', authenticate, async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) {
    res.status(400).json({ error: 'status must be accepted or declined' });
    return;
  }

  try {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const invite = user.invites.find(inv => inv.eventId.toString() === req.params.eventId);
    if (!invite) {
      res.status(404).json({ error: 'Invite not found' });
      return;
    }

    invite.status = status;

    if (status === 'accepted') {
      const Event = (await import('../models/Event')).default;
      const event = await Event.findById(req.params.eventId);
      if (event && !event.attendees.map(id => id.toString()).includes(user._id.toString())) {
        event.attendees.push(user._id as any);
        await event.save();
      }
    }

    await user.save();
    res.json({ message: `Invite ${status}` });
  } catch {
    res.status(500).json({ error: 'Failed to update invite' });
  }
});

// GET /users/:id — public profile by MongoDB _id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'username displayName avatarUrl accountType verified friends'
    );
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /users/me/friends/:friendId — add a friend
router.post('/me/friends/:friendId', authenticate, async (req, res) => {
  try {
    const currentUser = await User.findOne({ firebaseUid: req.user!.uid });
    if (!currentUser) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const { friendId } = req.params;
    if (currentUser._id.toString() === friendId) {
      res.status(400).json({ error: 'Cannot add yourself as a friend' });
      return;
    }
    if (currentUser.friends.map(id => id.toString()).includes(friendId)) {
      res.status(409).json({ error: 'Already friends' });
      return;
    }

    const friendExists = await User.findById(friendId);
    if (!friendExists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    currentUser.friends.push(friendId as any);
    await currentUser.save();
    res.json({ message: 'Friend added' });
  } catch {
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// DELETE /users/me/friends/:friendId — remove a friend
router.delete('/me/friends/:friendId', authenticate, async (req, res) => {
  try {
    const currentUser = await User.findOne({ firebaseUid: req.user!.uid });
    if (!currentUser) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    currentUser.friends = currentUser.friends.filter(
      id => id.toString() !== req.params.friendId
    );
    await currentUser.save();
    res.json({ message: 'Friend removed' });
  } catch {
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

export default router;
