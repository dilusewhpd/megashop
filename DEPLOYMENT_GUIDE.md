# MegaShop Deployment Guide

This guide will help you deploy the MegaShop e-commerce application (backend + database) and generate the Android APK.

## 🚀 Backend Deployment

### Step 1: Set up PostgreSQL Database

#### Option A: Supabase (Recommended - Free Tier)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the connection string (URI format)
5. Go to the SQL Editor and run the contents of `DATABASE_SETUP.sql`
6. Your database is ready!

#### Option B: Neon (Alternative Free Tier)
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from the dashboard
4. Use the SQL editor to run `DATABASE_SETUP.sql`

### Step 2: Deploy Backend to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Create .env file** with your database URL:
   ```
   DATABASE_URL=your_postgresql_connection_string_here
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   NODE_ENV=production
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel
   ```

5. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project dashboard
   - Settings → Environment Variables
   - Add the same variables from your .env file

6. **Redeploy** to apply environment variables:
   ```bash
   vercel --prod
   ```

7. **Get your backend URL** from the Vercel dashboard (e.g., `https://your-project.vercel.app`)

## 📱 Frontend Setup & APK Generation

### Step 1: Update API Configuration

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Update the API base URL** in `src/config/constants.js`:
   ```javascript
   // Replace localhost with your deployed backend URL
   export const API_BASE_URL = "https://your-project.vercel.app";
   ```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Install Expo CLI (Global)

```bash
npm install -g @expo/cli
```

### Step 4: Configure Expo for Build

1. **Login to Expo** (create account if needed):
   ```bash
   expo login
   ```

2. **Update app.json** for production build:
   ```json
   {
     "expo": {
       "name": "MegaShop",
       "slug": "megashop",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "userInterfaceStyle": "light",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       },
       "assetBundlePatterns": [
         "**/*"
       ],
       "ios": {
         "supportsTablet": true
       },
       "android": {
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#ffffff"
         },
         "package": "com.yourcompany.megashop"
       },
       "web": {
         "favicon": "./assets/favicon.png"
       }
     }
   }
   ```

### Step 5: Build Android APK

#### Option A: Expo Build Service (Recommended)
```bash
expo build:android
```

1. Choose "APK" when prompted
2. Wait for build to complete (may take 10-20 minutes)
3. Download your APK from the Expo dashboard

#### Option B: Local Build (Advanced)
```bash
expo run:android --device
```

This requires Android Studio and SDK setup.

### Step 6: Test the APK

1. Transfer the APK to your Android device
2. Enable "Install from unknown sources" in settings
3. Install and test the app

## 🔧 Troubleshooting

### Backend Issues
- **Database connection fails**: Check your DATABASE_URL format
- **JWT errors**: Ensure JWT_SECRET is set and matches between deployments
- **CORS issues**: Add your frontend URL to CORS origins if needed

### Frontend Issues
- **API calls fail**: Verify the API_BASE_URL is correct
- **Build fails**: Ensure all dependencies are installed
- **Expo login issues**: Try `expo logout` then `expo login` again

### APK Issues
- **Build fails**: Check that all assets exist in the correct paths
- **App crashes**: Check device logs with `expo start --clear`
- **Network issues**: Ensure backend allows requests from mobile apps

## 📋 Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET=your_long_random_secret_key
NODE_ENV=production
```

### Frontend (constants.js)
```javascript
export const API_BASE_URL = "https://your-vercel-app.vercel.app";
```

## 🎯 Final Steps

1. ✅ Database set up on Supabase/Neon
2. ✅ Backend deployed on Vercel
3. ✅ Frontend API URL updated
4. ✅ APK generated and tested
5. ✅ App ready for distribution!

## 📱 Distribution Options

- **Google Play Store**: Upload your APK to Google Play Console
- **Direct Download**: Share the APK file directly
- **Beta Testing**: Use Google Play Beta or direct sharing

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database tables are created properly
4. Test API endpoints with tools like Postman

Happy deploying! 🚀📱