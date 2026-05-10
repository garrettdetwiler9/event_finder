import { Router } from 'express';
import Event from '../models/Event';
import User from '../models/User';
import { authenticate } from '../middleware/auth';
import { sendPushNotification } from '../utils/notifications';

const router = Router();

function getUserAge(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) age--;
  return age;
}

// GET /events/mine — events created by the current user (host dashboard)
router.get('/mine', authenticate, async (req, res) => {
  try {
    const creator = await User.findOne({ firebaseUid: req.user!.uid });
    if (!creator) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }
    const events = await Event.find({ creator: creator._id })
      .sort({ startTime: -1 })
      .populate('creator', 'username displayName avatarUrl');
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to fetch your events' });
  }
});

// GET /events/nearby — geospatial event search with age filtering
router.get('/nearby', async (req, res) => {
  const { lat, lng, radius = '5000', userId } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: 'lat and lng query parameters are required' });
    return;
  }

  try {
    let userAge: number | null = null;
    if (userId) {
      const user = await User.findById(userId);
      if (user?.birthdate) userAge = getUserAge(user.birthdate);
    }

    const filter: Record<string, any> = {
      status: { $in: ['active', 'upcoming', 'ongoing'] },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng as string), parseFloat(lat as string)] },
          $maxDistance: parseInt(radius as string, 10),
        },
      },
    };

    if (userAge !== null) {
      filter.$and = [
        { $or: [{ ageMin: { $exists: false } }, { ageMin: null }, { ageMin: { $lte: userAge } }] },
        { $or: [{ ageMax: { $exists: false } }, { ageMax: null }, { ageMax: 0 }, { ageMax: { $gte: userAge } }] },
      ];
    }

    const events = await Event.find(filter).populate('creator', 'username displayName avatarUrl');
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to fetch nearby events' });
  }
});

