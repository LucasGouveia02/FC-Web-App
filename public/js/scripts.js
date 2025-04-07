var homeElement = document.querySelector(".home");

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

function loadLastPage(page) {
    fetch(`/pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;

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
    alert("Saindo do sistema...");
    window.location.href = "login.html"; // Redirecionamento fictício
}

function employeeAuthentication() {
    const employeeRole = localStorage.getItem("employeeRole");
    const employeeName = localStorage.getItem("employeeName");
    const storeName = localStorage.getItem("storeName");

    let words = employeeName.split(" ");
    let firstname = words[0];
    const nameElement = document.getElementById("user-name");
    nameElement.textContent = firstname;

    if (employeeRole === "Atendente") {
        console.log("atendente");

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
        }
    } 
}

document.addEventListener("DOMContentLoaded", function () {
    employeeAuthentication();
});