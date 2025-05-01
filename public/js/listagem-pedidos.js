export function init() {

    var storeId = localStorage.getItem("storeId");
    const botaoBuscar = document.querySelector("#buscar-filtro");
    let currentPage = 1;
    let totalPages = 0;
    let data = []; // Array para armazenar os dados dos produtos
    fetchData();

    async function fetchData(page = 0, size = 10) {
        try {
            const response = await fetch(`http://localhost:8085/orders/list?storeId=${storeId}&page=${page}&size=${size}`);
            const result = await response.json();

            data = result.orders;
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
                                        <th>Número do pedido</th>
                                        <th>Cliente</th>
                                        <th>Status</th>
                                        <th>Cód. Retirada</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody id="table-body">
                                </tbody>
                            </table>
                        `;
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = '';

        // Filtro para trazer apenas os pedidos que estão em andamento.
        const pedidosFiltrados = data.filter(item => item.orderStatus !== 'FINISHED' && item.orderStatus !== 'CANCELED');

        pedidosFiltrados.forEach(item => {
            const row = document.createElement('tr');

            const dataFormatada = formatarData(item.orderDate)

            row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.customerId}</td>
            <td>${item.orderStatus}</td>
            <td>${2872}</td>
            <td>${dataFormatada}</td>
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
}

function formatarData(dataISO) {
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}h`;
}




