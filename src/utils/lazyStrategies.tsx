import Loading from '@/pages/loading';
import React, { Suspense, ComponentType, ReactElement, useState, useEffect } from 'react';

// Loading timeout wrapper to prevent infinite loading
interface LoadingWithTimeoutProps {
  timeout?: number;
  fallback?: React.ComponentType;
}

const LoadingWithTimeout: React.FC<LoadingWithTimeoutProps> = ({ 
  timeout = 10000, // 10 seconds default timeout
  fallback: FallbackComponent 
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);

    return (): void => {
      window.clearTimeout(timer);
    };
  }, [timeout]);

  useEffect(() => {
    // Auto-reload when timed out, but only once
    if (isTimedOut && !isReloading) {
      setIsReloading(true);
      
      // Check if we should allow reload (throttled globally)
      if (shouldAllowReload()) {
        window.setTimeout(() => {
          reloadWithCacheBust();
        }, 1000); // 1 second delay before auto-reload
      } else {
        // If reload is throttled, just reset and try to continue
        window.setTimeout(() => {
          setIsTimedOut(false);
          setIsReloading(false);
        }, 2000);
      }
    }
  }, [isTimedOut, isReloading]);

  if (isTimedOut) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    // Show loading state while preparing to reload or recovering
    return <Loading />;
  }

  return <Loading />;
};

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: ComponentType<{ error?: Error | null; retry?: () => void }>;
  maxRetries?: number;
}

class SimpleErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private timeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    // Check if it's a chunk loading error and handle it
    const isChunkError = this.isChunkLoadingError(error);
    const isDOMError = this.isDOMRelatedError(error);
    const isAPIError = this.isAPIError(error);
    const isTimeoutError = this.isTimeoutError(error);
    
    // Log error details for debugging
    // eslint-disable-next-line no-console
    console.log('Error caught by boundary:', {
      message: error.message,
      name: error.name,
      isChunkError,
      isDOMError,
      isAPIError,
      isTimeoutError,
      retryCount: this.state.retryCount,
      stack: error.stack?.substring(0, 200) + '...'
    });
    
    // Do NOT reload on API errors or timeout errors - let them be handled by the application
    if (isAPIError || isTimeoutError) {
      // eslint-disable-next-line no-console
      console.warn('API/Timeout Error caught by error boundary, not reloading:', error);
      return;
    }
    
    const maxRetries = this.props.maxRetries || 2;
    
    if (this.state.retryCount < maxRetries) {
      if (isChunkError) {
        // Silent automatic recovery for chunk errors
        this.handleSilentChunkRecovery();
      } else if (isDOMError) {
        // Silent automatic recovery for DOM errors
        this.handleSilentDOMRecovery();
      } else {
        // For other errors that are NOT API/timeout errors, try to auto-recover
        this.scheduleAutoRecovery();
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn('Max retries reached for error boundary, stopping auto-recovery:', error);
    }
  }

  componentWillUnmount(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }

  private scheduleAutoRecovery(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = window.setTimeout(async () => {
      // Use auto-recovery system for seamless recovery
      await autoRecoverySystem.attemptRecovery();
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1
      }));
    }, 3000); // 3 second delay before retry
  }

  private isAPIError(error: Error): boolean {
    const message = error.message?.toLowerCase() || '';
    const name = error.name?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';
    
    // Common API error patterns
    const apiPatterns = [
      'fetch',
      'network error',
      'failed to fetch',
      'http error',
      'request failed',
      'response error',
      'api error',
      'server error',
      'axios error',
      'xhr error',
      'timeout',
      'request timeout',
      'response timeout',
      'connection timeout',
      'read timeout',
      'abort',
      'connection refused',
      'bad request',
      'unauthorized',
      'forbidden',
      'not found',
      'internal server error',
      'service unavailable',
      'gateway timeout',
      'networkerror',
      'typeerror: failed to fetch',
      'cors error',
      // Server restart/connection issues
      'econnrefused',
      'enotfound',
      'econnreset',
      'connection lost',
      'server unavailable',
      'websocket connection',
      'hmr connection',
      'hot reload',
      // Authentication related patterns that should NOT trigger reloads
      'authentication',
      'auth error',
      'login error',
      'session expired',
      'token expired',
      'invalid token',
      'access denied',
      'permission denied',
      // Slow response patterns
      'slow response',
      'response delayed',
      'request taking too long',
      'slow network'
    ];
    
    // Check for common HTTP status codes in error messages
    const httpStatusPattern = /(4\d{2}|5\d{2})/; // 400-599 status codes
    
    return Boolean(
      name === 'networkerror' ||
      name === 'timeouterror' ||
      httpStatusPattern.test(message) ||
      apiPatterns.some(pattern => 
        message.includes(pattern) || 
        stack.includes(pattern)
      )
    );
  }

  private isTimeoutError(error: Error): boolean {
    const message = error.message?.toLowerCase() || '';
    const name = error.name?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';
    
    // Specific timeout error patterns
    const timeoutPatterns = [
      'timeout',
      'request timeout',
      'response timeout',
      'connection timeout',
      'read timeout',
      'operation timeout',
      'fetch timeout',
      'network timeout',
      'gateway timeout',
      'request took too long',
      'slow response',
      'response delayed',
      'timeouterror',
      'operation timed out',
      'connection timed out',
      'request aborted due to timeout'
    ];
    
    return Boolean(
      name === 'timeouterror' ||
      name.includes('timeout') ||
      timeoutPatterns.some(pattern => 
        message.includes(pattern) || 
        stack.includes(pattern)
      )
    );
  }

  private isDOMRelatedError(error: Error): boolean {
    const message = error.message?.toLowerCase() || '';
    const name = error.name?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';
    
    // Common DOM-related error patterns
    const domPatterns = [
      'removechild',
      'insertbefore',
      'notfounderror',
      'domexception',
      'dom exception',
      'node to be removed is not a child',
      'failed to execute',
      'hierarchy request error',
      'invalid character error',
      'invalidstateerror',
      'invalidaccesserror',
      'wrong document error',
      'network error when accessing dom',
      'element not found',
      'null is not an object',
      'cannot read property',
      'cannot read properties of null',
      'cannot read properties of undefined',
      'the node to be removed is not a child of this node'
    ];
    
    return Boolean(
      name === 'notfounderror' ||
      name === 'domexception' ||
      name === 'typeerror' && (message.includes('null') || message.includes('undefined')) ||
      domPatterns.some(pattern => 
        message.includes(pattern) || 
        stack.includes(pattern)
      )
    );
  }

  private handleSilentDOMRecovery(): void {
    // Check if reload is allowed (throttled)
    if (!shouldAllowReload()) {
      return;
    }
    // Immediate silent reload for DOM errors
    window.setTimeout(() => {
      window.location.reload();
    }, 50); // Very fast, nearly instant
  }

  private handleSilentChunkRecovery(): void {
    // Check if reload is allowed (throttled)
    if (!shouldAllowReload()) {
      return;
    }
    // Clear caches and reload silently for chunk errors
    window.setTimeout(() => {
      reloadWithCacheBust();
    }, 100); // Fast recovery
  }

  private isChunkLoadingError(error: Error): boolean {
    const message = error.message?.toLowerCase() || '';
    const name = error.name?.toLowerCase() || '';
    
    // More specific chunk loading error detection
    return Boolean(
      message.includes('failed to fetch dynamically imported module') ||
      message.includes('loading chunk') && !message.includes('network error') ||
      message.includes('chunkloaderror') ||
      message.includes('loading css chunk') ||
      message.includes('loading script chunk') ||
      name === 'chunkloaderror' ||
      error.name === 'ChunkLoadError' ||
      // Additional patterns for module loading issues (but NOT general network errors)
      message.includes('failed to import') && message.includes('chunk') ||
      message.includes('module evaluation failed') && message.includes('chunk') ||
      (error.stack && error.stack.includes('webpackChunkName'))
    );
  }

  // Method to reset error state
  resetErrorBoundary = (): void => {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    this.setState({ hasError: false, error: null, retryCount: 0 });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} retry={this.resetErrorBoundary} />;
      }

      // Show loading component during silent recovery with timeout fallback
      // Only set timeout if not already set
      if (!this.timeoutId) {
        this.timeoutId = window.setTimeout(() => {
          if (this.state.hasError) {
            // If still in error state after 5 seconds, reset the boundary
            this.resetErrorBoundary();
          }
        }, 5000);
      }

      return <LoadingWithTimeout timeout={8000} />;
    }

    return this.props.children;
  }
}

