
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PushNotificationProvider } from '@/components/PushNotificationProvider'
import { GoogleMapsProvider } from '@/context/GoogleMapsContext'
import App from './App.tsx'
import './index.css'
import './utils/supabaseMonitor.ts' // Initialize query monitoring

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <GoogleMapsProvider>
      <PushNotificationProvider>
        <App />
      </PushNotificationProvider>
    </GoogleMapsProvider>
  </QueryClientProvider>
);
