import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

const PublicCollection = () => {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [cards, setCards] = useState([]);

    const [loadingCollection, setLoadingCollection] = useState(true);
    const [loadingCards, setLoadingCards] = useState(true);

    useEffect(() => {
        fetchCollection();
        fetchCards();
    }, [id]);

    const fetchCollection = async () => {
        try {
            const response = await api.get(`/collections/${id}`);
            setCollection(response.data);
        } catch (error) {
            console.error("Failed to fetch collection details", error);
        } finally {
            setLoadingCollection(false);
        }
    };

    const fetchCards = async () => {
        try {
            const response = await api.get(`/collections/${id}/flashcards/public`);

            const mappedCards = response.data.map(item => item.flashCard || item);
            setCards(mappedCards);
        } catch (error) {
            console.error("Failed to fetch public cards", error);
        } finally {
            setLoadingCards(false);
        }
    };

    if (loadingCollection && loadingCards) return <div style={{ padding: '20px' }}>Loading...</div>;

    if (!loadingCollection && !collection) return <div style={{ padding: '20px' }}>Access denied (you need to be logged in to view public collections).</div>;

    return (
        <div className="collection-view-container">
            <header className="collection-header">
                <Link to="/public-collections" className="back-link">← Back to Public List</Link>
                <h1>{collection.name}</h1>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    Cards count: {cards.length}
                </div>
            </header>

            <div className="cards-list" style={{ marginTop: '30px' }}>
                {cards.length > 0 ? (
                    cards.map(card => (
                        <div key={card.id} className="card-item" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '15px',
                            marginBottom: '10px',
                            borderRadius: '8px',
                            border: '1px solid #444',
                            backgroundColor: '#2a2a2a'
                        }}>
                            <div className="card-front" style={{ marginBottom: '10px', fontSize: '1.1em' }}>
                                <strong style={{ color: '#646cff' }}>Q:</strong> {card.question}
                            </div>

                            <div style={{ borderTop: '1px solid #444', margin: '5px 0' }}></div>

                            <div className="card-back" style={{ color: '#ddd' }}>
                                <strong style={{ color: '#4CAF50' }}>A:</strong> {card.answer}
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#888' }}>This collection is empty.</p>
                )}
            </div>
        </div>
    );
};

export default PublicCollection;