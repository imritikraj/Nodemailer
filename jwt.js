const jwt = require('jsonwebtoken');
const secret = 'Hello I am a secret';
const crypto = require('crypto');

function rmdStr(length) {
    return crypto.randomBytes(length)
        .toString('base64')
        .slice(0, length)
        .replace(/[^a-zA-Z0-9]/g, '');
}

class ShortURL {
    constructor() {
        this.storage = new Map();
    }
    set(shortStr,token) {
        this.storage.set(shortStr, token);
    }

    get(shortStr) {
        return this.storage.get(shortStr);
    }
}


const shortURL = new ShortURL();

const generateAccessToken = (payload) => {
    if (!payload) {
        throw new Error('Payload is required for generating access token');
    }

    let token = jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '10s' });
    let id = rmdStr(12);
    shortURL.set(id, token);
    return id;
};
    

const verifyToken = (id) => {
    try {
        token = shortURL.get(id);
        const decoded = jwt.verify(token, secret);
        return {
            status: true,
            payload: decoded,
            message: 'Email verified successfully'
        };
    } catch (error) {
        return {
            status: false,
            message: error.message,
        };

    }
};



module.exports = {
    generateAccessToken,
    verifyToken
};