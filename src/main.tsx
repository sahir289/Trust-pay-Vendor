import ReactDOM from 'react-dom/client';
// import { Suspense, lazy } from 'react'; // Commented out - not needed without lazy loading
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux-toolkit/store/store';
import '@/assets/css/app.css';
import ScrollToTop from '@/components/Base/ScrollToTop';
import { AuthProvider } from '@/components/context/AuthContext/index';
import { SocketProvider } from '@/socket/socketContext';
import ErrorBoundary from '@/pages/ErrorBoundary/index';
import { ErrorFallback } from '@/pages/ErrorBoundary/FallbackUI/index';
// import Loading from './pages/loading'; // Commented out - not needed without Suspense
// import { withLazyLoading } from '@/utils/lazyStrategies';

// Normal import instead of lazy loading
import Router from '@/router/index';

// Commented out lazy loading approach:
// const Router = lazy(() => import('@/router/index'));

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <ScrollToTop />
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider>
          <ErrorBoundary fallback={<ErrorFallback />}>
            {/* No Suspense needed with normal imports */}
            <Router />
            {/* Commented out Suspense wrapper: */}
            {/* <Suspense fallback={<Loading />}>
              <Router />
            </Suspense> */}
          </ErrorBoundary>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  </BrowserRouter>,
);
