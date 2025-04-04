export function init() {
    const telefoneInput = document.getElementById("telefone");
    const botaoConfirmar = document.querySelector(".btn-confirmar");
    const botaoCancelar = document.querySelector(".btn-cancelar");
    if (!botaoConfirmar) return;

    botaoConfirmar.addEventListener("click", async () => {
        console.log("Cadastro de funcionário iniciado!");

        const nome = document.getElementById("nomeCompleto").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const grupo = document.getElementById("grupo").value;
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmSenha = document.getElementById("confirmSenha").value;

        if (!nome || !telefone || !email || !senha || !confirmSenha) {
            alert("Todos os campos são obrigatórios!");
            return;
        }

        if (senha !== confirmSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        try {
            const response = await fetch("URL_DA_SUA_API/cadastrar-funcionario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, telefone, grupo, email, senha }),
            });

            if (!response.ok) {
                throw new Error("Erro ao cadastrar funcionário");
            }

            alert("Cadastro realizado com sucesso!");
            window.location.href = "TelaListagemUsuarios.html";
        } catch (error) {
            console.error("Erro:", error);
            alert("Falha ao cadastrar funcionário. Tente novamente.");
        }
    });

    botaoCancelar.addEventListener("click", () => {
        const confirmar = confirm("Você tem certeza que deseja cancelar o cadastro?");
        if (confirmar) {
            loadSubPage('gestao-funcionarios');
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