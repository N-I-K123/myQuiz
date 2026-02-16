import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const response = await api.get('/me');

            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await api.post('/login', { username, password });

            const userData = response.data.user;

            const normalizedUser = {
                ...userData,
                userId: userData.userId || userData.id
            };

            setUser(normalizedUser);
            return true;

        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (username, password, role) => {
        try {
            await api.post('/register', { username, password, role });
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;