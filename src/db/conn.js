const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Configuração da conexão com o banco de dados
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: console.log,
        define: {
            timestamps: true,
            underscored: false,
        },
        pool: {
            max: parseInt(process.env.DB_MAX_CONNECTIONS),
            min: parseInt(process.env.DB_MIN_CONNECTIONS),
            acquire: parseInt(process.env.DB_ACQUIRE_TIMEOUT),
            idle: parseInt(process.env.DB_IDLE_TIMEOUT),
        },
    }
);

// Função para testar a conexão
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error.message);
    }
}

testConnection();

module.exports = sequelize;