// GET /events — list events with optional filters
router.get('/', async (req, res) => {
  const { category, status = 'active', userId } = req.query;
  const filter: Record<string, any> = { status };
  if (category) filter.category = category;

  try {
    if (userId) {
      const user = await User.findById(userId);
      if (user?.birthdate) {
        const age = getUserAge(user.birthdate);
        filter.$and = [
          { $or: [{ ageMin: { $exists: false } }, { ageMin: null }, { ageMin: { $lte: age } }] },
          { $or: [{ ageMax: { $exists: false } }, { ageMax: null }, { ageMax: 0 }, { ageMax: { $gte: age } }] },
        ];
      }
    }

    const events = await Event.find(filter)
      .populate('creator', 'username displayName avatarUrl')
      .sort({ startTime: 1 });
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /events/:id — single event, increments view count, includes friends attending
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('creator', 'username displayName avatarUrl accountType verified')
      .populate('attendees', 'username displayName avatarUrl')
      .populate('checkins', 'username displayName avatarUrl');

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// GET /events/:id/analytics — host-only analytics
router.get('/:id/analytics', authenticate, async (req, res) => {
  try {
    const creator = await User.findOne({ firebaseUid: req.user!.uid });
    if (!creator) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const event = await Event.findById(req.params.id)
      .populate('attendees', 'username displayName avatarUrl')
      .populate('checkins', 'username displayName avatarUrl');

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    if (event.creator.toString() !== creator._id.toString()) {
      res.status(403).json({ error: 'Only the event creator can view analytics' });
      return;
    }

    res.json({
      views: event.views,
      rsvpCount: event.attendees.length,
      checkinCount: event.checkins.length,
      attendees: event.attendees,
      checkins: event.checkins,
      conversionRate:
        event.attendees.length > 0
          ? Math.round((event.checkins.length / event.attendees.length) * 100)
          : 0,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /events/:id/checkin-qr — get the check-in token (attendees and creator only)
router.get('/:id/checkin-qr', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const isCreator = event.creator.toString() === user._id.toString();
    const isAttendee = event.attendees.map(id => id.toString()).includes(user._id.toString());

    if (!isCreator && !isAttendee) {
      res.status(403).json({ error: 'You must RSVP to get the check-in QR code' });
      return;
    }

    res.json({ eventId: event._id, token: event.checkinToken });
  } catch {
    res.status(500).json({ error: 'Failed to get QR token' });
  }
});

// POST /events — create an event
router.post('/', authenticate, async (req, res) => {
  const {
    title, description, category, location, address,
    startTime, endTime, maxAttendees, isPublic,
    ageMin, ageMax, recurrence,
  } = req.body;

  try {
    const creator = await User.findOne({ firebaseUid: req.user!.uid });
    if (!creator) {
      res.status(404).json({ error: 'User profile not found. Create a profile before posting events.' });
      return;
    }

    const event = await Event.create({
      title, description, category,
      creator: creator._id,
      location, address, startTime, endTime,
      maxAttendees: maxAttendees || undefined,
      isPublic: isPublic ?? true,
      ageMin: ageMin || undefined,
      ageMax: ageMax || undefined,
      attendees: [creator._id],
      recurrence: recurrence || undefined,
    });

    // Notify friends about new event
    const creatorWithFriends = await User.findById(creator._id).populate('friends');
    if (creatorWithFriends?.friends?.length) {
      const friendIds = creatorWithFriends.friends.map((f: any) => f._id);
      const friends = await User.find({ _id: { $in: friendIds }, pushToken: { $exists: true } });
      for (const friend of friends) {
        if (friend.pushToken) {
          sendPushNotification(friend.pushToken, {
            title: `${creator.displayName} posted a new event`,
            body: title,
            data: { eventId: event._id.toString() },
          }).catch(() => {});
        }
      }
    }

    res.status(201).json(event);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PATCH /events/:id — update event fields (creator only)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const creator = await User.findOne({ firebaseUid: req.user!.uid });
    if (!creator) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    if (event.creator.toString() !== creator._id.toString()) {
      res.status(403).json({ error: 'Only the event creator can update this event' });
      return;
    }

    const allowed = [
      'title', 'description', 'category', 'address',
      'startTime', 'endTime', 'maxAttendees', 'isPublic',
      'status', 'ageMin', 'ageMax', 'recurrence',
    ];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) (event as any)[field] = req.body[field];
    });

    await event.save();
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /events/:id — delete event (creator only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const creator = await User.findOne({ firebaseUid: req.user!.uid });
    if (!creator) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    if (event.creator.toString() !== creator._id.toString()) {
      res.status(403).json({ error: 'Only the event creator can delete this event' });
      return;
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /events/:id/join — RSVP to an event
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    if (!['active', 'upcoming', 'ongoing'].includes(event.status)) {
      res.status(400).json({ error: 'Cannot RSVP to a cancelled or completed event' });
      return;
    }
    if (event.attendees.map(id => id.toString()).includes(user._id.toString())) {
      res.status(409).json({ error: 'Already RSVPd to this event' });
      return;
    }
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      res.status(400).json({ error: 'Event is full' });
      return;
    }

    event.attendees.push(user._id as any);
    await event.save();

    // Notify creator
    const creator = await User.findById(event.creator);
    if (creator?.pushToken) {
      sendPushNotification(creator.pushToken, {
        title: 'New RSVP!',
        body: `${user.displayName} is going to ${event.title}`,
        data: { eventId: event._id.toString() },
      }).catch(() => {});
    }

    // Notify friends who haven't RSVPd yet
    const friendsGoing = await User.find({
      _id: { $in: user.friends },
      pushToken: { $exists: true, $ne: null },
    });
    for (const friend of friendsGoing) {
      if (friend.pushToken && !event.attendees.map(id => id.toString()).includes(friend._id.toString())) {
        sendPushNotification(friend.pushToken, {
          title: 'Your friend is going!',
          body: `${user.displayName} RSVPd to ${event.title}`,
          data: { eventId: event._id.toString() },
        }).catch(() => {});
      }
    }

    res.json({ message: 'RSVPd to event', rsvpCount: event.attendees.length });
  } catch {
    res.status(500).json({ error: 'Failed to RSVP' });
  }
});

// DELETE /events/:id/leave — cancel RSVP
router.delete('/:id/leave', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    if (event.creator.toString() === user._id.toString()) {
      res.status(400).json({ error: 'The creator cannot leave their own event — delete it instead.' });
      return;
    }

    event.attendees = event.attendees.filter(id => id.toString() !== user._id.toString());
    await event.save();
    res.json({ message: 'RSVP cancelled', rsvpCount: event.attendees.length });
  } catch {
    res.status(500).json({ error: 'Failed to cancel RSVP' });
  }
});

// POST /events/:id/checkin — check in via QR token or geofence
router.post('/:id/checkin', authenticate, async (req, res) => {
  const { token, lat, lng } = req.body;

  if (!token && (lat === undefined || lng === undefined)) {
    res.status(400).json({ error: 'Provide either a QR token or lat/lng coordinates' });
    return;
  }

  try {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (token) {
      if (token !== event.checkinToken) {
        res.status(400).json({ error: 'Invalid check-in token' });
        return;
      }
    } else {
      // Geofence: check within 200 meters of event
      const [evLng, evLat] = event.location.coordinates;
      const R = 6371000;
      const dLat = ((lat - evLat) * Math.PI) / 180;
      const dLng = ((lng - evLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((evLat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (distance > 200) {
        res.status(400).json({ error: 'You must be within 200 meters of the event to check in' });
        return;
      }
    }

    if (event.checkins.map(id => id.toString()).includes(user._id.toString())) {
      res.status(409).json({ error: 'Already checked in' });
      return;
    }

    event.checkins.push(user._id as any);
    if (!event.attendees.map(id => id.toString()).includes(user._id.toString())) {
      event.attendees.push(user._id as any);
    }
    await event.save();

    user.checkins.push(event._id as any);
    await user.save();

    res.json({ message: 'Checked in successfully', checkinCount: event.checkins.length });
  } catch {
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// POST /events/:id/invite — invite friends to an event
router.post('/:id/invite', authenticate, async (req, res) => {
  const { friendIds } = req.body;
  if (!Array.isArray(friendIds) || friendIds.length === 0) {
    res.status(400).json({ error: 'friendIds array is required' });
    return;
  }

  try {
    const sender = await User.findOne({ firebaseUid: req.user!.uid });
    if (!sender) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const friends = await User.find({ _id: { $in: friendIds } });

    for (const friend of friends) {
      const alreadyInvited = event.invites.some(inv => inv.userId.toString() === friend._id.toString());
      if (!alreadyInvited) {
        event.invites.push({ userId: friend._id as any, invitedBy: sender._id as any, status: 'pending' });
      }

      const alreadyHasInvite = friend.invites.some(inv => inv.eventId.toString() === event._id.toString());
      if (!alreadyHasInvite) {
        friend.invites.push({
          eventId: event._id as any,
          invitedBy: sender._id as any,
          status: 'pending',
          createdAt: new Date(),
        });
        await friend.save();
      }

      if (friend.pushToken) {
        sendPushNotification(friend.pushToken, {
          title: `${sender.displayName} invited you to an event`,
          body: event.title,
          data: { eventId: event._id.toString() },
        }).catch(() => {});
      }
    }

    await event.save();
    res.json({ message: `Invited ${friends.length} friend(s)` });
  } catch {
    res.status(500).json({ error: 'Failed to send invites' });
  }
});

export default router;