// Circuit breaker to prevent infinite retry loops
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 30000, // 30 seconds
  ) {
    // Ensure properties are recognized as used
    this.threshold = threshold;
    this.timeout = timeout;
  }

  canExecute(): boolean {
    if (this.state === 'CLOSED') {
      return true;
    }
    
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    
    // HALF_OPEN state
    return true;
  }

  onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  isOpen(): boolean {
    return this.state === 'OPEN';
  }

  getState(): { state: string; failures: number; threshold: number; timeout: number } {
    return {
      state: this.state,
      failures: this.failures,
      threshold: this.threshold,
      timeout: this.timeout
    };
  }
}

// Global circuit breaker for lazy loading
const lazyLoadingCircuitBreaker = new CircuitBreaker(3, 15000); // 3 failures, 15 second timeout

// Strategy for lazy loading with retry capability
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyComponent = <P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  retries: number = 3,
): ComponentType<P> => {
  const LazyComponent = React.lazy(async () => {
    // Check circuit breaker first
    if (!lazyLoadingCircuitBreaker.canExecute()) {
      // Use auto-recovery system instead of throwing error
      await autoRecoverySystem.attemptRecovery();
      
      // After recovery attempt, check circuit breaker again
      if (!lazyLoadingCircuitBreaker.canExecute()) {
        throw new Error('System temporarily unavailable - automatic recovery in progress');
      }
    }

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < retries) {
      try {
        const module = await importFn();
        
        // Validate the module has a default export
        if (!module || !module.default) {
          throw new Error('Module does not have a valid default export');
        }
        
        lazyLoadingCircuitBreaker.onSuccess();
        autoRecoverySystem.reset(); // Reset recovery system on success
        return module;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        // Check if it's a chunk loading error
        const isChunkError = lastError && (
          lastError.message?.includes('Failed to fetch dynamically imported module') ||
          lastError.message?.includes('Loading chunk') ||
          lastError.message?.includes('ChunkLoadError') ||
          lastError.message?.includes('Loading CSS chunk') ||
          lastError.message?.includes('Loading script chunk') ||
          lastError.name === 'ChunkLoadError'
        );

        // Check if it's an API/Network error that shouldn't be retried
        const isAPIError = lastError && (
          lastError.message?.toLowerCase().includes('fetch') ||
          lastError.message?.toLowerCase().includes('network error') ||
          lastError.message?.toLowerCase().includes('failed to fetch') ||
          lastError.name?.toLowerCase() === 'networkerror'
        );

        // If it's the final attempt, mark failure and throw
        if (attempt >= retries) {
          lazyLoadingCircuitBreaker.onFailure();
          throw lastError;
        }

        // Don't retry API errors - throw immediately to prevent infinite loading
        if (isAPIError && !isChunkError) {
          lazyLoadingCircuitBreaker.onFailure();
          throw lastError;
        }

        // Don't retry if module validation failed
        if (lastError.message?.includes('does not have a valid default export')) {
          lazyLoadingCircuitBreaker.onFailure();
          throw lastError;
        }

        if (isChunkError) {
          // For chunk loading errors, quick retry with exponential backoff
          await new Promise<void>((resolve) => {
            window.setTimeout(() => resolve(), Math.min(100 * attempt, 1000));
          });
        } else {
          // For other errors, shorter retry with exponential backoff
          await new Promise<void>((resolve) => {
            window.setTimeout(() => resolve(), Math.min(200 * attempt, 2000));
          });
        }
      }
    }

    // This should never be reached, but satisfies TypeScript
    lazyLoadingCircuitBreaker.onFailure();
    throw lastError || new Error('Maximum retry attempts exceeded');
  });

  // Return the component wrapped with error boundary and suspense with timeout
  return (props: P) => (
    <SimpleErrorBoundary maxRetries={2}>
      <Suspense fallback={<LoadingWithTimeout timeout={15000} />}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <LazyComponent {...(props as any)} />
      </Suspense>
    </SimpleErrorBoundary>
  );
};

// Strategy for lazy loading with chunking optimization
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createOptimizedLazyComponent = <P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  chunkName?: string,
): ComponentType<P> => {
  // Add webpack magic comment for chunk naming if provided
  const enhancedImportFn = chunkName
    ? (): Promise<{ default: ComponentType<P> }> => importFn()
    : importFn;

  return createLazyComponent(enhancedImportFn, 2);
};

