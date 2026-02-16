const collectionService = require('../services/CollectionService');

const createCollection = async (req, res) => {
    try {
        const { userId } = req.user;
        const { name, description, deadline, isPublic } = req.body;

        const newCollection = await collectionService.createCollection(
            userId, 
            {
                name,
                description,
                deadline,
                isPublic
            }
        );

        return res.status(201).json(newCollection);
    } catch (error) {
        console.error('Error creating collection:', error);
        return res.status(500).json({ message: 'Failed to create collection.' });
    }
};

const getCollections = async (req, res) => {
    try {
        const { userId, role } = req.user;

        const collections = await collectionService.getCollections(role, userId);
        return res.status(200).json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        return res.status(500).json({ message: 'Failed to fetch collections.' });
    }
};

const getPublicCollections = async (req, res) => {
    try {
        const collections = await collectionService.getPublicCollections();
        return res.status(200).json(collections);
    } catch (error) {
        console.error('Error fetching public collections:', error);
        return res.status(500).json({ message: 'Failed to fetch public collections.' });
    }
}

const getCollectionById = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const collectionId = Number(req.params.id);

        const collection = await collectionService.getCollectionById(collectionId, userId, role);
        return res.status(200).json(collection);
    } catch (error) {
        console.error('Error fetching collection by ID:', error);

        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ message: 'Collection not found.' });
        }
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ message: 'Access to this collection is forbidden.' });
        }

        return res.status(500).json({ message: 'Failed to fetch collection.' });
    }
};

const deleteCollection = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const collectionId = Number(req.params.id);

        await collectionService.deleteCollection(collectionId, userId, role);
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting collection:', error);

        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ message: 'Collection not found.' });
        }
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ message: 'Access to delete this collection is forbidden.' });
        }

        return res.status(500).json({ message: 'Failed to delete collection.' });
    }
};

module.exports = {
    createCollection,
    getCollections,
    getPublicCollections,
    getCollectionById,
    deleteCollection
};