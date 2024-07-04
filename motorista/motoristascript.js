document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser && currentUser.role === 'motorista') {
        carregarPerfilMotorista(currentUser.nome, currentUser.email, currentUser.veiculo, currentUser.foto);
    }

    // Evento para logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser'); // Remove o usuário do localStorage
            window.location.href = '../index.html'; // Redireciona para a página de login
        });
    }

    // Botões para alternar entre fretes e perfil
    document.getElementById('perfilBtn').addEventListener('click', function() {
        document.getElementById('fretesContainer').style.display = 'none';
        document.getElementById('perfilContainer').style.display = 'block';
    });

    document.getElementById('fretesBtn').addEventListener('click', function() {
        document.getElementById('fretesContainer').style.display = 'block';
        document.getElementById('perfilContainer').style.display = 'none';
    });

    // Carrega fretes disponíveis
    atualizarTabelaFretesDisponiveis();

    // Carrega fretes aceitos
    carregarMotoristasAceitaram();
});

function carregarPerfilMotorista(nome, email, veiculo, foto) {
    document.getElementById('perfilNome').innerText = nome;
    document.getElementById('perfilEmail').innerText = email;
    document.getElementById('perfilVeiculo').innerText = veiculo; // Corrigido: Adicionado veículo
    document.getElementById('motoristaFoto').src = foto;
}

function adicionarFreteAceitoTabela(frete) {
    const tabela = document.getElementById('fretesAceitos').getElementsByTagName('tbody')[0];
    const novaLinha = tabela.insertRow();

    novaLinha.insertCell(0).innerText = frete.produto;
    novaLinha.insertCell(1).innerText = frete.veiculo;
    novaLinha.insertCell(2).innerText = `${frete.origem} - ${frete.destino}`; // Corrigido: Adicionado template literal
    novaLinha.insertCell(3).innerText = frete.distancia;
    novaLinha.insertCell(4).innerText = frete.valorFrete;
    novaLinha.insertCell(5).innerText = frete.taxa;
    novaLinha.insertCell(6).innerText = frete.totalReceber;

    const verRotaCell = novaLinha.insertCell(7);
    const verRotaBtn = document.createElement('a');
    verRotaBtn.innerText = 'Ver Rota';
    verRotaBtn.href = `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${frete.origem}&destination=${frete.destino}`; // Corrigido: Adicionado template literal
    verRotaBtn.target = '_blank';
    verRotaCell.appendChild(verRotaBtn);
}

// Função para aceitar um frete
function aceitarFrete(frete) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let fretesAceitos = JSON.parse(localStorage.getItem('fretesAceitos')) || [];

    // Adicionar dados do motorista ao frete aceito
    const dadosAceitacao = {
        nome: currentUser.nome,
        email: currentUser.email,
        foto: currentUser.foto
    };

    frete.AceitamentoFrete = dadosAceitacao;
    fretesAceitos.push(frete);
    localStorage.setItem('fretesAceitos', JSON.stringify(fretesAceitos));

    // Remover o frete aceito da lista de fretes disponíveis
    let fretesDisponiveis = JSON.parse(localStorage.getItem('fretesPostados')) || [];
    fretesDisponiveis = fretesDisponiveis.filter(f => f.produto !== frete.produto || f.veiculo !== frete.veiculo || f.origem !== frete.origem || f.destino !== frete.destino);
    localStorage.setItem('fretesPostados', JSON.stringify(fretesDisponiveis));

    // Atualizar a tabela de fretes disponíveis
    atualizarTabelaFretesDisponiveis();

    // Atualizar a tabela de fretes aceitos
    adicionarFreteAceitoTabela(frete);

    // Mostrar alerta de sucesso
    alert(`Frete '${frete.produto}' aceito com sucesso por ${currentUser.nome}!`);
}

function atualizarTabelaFretesDisponiveis() {
    const tabela = document.getElementById('fretesDisponiveis').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ''; // Limpar a tabela

    const fretesDisponiveis = JSON.parse(localStorage.getItem('fretesPostados')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    fretesDisponiveis.forEach(frete => {
        adicionarFreteTabela(frete, currentUser ? currentUser.veiculo : '');
    });

    // Log para verificar se os fretes estão sendo carregados
    console.log('Fretes disponíveis:', fretesDisponiveis);
}

function adicionarFreteTabela(frete, tipoVeiculo) {
    const tabela = document.getElementById('fretesDisponiveis').getElementsByTagName('tbody')[0];
    const novaLinha = tabela.insertRow();

    novaLinha.insertCell(0).innerText = frete.produto;
    novaLinha.insertCell(1).innerText = frete.veiculo;
    novaLinha.insertCell(2).innerText = frete.distancia;
    novaLinha.insertCell(3).innerText = frete.valorFrete;
    novaLinha.insertCell(4).innerText = frete.taxa;
    novaLinha.insertCell(5).innerText = frete.totalReceber;

    const acaoCell = novaLinha.insertCell(6);
    const aceitarBtn = document.createElement('button');
    aceitarBtn.innerText = 'Aceitar';
    aceitarBtn.disabled = frete.veiculo !== tipoVeiculo;
    aceitarBtn.style.cursor = frete.veiculo !== tipoVeiculo ? 'not-allowed' : 'pointer';
    aceitarBtn.onclick = function() {
        aceitarFrete(frete);
    };
    acaoCell.appendChild(aceitarBtn);

    // Log para verificar se a linha foi adicionada corretamente
    console.log('Frete adicionado:', frete);
}

function carregarMotoristasAceitaram() {
    const fretesAceitos = JSON.parse(localStorage.getItem('fretesAceitos')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const tabela = document.getElementById('fretesAceitos').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ''; // Limpar a tabela

    fretesAceitos.forEach(frete => {
        if (frete.AceitamentoFrete && frete.AceitamentoFrete.email === currentUser.email) {
            adicionarFreteAceitoTabela(frete);
        }
    });
}