// Strategy for preloading components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createPreloadableLazyComponent = <P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
): ComponentType<P> & { preload: () => void } => {
  let componentPromise: Promise<{ default: ComponentType<P> }> | null = null;

  const preload = (): Promise<{ default: ComponentType<P> }> => {
    if (!componentPromise) {
      componentPromise = importFn();
    }
    return componentPromise;
  };

  const LazyComponent = createLazyComponent(() => {
    if (componentPromise) {
      return componentPromise;
    }
    return preload();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (LazyComponent as any).preload = preload;
  return LazyComponent as ComponentType<P> & { preload: () => void };
};

// High-level wrapper for route components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withLazyLoading = <P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    retries?: number;
    preloadable?: boolean;
    chunkName?: string;
  } = {},
): ComponentType<P> => {
  const { retries = 3, preloadable = false, chunkName } = options;

  if (preloadable) {
    return createPreloadableLazyComponent(importFn);
  }

  if (chunkName) {
    return createOptimizedLazyComponent(importFn, chunkName);
  }

  return createLazyComponent(importFn, retries);
};

// Utility to create route element with lazy loading
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyRouteElement = <P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    retries?: number;
    preloadable?: boolean;
    chunkName?: string;
  },
): ReactElement => {
  const LazyComponent = withLazyLoading(importFn, options);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <LazyComponent {...({} as any)} />;
};

// Utility function to handle cache busting reload
const reloadWithCacheBust = (): void => {
  // Clear various caches aggressively
  if ('caches' in window) {
    window.caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        window.caches.delete(cacheName);
      });
    });
  }
  
  // Clear localStorage items related to chunk loading and any webpack cache
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('chunk') || 
        key.includes('webpack') || 
        key.includes('vite') ||
        key.includes('__vite__') ||
        key.includes('module')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore localStorage errors
  }
  
  // Clear sessionStorage as well
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sessionKeysToRemove = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && (
          key.includes('chunk') || 
          key.includes('webpack') || 
          key.includes('vite') ||
          key.includes('__vite__') ||
          key.includes('module')
        )) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
    }
  } catch {
    // Ignore sessionStorage errors
  }
  
  // Force reload with aggressive cache busting
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2);
  window.location.href = window.location.href.split('?')[0] + `?_cb=${timestamp}&_r=${randomId}`;
};

// Utility function to check if an error is timeout-related
const checkIfTimeoutError = (error: Error): boolean => {
  const message = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';
  const stack = error.stack?.toLowerCase() || '';
  
  // Specific timeout error patterns
  const timeoutPatterns = [
    'timeout',
    'request timeout',
    'response timeout',
    'connection timeout',
    'read timeout',
    'operation timeout',
    'fetch timeout',
    'network timeout',
    'gateway timeout',
    'request took too long',
    'slow response',
    'response delayed',
    'timeouterror',
    'operation timed out',
    'connection timed out',
    'request aborted due to timeout'
  ];
  
  return Boolean(
    name === 'timeouterror' ||
    name.includes('timeout') ||
    timeoutPatterns.some(pattern => 
      message.includes(pattern) || 
      stack.includes(pattern)
    )
  );
};

// Utility function to check if an error is API-related
const checkIfAPIError = (error: Error): boolean => {
  const message = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';
  const stack = error.stack?.toLowerCase() || '';
  
  // Common API error patterns
  const apiPatterns = [
    'fetch',
    'network error',
    'failed to fetch',
    'http error',
    'request failed',
    'response error',
    'api error',
    'server error',
    'axios error',
    'xhr error',
    'timeout',
    'request timeout',
    'response timeout',
    'connection timeout',
    'read timeout',
    'abort',
    'connection refused',
    'bad request',
    'unauthorized',
    'forbidden',
    'not found',
    'internal server error',
    'service unavailable',
    'gateway timeout',
    'networkerror',
    'typeerror: failed to fetch',
    'cors error',
    // Server restart/connection issues
    'econnrefused',
    'enotfound',
    'econnreset',
    'connection lost',
    'server unavailable',
    'websocket connection',
    'hmr connection',
    'hot reload',
    // Authentication related patterns that should NOT trigger reloads
    'authentication',
    'auth error',
    'login error',
    'session expired',
    'token expired',
    'invalid token',
    'access denied',
    'permission denied',
    // Slow response patterns
    'slow response',
    'response delayed',
    'request taking too long',
    'slow network'
  ];
  
  // Check for common HTTP status codes in error messages
  const httpStatusPattern = /(4\d{2}|5\d{2})/; // 400-599 status codes
  
  return Boolean(
    name === 'networkerror' ||
    name === 'timeouterror' ||
    httpStatusPattern.test(message) ||
    apiPatterns.some(pattern => 
      message.includes(pattern) || 
      stack.includes(pattern)
    )
  );
};

