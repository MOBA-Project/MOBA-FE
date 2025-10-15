import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

export default apiClient;

