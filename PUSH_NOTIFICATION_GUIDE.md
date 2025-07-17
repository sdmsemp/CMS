# 🔔 Web Push Notification System - Complete Guide

## Overview

The CMS system now includes a comprehensive web push notification system that automatically notifies department subadmins when new complaints are created in their department.

## 🏗️ Architecture

### Backend Components
- **PushSubscription Model**: Stores user push notification subscriptions
- **PushNotificationService**: Handles VAPID key generation and notification sending
- **PushNotificationRoutes**: API endpoints for subscription management
- **ComplaintController Integration**: Automatically sends notifications on complaint creation

### Frontend Components
- **Service Worker** (`/public/sw.js`): Handles push events and displays notifications
- **usePushNotifications Hook**: React hook for managing push subscriptions
- **PushNotificationToggle Component**: UI component for enabling/disabling notifications
- **Profile Page Integration**: Users can manage push notifications in their profile

## 🚀 Features

### ✅ Implemented Features
1. **VAPID Key Management**: Automatic generation and serving of VAPID keys
2. **Subscription Management**: Users can subscribe/unsubscribe to push notifications
3. **Department-based Routing**: Notifications are sent to the correct department subadmin
4. **Complaint Integration**: Automatic notifications when complaints are created
5. **Rich Notifications**: Support for actions, icons, and custom data
6. **Error Handling**: Graceful handling of invalid subscriptions and network errors
7. **Service Worker**: Handles push events even when the app is closed
8. **UI Integration**: Toggle switch in user profile for easy management

### 📱 Notification Types
- **New Complaint Notifications**: Sent to department subadmin when a complaint is created
- **Test Notifications**: For testing the system functionality
- **Direct User Notifications**: For sending notifications to specific users

## 🧪 Testing

### Backend Testing
```bash
# Test complete push notification flow
cd backend
node test-complete-push-flow.js

# Test complaint notification flow
node test-complaint-notification-flow.js
```

### Frontend Testing
1. Open `http://localhost:5173/test-push.html` in your browser
2. Click "Subscribe to Push Notifications"
3. Allow notifications when prompted
4. Click "Test Notification" to send a test notification

### Real-world Testing
1. Login as a subadmin user
2. Go to Profile page and enable push notifications
3. Login as a regular user and create a complaint
4. Check for push notification on subadmin's device

## 📊 Database Schema

### Push Subscriptions Table
```sql
CREATE TABLE push_subscriptions (
  subscription_id INT PRIMARY KEY AUTO_INCREMENT,
  emp_id INT NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (emp_id) REFERENCES users(emp_id) ON DELETE CASCADE,
  UNIQUE KEY push_subscriptions_endpoint (endpoint(255))
);
```

## 🔧 API Endpoints

### GET `/api/push/vapid-public-key`
Returns the VAPID public key for frontend subscription.

### POST `/api/push/subscribe`
Subscribe to push notifications (requires authentication).

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "base64-encoded-p256dh-key",
      "auth": "base64-encoded-auth-key"
    }
  }
}
```

### POST `/api/push/unsubscribe`
Unsubscribe from push notifications (requires authentication).

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

### POST `/api/push/test`
Send a test notification to the authenticated user.

## 🔄 Flow Diagram

```
User Creates Complaint
         ↓
   ComplaintController
         ↓
   Find Department Subadmin
         ↓
   Send Push Notification
         ↓
   Service Worker Receives
         ↓
   Display Notification
         ↓
   User Clicks Action
         ↓
   Navigate to Complaint
```

## 🛠️ Configuration

### Environment Variables
The system uses default VAPID keys generated at runtime. For production, you should:

1. Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

2. Add to environment variables:
```env
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=admin@yourdomain.com
```

3. Update the push notification service to use environment variables.

### Service Worker Configuration
The service worker is configured to:
- Cache essential resources for offline functionality
- Handle push events and display notifications
- Support notification actions (view, dismiss)
- Navigate to relevant pages when notifications are clicked

## 🔒 Security Considerations

1. **VAPID Keys**: Keep private keys secure and never expose them to the frontend
2. **Authentication**: All subscription endpoints require valid JWT tokens
3. **HTTPS**: Push notifications require HTTPS in production
4. **Permission**: Users must explicitly grant notification permission
5. **Data Validation**: All subscription data is validated before storage

## 🚨 Troubleshooting

### Common Issues

1. **"Push notifications are not supported"**
   - Ensure the browser supports Service Workers and Push API
   - Check if the site is served over HTTPS (required in production)

2. **"Notification permission denied"**
   - User must manually grant permission in browser settings
   - Check browser notification settings

3. **"No active push subscriptions found"**
   - User hasn't subscribed to push notifications
   - Subscription may have been invalidated by the browser

4. **"VAPID key errors"**
   - Ensure VAPID keys are properly generated and configured
   - Check that the email address is valid

### Debug Steps

1. Check browser console for errors
2. Verify service worker registration
3. Check network tab for API calls
4. Verify database subscriptions exist
5. Test with the provided test page

## 📈 Performance Considerations

1. **Subscription Cleanup**: Invalid subscriptions are automatically marked as inactive
2. **Batch Processing**: Multiple notifications can be sent efficiently
3. **Error Handling**: Failed notifications don't block the complaint creation process
4. **Caching**: Service worker caches essential resources for offline functionality

## 🔮 Future Enhancements

1. **Notification Preferences**: Allow users to customize notification types
2. **Scheduled Notifications**: Send reminders for pending complaints
3. **Rich Media**: Support for images and videos in notifications
4. **Analytics**: Track notification engagement and effectiveness
5. **Mobile App**: Native mobile app with push notification support

## 📝 Usage Examples

### Enabling Push Notifications (User)
1. Login to the CMS system
2. Go to Profile page
3. Toggle "Enable push notifications"
4. Allow notifications when prompted by browser

### Creating a Complaint (Triggers Notification)
1. Login as a regular user
2. Go to Complaint Form
3. Fill in complaint details and select department
4. Submit complaint
5. Department subadmin receives push notification automatically

### Testing the System
1. Use the test page: `http://localhost:5173/test-push.html`
2. Run backend tests: `node test-complete-push-flow.js`
3. Create real complaints and verify notifications

---

## 🎉 Summary

The web push notification system is now fully integrated into the CMS and provides:

- ✅ Real-time notifications for new complaints
- ✅ Department-based routing
- ✅ Rich notification support with actions
- ✅ Service worker for background processing
- ✅ User-friendly subscription management
- ✅ Comprehensive error handling
- ✅ Production-ready architecture

The system automatically notifies the appropriate department subadmin whenever a customer creates a complaint, significantly improving response times and user experience. 