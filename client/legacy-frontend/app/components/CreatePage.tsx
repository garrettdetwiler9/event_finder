import { useState } from 'react';
import { Calendar, Users, MapPin, Tag, Clock, RepeatIcon } from 'lucide-react';

const categories = ['Sports', 'Crafts', 'Games', 'Parties', '18+', '21+', 'Music', 'Food', 'Other'];

export function CreatePage() {
  const [eventData, setEventData] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    location: '',
    description: '',
    attendanceLimit: '',
    isRecurring: false,
    recurringPattern: 'weekly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Event created:', eventData);
    alert('Event created successfully! 🎉');
  };

  return (
    <div className="min-h-full pb-8">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white p-5">
        <h1 className="text-2xl font-bold">Create Event</h1>
        <p className="text-purple-100 mt-1">Share your plans with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4 text-purple-600" />
            Event Title
          </label>
          <input
            type="text"
            value={eventData.title}
            onChange={e => setEventData({ ...eventData, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="e.g., Summer Beach Party"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4 text-pink-600" />
            Category
          </label>
          <select
            value={eventData.category}
            onChange={e => setEventData({ ...eventData, category: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              Date
            </label>
            <input
              type="date"
              value={eventData.date}
              onChange={e => setEventData({ ...eventData, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              Time
            </label>
            <input
              type="time"
              value={eventData.time}
              onChange={e => setEventData({ ...eventData, time: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            Location
          </label>
          <input
            type="text"
            value={eventData.location}
            onChange={e => setEventData({ ...eventData, location: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="e.g., Central Park, New York"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 text-pink-600" />
            Attendance Limit (optional)
          </label>
          <input
            type="number"
            value={eventData.attendanceLimit}
            onChange={e => setEventData({ ...eventData, attendanceLimit: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="e.g., 50"
            min="1"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={eventData.isRecurring}
              onChange={e => setEventData({ ...eventData, isRecurring: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded"
            />
            <div className="flex items-center gap-2">
              <RepeatIcon className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Recurring event</span>
            </div>
          </label>
        </div>

        {eventData.isRecurring && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Repeat pattern</label>
            <select
              value={eventData.recurringPattern}
              onChange={e => setEventData({ ...eventData, recurringPattern: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
          <textarea
            value={eventData.description}
            onChange={e => setEventData({ ...eventData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-32"
            placeholder="Tell people what to expect..."
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold active:from-purple-700 active:to-pink-700 transition-all shadow-lg active:shadow-xl"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}
