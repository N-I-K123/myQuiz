import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!username || !password) {
                setError('Username and password are required.');
                return;
            } else if (password.length < 8) {
                setError('Password must be at least 8 characters long.');
                return;
            }

            await login(username.trim(), password.trim());
            navigate('/');
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
};

export default Login;
