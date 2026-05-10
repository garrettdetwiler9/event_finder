import {
  User,
  Mail,
  MapPin,
  Bell,
  Lock,
  Heart,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Edit Profile', color: 'text-purple-600' },
      { icon: Mail, label: 'Email Preferences', color: 'text-pink-600' },
      { icon: MapPin, label: 'Location Settings', color: 'text-orange-600' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', color: 'text-purple-600' },
      { icon: Lock, label: 'Privacy & Security', color: 'text-pink-600' },
      { icon: Heart, label: 'Interests', color: 'text-orange-600' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', color: 'text-purple-600' },
      { icon: Settings, label: 'App Settings', color: 'text-pink-600' },
      { icon: LogOut, label: 'Log Out', color: 'text-red-600' },
    ],
  },
];

const userStats = [
  { label: 'Events Attended', value: 23 },
  { label: 'Events Hosted', value: 7 },
  { label: 'Connections', value: 142 },
];

export function ProfilePage() {
  return (
    <div className="min-h-full pb-8">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white p-5 pb-16">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="px-5 -mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200"
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Alex Morgan</h2>
              <p className="text-gray-600">@alexmorgan</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {userStats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {settingsSections.map(section => (
            <div key={section.title} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <h3 className="px-5 py-3 bg-gray-50 font-semibold text-gray-700 text-sm">
                {section.title}
              </h3>
              <div className="divide-y divide-gray-100">
                {section.items.map(item => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-4 px-5 py-4 active:bg-gray-50 transition-colors"
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="flex-1 text-left text-gray-900">{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Event Finder v1.0.0</p>
          <p className="mt-1">© 2026 Event Finder. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
