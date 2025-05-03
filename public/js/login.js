// document.addEventListener("DOMContentLoaded", function () {
//     const botaoLogin = document.querySelector(".btn-login");
//     botaoLogin.addEventListener("click", async (event) => {
//         window.location.href = "/pages/index.html";
//         // validarLogin();
//     });
// });

const formulario = document.querySelector("form");
const email = document.querySelector(".email");
const senha = document.querySelector(".senha");
const btnLogin = document.querySelector(".btn-login");
const show = document.querySelector(".modal-confirm");

function validarLogin() {
    const login = {
        "email": email.value,
        "password": senha.value
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

                return response.json();
            } else if (response.status === 403) {

                loginInvalido()
                console.log('Usuário ou senha inválido');
                return Promise.reject('Usuário ou senha inválido');
            }
        })
        .then(data => {

            if (data.enabled) {

                console.log("Employee authenticated: " + data.authenticated)

                // Armazena os dados do usuário no localStorage
                localStorage.setItem("authenticated", data.authenticated);
                localStorage.setItem("employeeId", data.id);
                localStorage.setItem("employeeName", data.name);
                localStorage.setItem("employeeRole", data.role);
                localStorage.setItem("storeName", data.storeName);
                localStorage.setItem("storeId", data.storeId);
                localStorage.setItem("foodCourt", data.foodCourt);

                loginSucedido();
            } else {
                alert('Usuário inativo. Por favor, entre em contato com o administrador.');
            }
        })
        .catch(error => {
            console.log('Erro ao acessar usuário:', error);
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
    

    const openModal = () => {
        modal.style.display = 'flex';
    };

    openModal()

    btnTelaInicial.addEventListener('click', function (event) {
        event.preventDefault();
        window.location.replace("/pages/index.html");
    });
    
}

function loginInvalido() {
    const modal = document.querySelector('#not-valid');
    const btnOk = document.querySelector('#clicked');

    const openModal = () => {
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    openModal();

    if (btnOk) {
        btnOk.addEventListener('click', (event) => {
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

btnLogin.addEventListener('click', function (event) {
    event.preventDefault();
    if (validarCampos()) {
        validarLogin();
    }
});