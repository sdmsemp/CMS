import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      return supported;
    };

    checkSupport();
  }, []);

  // Convert VAPID public key to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Register service worker
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  };

  // Get VAPID public key from server
  const getVapidPublicKey = async () => {
    try {
      const response = await api.push.getVapidPublicKey();
      return response.data.data.publicKey;
    } catch (error) {
      console.error('Failed to get VAPID public key:', error);
      throw error;
    }
  };

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Register service worker
      const registration = await registerServiceWorker();

      // Get VAPID public key
      const vapidPublicKey = await getVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      // Save subscription to server
      await api.push.subscribe({ subscription: pushSubscription });

      setSubscription(pushSubscription);
      setIsSubscribed(true);
      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Unsubscribe from push manager
      await subscription.unsubscribe();

      // Remove subscription from server
      await api.push.unsubscribe({ endpoint: subscription.endpoint });

      setSubscription(null);
      setIsSubscribed(false);
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  // Check current subscription status
  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  }, [isSupported]);

  // Check subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  // Handle service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          window.location.reload();
        }
      });
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    subscription,
    loading,
    error,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus
  };
};

export default usePushNotifications; 