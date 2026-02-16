const prisma = require('../prismaClient');
const { getFlashCard } = require('./FlashCardService');

const addCardToCollection = async (userId, collectionId, cardId, initialData = {}) => {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");
    if (collection.userId !== userId) throw new Error("FORBIDDEN");

    const existingRelation = await prisma.collectionFlashCard.findUnique({
        where: {
            flashCardId_collectionId: {
                collectionId: collectionId,
                flashCardId: cardId
            }
        }
    });

    if (existingRelation) throw new Error("CARD_ALREADY_IN_COLLECTION");

    let priority = initialData.priority || 1;
    if (priority < 1 || priority > 5) {
        throw new Error("INVALID_PRIORITY_VALUE");
    }

    return await prisma.collectionFlashCard.create({
        data: {
            collectionId,
            flashCardId: cardId,
            isLearned: false,
            priority: initialData.priority || 1

        }
    });
};



const getFlashCardsInPublicCollection = async (collectionId) => {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");
    if (!collection.isPublic) throw new Error("FORBIDDEN");

    return await prisma.collectionFlashCard.findMany({
        where: { collectionId },
        include: { flashCard: true }
    });
}

const setIsLearned = async (userId, collectionId, cardId, isLearned) => {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");
    if (collection.userId !== userId) throw new Error("FORBIDDEN");

    const existingRelation = await prisma.collectionFlashCard.findUnique({
        where: {
            flashCardId_collectionId: {
                collectionId: collectionId,
                flashCardId: cardId
            }
        }
    });

    if (!existingRelation) throw new Error("CARD_NOT_IN_COLLECTION");

    return await prisma.collectionFlashCard.update({
        where: {
            flashCardId_collectionId: {
                collectionId: collectionId,
                flashCardId: cardId
            }
        },
        data: {
            isLearned: isLearned
        }
    });
}

const removeFlashCardFromCollection = async (userId, collectionId, cardId) => {
    const collection = await prisma.collection.findUnique({
        where: { id: collectionId }
    });

    if (!collection) throw new Error('Collection not found');

    if (collection.userId !== userId) {
        throw new Error('You can only remove from your collection');
    }

    const existingRelation = await prisma.collectionFlashCard.findUnique({
        where: {
            flashCardId_collectionId: {
                collectionId: collectionId,
                flashCardId: cardId
            }
        }
    });

    if (!existingRelation) throw new Error('Card is not in this collection');

    return await prisma.collectionFlashCard.delete({
        where: {
            flashCardId_collectionId: {
                collectionId: collectionId,
                flashCardId: cardId
            }
        }
    });
}


const findFlashCardsByTextNotInCollection = async (userId, collectionId, searchText) => {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");
    if (collection.userId !== userId) throw new Error("FORBIDDEN");

    const flashCardsInCollection = await prisma.collectionFlashCard.findMany({
        where: { collectionId: collectionId },
        select: { flashCardId: true }
    });

    const flashCardIdsInCollection = flashCardsInCollection.map(rel => rel.flashCardId);

    const textToLower = searchText.toLowerCase().trim();

    return await prisma.flashCard.findMany({
        where: {
            AND: [
                {
                    id: { notIn: flashCardIdsInCollection }
                },
                {
                    OR: [
                        { question: { contains: textToLower } },
                        { answer: { contains: textToLower } }
                    ]
                }
            ]
        }
    });
}
module.exports = {
    addCardToCollection,
    removeFlashCardFromCollection,
    setIsLearned,
    findFlashCardsByTextNotInCollection,
    getFlashCardsInPublicCollection
}
