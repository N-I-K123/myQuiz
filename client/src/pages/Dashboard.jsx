import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
    const [collections, setCollections] = useState([]);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const response = await api.get('/collections');
            setCollections(response.data);
        } catch (error) {
            console.error("Failed to fetch collections", error);
        }
    };

    const handleCreateCollection = async (e) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;

        if (deadline) {
            const selectedDate = new Date(deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                alert("Deadline cannot be in the past.");
                return;
            }
        }

        try {
            const payload = {
                name: newCollectionName,
                deadline: deadline,
                isPublic: isPublic
            };
            const response = await api.post('/collections', payload);
            const newCollectionWithType = {
                ...response.data,
                _count: { cards: 0 }
            };

            setCollections([...collections, newCollectionWithType]);

            setNewCollectionName('')
            setDeadline('');
            setIsPublic(false);
        } catch (error) {
            console.error("Failed to create collection", error);
        }
    };

    const handleDeleteCollection = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this collection?")) return;

        try {
            await api.delete(`/collections/${id}`);
            setCollections(collections.filter((collection) => collection.id !== id));
        } catch (error) {
            console.error("Failed to delete collection", error);
        }
    };

    return (
        <div className="dashboard-container">
            <h1>My Collections</h1>

            <div className="create-collection-form">
                <form onSubmit={handleCreateCollection} className="collection-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Collection Name"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            required
                            className="form-input primary-input"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="form-input"
                            title="Deadline"
                        />
                    </div>
                    <div className="form-group">
                        <select
                            value={isPublic}
                            onChange={(e) => setIsPublic(e.target.value === 'true')}
                            className="form-select"
                        >
                            <option value="false">Private</option>
                            <option value="true">Public</option>
                        </select>
                    </div>
                    <button type="submit" className="create-btn">Create</button>
                </form>
            </div>

            <div className="collections-grid">
                {collections.map((collection) => (
                    <Link to={`/collections/${collection.id}`} key={collection.id} className="collection-card">
                        <h3>{collection.name}</h3>

                        {collection.deadline ? (
                            <p style={{ color: 'red', fontWeight: 'bold' }}>
                                📅 Deadline: {new Date(collection.deadline).toLocaleDateString()}
                            </p>
                        ) : (
                            <p style={{ color: 'gray' }}>No deadline</p>
                        )}


                        <p>{collection._count?.cards || 0} cards</p>

                        <button
                            onClick={(e) => handleDeleteCollection(e, collection.id)}
                            className="delete-collection-btn"
                        >
                            Delete
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
