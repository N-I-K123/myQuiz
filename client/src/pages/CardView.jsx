import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
};

const CardView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [studyQueue, setStudyQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [isFlipped, setIsFlipped] = useState(false);
    const [loadingQueue, setLoadingQueue] = useState(true);

    useEffect(() => {
        prepareStudyQueue();
    }, [id]);

    const prepareStudyQueue = async () => {
        try {
            const response = await api.get(`/collections/${id}/flashcards`);

            let weightedCards = [];

            response.data.forEach(item => {
                if (item.isLearned) return;

                const flattenedCard = {
                    ...item.flashCard,
                    isLearned: item.isLearned,
                    relationId: item.id,
                    priority: item.priority || 1
                };

                for (let i = 0; i < flattenedCard.priority; i++) {
                    weightedCards.push(flattenedCard);
                }
            });

            const shuffledQueue = shuffleArray(weightedCards);

            setStudyQueue(shuffledQueue);
            setLoadingQueue(false);
        } catch (error) {
            console.error("Failed to prepare study queue", error);
            setLoadingQueue(false);
        }
    };

    const currentCard = studyQueue[currentIndex];

    const handleLearn = async () => {
        if (!currentCard) return;
        const newStatus = !currentCard.isLearned;

        try {
            await api.put(`/collections/${id}/flashcards/${currentCard.id}`, {
                isLearned: newStatus
            });
            setStudyQueue(prevQueue => prevQueue.map(card => {
                if (card.id === currentCard.id) {
                    return { ...card, isLearned: newStatus };
                }
                return card;
            }));

        } catch (error) {
            console.error("Failed to update card", error);
        }
    };

    const handleNext = () => {
        setIsFlipped(false);
        if (currentIndex + 1 >= studyQueue.length) {
            alert("Session finished!");
            navigate(`/collections/${id}`);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev - 1 < 0 ? 0 : prev - 1));
    };

    if (loadingQueue) return <div style={{ padding: '20px' }}>Preparing your study session...</div>;

    if (studyQueue.length === 0) return (
        <div className="study-container" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>All caught up! 🎉</h2>
            <p>No cards left to learn in this collection.</p>
            <Link to={`/collections/${id}`} style={{ color: '#646cff' }}>Back to Collection</Link>
        </div>
    );

    return (
        <div className="study-container">
            <header>
                <Link to={`/collections/${id}`} className="back-link">← Stop Studying</Link>
                <span>Session Progress: {currentIndex + 1} / {studyQueue.length}</span>
            </header>

            {!currentCard ? (
                <div className="flashcard-loading">Loading card...</div>
            ) : (
                <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                    <div className="flashcard-inner">
                        <div className="flashcard-front">

                            {currentCard.question}
                        </div>
                        <div className="flashcard-back">
                            {currentCard.answer}
                        </div>
                    </div>
                </div>
            )}

            {currentCard && (
                <div className='isLearned' style={{ textAlign: 'center', margin: '10px', color: currentCard.isLearned ? 'green' : 'gray' }}>
                    {currentCard.isLearned ? '✅ Learned' : '⭕ Not learned yet'}, Priority: {currentCard.priority}
                </div>
            )}

            <div className="controls">
                <button onClick={handlePrev} disabled={currentIndex === 0}>Previous</button>
                <button onClick={() => setIsFlipped(!isFlipped)}>Flip</button>

                <button
                    onClick={handleLearn}
                    style={{ backgroundColor: currentCard?.isLearned ? '#4CAF50' : '' }}
                >
                    {currentCard?.isLearned ? 'Unlearn' : 'Mark Learned'}
                </button>

                <button onClick={handleNext}>Next</button>
            </div>
        </div>
    );
};

export default CardView;