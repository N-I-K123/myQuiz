const express = require('express');
const prisma = require('../prismaClient');
const auth = require('../middleware/auth');

const flashCardController = require('../api/FlashCardController');
const loginController = require('../api/login');
const collectionController = require('../api/CollectionController');

const router = express.Router();

//--- LOGIN ROUTES ---//
router.post('/register', loginController.register);
router.post('/login', loginController.login);
router.post('/logout', loginController.logout);
router.get('/me', auth, loginController.getMe);

//--- FLASHCARD ROUTES ---//
router.get('/flashcards/search', flashCardController.getFlashCardsByText);
router.post('/collections/:collectionId/flashcards', auth, flashCardController.createCardInCollection);
router.get('/collections/:collectionId/flashcards/public', flashCardController.getFlashCardsInPublicCollection);
router.get('/flashcards', flashCardController.getAllFlashcards);
router.get('/collections/:collectionId/flashcards/search', auth, flashCardController.getFlashCardsByTextNotInCollection);
router.put('/collections/:collectionId/flashcards/:cardId', auth, flashCardController.setIsLearned);
router.get('/collections/:collectionId/flashcards', auth, flashCardController.getFlashCardsInCollection);
router.post('/collections/:collectionId/flashcards/:cardId', auth, flashCardController.assignFlashCardToCollection);
router.delete('/collections/:collectionId/flashcards/:cardId', auth, flashCardController.removeFlashCardFromCollection);
router.delete('/flashcards/:id', auth, flashCardController.deleteFlashCard);

//--- COLLECTION ROUTES ---//

router.post('/collections', auth, collectionController.createCollection);
router.get('/collections', auth, collectionController.getCollections);
router.get('/collections/:id', auth, collectionController.getCollectionById);
router.get('/public-collections', collectionController.getPublicCollections);
router.delete('/collections/:id', auth, collectionController.deleteCollection);

module.exports = router;
