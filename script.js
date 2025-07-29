document.addEventListener('DOMContentLoaded', () => {
    // Verificar se usuário está logado e atualizar UI
    checkLoginStatus();
    
    // Implementação do cabeçalho escondido na rolagem (apenas mobile)
    if (window.innerWidth <= 768) {
        implementHeaderScroll();
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
