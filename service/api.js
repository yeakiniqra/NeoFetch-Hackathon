import axios from 'axios';

const API_URL = 'https://cse.uap-bd.edu/v1/api/';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getFaculties = async () => {
  try {
    const response = await apiClient.get('faculties/');
    return response.data;
  } catch (error) {
    console.error('Error fetching faculties:', error);
    throw error;
  }
};

export const getRoutine = async () => {
  try {
    const response = await apiClient.get(`classroutines/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching routine:', error);
    throw error;
  }
};

export const getNotice = async () => {
  try {
    const response = await apiClient.get(`noticeboard/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notice:', error);
    throw error;
  }
};

export const getClubsinfo = async () => {
  try {
    const response = await apiClient.get(`clubinformation/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clubs:', error);
    throw error;
  }
}

export const getSingleClubinfo = async (id) => {
  try {
    const response = await apiClient.get(`clubinformation/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clubs:', error);
    throw error;
  }
}



export default apiClient;
