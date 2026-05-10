import { useState } from 'react';
import { Search, Filter, MapPin, Users, Calendar, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

const categories = ['All', 'Sports', 'Crafts', 'Games', 'Parties', '18+', '21+', 'Music', 'Food'];

const trendingEvents = [
  {
    id: 101,
    title: 'Sunset Yoga Session',
    category: 'Sports',
    distance: '1.5 mi',
    attendees: 45,
    date: 'May 11, 2026',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  },
  {
    id: 102,
    title: 'Street Art Walking Tour',
    category: 'Arts',
    distance: '0.5 mi',
    attendees: 32,
    date: 'May 13, 2026',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
  },
  {
    id: 103,
    title: 'Live Jazz Night',
    category: 'Music',
    distance: '2.1 mi',
    attendees: 78,
    date: 'May 12, 2026',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
  },
  {
    id: 104,
    title: 'Taco Festival',
    category: 'Food',
    distance: '1.8 mi',
    attendees: 156,
    date: 'May 15, 2026',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
  },
];

const mockEvents = [
  {
    id: 1,
    title: 'Summer Beach Volleyball Tournament',
    category: 'Sports',
    distance: '2.3 mi',
    attendees: 24,
    date: 'May 15, 2026',
    sponsored: true,
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
  },
  {
    id: 2,
    title: 'Pottery & Wine Night',
    category: 'Crafts',
    distance: '1.1 mi',
    attendees: 12,
    date: 'May 12, 2026',
    sponsored: false,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
  },
  {
    id: 3,
    title: 'Board Game Cafe Meetup',
    category: 'Games',
    distance: '0.8 mi',
    attendees: 18,
    date: 'May 10, 2026',
    sponsored: false,
    image: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800',
  },
  {
    id: 4,
    title: 'Rooftop EDM Party',
    category: '21+',
    distance: '3.5 mi',
    attendees: 150,
    date: 'May 16, 2026',
    sponsored: true,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
  },
  {
    id: 5,
    title: 'Local Food Truck Festival',
    category: 'Food',
    distance: '1.9 mi',
    attendees: 200,
    date: 'May 14, 2026',
    sponsored: true,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
  },
];

export function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [sponsoredOnly, setSponsoredOnly] = useState(false);

  return (
    <div className="min-h-full">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white p-5 pb-6">
        <h1 className="text-2xl font-bold mb-3">Discover Events</h1>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search for events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Distance: {maxDistance} miles
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={maxDistance}
              onChange={e => setMaxDistance(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={sponsoredOnly}
              onChange={e => setSponsoredOnly(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700">Sponsored events only</span>
          </label>
        </div>
      )}

      <div className="overflow-x-auto px-5 py-3 bg-white border-b border-gray-200">
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="py-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="px-5 mb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Trending Now
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 px-5 scrollbar-hide">
          {trendingEvents.map(event => (
            <div
              key={event.id}
              className="flex-shrink-0 w-56 bg-white rounded-2xl shadow-lg overflow-hidden active:shadow-xl transition-shadow"
            >
              <div className="relative h-32">
                <ImageWithFallback
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-orange-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Hot
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-orange-600" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-purple-600" />
                      <span>{event.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-pink-600" />
                      <span>{event.attendees}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {mockEvents.map(event => (
          <div
            key={event.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden active:shadow-xl transition-shadow"
          >
            <div className="relative h-44">
              <ImageWithFallback
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {event.sponsored && (
                <span className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Sponsored
                </span>
              )}
              <span className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {event.category}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>{event.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-pink-600" />
                  <span>{event.attendees} attending</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span>{event.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
