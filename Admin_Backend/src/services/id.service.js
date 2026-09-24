const { randomUUID } = require('crypto');

const createId = (prefix) => `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

module.exports = { createId };
