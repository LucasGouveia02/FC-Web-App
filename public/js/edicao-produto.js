export function init() {
    var productId = localStorage.getItem("param");
    acessarProduto(productId);


    const botaoConfirmar = document.querySelector(".btn-confirmar");
    const botaoCancelar = document.querySelector(".btn-cancelar");
    const nome = document.getElementById('nomeProduto');
    const descricao = document.getElementById('descricao');
    const preco = document.getElementById('preco');
    const estoque = document.getElementById('estoque');
    const categoria = document.getElementById('categoria');

    function acessarProduto(productId) {
        fetch(`http://localhost:8084/product/listById?id=${productId}`)
            .then(response => response.json())
            .then(produto => {
                nome.value = produto.name;
                descricao.value = produto.description;
                preco.value = produto.price;
                estoque.value = produto.stock;
                categoria.value = produto.categoryId.name;

                // Exibir imagem principal
                if (produto.imageUrl) {
                    previewImage(null, 'mainPicture__image', produto.imageUrl);
                }

            })
            .catch(error => {
                console.error('Erro ao acessar produto:', error);
                alert("Erro ao acessar produto. Por favor, tente novamente.");
            });
    }

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
            category: categoria.value
        };

        const produtoBlob = new Blob([JSON.stringify(product)], { type: 'application/json' });
        formData.append('product', produtoBlob);

        const imgPrincipalInput = document.querySelector("#imagemPrincipal");
        const imgPrincipal = imgPrincipalInput.files;

        if (!(imgPrincipal.length === 0)) {
            formData.append('image', imgPrincipal[0]);
        }  

        try {
            mostrarLoading();
            const response = await fetch(`http://localhost:8084/product/update?id=${productId}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erro ao alterar produto: ' + response.statusText);
            }

            esconderLoading();
            showModal('Produto alterado com sucesso!');
        } catch (error) {
            console.error('Erro ao alterar produto:', error);

            esconderLoading();
            showModalError('Erro ao alterar produto. Tente novamente mais tarde.');
        }
    });

    botaoCancelar.addEventListener("click", () => {
        const confirmar = confirm("Você tem certeza que deseja cancelar a alteração?");
        if (confirmar) {
            loadLastPageWithScript('listagem-produto');
        }
    });

    document.getElementById('imagemPrincipal').addEventListener('change', function () {
        previewImage(this, 'mainPicture__image');
    });

    function previewImage(input, previewContainerClass, imageUrlFromBanco = null) {
        const previewContainer = document.querySelector(`.${previewContainerClass}`);
        previewContainer.innerHTML = "";

        if (imageUrlFromBanco) {
            // Mostra a imagem vinda do banco
            const img = document.createElement("img");
            img.src = imageUrlFromBanco;
            img.classList.add("additional-img");
            previewContainer.appendChild(img);
            return;
        }

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
            loadLastPageWithScript('listagem-produto');
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