import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const CollectionView = () => {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [cards, setCards] = useState([]);

    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [defaultPriority, setDefaultPriority] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchResults, setIsSearchResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchPriorities, setSearchPriorities] = useState({});

    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchCollection();
        fetchCards();
    }, [id]);

    const fetchCollection = async () => {
        try {
            const response = await api.get(`/collections/${id}`);
            setCollection(response.data);
        } catch (error) {
            console.error("Failed to fetch collection", error);
        }
    };

    const fetchCards = async () => {
        try {
            const response = await api.get(`/collections/${id}/flashcards`);

            const mappedCards = response.data.map(item => {
                if (item.flashCard) {
                    return {
                        ...item.flashCard,
                        isLearned: item.isLearned,
                        priority: item.priority
                    };
                }
                return item;
            });

            setCards(mappedCards);
            setIsSearchResults(false);
            setSearchPriorities({});
        } catch (error) {
            console.error("Failed to fetch cards", error);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        try {
            const encodedText = encodeURIComponent(searchQuery);
            const response = await api.get(`/collections/${id}/flashcards/search?text=${encodedText}`);
            setCards(response.data);
            setIsSearchResults(true);
            setSearchPriorities({});
        } catch (error) {
            console.error("Failed to search cards", error);
            alert("Błąd wyszukiwania. Sprawdź backend.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        fetchCards();
    };

    const handleAssignCard = async (cardId) => {
        try {
            const selectedPriority = searchPriorities[cardId] || 1;
            await api.post(`/collections/${id}/flashcards/${cardId}`, {
                priority: selectedPriority
            });
            setCards(cards.filter(c => c.id !== cardId));

            handleClearSearch();

        } catch (error) {
            console.error("Failed to assign card", error);
            alert("Failed to assign card.");
        }
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/collections/${id}/flashcards`, {
                question: newFront,
                answer: newBack,
                priority: defaultPriority
            });
            const newCard = {
                ...(response.data.card || response.data),
                isLearned: false,
                priority: defaultPriority
            };

            if (!isSearchResults) {
                setCards([...cards, newCard]);
            } else {
                alert("Card created! Return to collection to see it.");
            }

            setNewFront('');
            setNewBack('');
            setDefaultPriority(1);
        } catch (error) {
            console.error("Failed to add card", error);
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("Remove this card from collection?")) return;
        try {
            await api.delete(`/collections/${id}/flashcards/${cardId}`);
            setCards(cards.filter(c => c.id !== cardId));
        } catch (error) {
            console.error("Failed to delete card", error);
        }
    };

    const handlePriorityChange = (cardId, value) => {
        setSearchPriorities(prev => ({
            ...prev,
            [cardId]: Number(value)
        }));
    };

    const toggleLearnedStatus = async (card) => {
        const newStatus = !card.isLearned;

        setCards(prevCards => prevCards.map(c =>
            c.id === card.id ? { ...c, isLearned: newStatus } : c
        ));

        try {
            await api.put(`/collections/${id}/flashcards/${card.id}`, {
                isLearned: newStatus
            });
        } catch (error) {
            console.error("Failed to update status", error);
            fetchCards();
            alert("Nie udało się zapisać statusu");
        }
    };

    if (!collection) return <div>Loading...</div>;
    console.log("CollectionView Debug:", { user, collection });

    const isOwner = user && collection && (
        (user.userId && user.userId == collection.userId) ||
        (user.id && user.id == collection.userId)
    );
    console.log("Is Owner:", isOwner);

    return (
        <div className="collection-view-container">
            <header className="collection-header">
                <Link to="/" className="back-link">← Back to Dashboard</Link>
                <h1>{collection.name}</h1>
                <Link to={`/collections/${id}/study`} className="study-button">Study Now</Link>
            </header>

            <div className="add-card-form">
                {isOwner && (
                    <>
                        <h3>Add New Card</h3>
                        <form onSubmit={handleAddCard}>
                            <input type="text" placeholder="Front" value={newFront} onChange={(e) => setNewFront(e.target.value)} required />
                            <input type="text" placeholder="Back" value={newBack} onChange={(e) => setNewBack(e.target.value)} required />
                            <label style={{ marginRight: '5px' }}>Priority:</label>
                            <select value={defaultPriority} onChange={(e) => setDefaultPriority(Number(e.target.value))}>
                                {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button type="submit">Create Card</button>
                        </form>
                    </>
                )}
            </div>

            <div className="search-section" style={{ marginTop: '30px', marginBottom: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
                <h3 style={{ color: '#eee', marginTop: 0 }}>{isSearchResults ? "🔍 Search Results" : "📂 Collection Cards"}</h3>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text" placeholder="Find cards to add..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1, padding: '10px', borderRadius: '5px', border: 'none', outline: 'none', backgroundColor: '#3d3d3d', color: 'white' }}
                    />
                    <button type="submit" disabled={isLoading} style={{ padding: '10px 20px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '5px' }}>
                        {isLoading ? '...' : 'Search'}
                    </button>
                    {isSearchResults && (
                        <button type="button" onClick={handleClearSearch} style={{ padding: '10px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '5px' }}>Back</button>
                    )}
                </form>
            </div>

            <div className="cards-list">
                {isSearchResults && cards.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
                        <p>No cards found matching your search.</p>
                        <button onClick={handleClearSearch} style={{ background: 'transparent', border: '1px solid #555', color: 'white', padding: '5px 10px', marginTop: '10px', cursor: 'pointer', borderRadius: '4px' }}>Clear Search</button>
                    </div>
                )}

                {cards.map((card) => (
                    <div key={card.id} className="card-item" style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #444', marginBottom: '5px', borderRadius: '5px',
                        opacity: card.isLearned && !isSearchResults ? 0.6 : 1
                    }}>

                        <div className="card-content" style={{ flex: 1 }}>
                            <div className="card-front" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                                {isOwner && !isSearchResults && (
                                    <input
                                        type="checkbox"
                                        checked={!!card.isLearned}
                                        onChange={() => toggleLearnedStatus(card)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        title="Mark as learned / not learned"
                                    />
                                )}

                                <span><strong>Q:</strong> {card.question}</span>
                            </div>
                            <div className="card-back" style={{ marginLeft: isOwner && !isSearchResults ? '28px' : '0' }}>
                                <strong>A:</strong> {card.answer}
                            </div>
                        </div>

                        <div className="card-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isOwner && isSearchResults && (
                                <>
                                    <select value={searchPriorities[card.id] || 1} onChange={(e) => handlePriorityChange(card.id, e.target.value)} style={{ padding: '5px', borderRadius: '4px' }}>
                                        <option value="1">1 (Low)</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5 (High)</option>
                                    </select>
                                    <button onClick={() => handleAssignCard(card.id)} style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>+ Add</button>
                                </>
                            )}

                            {isOwner && !isSearchResults && (
                                <button onClick={() => handleDeleteCard(card.id)} className="delete-btn">Remove</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollectionView;