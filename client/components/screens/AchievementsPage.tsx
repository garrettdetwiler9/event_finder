/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */
import { Trophy, Calendar, Users, Star, TrendingUp, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import * as Progress from '@radix-ui/react-progress';

const monthlyData = [
  { month: 'Jan', attended: 4, hosted: 1 },
  { month: 'Feb', attended: 6, hosted: 2 },
  { month: 'Mar', attended: 8, hosted: 1 },
  { month: 'Apr', attended: 5, hosted: 3 },
  { month: 'May', attended: 7, hosted: 2 },
];

const achievements = [
  {
    id: 1,
    title: 'Social Butterfly',
    description: 'Attend 10 events',
    progress: 70,
    current: 7,
    goal: 10,
    icon: Users,
    color: 'purple',
  },
  {
    id: 2,
    title: 'Event Host',
    description: 'Host 5 events',
    progress: 80,
    current: 4,
    goal: 5,
    icon: Star,
    color: 'pink',
  },
  {
    id: 3,
    title: 'Weekly Warrior',
    description: 'Attend events 4 weeks in a row',
    progress: 50,
    current: 2,
    goal: 4,
    icon: TrendingUp,
    color: 'orange',
  },
  {
    id: 4,
    title: 'Category Explorer',
    description: 'Try 8 different categories',
    progress: 62,
    current: 5,
    goal: 8,
    icon: Award,
    color: 'purple',
  },
];

const stats = [
  { label: 'Events Attended', value: 23, icon: Calendar, color: 'from-purple-500 to-purple-600' },
  { label: 'Events Hosted', value: 7, icon: Star, color: 'from-pink-500 to-pink-600' },
  { label: 'Total Connections', value: 142, icon: Users, color: 'from-orange-500 to-orange-600' },
  { label: 'Achievement Points', value: 1250, icon: Trophy, color: 'from-purple-600 to-pink-600' },
];

export function AchievementsPage() {
  return (
    <div className="min-h-full pb-8">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white p-5">
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-purple-100 mt-1">Track your social journey</p>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {stats.map(stat => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white shadow-lg`}
            >
              <stat.icon className="w-8 h-8 mb-2 opacity-80" />
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Activity Over Time
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="attended"
                stroke="#9333ea"
                strokeWidth={3}
                name="Attended"
              />
              <Line
                type="monotone"
                dataKey="hosted"
                stroke="#ec4899"
                strokeWidth={3}
                name="Hosted"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-pink-600" />
            Monthly Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="attended" fill="#9333ea" radius={[8, 8, 0, 0]} />
              <Bar dataKey="hosted" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-600" />
            Achievement Progress
          </h2>
          <div className="space-y-4">
            {achievements.map(achievement => {
              const Icon = achievement.icon;
              const colorClasses = {
                purple: { bg: 'bg-purple-100', text: 'text-purple-600', progress: 'bg-purple-600' },
                pink: { bg: 'bg-pink-100', text: 'text-pink-600', progress: 'bg-pink-600' },
                orange: { bg: 'bg-orange-100', text: 'text-orange-600', progress: 'bg-orange-600' },
              }[achievement.color];

              return (
                <div
                  key={achievement.id}
                  className="bg-white rounded-xl shadow-md p-5 border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${colorClasses.bg} p-3 rounded-xl`}>
                      <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">
                            {achievement.current} / {achievement.goal}
                          </span>
                          <span className={`font-semibold ${colorClasses.text}`}>
                            {achievement.progress}%
                          </span>
                        </div>
                        <Progress.Root
                          className="relative h-3 overflow-hidden rounded-full bg-gray-200"
                          value={achievement.progress}
                        >
                          <Progress.Indicator
                            className={`h-full ${colorClasses.progress} transition-transform duration-500 ease-out`}
                            style={{ transform: `translateX(-${100 - achievement.progress}%)` }}
                          />
                        </Progress.Root>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
