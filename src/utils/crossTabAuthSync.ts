/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { store } from '@/redux-toolkit/store/store';
import { logout } from '@/redux-toolkit/slices/auth/authSlice';

// Constants for localStorage keys
const LOGOUT_EVENT_KEY = 'trust_pay_logout_event';
const LOGIN_EVENT_KEY = 'trust_pay_login_event';
const AUTH_TOKEN_KEY = 'accessToken';
const USER_DATA_KEY = 'userData';
const USER_SESSION_KEY = 'userSession';

// Interface for logout event data
interface LogoutEventData {
  timestamp: number;
  sessionId: string;
  reason?: string;
}

// Interface for login event data
interface LoginEventData {
  timestamp: number;
  sessionId: string;
  userId: string;
  tabId: string;
  accessToken: string;
}

// Type alias for login callback function
type LoginCallback = Function;

class CrossTabAuthSync {
  private isInitialized = false;
  private currentSessionId: string | null = null;
  private currentTabId: string;
  private loginCallbacks: LoginCallback[] = [];

  constructor() {
    this.currentSessionId = localStorage.getItem(USER_SESSION_KEY);
    this.currentTabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    this.init();
  }

  /**
   * Initialize cross-tab authentication synchronization
   */
  private init(): void {
    if (this.isInitialized) return;

    // Listen for storage events (fired when localStorage is modified in other tabs)
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    
    // Listen for beforeunload to clean up
    window.addEventListener('beforeunload', this.cleanup.bind(this));
    
    this.isInitialized = true;
  }

  /**
   * Handle storage events from other tabs
   */
  private handleStorageEvent(event: any): void {
    // Handle logout events
    if (event.key === LOGOUT_EVENT_KEY) {
      this.handleLogoutEvent(event);
      return;
    }
    
    // Handle login events
    if (event.key === LOGIN_EVENT_KEY) {
      this.handleLoginEvent(event);
      return;
    }
  }

  /**
   * Handle logout events from other tabs
   */
  private handleLogoutEvent(event: any): void {
    // If the new value is null, it means the logout event was cleared
    if (!event.newValue) return;

    try {
      const logoutData: LogoutEventData = JSON.parse(event.newValue);
      
      // Verify this is a recent logout event (within last 5 seconds)
      const timeDiff = Date.now() - logoutData.timestamp;
      if (timeDiff > 5000) return;

      // Perform logout for all tabs when logout event is detected
      // console.log('Cross-tab logout detected');
      this.performLogout(logoutData.reason || 'Logged out from another tab');
    } catch (error) {
      console.error('Error parsing logout event data:', error);
    }
  }

  /**
   * Handle login events from other tabs
   */
  private handleLoginEvent(event: any): void {
    // If the new value is null, it means the login event was cleared
    if (!event.newValue) return;

    try {
      const loginData: LoginEventData = JSON.parse(event.newValue);
      
      // Ignore events from the same tab
      if (loginData.tabId === this.currentTabId) return;
      
      // Verify this is a recent login event (within last 10 seconds)
      const timeDiff = Date.now() - loginData.timestamp;
      if (timeDiff > 10000) return;

      // Notify all registered callbacks about the login
      this.loginCallbacks.forEach(callback => {
        try {
          callback(loginData);
        } catch (error) {
          console.error('Error in login callback:', error);
        }
      });
    } catch (error) {
      console.error('Error parsing login event data:', error);
    }
  }

  /**
   * Trigger logout across all tabs
   */
  public triggerCrossTabLogout(reason?: string): void {
    const logoutData: LogoutEventData = {
      timestamp: Date.now(),
      sessionId: this.currentSessionId || '',
      reason
    };

    // Set the logout event in localStorage to notify other tabs
    localStorage.setItem(LOGOUT_EVENT_KEY, JSON.stringify(logoutData));
    
    // Clear the logout event after a short delay to avoid repeated processing
    window.setTimeout(() => {
      localStorage.removeItem(LOGOUT_EVENT_KEY);
    }, 1000);
  }

