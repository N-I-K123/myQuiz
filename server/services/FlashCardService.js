const prisma = require('../prismaClient');

const createFlashCard = async (cardData) => {
    const question = typeof cardData.question === 'string' ? cardData.question.trim() : '';
    const answer = typeof cardData.answer === 'string' ? cardData.answer.trim() : '';
    const difficulty = cardData.difficulty || 1;

    if (!question || !answer) {
        throw new Error("INVALID_DATA: Question and answer are required.");
    }
    answer.toLowerCase();
    question.toLowerCase();

    const newCard = await prisma.flashCard.create({
        data: { question, answer, difficulty }
    });

    return newCard;
};

const getAllFlashcards = async () => {
    return await prisma.flashCard.findMany();
}

const getFlashCardsInCollection = async (collectionId, userId) => {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");
    if (!collection.isPublic && collection.userId !== userId) throw new Error("FORBIDDEN");

    return await prisma.collectionFlashCard.findMany({
        where: { collectionId },
        include: { flashCard: true }
    });
}

const deleteFlashCard = async (role, cardId) => {
    if (role !== 'ADMIN') throw new Error('Only admin can delete flashcard');

    await prisma.flashCard.delete({
        where: { id: cardId }
    });
}

const findFlashCardWithText = async (text) => {
    let textToLower = text.toLowerCase();
    let flashcards = await prisma.flashCard.findMany({
        where: {
            OR: [
                {
                    question: { contains: textToLower }
                },
                {
                    answer: { contains: textToLower }
                }
            ]
        }
    });
    return flashcards;
}

module.exports = {
    createFlashCard,
    getFlashCardsInCollection,
    getAllFlashcards,
    deleteFlashCard,
    findFlashCardWithText
};