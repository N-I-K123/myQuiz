const jwt = require('jsonwebtoken');
const userService = require('../services/UserService');


const JWT_SECRET = 'bardzotajnykluczjwt123';

const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const newUser = await userService.registerUser({ username, password, role });
        res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
    } catch (error) {
        console.error("Błąd rejestracji:", error.message);

        if (error.message === 'USER_ALREADY_EXISTS') {
            return res.status(409).json({ error: 'Użytkownik o takiej nazwie już istnieje.' });
        }
        if (error.message === 'INVALID_ROLE' || error.message === 'MISSING_DATA') {
            return res.status(400).json({ error: 'Nieprawidłowe dane (zła rola lub brak hasła/loginu).' });
        }

        res.status(500).json({ error: 'Wystąpił błąd serwera podczas rejestracji.' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await userService.getUserByUsername(username);
        if (!user || user.password !== password) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 3600000
        });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to login' });
    }
};

const logout = (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logout' });
};

const getMe = (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    res.json({
        id: req.user.userId,
        username: req.user.username,
        role: req.user.role
    });
}
module.exports = {
    register,
    login,
    logout,
    getMe
}