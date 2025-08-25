// index.js
const serverlessExpress = require('@vendia/serverless-express');
const app = require('../app');

module.exports = serverlessExpress({ app });
