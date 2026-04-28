// API Configuration
// For development: use localhost
// For production: use your deployed backend URL
// For Android emulator: use "http://10.0.2.2:5000"

// Production URL (update this with your Vercel/Render deployment URL)
export const API_BASE_URL = __DEV__
  ? "http://localhost:5000"
  : "https://your-backend-url.vercel.app"; // Replace with your actual deployed URL