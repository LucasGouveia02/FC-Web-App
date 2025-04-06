export function init(userId) {
    if (!userId) {
        userId =  1;
    }

    const telefoneInput = document.getElementById("telefone");
    const nomeCompleto = document.getElementById("nomeCompleto");
    const telefone = document.getElementById("telefone"); // Confirme se o ID no HTML está correto
    const email = document.getElementById("email");
    const grupo = document.getElementById("grupo");
    const senha = document.getElementById("senha");
    const confirmSenha = document.getElementById("confirmSenha");
    const botaoConfirmar = document.querySelector(".btn-confirmar");
    const botaoCancelar = document.querySelector(".btn-cancelar");
    telefoneInput.addEventListener("input", aplicarMascaraTelefone);

    function atualizarCampos() {
        if (grupo.value === "Atendente") {
            grupo.disabled = true; // Libera alteração do grupo
            email.disabled = true;  // Impede alteração do email
            senha.disabled = false; // Libera alteração da senha
            confirmSenha.disabled = false;
        } else if (grupo.value === "Gerente") {
            email.disabled = true;
            senha.disabled = true;  // Impede alteração da senha
            confirmSenha.disabled = true;
        }
    }

    // Evento para detectar mudança de grupo e atualizar os campos
    grupo.addEventListener("change", atualizarCampos);

    // Buscar e preencher os dados do usuário
    fetch(`http://localhost:8083/employee/user/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao carregar os dados do usuário.");
            }
            return response.json();
        })
        .then(data => {
            nomeCompleto.value = data.name;
            email.value = data.email;
            telefone.value = data.phoneNumber ? data.phoneNumber : ""; // Evita erro se for null
            grupo.value = data.role;

            telefone.value = aplicarMascaraTelefoneCarregamento(telefone.value);
            // Atualiza os campos conforme a role do usuário carregado
            atualizarCampos();
        })
        .catch(error => {
            console.error("Erro ao buscar usuário:", error);
            alert("Erro ao carregar os dados do usuário.");
        });

    // Evento para salvar as alterações
    botaoConfirmar.addEventListener("click", function (event) {
        event.preventDefault();

        // Verifica se as senhas coincidem, caso tenham sido preenchidas
        if (senha.value && senha.value !== confirmSenha.value) {
            alert("As senhas não coincidem!");
            return;
        }

        // Monta o objeto de atualização, sem enviar senha se estiver vazia
        const updatedData = {
            name: nomeCompleto.value.trim(),
            email: email.value.trim(),
            phoneNumber: telefone.value.replace(/\D/g, ""), // Remove caracteres não numéricos
            role: grupo.value
        };

        if (senha.value) {
            updatedData.password = senha.value;
        }

        if (validarTelefone()) {

            fetch(`http://localhost:8083/employee/alter/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Erro ao atualizar os dados. Verifique as informações.");
                    }
                    return response.json();
                })
                .then(() => {
                    alert("Dados atualizados com sucesso!");
                    window.location.reload(); // Atualiza a página após salvar
                })
                .catch(error => {
                    console.error("Erro ao atualizar:", error);
                    alert("Erro ao atualizar os dados.");
                });
        } else {
            alert("Por favor, insira um número de telefone válido.");
        }
    });

    botaoCancelar.addEventListener("click", () => {
        const confirmar = confirm("Você tem certeza que deseja cancelar a alteração?");
        if (confirmar) {
            loadLastPage('gestao-funcionarios');
        }
    });

    // Função para aplicar a máscara no telefone
    function aplicarMascaraTelefoneCarregamento(telefone) {

        // Remover tudo que não seja número
        telefone = telefone.replace(/\D/g, "");
        if (telefone.length > 11) {
            telefone = telefone.substring(0, 11);
        }

        // Adicionar a máscara (XX) XXXXX-XXXX
        if (telefone.length <= 2) {
            telefone = telefone.replace(/(\d{2})/, "($1");
        } else if (telefone.length <= 7) {
            telefone = telefone.replace(/(\d{2})(\d{5})/, "($1) $2");
        } else {
            telefone = telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        }

        return telefone;
    }

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
};