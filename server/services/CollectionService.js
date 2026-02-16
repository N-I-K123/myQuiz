const prisma = require('../prismaClient');

const createCollection = async (userId, collectionData) => {
    collectionData.name = typeof collectionData.name === 'string' ? collectionData.name.trim() : '';
    collectionData.isPublic = Boolean(collectionData.isPublic);
    collectionData.deadline = typeof collectionData.deadline === 'string' && collectionData.deadline.trim() !== '' ? new Date(collectionData.deadline) : null;

    if (collectionData.name.length < 3 || collectionData.name.length > 50) {
        throw new Error('Collection name must be between 3 and 50 characters long.');
    }

    if (collectionData.deadline) {
        const dateObj = new Date(collectionData.deadline);
        if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid deadline date format.');
        }
    } else {
        collectionData.deadline = null;
    }

    const newCollection = await prisma.collection.create({
        data: {
            name: collectionData.name,
            isPublic: collectionData.isPublic,
            deadline: collectionData.deadline,
            userId: userId
        }
    });

    return newCollection;
}

const getCollections = async (userRole, userId) => {
    let conditions = {};

    conditions = {
        userId: Number(userId)
    };


    const collections = await prisma.collection.findMany({
        where: conditions,
        include: {
            _count: {
                select: { cards: true }
            }
        },
        orderBy: { id: 'desc' }
    });

    return collections;
}

const getPublicCollections = async () => {
    const collections = await prisma.collection.findMany({
        where: { isPublic: true },
        include: {
            _count: {
                select: { cards: true }
            },
            user: {
                select: { username: true }
            }
        },
        orderBy: { id: 'desc' }
    });
    return collections;
}

const getCollectionById = async (collectionId, userId, userRole) => {
    const collection = await prisma.collection.findUnique({
        where: { id: collectionId },
        include: {
            _count: { select: { cards: true } },
            cards: { include: { flashCard: true } }
        }
    });

    if (!collection) {
        throw new Error("NOT_FOUND");
    }

    if (userRole !== 'ADMIN' && collection.userId !== userId && !collection.isPublic) {
        throw new Error("FORBIDDEN");
    }

    return collection;
};

const modifyCollection = async (collectionId, userId, userRole, updateData) => {

    const existingCollection = await prisma.collection.findUnique({
        where: { id: collectionId }
    });

    if (!existingCollection) {
        throw new Error("NOT_FOUND");
    }

    if (userRole !== 'ADMIN' && existingCollection.userId !== userId) {
        throw new Error("FORBIDDEN");
    }

    const updatedCollection = await prisma.collection.update({
        where: { id: collectionId },
        data: updateData
    });

    return updatedCollection;
};

const deleteCollection = async (collectionId, userId, userRole) => {
    const existingCollection = await prisma.collection.findUnique({
        where: { id: collectionId }
    });

    if (!existingCollection) {
        throw new Error("NOT_FOUND");
    }
    if (existingCollection.userId !== userId && userRole !== 'ADMIN') {
        throw new Error("FORBIDDEN");
    }
    await prisma.collection.delete({
        where: { id: collectionId }
    });
    return;
}

module.exports = {
    createCollection,
    getCollections,
    getPublicCollections,
    getCollectionById,
    modifyCollection,
    deleteCollection
};