export function init() {
    const telefoneInput = document.getElementById("telefone");
    const botaoConfirmar = document.querySelector(".btn-confirmar");
    const botaoCancelar = document.querySelector(".btn-cancelar");
    let storeId = localStorage.getItem("storeId");
    if (!botaoConfirmar) return;

    botaoConfirmar.addEventListener("click", async () => {
        const nomeCompleto = document.getElementById("nomeCompleto").value.trim();
        const contato = document.getElementById("telefone").value.replace(/\D/g, ""); // Remove caracteres não numéricos
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmSenha = document.getElementById("confirmSenha").value;
        const grupo = document.getElementById("grupo").value;

        if (senha !== confirmSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        const employeeData = {
            name: nomeCompleto,
            phoneNumber: contato,
            email: email,
            password: senha,
            role: grupo,
            storeId: storeId
        };

        fetch("http://4.201.144.173:8083/employee/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employeeData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Erro ao cadastrar. Verifique os dados e tente novamente.");
                }
                return response.json();
            })
            .then(data => {
                alert("Cadastro realizado com sucesso!");
                loadPage('home', null);
            })
            .catch(error => {
                alert(error.message);
            });
    });

    botaoCancelar.addEventListener("click", () => {
        const confirmar = confirm("Você tem certeza que deseja cancelar o cadastro?");
        if (confirmar) {
            loadLastPage('gestao-funcionarios');
        }
    });

    // Função para aplicar a máscara no telefone
    function aplicarMascaraTelefone(event) {
        let valor = event.target.value;

        // Remover tudo que não seja número
        valor = valor.replace(/\D/g, "");
        if (valor.length > 11) {
            valor = valor.substring(0, 11);
        }

        // Adicionar a máscara (XX) XXXXX-XXXX
        if (valor.length <= 2) {
            valor = valor.replace(/(\d{2})/, "($1");
        } else if (valor.length <= 7) {
            valor = valor.replace(/(\d{2})(\d{5})/, "($1) $2");
        } else {
            valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        }

        event.target.value = valor;
    }

    // Função para validar o telefone
    function validarTelefone() {
        const telefone = telefoneInput.value;
        const regex = /^\(\d{2}\) \d{5}-\d{4}$/;

        if (!regex.test(telefone)) {
            telefoneInput.classList.add("is-invalid");
            return false;
        } else {
            telefoneInput.classList.remove("is-invalid");
            return true;
        }
    }

    // Aplicar a máscara enquanto o usuário digita
    telefoneInput.addEventListener("input", aplicarMascaraTelefone);

    // Validar o telefone ao submeter o formulário
    const form = document.querySelector(".form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (validarTelefone()) {

            // Aqui você pode continuar com a submissão do formulário
        } else {
            alert("Por favor, insira um número de telefone válido.");
        }
    });
}