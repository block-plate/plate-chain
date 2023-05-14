import axios from 'axios';

axios.defaults.withCredentials = true;

const api = axios.create({
    baseURL: `/v1`,
});

export const getBlocks = () => api.get(`/block`)

export const login = (data) => api.post(`/auth/login`, data);

export const getWallets = () => api.get(`/wallet/`);

export const getWallet = (account) => api.get(`/wallet/${account}`);

export const sendTransaction = (data) => api.post('/transaction', data);