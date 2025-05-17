export function init() {

    var storeId = localStorage.getItem("storeId");
    const botaoConfirmar = document.querySelector(".btn-confirmar");
    const botaoCancelar = document.querySelector(".btn-cancelar");
    const nome = document.getElementById('nomeProduto');
    const descricao = document.getElementById('descricao');
    const preco = document.getElementById('preco');
    const estoque = document.getElementById('estoque');
    const categoria = document.getElementById('categoria');

    [nome, descricao, preco, estoque, categoria].forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('erro');
        });
    });

    botaoConfirmar.addEventListener("click", async () => {
        const formData = new FormData();

        [nome, descricao, preco, estoque, categoria].forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('erro');
            } else {
                input.classList.remove('erro');
            }
        });

        if (
            !nome.value.trim() ||
            !descricao.value.trim() ||
            !preco.value.trim() ||
            !estoque.value.trim() ||
            !categoria.value.trim()
        ) {
            showModalError('Preencha todos os campos!');
            return;
        }

        const product = {
            name: nome.value,
            description: descricao.value,
            price: preco.value,
            stock: estoque.value,
            category: categoria.value,
            storeId: storeId,
        };

        // Adiciona o JSON do produto com o Content-Type correto
        const produtoBlob = new Blob([JSON.stringify(product)], { type: 'application/json' });
        formData.append('product', produtoBlob);

        const imgPrincipalInput = document.querySelector("#imagemPrincipal");
        const imgPrincipal = imgPrincipalInput.files;

        // Verifica se o arquivo de imagem principal foi selecionado
        if (imgPrincipal.length === 0) {
            showModalError('Escolha uma imagem para realizar o cadastro!');
            return;
        }
        // Adiciona a imagem principal
        formData.append('image', imgPrincipal[0]);

        try {
            mostrarLoading();
            const response = await fetch('http://4.201.144.173:8084/product/register', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erro ao cadastrar produto: ' + response.statusText);
            }

            esconderLoading();
            showModal('Produto cadastrado com sucesso!');
        } catch (error) {
            console.error('Erro ao cadastrar produto:', error);

            esconderLoading();
            showModalError('Erro ao cadastrar produto. Tente novamente mais tarde.');
        }
    });

    botaoCancelar.addEventListener("click", () => {
        const confirmar = confirm("Você tem certeza que deseja cancelar o cadastro?");
        if (confirmar) {
            loadLastPage('gestao-produtos');
        }
    });

    document.getElementById('imagemPrincipal').addEventListener('change', function () {
        previewImage(this, 'mainPicture__image');
    });

    function previewImage(input, previewContainerClass) {
        const previewContainer = document.querySelector(`.${previewContainerClass}`);
        previewContainer.innerHTML = "";
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.classList.add("additional-img");
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }

    function showModal(message) {
        const modal = document.getElementById('confirmationModal');
        const modalMessage = document.getElementById('modalMessage');
        const okBtn = document.querySelector('.btn-ok');
        const closeBtn = document.getElementsByClassName('close')[0];

        modalMessage.innerText = message;
        modal.style.display = 'block';

        closeBtn.onclick = function () {
            modal.style.display = 'none';
        };

        okBtn.onclick = function () {
            loadLastPage('gestao-produtos');
        };

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    }

    function showModalError(message) {
        const modal = document.getElementById('confirmationModal');
        const modalMessage = document.getElementById('modalMessage');
        const okBtn = document.querySelector('.btn-ok');
        const closeBtn = document.getElementsByClassName('close')[0];

        modalMessage.innerText = message;
        modal.style.display = 'block';

        closeBtn.onclick = function () {
            modal.style.display = 'none';
        };
        okBtn.onclick = function () {
            modal.style.display = 'none';
        };

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    }

    function mostrarLoading() {
        document.querySelector(".all-content").classList.add('blur');
        document.getElementById("loadingModal").style.display = "block";
        document.getElementById("loadingModal").classList.remove('blur');
    }

    function esconderLoading() {
        document.getElementById("loadingModal").style.display = "none";
        document.querySelector(".all-content").classList.remove('blur');
    }
}