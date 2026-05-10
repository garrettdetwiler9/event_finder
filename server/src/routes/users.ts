import { Router } from 'express';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /users — create a MongoDB user profile after Firebase signup.
// Called once from the client immediately after createUserWithEmailAndPassword.
// The Firebase UID comes from the verified token (req.user.uid), not the request body.
router.post('/', authenticate, async (req, res) => {
  const { username, displayName, accountType } = req.body;

  if (!username || !displayName) {
    res.status(400).json({ error: 'username and displayName are required' });
    return;
  }

  try {
    // Prevent duplicate profiles if the client retries the request
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
    });

    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === 11000) {
      // Mongoose duplicate key — username is already taken
      res.status(409).json({ error: 'Username is already taken' });
      return;
    }
    res.status(500).json({ error: 'Failed to create user profile' });
  }
});

// GET /users/me — current authenticated user's full profile with friends populated.
// NOTE: must be declared before /:id so Express doesn't treat "me" as a Mongo ID.
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user!.uid }).populate(
      'friends',
      'username displayName avatarUrl'
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

// PATCH /users/me — update editable fields on the current user's profile
router.patch('/me', authenticate, async (req, res) => {
  const { displayName, avatarUrl, accountType } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user!.uid },
      {
        ...(displayName && { displayName }),
        ...(avatarUrl && { avatarUrl }),
        ...(accountType && { accountType }),
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

// GET /users/:id — public profile of any user by their MongoDB _id
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

// POST /users/me/friends/:friendId — add a friend by their MongoDB _id
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

    currentUser.friends.push(friendId as any);
    await currentUser.save();
    res.json({ message: 'Friend added' });
  } catch {
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// DELETE /users/me/friends/:friendId — remove a friend by their MongoDB _id
router.delete('/me/friends/:friendId', authenticate, async (req, res) => {
  try {
    const currentUser = await User.findOne({ firebaseUid: req.user!.uid });
    if (!currentUser) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    currentUser.friends = currentUser.friends.filter(id => id.toString() !== req.params.friendId);
    await currentUser.save();
    res.json({ message: 'Friend removed' });
  } catch {
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

export default router;
