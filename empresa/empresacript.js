document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        if (currentUser.role === 'empresa') {
            carregarPerfilEmpresa(currentUser);
            carregarFretes();
        } else if (currentUser.role === 'motorista') {
            carregarPerfilMotorista(currentUser);
            carregarFretesDisponiveis();
            carregarFretesAceitos(currentUser.email);
        }
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = '../index.html';
        });
    }

    const perfilBtn = document.getElementById('perfilBtn');
    const fretesBtn = document.getElementById('fretesBtn');
    if (perfilBtn && fretesBtn) {
        perfilBtn.addEventListener('click', function() {
            toggleContainer('perfilContainer', 'fretesContainer');
        });

        fretesBtn.addEventListener('click', function() {
            toggleContainer('fretesContainer', 'perfilContainer');
        });
    }

    const origemSelect = document.getElementById('origem');
    const destinoSelect = document.getElementById('destino');
    const veiculoSelect = document.getElementById('veiculo');
    if (origemSelect && destinoSelect && veiculoSelect) {
        origemSelect.addEventListener('change', function() {
            ajustarSelects(origemSelect, destinoSelect);
            calcularValores();
        });
        destinoSelect.addEventListener('change', function() {
            ajustarSelects(destinoSelect, origemSelect);
            calcularValores();
        });
        veiculoSelect.addEventListener('change', calcularValores);
    }

    const freteForm = document.getElementById('frete-form');
    if (freteForm) {
        freteForm.addEventListener('submit', function(event) {
            event.preventDefault();
            postarFrete();
        });
    }
});

function carregarPerfilEmpresa(user) {
    const perfilNomeElem = document.getElementById('perfilNome');
    const perfilEmailElem = document.getElementById('perfilEmail');
    if (perfilNomeElem && perfilEmailElem) {
        perfilNomeElem.textContent = user.nome;
        perfilEmailElem.textContent = user.email;
    }
}

function carregarPerfilMotorista(user) {
    const perfilNomeElem = document.getElementById('perfilNome');
    const perfilEmailElem = document.getElementById('perfilEmail');
    const perfilVeiculoElem = document.getElementById('perfilVeiculo');
    const motoristaFotoElem = document.getElementById('motoristaFoto');
    if (perfilNomeElem && perfilEmailElem && perfilVeiculoElem && motoristaFotoElem) {
        perfilNomeElem.textContent = user.nome;
        perfilEmailElem.textContent = user.email;
        perfilVeiculoElem.textContent = user.veiculo;
        motoristaFotoElem.src = user.foto;
    }
}

function toggleContainer(showId, hideId) {
    const showContainer = document.getElementById(showId);
    const hideContainer = document.getElementById(hideId);
    if (showContainer && hideContainer) {
        showContainer.style.display = 'block';
        hideContainer.style.display = 'none';
    }
}

function carregarFretes() {
    const fretesPostados = JSON.parse(localStorage.getItem('fretesPostados')) || [];
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const tabela = document.getElementById('fretesPostados').getElementsByTagName('tbody')[0];
    if (tabela && user) {
        tabela.innerHTML = ''; 
        fretesPostados.forEach(frete => {
            if (frete.userId === user.email) {
                adicionarFreteNaTabela(frete, tabela);
            }
        });
    }
}

function adicionarFreteNaTabela(frete, tabela) {
    const novaLinha = tabela.insertRow();
    novaLinha.insertCell(0).textContent = frete.produto;
    novaLinha.insertCell(1).textContent = frete.veiculo;
    novaLinha.insertCell(2).textContent = `${frete.origem} - ${frete.destino}`;
    novaLinha.insertCell(3).textContent = frete.distancia;
    novaLinha.insertCell(4).textContent = frete.valorFrete;
    novaLinha.insertCell(5).textContent = frete.taxa;
    novaLinha.insertCell(6).textContent = frete.totalReceber;
}

function postarFrete() {
    const produto = document.getElementById('produto').value;
    const veiculo = document.getElementById('veiculo').value;
    const origem = document.getElementById('origem').value;
    const destino = document.getElementById('destino').value;
    const distancia = document.getElementById('distancia').value;
    const valorFrete = document.getElementById('valorFrete').value;
    const taxa = document.getElementById('taxa').value;
    const totalReceber = document.getElementById('totalReceber').value;

    if (produto && veiculo && origem && destino && distancia && valorFrete && taxa && totalReceber) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            const frete = {
                produto,
                veiculo,
                origem,
                destino,
                distancia,
                valorFrete,
                taxa,
                totalReceber,
                userId: user.email
            };

            let fretesPostados = JSON.parse(localStorage.getItem('fretesPostados')) || [];
            fretesPostados.push(frete);
            localStorage.setItem('fretesPostados', JSON.stringify(fretesPostados));

            carregarFretes(); 

            document.getElementById('frete-form').reset();
            calcularValores();
        } else {
            alert("Usuário não está logado.");
        }
    } else {
        alert("Por favor, preencha todos os campos.");
    }
}

function ajustarSelects(selectChanged, selectToAdjust) {
    const selecionado = selectChanged.value;

    for (let option of selectToAdjust.options) {
        option.disabled = false;
    }

    if (selecionado) {
        for (let option of selectToAdjust.options) {
            if (option.value === selecionado) {
                option.disabled = true;
            }
        }
    }

    if (selectChanged.value === selectToAdjust.value) {
        selectToAdjust.value = '';
    }
}