// Utility function to check if an error is DOM-related
const checkIfDOMError = (error: Error): boolean => {
  const message = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';
  const stack = error.stack?.toLowerCase() || '';
  
  const domPatterns = [
    'removechild',
    'insertbefore',
    'notfounderror',
    'domexception',
    'dom exception',
    'node to be removed is not a child',
    'failed to execute',
    'hierarchy request error',
    'invalid character error',
    'the node to be removed is not a child of this node'
  ];
  
  return Boolean(
    name === 'notfounderror' ||
    name === 'domexception' ||
    name === 'typeerror' && (message.includes('null') || message.includes('undefined')) ||
    domPatterns.some(pattern => 
      message.includes(pattern) || 
      stack.includes(pattern)
    )
  );
};

// Global error handler for chunk loading errors
let hasSetupGlobalHandler = false;
let lastReloadTime = 0;
const RELOAD_THROTTLE_TIME = 10000; // 10 seconds between reloads (increased from 5 seconds)

const shouldAllowReload = (): boolean => {
  const now = Date.now();
  if (now - lastReloadTime < RELOAD_THROTTLE_TIME) {
    // eslint-disable-next-line no-console
    console.warn('Reload throttled - too soon since last reload');
    return false;
  }
  lastReloadTime = now;
  return true;
};

const setupGlobalChunkErrorHandler = (): void => {
  if (hasSetupGlobalHandler) return;
  hasSetupGlobalHandler = true;

  // Handle unhandled promise rejections (common for chunk loading errors)
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const error = event.reason;
      
      if (error instanceof Error) {
        const isChunkError = 
          error.message?.includes('Failed to fetch dynamically imported module') ||
          error.message?.includes('Loading chunk') && !error.message?.includes('network error') ||
          error.message?.includes('ChunkLoadError') ||
          error.message?.includes('Loading CSS chunk') ||
          error.message?.includes('Loading script chunk') ||
          error.name === 'ChunkLoadError';

        const isDOMError = checkIfDOMError(error);
        const isAPIError = checkIfAPIError(error);
        const isTimeoutError = checkIfTimeoutError(error);

        // Log for debugging
        // eslint-disable-next-line no-console
        console.log('Global rejection handler:', {
          message: error.message,
          isChunkError,
          isDOMError,
          isAPIError,
          isTimeoutError
        });

        // Do NOT reload on API errors or timeout errors
        if (isAPIError || isTimeoutError) {
          // eslint-disable-next-line no-console
          console.warn('API/Timeout Error caught in global handler, not reloading:', error);
          return;
        }

        if (isChunkError) {
          // Silent recovery with cache busting (throttled)
          if (shouldAllowReload()) {
            event.preventDefault();
            window.setTimeout(() => {
              reloadWithCacheBust();
            }, 100);
          }
        } else if (isDOMError) {
          // Silent fast recovery for DOM errors (throttled)
          if (shouldAllowReload()) {
            event.preventDefault();
            window.setTimeout(() => {
              window.location.reload();
            }, 50);
          }
        }
      }
    } catch (handlerError) {
      // eslint-disable-next-line no-console
      console.error('Error in unhandledrejection handler:', handlerError);
    }
  });

  // Handle script loading errors
  window.addEventListener('error', (event) => {
    try {
      // Check if it's a DOM-related error from the error event
      if (event.error && event.error instanceof Error) {
        const isDOMError = checkIfDOMError(event.error);
        const isAPIError = checkIfAPIError(event.error);
        const isTimeoutError = checkIfTimeoutError(event.error);

        // Log for debugging
        // eslint-disable-next-line no-console
        console.log('Global error handler:', {
          message: event.error.message,
          isDOMError,
          isAPIError,
          isTimeoutError
        });

        // Do NOT reload on API errors or timeout errors
        if (isAPIError || isTimeoutError) {
          // eslint-disable-next-line no-console
          console.warn('API/Timeout Error caught in script error handler, not reloading:', event.error);
          return;
        }

        if (isDOMError) {
          // Silent fast recovery for DOM errors (throttled)
          if (shouldAllowReload()) {
            window.setTimeout(() => {
              window.location.reload();
            }, 50);
          }
          return;
        }
      }

      // Check for script/CSS loading errors
      if (event.target) {
        const target = event.target as { src?: string; href?: string } | null;
        if (target && (target.src || target.href)) {
          const src = target.src || target.href;
          if (src && (src.includes('.js') || src.includes('.css'))) {
            // Silent recovery for script loading errors (throttled)
            if (shouldAllowReload()) {
              window.setTimeout(() => {
                reloadWithCacheBust();
              }, 100);
            }
          }
        }
      }
    } catch (handlerError) {
      // eslint-disable-next-line no-console
      console.error('Error in global error handler:', handlerError);
    }
  });
};

