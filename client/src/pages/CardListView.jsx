import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import AuthContext from "../context/AuthContext";

const CardListView = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchCards();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchCards();
            return;
        }
        try {
            const encodedText = encodeURIComponent(searchQuery.trim());
            const response = await api.get(`/flashcards/search?text=${encodedText}`);
            setCards(response.data)
        } catch (error) {
            console.error("Failed to fetch cards", error);
        }
    };

    const handleDeleteCard = async (cardId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this card?");
        if (!isConfirmed) return;
        try {
            if (!user || user.role !== 'ADMIN') throw new Error('Only admin can delete flashcard');
            await api.delete(`/flashcards/${cardId}`);
            fetchCards();
        } catch (error) {
            console.error("Failed to delete card", error);
        }
    };

    const fetchCards = async () => {
        try {
            const response = await api.get(`/flashcards`);
            setCards(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch cards", error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="collection-view-container">
            <h1>All Flashcards</h1>
            <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Search flashcards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            <div className="cards-list">
                {cards.map((card) => (
                    <div key={card.id} className="card-item">
                        <div className="card-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="card-text">
                                <div className="card-front"><strong>Q:</strong> {card.question}</div>
                                <div className="card-back"><strong>A:</strong> {card.answer}</div>
                            </div>
                            {user && user.role === 'ADMIN' && (
                                <button
                                    style={{ backgroundColor: 'red', marginLeft: '10px', height: 'fit-content' }}
                                    onClick={() => handleDeleteCard(card.id)}>Delete</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
};

export default CardListView;