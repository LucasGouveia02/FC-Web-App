export function init() {

    // var grupoUsuarioLogado = localStorage.getItem("grupo");
    var grupoUsuarioLogado = "Gerente";

    const rowsPerPage = 10;
    let currentPage = 1;
    let totalPages = 0;
    let data = []; // Array para armazenar os dados dos produtos
    fetchData();

    async function fetchData(page = 0) {
        try {
            const response = await fetch(`http://localhost:8084/product/list?page=${page}`); // Substitua pela URL do seu backend
            const result = await response.json();
            data = result.products; // Armazena os produtos recebidos
            totalPages = result.totalPages; // Armazena o número total de páginas
            console.log(data);
            displayTableData();
            setupPagination();
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }

    function displayTableData() {
        const tabela = document.querySelector('.divTable');

        if (grupoUsuarioLogado === "Gerente") {
            tabela.innerHTML = `
        <table>
            <thead> 
                <tr>       
                    <th>Imagem</th>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Estoque</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th class="acao">Alterar</th>
                    <th class="acao">Hab/Des</th>
                </tr>
            </thead>
            <tbody id="table-body">
            </tbody>
        </table>
                        `;
            const tableBody = document.getElementById('table-body');
            tableBody.innerHTML = '';

            data.forEach(item => {
                const row = document.createElement('tr');

                const isProdAtivo = item.enabled ? true : "Ativo";
                console.log(isProdAtivo);

                row.innerHTML = `
            <td><img src="${item.imageUrl}" alt="${item.nomeProduto}" width="50"></td>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.stock}</td>
            <td>R$${item.price.toFixed(2)}</td>
            <td>${item.enabled ? 'Ativo' : 'Inativo'}</td>
            <td class="acao"><button onclick="alterarProduto(${item.id})">Alterar</button></td>
            <td class="acao">
                <button onclick="abrirModalConfirmacao(${item.id}, '${isProdAtivo}')">${isProdAtivo === true ? 'Desabilitar' : 'Habilitar'}</button>
            </td>
        `;
                tableBody.appendChild(row);
            });
        } else if (grupoUsuarioLogado === "Estoquista") {
            tabela.innerHTML = `
        <table>
            <thead> 
                <tr>       
                    <th>Imagem</th>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Quantidade</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th class="acao">Alterar</th>
                </tr>
            </thead>
            <tbody id="table-body">
            </tbody>
        </table>
                        `;
            const tableBody = document.getElementById('table-body');
            tableBody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
            <td><img src="${item.urlImagemPrincipal}" alt="${item.nomeProduto}" width="50"></td>
            <td>${item.id}</td>
            <td>${item.nomeProduto}</td>
            <td>${item.quantidade}</td>
            <td>${item.preco.toFixed(2)}</td>
            <td>${item.ativo ? 'Ativo' : 'Inativo'}</td>
            <td class="acao"><button onclick="alterarProduto(${item.id})">Alterar</button></td>
        `;
                tableBody.appendChild(row);
            });
        } else {
            alert("Você não tem permissão para acessar esta página!");
            window.location.href = 'TelaLogin.html';
        }
    }

    function setupPagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.innerText = i;
            button.classList.add('page-btn');
            if (i === currentPage) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentPage = i;
                fetchData(currentPage - 1); // Ajusta a página para a API (0-indexed)
            });
            pagination.appendChild(button);
        }
    }

    function filtrarProdutos() {
        // Obtém o valor digitado no campo de entrada e remove espaços extras
        var filtro = document.getElementById('filtro').value.trim().toUpperCase();

        // Se o filtro estiver vazio, busca os produtos normalmente
        if (!filtro) {
            fetchData(); // Carrega a lista completa se o filtro estiver vazio
            return;
        }

        async function fetchFilteredData(page = 0) {
            try {
                const response = await fetch(`http://${API}:8080/produto/buscaNome?nome=${filtro}&page=${page}`);

                // Se a API retornar 404, exibe a mensagem de produto não encontrado
                if (response.status === 404) {
                    exibirMensagemProdutoNaoEncontrado();
                    return;
                }

                const result = await response.json();
                if (result.produtos.length === 0) {
                    // Caso a lista de produtos retornada seja vazia, exibe mensagem de produto não encontrado
                    exibirMensagemProdutoNaoEncontrado();
                } else {
                    data = result.produtos; // Armazena os produtos filtrados
                    totalPages = result.totalPages; // Armazena o número total de páginas para os produtos filtrados
                    displayTableData(); // Exibe os dados filtrados
                    setupPagination(); // Configura a paginação para os dados filtrados
                }
            } catch (error) {
                console.error('Erro ao buscar dados filtrados:', error);
                exibirMensagemProdutoNaoEncontrado(); // Exibe mensagem em caso de erro
            }
        }

        fetchFilteredData(); // Chama a função para buscar os produtos filtrados
    }

    function exibirMensagemProdutoNaoEncontrado() {
        const tabela = document.querySelector('.divTable');
        tabela.innerHTML = `
        <div class="produto-nao-encontrado">
            <p>PRODUTO NÃO ENCONTRADO!</p>
            <img src="src/img/1178479.png" alt="Produto não encontrado" width="200">
        </div>
    `;

        const pagination = document.getElementById('pagination');
        pagination.innerHTML = ''; // Limpa a paginação quando não houver resultados
    }

    function visualizarProduto(produtoId) {
        const carrosselImagens = document.querySelector(".swiper-wrapper");
        const nomeProd = document.querySelector(".titulo-prod");
        const valorProd = document.querySelector(".valor-prod");
        const avaliacaoProd = document.querySelector(".avaliacao-prod");
        const descricaoProd = document.querySelector(".descricao-prod");
        abrirModalProduto();

        fetch('http://' + API + ':8080/produto/buscaID?id=' + produtoId)
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                }
            })
            .then(produto => {

                // Adiciona a imagem principal
                let indexImage = 0;
                carrosselImagens.innerHTML = `
                <div class="swiper-slide">
                    <div class="project-img">
                        <img src="${produto.imagemPrincipal}" alt="Imagem produto ${indexImage++}">
                    </div>
                </div>
            `;
                atualizarInstanciaSwiper();

                // Adiciona imagens adicionais, se houver
                if (produto.imagens && produto.imagens.length > 0) {
                    atualizarLoopSwiper(true);
                    produto.imagens.forEach(imagenProduto => {
                        carrosselImagens.innerHTML += `
                        <div class="swiper-slide">
                            <div class="project-img">
                                <img src="${imagenProduto}" alt="Imagem produto ${indexImage++}">
                            </div>
                        </div>
                    `;
                    });
                    atualizarInstanciaSwiper();
                }

                nomeProd.innerText = produto.nomeProduto;
                valorProd.innerText = "R$ " + produto.preco.toFixed(2);
                avaliacaoProd.innerText = "Avaliação: " + produto.avaliacao;
                descricaoProd.innerText = produto.descricao;

            })
            .catch(error => {
                console.error('Erro ao acessar produto:', error);
                alert("Erro ao acessar produto. Por favor, tente novamente.");
            });
    }

    function abrirModalProduto() {
        document.querySelector(".card-produto").style.display = "flex";
    }

    function fecharModalProduto() {
        document.querySelector(".card-produto").style.display = "none";
        const carrosselImagens = document.querySelector(".swiper-wrapper");
        carrosselImagens.innerHTML = '';  // Limpar conteudo do produto antigo
        atualizarLoopSwiper(false);
        atualizarInstanciaSwiper();
    }

    function alterarProduto(id) {
        // Função para redirecionar para a página de alteração do usuário
        window.location.href = `TelaAlterarProduto.html?id=${id}`;
    }

    async function habilitarDesabilitarProduto(id, ativo) {
        const endpoint = ativo === 'Ativo' ? `http://` + API + `:8080/produto/desativar/${id}` : `http://` + API + `:8080/produto/ativar/${id}`;
        try {
            const response = await fetch(endpoint, {
                method: 'PATCH'
            });

            if (response.status === 200) {
                alert(`Produto ${ativo === 'Ativo' ? 'desabilitado' : 'ativado'} com sucesso!`);
                fetchData();
            } else {
                alert("Erro ao tentar atualizar o status do produto. Por favor, tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao atualizar status do produto:", error);
            alert("Ocorreu um erro inesperado. Por favor, tente novamente.");
        }
    }

    function abrirModalConfirmacao(id, ativo) {
        document.getElementById("overlay").style.display = "flex";
        document.getElementById("main-content").classList.add("blur");

        const modal = document.querySelector(".card-confirmar");
        const heading = document.querySelector(".card-heading");
        const btnConfirmar = modal.querySelector('.card-button.primary');

        if (ativo === "Inativo") {
            heading.innerText = "Habilitar produto?";
            btnConfirmar.innerText = "Habilitar";
            btnConfirmar.style.backgroundColor = "rgb(58, 151, 63)";
        } else {
            heading.innerText = "Desabilitar produto?";
            btnConfirmar.innerText = "Desabilitar";
            btnConfirmar.style.backgroundColor = "rgb(214, 63, 58)";
        }

        modal.style.display = "flex";

        btnConfirmar.onclick = () => {
            habilitarDesabilitarProduto(id, ativo);
            fecharModalConfirmacao();
        }
    }

    function fecharModalConfirmacao() {
        document.querySelector(".card-confirmar").style.display = "none";
        document.getElementById("overlay").style.display = "none";
        document.getElementById("main-content").classList.remove("blur");
    }
}

