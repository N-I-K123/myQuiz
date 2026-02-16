const flashCardService = require('../services/FlashCardService');
const collectionFlashCardService = require('../services/CollectionFlashCardService');

const createCardInCollection = async (req, res) => {
    try {
        const { userId } = req.user;
        const collectionId = Number(req.params.collectionId);
        const { question, answer, difficulty, priority } = req.body;

        const newCard = await flashCardService.createFlashCard({ question, answer, difficulty });

        const relation = await collectionFlashCardService.addCardToCollection(
            userId,
            collectionId,
            newCard.id,
            { priority: priority }
        );

        return res.status(201).json({ card: newCard, relation });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create card.' });
    }
}


const getFlashCardsInCollection = async (req, res) => {
    try {
        const { userId } = req.user;
        const collectionId = Number(req.params.collectionId);
        const cards = await flashCardService.getFlashCardsInCollection(collectionId, userId);
        return res.status(200).json(cards);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching cards in collection.' });
    }
}

const getFlashCardsInPublicCollection = async (req, res) => {
    try {
        const collectionId = Number(req.params.collectionId);
        const cards = await collectionFlashCardService.getFlashCardsInPublicCollection(collectionId);
        return res.status(200).json(cards);
    } catch (error) {
        console.error("Error in getFlashCardsInPublicCollection:", error);
        return res.status(500).json({ message: 'Error fetching cards in public collection.' });
    }
}

const getAllFlashcards = async (req, res) => {
    try {
        const allFlashcards = await flashCardService.getAllFlashcards();
        return res.status(200).json(allFlashcards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to get all flashcards.' });
    }
}

const getFlashCardsByText = async (req, res) => {
    try {
        const text = req.query.text;
        const cards = await flashCardService.findFlashCardWithText(text);
        return res.status(200).json(cards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to get flashcards by text.' });
    }
}

const setIsLearned = async (req, res) => {
    try {
        const { userId } = req.user;
        const collectionId = Number(req.params.collectionId);
        const cardId = Number(req.params.cardId);
        const isLearned = req.body.isLearned;

        await collectionFlashCardService.setIsLearned(
            userId,
            collectionId,
            cardId,
            isLearned
        );

        return res.status(200).json({ message: 'Card learned status updated' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update learned status' });
    }
}

const removeFlashCardFromCollection = async (req, res) => {
    try {
        const { userId } = req.user;
        const collectionId = Number(req.params.collectionId);
        const cardId = Number(req.params.cardId);

        await collectionFlashCardService.removeFlashCardFromCollection(
            userId,
            collectionId,
            cardId
        )

        return res.status(200).json({ message: 'Card removed from collection' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to remove card.' })
    }
}

const deleteFlashCard = async (req, res) => {
    try {
        const cardId = Number(req.params.id);
        const { role } = req.user;

        await flashCardService.deleteFlashCard(role, cardId);

        return res.status(200).json({ message: 'Card deleted permanently' });
    } catch (error) {
        if (error.message.includes('Only admin')) return res.status(403).json({ error: 'Forbidden' });
        return res.status(500).json({ message: 'Failed to delete flashcard.' });
    }
}

const assignFlashCardToCollection = async (req, res) => {
    try {
        const { userId } = req.user;
        const collectionId = Number(req.params.collectionId);
        const cardId = Number(req.params.cardId);
        const { priority } = req.body;

        const relation = collectionFlashCardService.addCardToCollection(
            userId,
            collectionId,
            cardId,
            { priority }
        );

        return res.status(201).json(relation);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to assign card to collection.' });
    }
}

const getFlashCardsByTextNotInCollection = async (req, res) => {
    try {
        const text = req.query.text;
        const collectionId = Number(req.params.collectionId);
        const userId = req.user.userId;
        const cards = await collectionFlashCardService.findFlashCardsByTextNotInCollection(userId, collectionId, text);
        console.log(cards);
        return res.status(200).json(cards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to get flashcards by text.' });
    }
}

module.exports = {
    createCardInCollection,
    getAllFlashcards,
    getFlashCardsInCollection,
    removeFlashCardFromCollection,
    deleteFlashCard,
    getFlashCardsByText,
    setIsLearned,
    assignFlashCardToCollection,
    getFlashCardsByTextNotInCollection,
    getFlashCardsInPublicCollection
};