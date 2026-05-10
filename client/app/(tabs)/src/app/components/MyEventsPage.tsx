import { useState } from "react";
import { Calendar, MapPin, Users, PlusCircle } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { CreateEventModal } from "./CreateEventModal";

const attendingEvents = [
  {
    id: 1,
    title: "Summer Beach Volleyball Tournament",
    category: "Sports",
    distance: "2.3 mi",
    attendees: 24,
    date: "May 15, 2026",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800",
  },
  {
    id: 2,
    title: "Pottery & Wine Night",
    category: "Crafts",
    distance: "1.1 mi",
    attendees: 12,
    date: "May 12, 2026",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
  },
  {
    id: 3,
    title: "Board Game Cafe Meetup",
    category: "Games",
    distance: "0.8 mi",
    attendees: 18,
    date: "May 10, 2026",
    image: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800",
  },
];

const hostingEvents = [
  {
    id: 4,
    title: "Rooftop EDM Party",
    category: "21+",
    distance: "3.5 mi",
    attendees: 150,
    date: "May 16, 2026",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
  },
  {
    id: 5,
    title: "Local Food Truck Festival",
    category: "Food",
    distance: "1.9 mi",
    attendees: 200,
    date: "May 14, 2026",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
  },
];

export function MyEventsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-full pb-8 relative">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white p-5">
        <h1 className="text-2xl font-bold">My Events</h1>
        <p className="text-purple-100 mt-1">Your upcoming plans</p>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Attending ({attendingEvents.length})
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {attendingEvents.map((event) => (
              <div
                key={event.id}
                className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-lg overflow-hidden active:shadow-xl transition-shadow"
              >
                <div className="relative h-36">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-purple-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    {event.category}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-orange-600" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-purple-600" />
                      <span>{event.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-pink-600" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-600" />
            Hosting ({hostingEvents.length})
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {hostingEvents.map((event) => (
              <div
                key={event.id}
                className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-lg overflow-hidden active:shadow-xl transition-shadow"
              >
                <div className="relative h-36">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-pink-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    {event.category}
                  </span>
                  <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    Host
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-orange-600" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-purple-600" />
                      <span>{event.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-pink-600" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="absolute left-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl active:scale-95 transition-transform z-10"
        style={{ bottom: '16px' }}
        aria-label="Create event"
      >
        <PlusCircle className="w-7 h-7" />
      </button>

      {showCreateModal && (
        <div className="absolute inset-0 z-50">
          <CreateEventModal onClose={() => setShowCreateModal(false)} />
        </div>
      )}
    </div>
  );
}
