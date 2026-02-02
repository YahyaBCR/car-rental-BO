import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import i18n from './i18n/config'
import App from './App'
import { LanguageProvider } from './contexts/LanguageContext'

// Loading component while translations are loading
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'Inter, sans-serif'
  }}>
    Chargement / Loading...
  </div>
);

// Wait for i18n to be initialized before rendering
i18n.on('initialized', () => {
  console.log('i18n initialized, rendering app...');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Suspense fallback={<LoadingFallback />}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </Suspense>
    </StrictMode>,
  );
});

// If i18n is already initialized, render immediately
if (i18n.isInitialized) {
  console.log('i18n already initialized, rendering app immediately...');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Suspense fallback={<LoadingFallback />}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </Suspense>
    </StrictMode>,
  );
}
