var homeElement = document.querySelector(".home");
document.addEventListener("DOMContentLoaded", function () {
    employeeAuthentication();
});


// Função para carregar páginas dinamicamente na div #content
function loadPage(page, element) {
    fetch(`/pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            if (element === null) {
                element = homeElement; // Se não houver elemento, use o padrão
            }
            highlightMenuItem(element);
            employeeAuthentication();

        })
        .catch(error => console.error("Erro ao carregar a página:", error));
}

function loadSubPage(page) {
    fetch(`/pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            runPageScript(page);

            employeeAuthentication();
        })
        .catch(error => console.error("Erro ao carregar a página:", error));
}

function loadSubPageWithParam(page, param) {
    fetch(`/pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            localStorage.setItem('param', param);
            runPageScript(page);

            employeeAuthentication();
        })
        .catch(error => console.error("Erro ao carregar a página:", error));
}

function loadLastPage(page) {
    fetch(`/pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;

            employeeAuthentication();
        })
        .catch(error => console.error("Erro ao carregar a página:", error));
}

function loadLastPageWithScript(page) {
    fetch(`/pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            runPageScript(page);

            employeeAuthentication();
        })
        .catch(error => console.error("Erro ao carregar a página:", error));
}

// Função para destacar a opção ativa no menu lateral
function highlightMenuItem(selectedItem) {
    document.querySelectorAll(".nav-link").forEach(item => {
        item.classList.remove("active");
    });

    selectedItem.classList.add("active");
}

function runPageScript(page) {
    import(`./${page}.js`)
        .then(module => {
            if (typeof module.init === "function") {
                module.init(); // Executa a função `init()` do arquivo
            } else {
                console.warn(`O módulo ${page}.js não exporta uma função 'init'.`);
            }
        })
        .catch(err => console.warn(`Nenhum script específico encontrado para a página '${page}'.`, err));
}


// Função de logout
function logout() {
    localStorage.clear();
    sessionStorage.clear();
    alert("Saindo do sistema...");

    // Redireciona para a página de login
    window.location.href = "http://4.201.144.173:3000/login.html";

    // Substitui o histórico para impedir o retorno
    window.history.replaceState(null, null, "http://4.201.144.173:3000/login.html");
}

document.addEventListener("DOMContentLoaded", function () {
    setInitialStoreStatus(); 
    employeeAuthentication(); 
});
let pendingStatusChange = null;
let storeId = localStorage.getItem("storeId");

function setInitialStoreStatus() {
    const toggle = document.getElementById('statusToggle');
    const label = document.getElementById('statusLabel');
    console.log("storeId:", storeId);

    fetch(`http://4.201.144.173:8083/store/status?storeId=${storeId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao obter status da loja");
            }
            return response.json(); // true ou false
        })
        .then(isOpen => {
            toggle.checked = isOpen;
            label.textContent = isOpen ? 'Aberto' : 'Fechado';
        })
        .catch(error => {
            console.error("Erro ao definir status inicial da loja:", error);
        });
}

function handleToggle(input) {
    const isOpen = input.checked;
    const label = document.getElementById('statusLabel');

    input.checked = !isOpen;

    pendingStatusChange = { isOpen, input, label };

    document.getElementById("modalAction").textContent = isOpen ? "abrir" : "fechar";
    console.log("Modal action set to:", isOpen ? "abrir" : "fechar");

    const modal = new bootstrap.Modal(document.getElementById("statusModal"));
    modal.show();
}

document.getElementById("confirmToggle").addEventListener("click", function () {
    if (!pendingStatusChange) return;

    const { isOpen, input, label } = pendingStatusChange;
    

    // Atualiza visualmente
    input.checked = isOpen;
    label.textContent = isOpen ? 'Aberto' : 'Fechado';

    fetch(`http://4.201.144.173:8083/store/openClose?open=${isOpen}&storeId=${storeId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro na resposta do servidor");
            }
            return response.text(); 
        })
        .then(data => {
            console.log("Status da loja atualizado:", data);
        })
        .catch(error => {
            console.error("Erro ao atualizar o status da loja:", error);
            // Reverte se der erro
            input.checked = !isOpen;
            label.textContent = !isOpen ? 'Aberto' : 'Fechado';
        });

    pendingStatusChange = null;

    // Fecha o modal
    bootstrap.Modal.getInstance(document.getElementById("statusModal")).hide();
});

function employeeAuthentication() {
    
    const employeeRole = localStorage.getItem("employeeRole");
    const employeeName = localStorage.getItem("employeeName");
    const storeName = localStorage.getItem("storeName");

    let words = employeeName.split(" ");
    let firstname = words[0];
    const nameElement = document.getElementById("user-name");
    nameElement.textContent = firstname;

    if (employeeRole === "Atendente") {
        // Oculta o menu "Gestão de Produtos" para Atendentes
        console.log(employeeRole);
        const gestaoProdutosLink = document.querySelector('a.nav-link[onclick="loadPage(\'gestao-produtos\', this)"]');
        if (gestaoProdutosLink) {
            gestaoProdutosLink.parentElement.style.display = "none";
        }

        if (employeeRole === "Atendente") {
            // Oculta o botão de status
            const toggleContainer = document.getElementById("toggleContainer");
            console.log("toggleContainer existe?", toggleContainer);
            console.log("employeeRole:", employeeRole);
                toggleContainer.style.setProperty('display', 'none', 'important');
                console.log("toggleContainer oculto");
        }


        // Altera o título da barra lateral
        const gestaoFuncionariosLink = document.querySelector('a.nav-link[onclick="loadPage(\'gestao-funcionarios\', this)"]');
        if (gestaoFuncionariosLink) {
            gestaoFuncionariosLink.innerHTML = `
                <img src="../img/perfil.png" alt="Funcionários" class="me-2" style="width: 20px;">
                Meus dados
            `;
        }

        // Altera o título da página
        const pageTitle = document.querySelector("h3.text-center");
        if (pageTitle) {
            pageTitle.textContent = "Meus dados";
        }

        // Oculta os cards de "Cadastrar" e "Listar funcionários"
        const cadastroCard = document.querySelector('[onclick="loadSubPage(\'cadastro-funcionario\')"]');
        const listagemCard = document.querySelector('[onclick="loadSubPage(\'listagem-funcionario\')"]');

        if (cadastroCard) {
            cadastroCard.style.display = "none";
        }
        if (listagemCard) {
            listagemCard.style.display = "none";
        }}
    }

document.addEventListener("DOMContentLoaded", function () {
    employeeAuthentication();
    
});
