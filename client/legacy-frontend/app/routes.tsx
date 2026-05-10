import { createBrowserRouter } from 'react-router';
import { Root } from './components/Root';
import { DiscoverPage } from './components/DiscoverPage';
import { MyEventsPage } from './components/MyEventsPage';
import { MapPage } from './components/MapPage';
import { AchievementsPage } from './components/AchievementsPage';
import { ProfilePage } from './components/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: DiscoverPage },
      { path: 'my-events', Component: MyEventsPage },
      { path: 'map', Component: MapPage },
      { path: 'achievements', Component: AchievementsPage },
      { path: 'profile', Component: ProfilePage },
    ],
  },
]);
