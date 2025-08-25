/**
 * API Configuration
 *
 * This file centralizes API endpoints configuration for the mobile application.
 * It makes it easy to switch between development and production environments.
 */

// Base URLs for different environments
const API_URLS = {
  development: "http://192.168.0.12:5000", // Local development IP
  production: "https://clinix-spehere-assignment.onrender.com", // Hosted backend
};

// Determine if we're running in development or production
// For Expo, we'll use __DEV__ global variable
const isDevelopment = false; // Set to false to always use production

// Select the appropriate base URL
const BASE_URL = isDevelopment ? API_URLS.development : API_URLS.production;

// Export endpoints with base URL
export const API = {
  base: BASE_URL,
  auth: {
    login: `${BASE_URL}/auth/login`,
    register: `${BASE_URL}/auth/register`,
  },
  appointments: {
    base: `${BASE_URL}/appointments`,
    getById: (id) => `${BASE_URL}/appointments/${id}`,
    update: (id) => `${BASE_URL}/appointments/${id}`,
  },
  prescriptions: {
    base: `${BASE_URL}/prescriptions`,
    getByAppointment: (appointmentId) =>
      `${BASE_URL}/prescriptions/${appointmentId}`,
  },
};

export default API;
