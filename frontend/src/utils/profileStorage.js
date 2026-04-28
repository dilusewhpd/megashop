import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_IMAGE_KEY = 'profileImage';
const USER_KEY = 'user';

export const ProfileStorage = {
  // Save profile image
  async saveProfileImage(imageUri) {
    try {
      if (imageUri) {
        await AsyncStorage.setItem(PROFILE_IMAGE_KEY, imageUri);
      } else {
        await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
      }
      return true;
    } catch (error) {
      console.error('Error saving profile image:', error);
      return false;
    }
  },

  // Get profile image
  async getProfileImage() {
    try {
      return await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
    } catch (error) {
      console.error('Error getting profile image:', error);
      return null;
    }
  },

  // Remove profile image
  async removeProfileImage() {
    try {
      await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error removing profile image:', error);
      return false;
    }
  },

  // Save user data
  async saveUser(userData) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  },

  // Get user data
  async getUser() {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Update user profile image in stored user data
  async updateUserProfileImage(profileImage) {
    try {
      const userData = await this.getUser();
      if (userData) {
        userData.profileImage = profileImage;
        await this.saveUser(userData);
      }
      return true;
    } catch (error) {
      console.error('Error updating user profile image:', error);
      return false;
    }
  },

  // Clear all profile data
  async clearProfileData() {
    try {
      await AsyncStorage.multiRemove([PROFILE_IMAGE_KEY, USER_KEY]);
      return true;
    } catch (error) {
      console.error('Error clearing profile data:', error);
      return false;
    }
  }
};