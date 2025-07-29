document.addEventListener('DOMContentLoaded', () => {
    // Verificar se usuário está logado e atualizar UI
    checkLoginStatus();
    
    // Implementação do cabeçalho escondido na rolagem (apenas mobile)
    if (window.innerWidth <= 768) {
        implementHeaderScroll();
    }
    
    // Admin login handling
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        // Definir credencial padrão de admin se não existir
        setupAdminCredentials();
        
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Formulário de admin enviado');
            
            const username = document.getElementById('admin-user').value;
            const password = document.getElementById('admin-password').value;
            console.log('Tentando login com:', username);
            
            // Força o redirecionamento para teste
            if (username === 'admin' && password === 'tatico2025') {
                console.log('Credenciais corretas, redirecionando...');
                // Salvar sessão de administrador manualmente
                const session = {
                    username: 'admin',
                    name: 'Administrador',
                    role: 'super_admin',
                    loggedInAt: new Date().toISOString()
                };
                
                localStorage.setItem('adminSession', JSON.stringify(session));
                
                // Usar timeout para garantir o redirecionamento
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 100);
                return;
            }
            
            if (loginAdmin(username, password)) {
                // Sucesso - redirecionar para dashboard admin
                console.log('Login bem-sucedido via função, redirecionando...');
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 100);
            } else {
                // Erro - mostrar mensagem
                console.log('Login falhou');
                const errorDiv = document.getElementById('admin-error');
                if (errorDiv) {
                    errorDiv.style.display = 'block';
                    
                    // Esconder a mensagem após 3 segundos
                    setTimeout(() => {
                        errorDiv.style.display = 'none';
                    }, 3000);
                }
            }
        });
    }
    
    // Form submission handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Show success message
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            contactForm.reset();
        });
    }
    
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (loginUser(email, password)) {
                alert('Login realizado com sucesso!');
                window.location.href = 'index.html';
            } else {
                alert('Email ou senha incorretos. Por favor, tente novamente.');
            }
        });
    }
    
    // Register form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }
            
            if (registerUser(name, email, phone, password)) {
                alert('Cadastro realizado com sucesso! Você já pode fazer login.');
                window.location.href = 'login.html';
            } else {
                alert('Este email já está cadastrado.');
            }
        });
    }
    
    // Forgot password handling
    const forgotPassword = document.getElementById('forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            const email = prompt('Digite seu email para receber instruções de recuperação de senha:');
            if (email) {
                alert(`Se o email ${email} estiver cadastrado, você receberá as instruções para redefinir sua senha.`);
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add scroll animation for service cards
    const serviceCards = document.querySelectorAll('.service-card');
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });

    // Botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
            window.location.reload();
        });
    }
});

// Funções de autenticação

// Verificar status de login e atualizar a UI
function checkLoginStatus() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // Usuário está logado, mostrar menu de usuário
        authButtons.innerHTML = `
            <span class="user-welcome">Olá, ${currentUser.name.split(' ')[0]}</span>
            <a href="#" id="logout-btn" class="btn btn-login">Sair</a>
        `;
        
        // Adicionar listener para o botão de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
                window.location.reload();
            });
        }
    } else {
        // Usuário não está logado, mostrar botões de login/cadastro
        authButtons.innerHTML = `
            <a href="login.html" class="btn btn-login">Login</a>
            <a href="cadastro.html" class="btn btn-register">Cadastro</a>
        `;
    }
}

// Cadastrar um novo usuário
function registerUser(name, email, phone, password) {
    // Verificar se já existe um usuário com este email
    const users = getUsers();
    if (users.find(user => user.email === email)) {
        return false;
    }
    
    // Adicionar novo usuário
    const newUser = { name, email, phone, password };
    users.push(newUser);
    
    // Salvar no localStorage
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

// Login de usuário
function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(user => user.email === email && user.password === password);
    
    if (user) {
        // Salvar usuário atual no localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    
    return false;
}

// Logout de usuário
function logoutUser() {
    localStorage.removeItem('currentUser');
}

// Obter usuário atual
function getCurrentUser() {
    const userJSON = localStorage.getItem('currentUser');
    return userJSON ? JSON.parse(userJSON) : null;
}

// Obter lista de usuários
function getUsers() {
    const usersJSON = localStorage.getItem('users');
    return usersJSON ? JSON.parse(usersJSON) : [];
}

// Função para controlar a exibição do cabeçalho durante a rolagem (apenas mobile)
function implementHeaderScroll() {
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    
    // Adicionar classe para transição suave
    header.style.transition = 'transform 0.3s ease-in-out';
    
    // Controlar a visibilidade do cabeçalho durante a rolagem
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Se estiver rolando para baixo e já passou pelo menos 50px
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
            // Esconder o cabeçalho
            header.style.transform = 'translateY(-100%)';
        } else {
            // Mostrar o cabeçalho
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Atualizar ao redimensionar a janela
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // Resetar para desktop
            header.style.transform = 'translateY(0)';
            header.style.transition = 'none';
        } else {
            // Reabilitar para mobile
            header.style.transition = 'transform 0.3s ease-in-out';
        }
    });
}

// Configuração e gerenciamento de administradores

// Configurar credenciais de administrador padrão se não existirem
function setupAdminCredentials() {
    const adminCredentials = localStorage.getItem('adminCredentials');
    if (!adminCredentials) {
        // Criar admin padrão - em produção isso seria feito no servidor
        const defaultAdmin = [
            {
                username: 'admin',
                password: 'tatico2025',  // Em produção, usar senha hash
                name: 'Administrador',
                role: 'super_admin'
            }
        ];
        
        localStorage.setItem('adminCredentials', JSON.stringify(defaultAdmin));
    }
}

// Verificar login de administrador
function loginAdmin(username, password) {
    const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials') || '[]');
    const admin = adminCredentials.find(admin => admin.username === username && admin.password === password);
    
    if (admin) {
        // Salvar sessão de administrador
        const session = {
            username: admin.username,
            name: admin.name,
            role: admin.role,
            loggedInAt: new Date().toISOString()
        };
        
        localStorage.setItem('adminSession', JSON.stringify(session));
        return true;
    }
    
    return false;
}

// Verificar se administrador está logado
function isAdminLoggedIn() {
    return localStorage.getItem('adminSession') !== null;
}

// Obter sessão atual do administrador
function getCurrentAdminSession() {
    const sessionJSON = localStorage.getItem('adminSession');
    return sessionJSON ? JSON.parse(sessionJSON) : null;
}

// Logout do administrador
function logoutAdmin() {
    localStorage.removeItem('adminSession');
}
