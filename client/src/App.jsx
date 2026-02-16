import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CollectionView from './pages/CollectionView';
import CardView from './pages/CardView';
import CardListView from './pages/CardListView';
import PublicCollections from './pages/PublicCollections';
import PublicCollection from './pages/PublicCollection';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/flashcards" element={<CardListView />} />
            <Route path="/public-collections" element={<PublicCollections />} />
            <Route path="/public-collections/:id" element={<PublicCollection />} />
            <Route path="/collections/:id" element={
              <PrivateRoute>
                <CollectionView />
              </PrivateRoute>
            } />
            <Route path="/collections/:id/study" element={
              <PrivateRoute>
                <CardView />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
