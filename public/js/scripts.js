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
        })
        .catch(error => console.error("Erro ao carregar a página:", error));
}

function loadSubPage(page) {
    fetch(`/pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            runPageScript(page);
        })
        .catch(error => console.error("Erro ao carregar a página:", error));
}

function loadLastPage(page) {
    fetch(`/pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
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
