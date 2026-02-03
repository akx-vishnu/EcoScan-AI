import axios from 'axios';

const api = axios.create({
    baseURL: '',
    withCredentials: true,  // Ensures cookies are sent
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
        }
        throw error;
    }
);

export const checkAuthStatus = async () => {
    try {
        const response = await api.get('/api/profile');
        console.log('Auth check successful:', response.data);
        return true;
    } catch (error) {
        console.log('Auth check failed:', error.response?.status);
        return false;
    }
};


export const loginUser = async (username, password) => {
    try {
        const response = await api.post('/api/login', { username, password }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Login response:', response.data);
        return response.data;
    } catch (error) {
        console.log('Login error:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Network error occurred'
        };
    }
};

export const signupUser = async (username, email, password) => {
    try {
        const response = await api.post('/api/signup', { username, email, password }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Signup response:', response.data);
        return response.data;
    } catch (error) {
        console.log('Signup error:', error);
        let message = error.response?.data?.message || error.message || 'Network error occurred';

        // Append validation details if available
        if (error.response?.data?.errors) {
            const details = Object.entries(error.response.data.errors)
                .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
                .join(' | ');
            message += `: ${details}`;
        }

        return {
            success: false,
            message: message
        };
    }
};

export const logoutUser = async () => {
    try {
        await api.post('/api/logout');
        console.log('Logout successful');
        return true;
    } catch (error) {
        console.log('Logout error:', error);
        return false;
    }
};

export const scanProduct = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('product_image', imageFile);

        // 1. Submit Scan Job
        const response = await api.post('/api/scan', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        console.log('Scan submission response:', response.data);

        // Status 202 means Accepted/Async
        if (response.status === 202 && response.data.task_id) {
            const taskId = response.data.task_id;
            console.log(`Polling for task ${taskId}...`);

            // 2. Poll for Completion
            return new Promise((resolve, reject) => {
                const checkStatus = async () => {
                    try {
                        const taskRes = await api.get(`/api/tasks/${taskId}`);
                        const taskData = taskRes.data.data;
                        console.log('Task status:', taskData.status);

                        if (taskData.status === 'COMPLETED') {
                            resolve({ success: true, data: taskData.result });
                        } else if (taskData.status === 'FAILED') {
                            resolve({ success: false, message: taskData.error || 'Scan analysis failed' });
                        } else {
                            // Still processing, check again in 2s
                            setTimeout(checkStatus, 2000);
                        }
                    } catch (e) {
                        console.error('Polling error:', e);
                        resolve({ success: false, message: 'Lost connection to scan task' });
                    }
                };
                checkStatus();
            });
        }

        // Fallback for immediate response (if logic changes back)
        return response.data;

    } catch (error) {
        console.log('Scan error:', error);
        if (error.response?.status === 401) {
            return { success: false, message: 'Please log in to scan products.' };
        }
        if (error.response?.status === 500) {
            return { success: false, message: 'Server error. Please try again later.' };
        }
        return { success: false, message: error.message || 'Scan processing failed.' };
    }
};

export const getProfile = async () => {
    try {
        const response = await api.get('/api/profile');
        console.log('Profile fetch successful:', response.data);
        return response.data;
    } catch (error) {
        console.log('Profile fetch error:', error);
        return null;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.post('/api/profile', profileData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Profile update successful:', response.data);
        return response.data;
    } catch (error) {
        console.log('Profile update error:', error);
        let message = error.message || 'Update failed';

        // Append validation details if available
        if (error.response?.data?.errors) {
            const details = Object.entries(error.response.data.errors)
                .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
                .join(' | ');
            message += `: ${details}`;
        } else if (error.response?.data?.message) {
            message = error.response.data.message;
        }

        return { success: false, message: message };
    }
};

export const chatWithAI = async (query, context) => {
    try {
        const response = await api.post('/api/chat', { query, context }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Chat response:', response.data);
        return response.data.response;
    } catch (error) {
        console.log('Chat error:', error);
        return "Sorry, I couldn't reach the AI.";
    }
};

export const getHistory = async () => {
    try {
        const response = await api.get('/api/history');
        console.log('History fetch successful:', response.data);
        return response.data;
    } catch (error) {
        console.log('History fetch error:', error);
        return { success: false, data: [] };
    }
};

export const clearHistory = async () => {
    try {
        const response = await api.post('/api/history/clear');
        console.log('History clear successful:', response.data);
        return response.data;
    } catch (error) {
        console.log('History clear error:', error);
        return { success: false, message: 'Failed to clear history' };
    }
};