const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Flow...\n');

    // Test 1: Register a user
    console.log('1️⃣ Testing User Registration...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
      console.log('✅ Registration Success:', registerResponse.data);
    } catch (error) {
      console.log('❌ Registration Error:', error.response?.data || error.message);
    }

    // Test 2: Login with the registered user
    console.log('\n2️⃣ Testing User Login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      console.log('✅ Login Success:', loginResponse.data);
    } catch (error) {
      console.log('❌ Login Error:', error.response?.data || error.message);
    }

    // Test 3: Try login with wrong password
    console.log('\n3️⃣ Testing Login with Wrong Password...');
    const wrongLoginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    try {
      const wrongLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, wrongLoginData);
      console.log('✅ Wrong Password Test:', wrongLoginResponse.data);
    } catch (error) {
      console.log('❌ Wrong Password Error (Expected):', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test Script Error:', error.message);
  }
}

testAuth();