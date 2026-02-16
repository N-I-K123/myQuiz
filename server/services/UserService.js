const prisma = require('../prismaClient');


const registerUser = async (userData) => {
    let { username, password, role } = userData;
    const existingUser = await prisma.user.findUnique({
        where: { username: username }
    });

    if (!username || !password) {
        throw new Error('MISSING_DATA');
    }
    if (password.length < 8) {
        throw new Error('PASSWORD_TOO_SHORT');
    }

    if (existingUser) {
        throw new Error('USER_ALREADY_EXISTS');
    }
    if (!role) {
        role = "USER"
    } else if (role != "ADMIN" && role != "USER") {
        throw new Error('INVALID_ROLE');
    }
    const newUser = await prisma.user.create({
        data: { username: username, password: password, role: role }
    });
    return newUser;
}

const getUserByUsername = async (username) => {
    return await prisma.user.findUnique({
        where: { username: username }
    });
}
module.exports = {
    registerUser,
    getUserByUsername,
};