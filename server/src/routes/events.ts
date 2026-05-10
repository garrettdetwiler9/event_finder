import { Router } from 'express';
import Event from '../models/Event';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /events/nearby — find active events within a radius of a lat/lng point.
// Query params: lat (required), lng (required), radius (meters, default 5000)
//
// ⚠️ Must be declared BEFORE GET /:id — otherwise Express matches the string
// "nearby" as a MongoDB ObjectId, throws a CastError, and returns a 500.
router.get('/nearby', async (req, res) => {
  const { lat, lng, radius = '5000' } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: 'lat and lng query parameters are required' });
    return;
  }

  try {
    const events = await Event.find({
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            // GeoJSON standard: [longitude, latitude]
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
          },
          $maxDistance: parseInt(radius as string, 10),
        },
      },
    }).populate('creator', 'username displayName avatarUrl');

    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to fetch nearby events' });
  }
});

// GET /events — list events with optional filters
// Query params: category (sports|social|hiking|games|other), status (default: active)
router.get('/', async (req, res) => {
  const { category, status = 'active' } = req.query;
  const filter: Record<string, unknown> = { status };
  if (category) filter.category = category;

  try {
    const events = await Event.find(filter)
      .populate('creator', 'username displayName avatarUrl')
      .sort({ startTime: 1 });
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /events/:id — single event with creator and attendees populated
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'username displayName avatarUrl')
      .populate('attendees', 'username displayName avatarUrl');
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /events — create an event (auth required).
// Creator is automatically added as the first attendee.
// Expected body: { title, description, category, location, address, startTime, endTime, maxAttendees, isPublic? }
// location shape: { type: "Point", coordinates: [lng, lat] }
router.post('/', authenticate, async (req, res) => {
  const {
    title,
    description,
    category,
    location,
    address,
    startTime,
    endTime,
    maxAttendees,
    isPublic,
  } = req.body;

  try {
    // Look up the MongoDB user by Firebase UID to get the creator's _id
    const creator = await User.findOne({ firebaseUid: req.user!.uid });
    if (!creator) {
      res
        .status(404)
        .json({ error: 'User profile not found. Create a profile before posting events.' });
      return;
    }

    const event = await Event.create({
      title,
      description,
      category,
      creator: creator._id,
      location,
      address,
      startTime,
      endTime,
      maxAttendees,
      isPublic: isPublic ?? true,
      attendees: [creator._id],
    });

    res.status(201).json(event);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PATCH /events/:id — update event fields (auth required, creator only).
// Only these fields can be changed after creation; location is intentionally excluded.
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
      'title',
      'description',
      'category',
      'address',
      'startTime',
      'endTime',
      'maxAttendees',
      'isPublic',
      'status',
    ];
    allowed.forEach(field => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (req.body[field] !== undefined) (event as any)[field] = req.body[field];
    });

    await event.save();
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /events/:id — permanently delete an event (auth required, creator only)
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

// POST /events/:id/join — join an event (auth required)
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
    if (event.status !== 'active') {
      res.status(400).json({ error: 'Cannot join a cancelled or completed event' });
      return;
    }
    if (event.attendees.map(id => id.toString()).includes(user._id.toString())) {
      res.status(409).json({ error: 'Already joined this event' });
      return;
    }
    if (event.attendees.length >= event.maxAttendees) {
      res.status(400).json({ error: 'Event is full' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event.attendees.push(user._id as any);
    await event.save();
    res.json({ message: 'Joined event', attendeeCount: event.attendees.length });
  } catch {
    res.status(500).json({ error: 'Failed to join event' });
  }
});

// DELETE /events/:id/leave — leave an event (auth required).
// The creator cannot leave — they must delete the event instead.
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
      res
        .status(400)
        .json({ error: 'The creator cannot leave their own event — delete it instead.' });
      return;
    }

    event.attendees = event.attendees.filter(id => id.toString() !== user._id.toString());
    await event.save();
    res.json({ message: 'Left event', attendeeCount: event.attendees.length });
  } catch {
    res.status(500).json({ error: 'Failed to leave event' });
  }
});

export default router;
