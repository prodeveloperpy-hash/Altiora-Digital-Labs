import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { AppBackground } from '@/components/ui/background';

/** Root application component: mounts the router. */
export default function App() {
  return (
    <div className="relative isolate min-h-screen">
      <AppBackground />
      <div className="relative z-10 min-h-screen">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}
