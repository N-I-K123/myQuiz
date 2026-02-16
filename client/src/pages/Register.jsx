import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (username.trim().length < 3) {
                setError('Username must be at least 3 characters long.');
                return;
            }
            if (password.trim().length < 8) {
                setError('Password must be at least 8 characters long.');
                return;
            }
            await register(username.trim(), password.trim(), role);
            navigate('/login');
        } catch (err) {
            setError('Failed to register. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>
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
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Register;
