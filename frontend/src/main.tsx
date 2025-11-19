import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { setupDIContainer, diContainer } from '@core'
import { createQueryClient } from '@/lib/cache/query-cache'
import { GoogleAuthProvider } from '@/components/auth'

// Initialize the DI container with all services
setupDIContainer(diContainer)

// Create React Query client
const queryClient = createQueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleAuthProvider>
        <App />
      </GoogleAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
