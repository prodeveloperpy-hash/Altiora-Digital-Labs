import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';

/** Root application component: mounts the router. */
export default function App() {
  return <RouterProvider router={router} />;
}