function calcularValores() {
    const origem = document.getElementById('origem').value;
    const destino = document.getElementById('destino').value;
    const veiculo = document.getElementById('veiculo').value;

    if (origem && destino && veiculo) {
        const distancia = obterDistancia(origem, destino);
        let pesoVeiculo;

        switch (veiculo) {
            case 'caminhonete':
                pesoVeiculo = 5;
                break;
            case 'furgao':
                pesoVeiculo = 4;
                break;
            case 'caminhao':
                pesoVeiculo = 10;
                break;
            default:
                pesoVeiculo = 0;
        }

        const valorFrete = distancia * pesoVeiculo;
        let taxa;

        if (distancia <= 100) {
            taxa = valorFrete * 0.20;
        } else if (distancia <= 200) {
            taxa = valorFrete * 0.15;
        } else if (distancia <= 500) {
            taxa = valorFrete * 0.10;
        } else {
            taxa = valorFrete * 0.075;
        }

        const totalOperacao = valorFrete - taxa;

        document.getElementById('distancia').value = distancia+' km';
        document.getElementById('valorFrete').value = 'R$ '+valorFrete.toFixed(2);
        document.getElementById('taxa').value = 'R$ '+taxa.toFixed(2);
        document.getElementById('totalReceber').value = 'R$ ' +totalOperacao.toFixed(2);
    }
}

function obterDistancia(origem, destino) {
    const distancias = {
        'Uberlândia-Araguari': 38,
        'Araguari-Uberlândia': 38,
        'Uberlândia-Indianópolis': 63,
        'Indianópolis-Uberlândia': 63,
        'Uberlândia-Monte Alegre': 84,
        'Monte Alegre-Uberlândia': 84,
        'Uberlândia-Goiânia': 331,
        'Goiânia-Uberlândia': 331,
        'Uberlândia-Uberaba': 110,
        'Uberaba-Uberlândia': 110,
        'Uberlândia-São Paulo': 584,
        'São Paulo-Uberlândia': 584,
        'Araguari-Monte Alegre': 103,
        'Monte Alegre-Araguari': 103,
        'Araguari-Indianópolis': 60,
        'Indianópolis-Araguari': 60,
        'Goiânia-Araguari': 304,
        'Araguari-Goiânia': 304,
        'Goiânia-Indianópolis': 366,
        'Indianópolis-Goiânia': 366,
        'Goiânia-Monte Alegre': 286,
        'Monte Alegre-Goiânia': 286,
        'São Paulo-Araguari': 621,
        'Araguari-São Paulo': 621,
        'São Paulo-Indianópolis': 634,
        'Indianópolis-São Paulo': 634,
        'São Paulo-Monte Alegre': 658,
        'Monte Alegre-São Paulo': 658,
        'São Paulo-Goiânia': 900,
        'Goiânia-São Paulo': 900,
        'Uberaba-Araguari': 139,
        'Araguari-Uberaba': 139,
        'Uberaba-Indianópolis': 152,
        'Indianópolis-Uberaba': 152,
        'Uberaba-Monte Alegre': 176,
        'Monte Alegre-Uberaba': 176,
        'Uberaba-Goiânia': 445,
        'Goiânia-Uberaba': 445,
        'São Paulo-Uberaba': 481,
        'Uberaba-São Paulo': 481
    };

    const key = `${origem}-${destino}`;
    return distancias[key] || 0;
}

// Função para carregar motoristas que aceitaram fretes
function carregarMotoristasAceitaram() {
    const fretesAceitos = JSON.parse(localStorage.getItem('fretesAceitos')) || [];
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const tabelaMotoristas = document.getElementById('tabelaAceitamentos').getElementsByTagName('tbody')[0];

    // Limpar tabela antes de adicionar novos dados
    tabelaMotoristas.innerHTML = '';

    // Iterar sobre os fretes aceitos e adicionar na tabela
    fretesAceitos.forEach(frete => {
        // Verificar se o frete aceito pertence à empresa logada
        if (frete.userId === user.email) {
            const row = tabelaMotoristas.insertRow();
            row.innerHTML = `
                <td>${frete.AceitamentoFrete.nome}</td>
                <td>${frete.AceitamentoFrete.email}</td>
                <td><img src="${frete.AceitamentoFrete.foto}" alt="Foto do Motorista" style="width: 50px; height: 50px;"></td>
            `;
        }
    });
}

// Função para adicionar detalhes dos fretes aceitos na tabela de detalhes
function adicionarDetalhesFretesAceitos(frete) {
    const tabelaDetalhes = document.getElementById('detalhesFretesAceitos').getElementsByTagName('tbody')[0];
    const novaLinha = tabelaDetalhes.insertRow();
    novaLinha.innerHTML = `
        <td>${frete.produto}</td>
        <td>${frete.destino}</td>
        <td>${frete.distancia}</td>
        <td>${frete.valorFrete}</td>
        <td>${frete.taxa}</td>
        <td>${frete.totalReceber}</td>
    `;
}

// Função para carregar detalhes dos fretes aceitos
function carregarDetalhesFretesAceitos() {
    const fretesAceitos = JSON.parse(localStorage.getItem('fretesAceitos')) || [];
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const tabelaDetalhes = document.getElementById('detalhesFretesAceitos').getElementsByTagName('tbody')[0];

    // Limpar tabela antes de adicionar novos dados
    tabelaDetalhes.innerHTML = '';

    // Iterar sobre os fretes aceitos e adicionar detalhes na tabela
    fretesAceitos.forEach(frete => {
        // Verificar se o frete aceito pertence à empresa logada
        if (frete.userId === user.email) {
            adicionarDetalhesFretesAceitos(frete);
        }
    });
}

// Evento que carrega os motoristas e detalhes dos fretes aceitos quando a página é carregada
document.addEventListener('DOMContentLoaded', function() {
    carregarMotoristasAceitaram();
    carregarDetalhesFretesAceitos();
});

