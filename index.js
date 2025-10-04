const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

// Importando conexão e modelos
const conn = require('./src/db/conn');
const User = require('./src/models/User');
const Address = require('./src/models/Adrdress');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Handlebars
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsing de dados
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de log das requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ===============================
// ROTAS PRINCIPAIS
// ===============================

// Página inicial - Lista todos os usuários
app.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            order: [['createdAt', 'DESC']], // Mais recentes primeiro
            raw: true
        });

        console.log(`Encontrados ${users.length} usuários`);
        res.render('home', { users });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.render('home', {
            users: [],
            error: 'Erro ao carregar usuários'
        });
    }
});

// ===============================
// ROTAS DE USUÁRIOS
// ===============================

// Página de cadastro de usuário
app.get('/users/create', (req, res) => {
    res.render('adduser');
});

// Criar novo usuário
app.post('/users/create', async (req, res) => {
    try {
        const { name, occupation, newsletter } = req.body;

        // Validação básica
        if (!name || name.trim().length < 2) {
            return res.render('adduser', {
                error: 'Nome deve ter pelo menos 2 caracteres',
                formData: { name, occupation, newsletter }
            });
        }

        const userData = {
            name: name.trim(),
            occupation: occupation ? occupation.trim() : null,
            newsletter: newsletter === 'on'
        };

        const user = await User.create(userData);
        console.log('Usuário criado:', user.toJSON());

        res.redirect('/');
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.render('adduser', {
            error: 'Erro ao criar usuário: ' + error.message,
            formData: req.body
        });
    }
});

// Ver detalhes de um usuário
app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [{
                model: Address,
                as: 'addresses'
            }]
        });

        if (!user) {
            return res.render('userview', {
                error: 'Usuário não encontrado'
            });
        }

        res.render('userview', {
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.render('userview', {
            error: 'Erro ao carregar usuário'
        });
    }
});

// Página de edição de usuário
app.get('/users/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [{
                model: Address,
                as: 'addresses',
                order: [['createdAt', 'DESC']]
            }]
        });

        if (!user) {
            return res.redirect('/');
        }

        res.render('useredit', {
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Erro ao buscar usuário para edição:', error);
        res.redirect('/');
    }
});

// Atualizar usuário
app.post('/users/update', async (req, res) => {
    try {
        const { id, name, occupation, newsletter } = req.body;

        // Validação
        if (!name || name.trim().length < 2) {
            return res.redirect(`/users/edit/${id}`);
        }

        const updateData = {
            name: name.trim(),
            occupation: occupation ? occupation.trim() : null,
            newsletter: newsletter === 'on'
        };

        const [updatedRows] = await User.update(updateData, {
            where: { id }
        });

        if (updatedRows === 0) {
            console.log('Nenhum usuário foi atualizado');
        } else {
            console.log(`Usuário ${id} atualizado com sucesso`);
        }

        res.redirect('/');
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.redirect(`/users/edit/${req.body.id || ''}`);
    }
});

// Excluir usuário
app.post('/users/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Primeiro, deletar todos os endereços do usuário
        await Address.destroy({
            where: { userId: id }
        });

        // Depois, deletar o usuário
        const deletedRows = await User.destroy({
            where: { id }
        });

        if (deletedRows > 0) {
            console.log(`Usuário ${id} e seus endereços foram excluídos`);
        } else {
            console.log('Nenhum usuário foi excluído');
        }

        res.redirect('/');
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.redirect('/');
    }
});

// ===============================
// ROTAS DE ENDEREÇOS
// ===============================

// Criar novo endereço
app.post('/address/create', async (req, res) => {
    try {
        const { userId, street, number, city } = req.body;

        // Validação
        if (!street || street.trim().length < 5) {
            return res.redirect(`/users/edit/${userId}`);
        }

        if (!city || city.trim().length < 2) {
            return res.redirect(`/users/edit/${userId}`);
        }

        const addressData = {
            street: street.trim(),
            number: number ? number.trim() : null,
            city: city.trim(),
            userId
        };

        const address = await Address.create(addressData);
        console.log('Endereço criado:', address.toJSON());

        res.redirect(`/users/edit/${userId}`);
    } catch (error) {
        console.error('Erro ao criar endereço:', error);
        res.redirect(`/users/edit/${req.body.userId || ''}`);
    }
});

// Excluir endereço
app.post('/address/delete', async (req, res) => {
    try {
        const { id, userId } = req.body;

        const deletedRows = await Address.destroy({
            where: { id }
        });

        if (deletedRows > 0) {
            console.log(`Endereço ${id} excluído`);
        }

        res.redirect(userId ? `/users/edit/${userId}` : '/');
    } catch (error) {
        console.error('Erro ao excluir endereço:', error);
        res.redirect('/');
    }
});

// ===============================
// TRATAMENTO DE ERROS 404
// ===============================
app.use((req, res) => {
    res.status(404).render('home', {
        users: [],
        error: 'Página não encontrada'
    });
});

// ===============================
// INICIALIZAÇÃO DO SERVIDOR
// ===============================
async function startServer() {
    try {
        // Sincronizar modelos com o banco de dados
        await conn.sync();
        console.log('✅ Modelos sincronizados com o banco de dados!');

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
            console.log('💡 Pressione Ctrl+C para parar o servidor');
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

startServer();