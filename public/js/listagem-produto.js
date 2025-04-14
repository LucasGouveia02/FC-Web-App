export function init() {

    var storeId = localStorage.getItem("storeId");
    const botaoBuscar = document.querySelector("#buscar-filtro");
    let currentPage = 1;
    let totalPages = 0;
    let data = []; // Array para armazenar os dados dos produtos
    fetchData();

    async function fetchData(page = 0) {
        try {
            const response = await fetch(`http://localhost:8084/product/list?page=${page}&storeId=${storeId}`); // Substitua pela URL do seu backend
            const result = await response.json();
            data = result.products;
            totalPages = result.totalPages;
            displayTableData();
            setupPagination();
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }

    function displayTableData() {
        const tabela = document.querySelector('.divTable');

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

            const isProdAtivo = item.enabled;

            row.innerHTML = `
            <td><img src="${item.imageUrl}" alt="${item.name}" width="50"></td>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.stock}</td>
            <td>R$${item.price.toFixed(2)}</td>
            <td>${item.enabled ? 'Ativo' : 'Inativo'}</td>
            <td class="acao"><button onclick="loadSubPageWithParam('edicao-produto', ${item.id})">Alterar</button></td>
            <td class="acao">
                <button onclick="abrirModalConfirmacao(${item.id}, ${isProdAtivo})">${isProdAtivo === true ? 'Desabilitar' : 'Habilitar'}</button>
            </td>
        `;
            tableBody.appendChild(row);
        });
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

    botaoBuscar.addEventListener("click", function () {
        filtrarProdutos();
    });

    function filtrarProdutos() {
        var filtro = document.getElementById('filtro').value.toUpperCase();

        console.log(filtro);
    
        // Se o filtro estiver vazio, busca os produtos normalmente
        if (!filtro) {
            fetchData(); // Carrega a lista completa se o filtro estiver vazio
            return;
        }
    
        async function fetchFilteredData(page = 0) {
            try {
                const response = await fetch(`http://localhost:8084/product/listByNameAndStoreId?name=${filtro}&storeId=${storeId}&page=${page}`);
    
                // Se a API retornar 404, exibe a mensagem de produto não encontrado
                if (response.status === 404) {
                    exibirMensagemProdutoNaoEncontrado();
                    return;
                }
    
                const result = await response.json();
                if (result.products.length === 0) {
                    // Caso a lista de produtos retornada seja vazia, exibe mensagem de produto não encontrado
                    exibirMensagemProdutoNaoEncontrado();
                } else {
                    data = result.products; // Armazena os produtos filtrados
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
                <img src="../img/not-found.png" alt="Produto não encontrado" width="200">
            </div>
        `;
    
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = ''; // Limpa a paginação quando não houver resultados
    }
}

window.abrirModalConfirmacao = function(id, isProdAtivo) {
    let funcao = isProdAtivo ? "desabilitado!" : "habilitado!";
    confirm(`O produto será ${funcao}`);
    if (isProdAtivo) {
        desabilitarProduto(id);
    } else {
        habilitarProduto(id);
    }
}

window.habilitarProduto = async function(id) {
    const endpoint = `http://localhost:8084/product/enable?id=${id}`;
    try {
        const response = await fetch(endpoint, {
            method: 'PATCH'
        });

        if (response.status === 200) {
            alert(`Produto habilitado com sucesso!`);
            loadLastPageWithScript('listagem-produto');
        } else {
            alert("Erro ao habilitar o produto. Por favor, tente novamente.");
        }
    } catch (error) {
        console.error("Erro ao habilitar o produto:", error);
        alert("Ocorreu um erro inesperado. Por favor, tente novamente.");
    }
}

window.desabilitarProduto = async function(id) {
    const endpoint = `http://localhost:8084/product/disable?id=${id}`;
    try {
        const response = await fetch(endpoint, {
            method: 'PATCH'
        });

        if (response.status === 200) {
            alert(`Produto desabilitado com sucesso!`);
            loadLastPageWithScript('listagem-produto');
        } else {
            alert("Erro ao desabilitar o produto. Por favor, tente novamente.");
        }
    } catch (error) {
        console.error("Erro ao desabilitar o produto:", error);
        alert("Ocorreu um erro inesperado. Por favor, tente novamente.");
    }
}

