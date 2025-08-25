/**
 * API Configuration
 *
 * This file centralizes API endpoints configuration for the application.
 * It makes it easy to switch between development and production environments.
 */

// Base URLs for different environments
const API_URLS = {
  development: "http://localhost:5000",
  production: "https://clinix-spehere-assignment.onrender.com",
};

// Always use production URL when deployed
const BASE_URL =
  window.location.hostname === "localhost"
    ? API_URLS.development
    : API_URLS.production;

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
