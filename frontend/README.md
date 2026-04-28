# MegaShop Mobile App

A React Native mobile application for the MegaShop e-commerce platform, built with Expo.

## Features

- User authentication (login/register)
- Product browsing with advanced filtering
- Shopping cart functionality
- Wishlist management
- Order placement and tracking
- Promo code support
- Responsive mobile UI

## Tech Stack

- **Framework**: React Native
- **Build Tool**: Expo
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Icons**: Expo Vector Icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)

## Installation

1. **Clone the repository**
2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Install Expo CLI** (global):
   ```bash
   npm install -g @expo/cli
   ```

## Configuration

### API Configuration

Update `src/config/constants.js` with your backend URL:

```javascript
export const API_BASE_URL = __DEV__
  ? "http://localhost:5000"          // Development
  : "https://your-backend.vercel.app"; // Production
```

## Running the App

### Development Mode
```bash
npm start
# or
expo start
```

### Android Emulator
```bash
expo run:android
```

### iOS Simulator (macOS only)
```bash
expo run:ios
```

## Building APK for Android

### Step 1: Configure app.json

Ensure your `app.json` has the correct configuration:

```json
{
  "expo": {
    "name": "MegaShop",
    "slug": "megashop",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "android": {
      "package": "com.yourcompany.megashop"
    }
  }
}
```

### Step 2: Login to Expo

```bash
expo login
```

### Step 3: Build APK

```bash
expo build:android
```

1. Choose "APK" when prompted
2. Wait for the build to complete (10-20 minutes)
3. Download your APK from the Expo dashboard

### Step 4: Test APK

1. Transfer APK to Android device
2. Enable "Install from unknown sources"
3. Install and test

## Project Structure

```
frontend/
├── src/
│   ├── api/           # API service functions
│   ├── components/    # Reusable UI components
│   ├── config/        # Configuration files
│   ├── context/       # React context providers
│   ├── navigation/    # Navigation configuration
│   ├── screens/       # Screen components
│   └── utils/         # Utility functions
├── assets/            # Images and static assets
├── app.json           # Expo configuration
└── package.json       # Dependencies
```

## Key Features Implementation

### Authentication
- JWT-based authentication
- Secure token storage with AsyncStorage
- Automatic logout on token expiry

### Product Management
- Advanced filtering (price, category, rating)
- Real-time search
- Sorting options (newest, price, popularity)

### Cart & Checkout
- Persistent cart storage
- Promo code application
- Multiple payment methods

### UI/UX
- Material Design inspired
- Smooth animations
- Responsive layout
- Loading states and error handling

## Troubleshooting

### Common Issues

**Build fails:**
- Ensure all dependencies are installed
- Check that image assets exist
- Verify Expo CLI is up to date

**API connection issues:**
- Confirm backend URL is correct
- Check network connectivity
- Verify CORS settings on backend

**Android build issues:**
- Ensure Android SDK is installed
- Check Expo account permissions
- Verify app.json configuration

### Debug Commands

```bash
# Clear Expo cache
expo start --clear

# View device logs
expo start --dev-client

# Build with verbose logging
expo build:android --verbose
```

## Deployment

### Google Play Store
1. Build a signed APK/AAB
2. Create Google Play Console account
3. Upload and configure store listing
4. Publish to production

### Alternative Distribution
- Direct APK sharing
- Beta testing platforms
- Enterprise distribution

## Contributing

1. Follow React Native and Expo best practices
2. Test on both Android and iOS
3. Ensure proper error handling
4. Update documentation for new features

## License

This project is licensed under the ISC License.