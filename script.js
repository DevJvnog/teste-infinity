function toggleForms() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('register-form-empresa').style.display = 'none';
    document.getElementById('register-form-motorista').style.display = 'none';
}

function showRoleSelection() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('role-selection').style.display = 'block';
}

function showRegisterForm(role) {
    document.getElementById('role-selection').style.display = 'none';
    if (role === 'empresa') {
        document.getElementById('register-form-empresa').style.display = 'block';
    } else if (role === 'motorista') {
        document.getElementById('register-form-motorista').style.display = 'block';
    }
}

function registerEmpresa() {
    const nome = document.getElementById('empresa-nome').value;
    const email = document.getElementById('empresa-email').value;
    const password = document.getElementById('empresa-password').value;

    if (nome && email && password) {
        const existingUser = JSON.parse(localStorage.getItem(`empresa-${email}`));
        if (existingUser) {
            alert(`E-mail já cadastrado como ${existingUser.role}`);
        } else {
            localStorage.setItem(`empresa-${email}`, JSON.stringify({ role: 'empresa', nome, email, password }));
            alert('Cadastro realizado com sucesso!');
            toggleForms();
        }
    } else {
        alert('Por favor, preencha todos os campos.');
    }
}

function registerMotorista() {
    const nome = document.getElementById('motorista-nome').value;
    const email = document.getElementById('motorista-email').value;
    const password = document.getElementById('motorista-password').value;
    const veiculo = document.getElementById('motorista-veiculo').value;
    const foto = document.getElementById('motorista-foto').files[0];

    if (nome && email && password && veiculo && foto) {
        const existingUser = JSON.parse(localStorage.getItem(`motorista-${email}`));
        if (existingUser) {
            alert(`E-mail já cadastrado como ${existingUser.role}`);
        } else {
            const reader = new FileReader();
            reader.onload = function (e) {
                const fotoUrl = e.target.result;
                localStorage.setItem(`motorista-${email}`, JSON.stringify({ role: 'motorista', nome, email, password, veiculo, foto: fotoUrl }));
                alert('Cadastro realizado com sucesso!');
                toggleForms();
            };
            reader.readAsDataURL(foto);
        }
    } else {
        alert('Por favor, preencha todos os campos.');
    }
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Verifica se é empresa
    const empresaUser = JSON.parse(localStorage.getItem(`empresa-${email}`));
    if (empresaUser && empresaUser.password === password) {
        localStorage.setItem('currentUser', JSON.stringify(empresaUser));
        alert('Login realizado com sucesso!');
        window.location.href = './empresa/empresa.html';
        return;
    }

    // Verifica se é motorista
    const motoristaUser = JSON.parse(localStorage.getItem(`motorista-${email}`));
    if (motoristaUser && motoristaUser.password === password) {
        localStorage.setItem('currentUser', JSON.stringify(motoristaUser));
        alert('Login realizado com sucesso!');
        window.location.href = './motorista/motorista.html';
        return;
    }

    // Caso nenhum usuário seja encontrado
    alert('Email ou senha incorretos.');
}
