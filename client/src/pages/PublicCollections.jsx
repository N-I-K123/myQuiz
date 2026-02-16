import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const PublicCollections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicCollections();
    }, []);

    const fetchPublicCollections = async () => {
        try {
            const response = await api.get('/public-collections');
            setCollections(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch public collections", error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            <h1>Public Collections</h1>
            <div className="collections-grid">
                {collections.map((collection) => (
                    <Link to={`/public-collections/${collection.id}`} key={collection.id} className="collection-card">
                        <h3>{collection.name}</h3>
                        {collection.description && <p style={{ fontSize: '0.9rem', color: '#ccc' }}>{collection.description}</p>}
                        {collection.deadline ? (
                            <p style={{ color: 'red', fontWeight: 'bold' }}>
                                📅 Deadline: {new Date(collection.deadline).toLocaleDateString()}
                            </p>
                        ) : (
                            <p style={{ color: 'gray' }}>No deadline</p>
                        )}
                        <p>{collection._count?.cards || 0} cards</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default PublicCollections;
