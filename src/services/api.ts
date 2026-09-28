import axios from 'axios';

const API_URL = 'http://localhost:3000';

// --- BAGIAN PRODUK (Yang sudah ada sebelumnya) ---
export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const addProduct = async (productData: any) => {
  const response = await axios.post(`${API_URL}/products`, productData);
  return response.data;
};

export const updateProduct = async (id: number, productData: any) => {
  const response = await axios.put(`${API_URL}/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await axios.delete(`${API_URL}/products/${id}`);
  return response.data;
};

export const downloadExcel = () => {
  window.open(`${API_URL}/products/export/excel`, '_blank');
};


// --- BAGIAN LOGISTIK / INBOUND & OUTBOUND ---
export const getLogisticsTransactions = async () => {
  try {
    const response = await axios.get(`${API_URL}/logistics`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data logistik:', error);
    return [];
  }
};

export const addLogisticsTransaction = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/logistics`, data);
    return response.data;
  } catch (error) {
    console.error('Gagal menyimpan transaksi logistik:', error);
    throw error;
  }
};

export const clearLogisticsTransactions = async () => {
  try {
    await axios.delete(`${API_URL}/logistics`);
    return true;
  } catch (error) {
    console.error('Gagal membersihkan log:', error);
    return false;
  }
};


// --- BAGIAN AUDIT & STOCK OPNAME (Baru ditambahkan) ---
export const getAuditRecords = async () => {
  try {
    const response = await axios.get(`${API_URL}/audit`);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data audit:', error);
    return [];
  }
};

export const addAuditRecord = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/audit`, data);
    return response.data;
  } catch (error) {
    console.error('Gagal menyimpan data audit:', error);
    throw error;
  }
};

export const clearAuditRecords = async () => {
  try {
    await axios.delete(`${API_URL}/audit`);
    return true;
  } catch (error) {
    console.error('Gagal membersihkan data audit:', error);
    return false;
  }
};