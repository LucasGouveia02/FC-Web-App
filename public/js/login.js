document.addEventListener("DOMContentLoaded", function () {
    const botaoLogin = document.querySelector(".btn-login");
    botaoLogin.addEventListener("click", async (event) => {
        window.location.href = "/pages/index.html";
        // validarLogin();
    });
    
});

const formulario = document.querySelector("form");
const email = document.querySelector(".email");
const senha = document.querySelector(".senha");
const btnLogin = document.querySelector(".btn-login");
const show = document.querySelector(".modal-confirm");


function validarLogin() {
    const login = {
        "email": email.value,
        "senha": senha.value
    };

    fetch('http://localhost:8082/login/employeeAccess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(login)
    })
        .then(response => {
            if (response.status === 200) {

                // Login está ok,  converte a resposta em JSON
                return response.json();
            } else if (response.status === 403) {

                loginInvalido()
                console.log('Usuário ou senha inválido');
                return Promise.reject('Usuário ou senha inválido');
            }
        })
        .then(data => {

            if (data.ativo) {
                if (data.grupo != "cliente") {

                    console.log("Usuario autenticado: " + data.autenticado)

                    // Armazena os dados do usuário no localStorage
                    localStorage.setItem("autenticado", data.autenticado);
                    localStorage.setItem("id", data.id);
                    localStorage.setItem("nome", data.nome);
                    localStorage.setItem("grupo", data.grupo);
                    localStorage.setItem("ativo", data.ativo);

                    loginSucedido();
                } else {
                    alert('Usuário sem permissão para acessar o Backoffice!')
                }
            } else {
                // Usuário não está ativo
                alert('Usuário inativo. Por favor, entre em contato com o administrador.');
            }
        })
        .catch(error => {
            // Exibe mensagem de erro em caso de falha na requisição
            console.log('Erro ao acessar usuário:', error);
            // alert("Erro ao acessar usuário. Por favor, tente novamente.");
        });
}

function validarCampos() {
    let camposValidados = true;
    const emailValue = email.value;
    const senhaValue = senha.value;

    // Verifica se o campo de e-mail está vazio
    if (emailValue.trim() === '') {
        alert("Por favor, preencha o campo de e-mail.");
        email.focus();
        camposValidados = false;
    }

    // Verifica se o campo de senha está vazio
    if (senhaValue.trim() === '') {
        alert("Por favor, preencha o campo de senha.");
        senha.focus();
        camposValidados = false;
    }

    return camposValidados;
}

function loginSucedido() {
    const modal = document.querySelector('.cartao');
    const btnTelaInicial = document.querySelector('.inicial');

    // Função para abrir o modal
    const openModal = () => {
        modal.style.display = 'flex';
    };

    // abre o modal após o login bem sucedido
    openModal()

    // Direciona para a tela inicial
    btnTelaInicial.addEventListener('click', function (event) {
        event.preventDefault(); // Evita o comportamento padrão do formulário
        window.location.href = "TelaInicial.html";
    });
}

function loginInvalido() {
    const modal = document.querySelector('#not-valid');
    const btnOk = document.querySelector('#clicked');

    // Função para abrir o modal
    const openModal = () => {
        modal.style.display = 'flex';
    };

    // Função para fechar o modal
    const closeModal = () => {
        modal.style.display = 'none';
    };

    // Abre o modal
    openModal();

    // Adiciona o evento de clique ao botão 'btnOk'
    if (btnOk) {
        btnOk.addEventListener('click', (event) => {
            console.log("Botão OK clicado");
            closeModal();
        });
    } else {
        console.error("Elemento '.inicial' não encontrado.");
    }

    // Adiciona evento para fechar o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });
}

function limparCampos() {
    document.querySelector(".card-login").reset();
}

btnLogin.addEventListener('click', function (event) {
    event.preventDefault();
    if (validarCampos()) {
        validarLogin();
    }
});