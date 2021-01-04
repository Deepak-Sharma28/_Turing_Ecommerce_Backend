module.exports = {
    development: {
        client: 'mysql',
        connection: process.env.CONNECTION
    },
    production: {
        client: 'mysql',
        connection: process.env.CONNECTION
    }
};