// Auto-recovery system that handles failures without user interaction
class AutoRecoverySystem {
  private static instance: AutoRecoverySystem;
  private recoveryAttempts: number = 0;
  private lastRecoveryTime: number = 0;
  private readonly maxRecoveryAttempts: number = 3;
  private readonly recoveryThrottleTime: number = 30000; // 30 seconds

  static getInstance(): AutoRecoverySystem {
    if (!AutoRecoverySystem.instance) {
      AutoRecoverySystem.instance = new AutoRecoverySystem();
    }
    return AutoRecoverySystem.instance;
  }

  canAttemptRecovery(): boolean {
    const now = Date.now();
    
    // Reset attempts if enough time has passed
    if (now - this.lastRecoveryTime > this.recoveryThrottleTime) {
      this.recoveryAttempts = 0;
    }
    
    return this.recoveryAttempts < this.maxRecoveryAttempts;
  }

  attemptRecovery(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.canAttemptRecovery()) {
        // If we can't attempt recovery, just wait and resolve
        window.setTimeout(() => resolve(), 5000);
        return;
      }

      this.recoveryAttempts++;
      this.lastRecoveryTime = Date.now();

      // Progressive recovery strategy
      if (this.recoveryAttempts === 1) {
        // First attempt: Just wait a bit
        window.setTimeout(() => resolve(), 2000);
      } else if (this.recoveryAttempts === 2) {
        // Second attempt: Clear caches and wait
        this.clearApplicationCaches().then(() => {
          window.setTimeout(() => resolve(), 3000);
        });
      } else {
        // Final attempt: Full reload if allowed
        if (shouldAllowReload()) {
          reloadWithCacheBust();
          // This will never resolve, but that's okay as page will reload
        } else {
          // If reload is not allowed, just wait longer
          window.setTimeout(() => resolve(), 5000);
        }
      }
    });
  }

  private async clearApplicationCaches(): Promise<void> {
    try {
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => window.caches.delete(cacheName))
        );
      }

      // Clear relevant localStorage items
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('chunk') || 
          key.includes('webpack') || 
          key.includes('vite') ||
          key.includes('__vite__') ||
          key.includes('module')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to clear caches:', error);
    }
  }

  reset(): void {
    this.recoveryAttempts = 0;
    this.lastRecoveryTime = 0;
  }
}

const autoRecoverySystem = AutoRecoverySystem.getInstance();

// Utility functions to help applications handle timeout errors
export const isTimeoutError = (error: Error): boolean => {
  return checkIfTimeoutError(error);
};

export const isAPIError = (error: Error): boolean => {
  return checkIfAPIError(error);
};

// Utility to reset circuit breaker manually if needed
export const resetLazyLoadingCircuitBreaker = (): void => {
  lazyLoadingCircuitBreaker.onSuccess();
};

// Utility to check circuit breaker status
export const getLazyLoadingCircuitBreakerStatus = (): { state: string; failures: number; threshold: number; timeout: number } => {
  return lazyLoadingCircuitBreaker.getState();
};

// Utility to create a lazy component with custom timeout
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyComponentWithTimeout = <P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    retries?: number;
    timeout?: number;
    maxRetries?: number;
  } = {}
): ComponentType<P> => {
  const { retries = 3, timeout = 10000, maxRetries = 2 } = options;
  
  const LazyComponent = createLazyComponent(importFn, retries);
  
  return (props: P) => (
    <SimpleErrorBoundary maxRetries={maxRetries}>
      <Suspense fallback={<LoadingWithTimeout timeout={timeout} />}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <LazyComponent {...(props as any)} />
      </Suspense>
    </SimpleErrorBoundary>
  );
};

// Utility to reset auto-recovery system manually if needed
export const resetAutoRecoverySystem = (): void => {
  autoRecoverySystem.reset();
};

// Utility to check if auto-recovery can attempt recovery
export const canAttemptAutoRecovery = (): boolean => {
  return autoRecoverySystem.canAttemptRecovery();
};

// Setup global handler immediately
setupGlobalChunkErrorHandler();