  /**
   * Trigger login coordination across all tabs
   */
  public triggerCrossTabLogin(sessionId: string, userId: string, accessToken: string): void {
    const loginData: LoginEventData = {
      timestamp: Date.now(),
      sessionId,
      userId,
      tabId: this.currentTabId,
      accessToken
    };

    // Update current session ID
    this.currentSessionId = sessionId;

    // Set the login event in localStorage to notify other tabs
    localStorage.setItem(LOGIN_EVENT_KEY, JSON.stringify(loginData));
    
    // Clear the login event after a short delay to avoid repeated processing
    window.setTimeout(() => {
      localStorage.removeItem(LOGIN_EVENT_KEY);
    }, 2000);
  }

  /**
   * Register a callback to be called when login occurs in another tab
   */
  public onCrossTabLogin(callback: LoginCallback): void {
    this.loginCallbacks.push(callback);
  }

  /**
   * Remove a login callback
   */
  public offCrossTabLogin(callback: LoginCallback): void {
    const index = this.loginCallbacks.indexOf(callback);
    if (index > -1) {
      this.loginCallbacks.splice(index, 1);
    }
  }

  /**
   * Get current tab ID
   */
  public getTabId(): string {
    return this.currentTabId;
  }

  /**
   * Perform the actual logout
   */
  private performLogout(reason?: string): void {
    console.log(`Performing cross-tab logout. Reason: ${reason || 'Unknown'}`);
    
    // Clear all auth-related data from localStorage
    this.clearAuthData();
    
    // Dispatch logout action to Redux store
    store.dispatch(logout());
    
    // Redirect to login page
    window.location.href = '/';
  }

  /**
   * Clear all authentication data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(USER_SESSION_KEY);
    // Clear any other auth-related items
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('user') ||
        key.includes('session')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Update current session ID
   */
  public updateSessionId(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  /**
   * Check if token exists in localStorage
   */
  public hasValidToken(): boolean {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  }

  /**
   * Monitor token changes and trigger logout if token is removed
   */
  public startTokenMonitoring(): void {
    // Check token every 2 seconds
    const tokenCheckInterval = window.setInterval(() => {
      if (!this.hasValidToken() && this.isAuthenticated()) {
        console.log('Token removed, triggering logout');
        this.performLogout('Token removed');
        window.clearInterval(tokenCheckInterval);
      }
    }, 2000);

    // Store interval ID for cleanup
    (window as any).__tokenCheckInterval = tokenCheckInterval;
  }

  /**
   * Stop token monitoring
   */
  public stopTokenMonitoring(): void {
    const intervalId = (window as any).__tokenCheckInterval;
    if (intervalId) {
      window.clearInterval(intervalId);
      delete (window as any).__tokenCheckInterval;
    }
  }

  /**
   * Check if user is currently authenticated in Redux store
   */
  private isAuthenticated(): boolean {
    const state = store.getState();
    return state.auth?.isAuthenticated || false;
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.stopTokenMonitoring();
  }

  /**
   * Destroy the instance and remove event listeners
   */
  public destroy(): void {
    window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    window.removeEventListener('beforeunload', this.cleanup.bind(this));
    this.stopTokenMonitoring();
    this.isInitialized = false;
  }
}

// Create singleton instance
const crossTabAuthSync = new CrossTabAuthSync();

// Export functions for use in components
export const initCrossTabAuthSync = (): void => {
  crossTabAuthSync.startTokenMonitoring();
};

export const triggerCrossTabLogout = (reason?: string): void => {
  crossTabAuthSync.triggerCrossTabLogout(reason);
};

export const triggerCrossTabLogin = (sessionId: string, userId: string, accessToken: string): void => {
  crossTabAuthSync.triggerCrossTabLogin(sessionId, userId, accessToken);
};

export const onCrossTabLogin = (callback: LoginCallback): void => {
  crossTabAuthSync.onCrossTabLogin(callback);
};

export const offCrossTabLogin = (callback: LoginCallback): void => {
  crossTabAuthSync.offCrossTabLogin(callback);
};

export const updateSessionId = (sessionId: string): void => {
  crossTabAuthSync.updateSessionId(sessionId);
};

export const getTabId = (): string => {
  return crossTabAuthSync.getTabId();
};

export const destroyCrossTabAuthSync = (): void => {
  crossTabAuthSync.destroy();
};

// Export types for use in components
export type { LoginEventData, LogoutEventData, LoginCallback };

// Export the class for advanced usage
export { CrossTabAuthSync };

// Export default instance
export default crossTabAuthSync;
