const { PrismaClient } = require('@prisma/client');


// DATABASE_URL="file:./database.sqlite"
const prisma = new PrismaClient();

module.exports = prisma;

