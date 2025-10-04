const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

console.log('Tentando conectar em:');
console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
});

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 24650,
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            connectTimeout: 60000
        },
        define: {
            timestamps: true,
            underscored: false,
        },
        pool: {
            max: parseInt(process.env.DB_MAX_CONNECTIONS || 5),
            min: parseInt(process.env.DB_MIN_CONNECTIONS || 0),
            acquire: parseInt(process.env.DB_ACQUIRE_TIMEOUT || 30000),
            idle: parseInt(process.env.DB_IDLE_TIMEOUT || 10000),
        },
        logging: false,
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com MySQL (Aiven) estabelecida com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
    }
})();

module.exports = sequelize;
