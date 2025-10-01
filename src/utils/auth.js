import { jwtDecode } from "jwt-decode";

export const checkTokenValidity = () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    // Token doesn't exist, navigate user to login page
    return { isValid: false, expired: false };
  }

  try {
    // Decode the token to get expiration time
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    
    if (decodedToken.exp < currentTime) {
      // Token has expired, navigate user to login page
      return { isValid: false, expired: true };
    }
    
    // Token exists and is not expired
    return { isValid: true, expired: false };
  } catch (error) {
    console.error('Error decoding token:', error);
    // Invalid token format, navigate user to login page
    return { isValid: false, expired: true };
  }
};
