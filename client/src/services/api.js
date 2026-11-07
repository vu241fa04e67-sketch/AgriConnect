import axios from 'axios';
const apiOrigin = import.meta.env.VITE_API_ORIGIN?.replace(/\/+$/, '');
const apiBaseURL = apiOrigin
  ? `${apiOrigin.startsWith('http') ? apiOrigin : `https://${apiOrigin}`}/api`
  : 'http://localhost:5000/api';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || apiBaseURL
});
api.interceptors.request.use(config=>{const token=localStorage.getItem('agri_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
export default api;
