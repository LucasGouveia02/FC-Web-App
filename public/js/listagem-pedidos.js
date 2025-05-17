export function init() {

    var storeId = localStorage.getItem("storeId");
    const botaoBuscar = document.querySelector("#buscar-filtro");
    let currentPage = 1;
    let totalPages = 0;
    let data = [];
    fetchData();

    async function fetchData(page = 0) {
        try {
            currentPage = page + 1; // Corrigir a numeração da página exibida
            const response = await fetch(`http://4.201.144.173:8085/orders/list?storeId=${storeId}&excludeStatus=CANCELED&excludeStatus=FINISHED&page=${page}`);
            const result = await response.json();
            console.log(result);
            data = result.content;
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
                    <th>Número do Pedido</th>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Data do Pedido</th>
                </tr>
            </thead>
            <tbody id="table-body"></tbody>
        </table>
        `;
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = '';

        data.forEach(item => {
            const dataFormatada = formatarData(item.orderDate);
            const statusMaisRecente = item.statusList?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
            const statusExibido = statusTraduzido[statusMaisRecente.orderStatus] || statusMaisRecente.orderStatus;

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>
                <a href="#" class="abrir-modal" data-id="${item.id}">
                    ${item.id}
                </a>
            </td>
            <td>${item.customerId.name}</td>
            <td>${statusExibido}</td>
            <td>${dataFormatada}</td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.abrir-modal').forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const pedidoId = this.getAttribute('data-id');
                abrirModalComPedido(pedidoId);
            });
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
                fetchData(i - 1);
            });
            pagination.appendChild(button);
        }
    }

    function abrirModalComPedido(pedidoId) {
        const statusSteps = ['PAID', 'PREPARING', 'AVAILABLE', 'FINISHED'];
        const pedido = data.find(p => p.id == pedidoId);
        if (!pedido) return;

        const statusConcluidos = {};
        pedido.statusList.forEach(s => {
            statusConcluidos[s.orderStatus] = s.updatedAt;
        });

        const steps = document.querySelectorAll('.modal-detalhe-pedido .timeline-list .timeline-item');
        steps.forEach((step, index) => {
            const progress = step.querySelector('.progress');
            const iconCheck = progress.querySelector('i');
            const text = step.querySelector('.text');

            const statusAtual = statusSteps[index];
            const dataAtual = statusConcluidos[statusAtual];

            if (dataAtual) {
                progress.classList.add('completed');
                iconCheck.style.visibility = 'visible';
                text.innerText = `${statusTraduzido[statusAtual]} em ${formatarData(dataAtual)}`;
            } else {
                progress.classList.remove('completed');
                iconCheck.style.visibility = 'hidden';
                text.innerText = statusTraduzido[statusAtual];
            }
        });

        const tabelaBody = document.querySelector('.tabela-produtos tbody');
        tabelaBody.innerHTML = '';

        let totalPedido = 0;

        pedido.items.forEach(item => {
            const produto = item.id.productId;
            const totalItem = produto.price * item.quantity;
            totalPedido += totalItem;

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${produto.name}</td>
            <td>${item.quantity}</td>
            <td>R$ ${produto.price.toFixed(2).replace('.', ',')}</td>
            <td>R$ ${totalItem.toFixed(2).replace('.', ',')}</td>
            `;
            tabelaBody.appendChild(row);
        });

        const totalPedidoElement = document.querySelector('.valor-total-pedido strong');
        totalPedidoElement.innerText = `R$ ${totalPedido.toFixed(2).replace('.', ',')}`;

        document.querySelector('.modal-pedido').style.display = 'flex';
        document.getElementById('overlay').style.display = 'block';

        const btnAvancar = document.querySelector('.btn-avancar-etapa');
        const statusMaisRecente = pedido.statusList?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]?.orderStatus;

        if (statusMaisRecente === 'FINISHED') {
            btnAvancar.style.display = 'none';
        } else {
            btnAvancar.style.display = 'block';
            btnAvancar.onclick = () => avancarEtapa(pedidoId);
        }
    }

    async function avancarEtapa(pedidoId) {
        const pedido = data.find(p => p.id == pedidoId);
        if (!pedido) {
            alert("Pedido não encontrado.");
            return;
        }

        const employeeId = localStorage.getItem("employeeId");
        const statusSequencia = ['PAID', 'PREPARING', 'AVAILABLE', 'FINISHED'];
        const statusMaisRecente = pedido.statusList?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        const statusAtual = statusMaisRecente?.orderStatus;
        const statusAtualIndex = statusSequencia.indexOf(statusAtual);
        const proximoStatus = statusSequencia[statusAtualIndex + 1];

        if (!proximoStatus) {
            alert("Pedido já está na última etapa.");
            return;
        }

        // Se for para FINISHED, validar código
        if (statusAtual === 'AVAILABLE' && proximoStatus === 'FINISHED') {
            abrirModalCodigo(pedidoId);
            return;
        }

        await atualizarStatus(pedidoId, proximoStatus, employeeId);
    }

    async function atualizarStatus(pedidoId, novoStatus, employeeId) {
        const payload = {
            orderId: pedidoId,
            employeeId: parseInt(employeeId),
            orderStatus: novoStatus
        };

        try {
            const response = await fetch(`http://4.201.144.173:8085/orders/updstatus`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Etapa avançada com sucesso!");
                fecharModalPedido();
                fetchData(currentPage - 1);
            } else {
                alert("Erro ao avançar etapa do pedido.");
            }
        } catch (error) {
            console.error("Erro ao enviar requisição:", error);
            alert("Erro na conexão com o servidor.");
        }
    }

    function abrirModalCodigo(pedidoId) {
        const modal = document.getElementById('modal-codigo-retirada');
        const input = document.getElementById('codigo-retirada-input');
        input.value = '';
        modal.style.display = 'flex';

        const confirmar = document.getElementById('confirmar-codigo');
        const cancelar = document.getElementById('cancelar-codigo');

        confirmar.onclick = async () => {
            const codigo = input.value.trim();
            if (!codigo) {
                alert("Digite o código para continuar.");
                return;
            }

            try {
                const employeeId = localStorage.getItem("employeeId");

                const response = await fetch(`http://4.201.144.173:8085/orders/validate-code`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderId: pedidoId,
                        code: codigo,
                        employeeId: parseInt(employeeId),
                        orderStatus: "FINISHED"
                    })
                });

                if (response.ok) {
                    fecharModalCodigo();
                    alert("Código validado e pedido finalizado com sucesso!");
                    fecharModalPedido();
                    fetchData(currentPage - 1);
                } else {
                    alert("Código inválido. Tente novamente.");
                }

            } catch (error) {
                console.error("Erro na validação do código:", error);
                alert("Erro ao validar o código.");
            }
        };
        cancelar.onclick = fecharModalCodigo;
    }

    function fecharModalCodigo() {
        document.getElementById('modal-codigo-retirada').style.display = 'none';
    }

    botaoBuscar.addEventListener("click", function () {
        filtrarProdutos();
    });
}

function fecharModalPedido() {
    document.querySelector('.modal-pedido').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
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

const statusTraduzido = {
    'PAID': 'Pagamento',
    'PREPARING': 'Preparando',
    'AVAILABLE': 'Disponível',
    'FINISHED': 'Finalizado'
};

document.getElementById('overlay').addEventListener('click', fecharModalPedido);
document.querySelector('.btn-fechar').addEventListener('click', fecharModalPedido);



