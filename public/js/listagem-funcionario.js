export function init() {
    const apiUrl = 'http://4.201.144.173:8083/employee/all';

    // Função para buscar os dados da API
    async function fetchEmployees() {
        try {
            const response = await fetch(apiUrl);
            const employees = await response.json();

            // Seleciona o corpo da tabela
            const tableBody = document.getElementById('employee-table-body');

            // Limpa o conteúdo existente
            tableBody.innerHTML = '';

            // Itera sobre os dados e cria as linhas da tabela
            employees.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.id}</td>
                    <td>${employee.name}</td>
                    <td>${formatPhoneNumber(employee.phoneNumber)}</td>
                    <td>${employee.email}</td>
                    <td>${employee.role}</td>
                    <td class="text-center">
                        <button class="btn btn-primary btn-sm btn-editar" data-id="${employee.id}">Editar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Adiciona evento de clique aos botões "Editar"
            document.querySelectorAll('.btn-editar').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const userId = event.target.getAttribute('data-id');
                    await carregarPaginaEdicao(userId);
                });
            });
        } catch (error) {
            console.error('Erro ao buscar os dados:', error);
        }
    }

    // Função para carregar a página de edição
    async function carregarPaginaEdicao(userId) {
        try {
            const response = await fetch('../pages/edicao-funcionario.html');
            const html = await response.text();

            // Substitui o conteúdo atual pelo HTML da página de edição
            const container = document.querySelector('.container');
            container.innerHTML = html;

            // Importa e inicializa o script da página de edição
            const { init } = await import('../js/edicao-funcionario.js');
            init(userId);
        } catch (error) {
            console.error('Erro ao carregar a página de edição:', error);
        }
    }
    function formatPhoneNumber(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
    
        
        return phoneNumber;
    }
    

    // Chama a função para buscar os funcionários ao carregar a página
    fetchEmployees();
}