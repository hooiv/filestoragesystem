import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000', // Adjust if backend runs elsewhere
});

export default API;
