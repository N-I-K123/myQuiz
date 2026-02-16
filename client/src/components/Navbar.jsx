import { useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-links">
                {user ? (
                    <>
                        <Link to="/">My Collections</Link>
                        <Link to="/public-collections">Public Collections</Link>
                        <Link to="/flashcards">All Flashcards</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/public-collections">Public Collections</Link>
                        <Link to="/flashcards">All Flashcards</Link>
                        <Link to="/login" className="login-btn">
                            <button>Login</button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
