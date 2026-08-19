
// ================ // GESTÃO DE ESTOQUE 


// Dados
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];

let produtoEditando = null;

// ================ // ELEMENTOS


const modalProduto = document.getElementById("modalProduto");
const modalMovimentacao = document.getElementById("modalMovimentacao");

const formProduto = document.getElementById("formProduto");
const formMovimentacao = document.getElementById("formMovimentacao");

const btnNovoProduto = document.getElementById("btnNovoProduto");
const fecharModal = document.getElementById("fecharModal");
const cancelarModal = document.getElementById("cancelarModal");

const fecharMovimentacao = document.getElementById("fecharMovimentacao");
const cancelarMovimentacao = document.getElementById("cancelarMovimentacao");


// ==================== // NAVEGAÇÃO


const menuItems = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".section");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        const sectionId = item.dataset.section;

        menuItems.forEach(btn => {
            btn.classList.remove("active");
        });

        item.classList.add("active");

        sections.forEach(section => {
            section.classList.remove("active");
        });

        document.getElementById(sectionId).classList.add("active");

        const titulos = {
            dashboard: "Dashboard",
            produtos: "Produtos",
            movimentacoes: "Movimentações"
        };

        document.getElementById("pageTitle").textContent =
            titulos[sectionId];
    });

});


// =========================== // LOCAL STORAGE


function salvarDados() {

    localStorage.setItem(
        "produtos",
        JSON.stringify(produtos)
    );

    localStorage.setItem(
        "movimentacoes",
        JSON.stringify(movimentacoes)
    );
}


// =================== // FORMATAÇÃO


function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function formatarData(data) {

    return new Date(data).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}


// =========================== // STATUS


function obterStatus(produto) {

    if (produto.quantidade === 0) {

        return {
            texto: "Sem estoque",
            classe: "zerado"
        };

    }

    if (produto.quantidade <= produto.estoqueMinimo) {

        return {
            texto: "Estoque baixo",
            classe: "baixo"
        };

    }

    return {
        texto: "Normal",
        classe: "normal"
    };
}


// ==================== // DASHBOARD


function atualizarDashboard() {

    const totalProdutos = produtos.length;

    const totalEstoque = produtos.reduce(
        (total, produto) => total + Number(produto.quantidade),
        0
    );

    const produtosBaixos = produtos.filter(
        produto => produto.quantidade <= produto.estoqueMinimo
    );

    const valorEstoque = produtos.reduce(
        (total, produto) =>
            total + (Number(produto.quantidade) * Number(produto.precoCompra || 0)),
        0
    );

    document.getElementById("totalProdutos").textContent =
        totalProdutos;

    document.getElementById("totalEstoque").textContent =
        totalEstoque;

    document.getElementById("estoqueBaixo").textContent =
        produtosBaixos.length;

    document.getElementById("valorEstoque").textContent =
        formatarMoeda(valorEstoque);

    renderizarEstoqueBaixo();
    renderizarUltimasMovimentacoes();
}


// ======================== // ESTOQUE BAIXO


function renderizarEstoqueBaixo() {

    const container =
        document.getElementById("listaEstoqueBaixo");

    const produtosBaixos = produtos.filter(
        produto => produto.quantidade <= produto.estoqueMinimo
    );

    if (produtosBaixos.length === 0) {

        container.innerHTML =
            `<div class="empty">
                Nenhum produto com estoque baixo.
            </div>`;

        return;
    }

    container.innerHTML = produtosBaixos
        .map(produto => {

            return `
                <div class="low-stock-item">

                    <div>
                        <strong>${produto.nome}</strong>
                        <span>${produto.categoria}</span>
                    </div>

                    <div>
                        <strong>${produto.quantidade}</strong>
                        <span>mín. ${produto.estoqueMinimo}</span>
                    </div>

                </div>
            `;

        })
        .join("");
}


// =========================== // ÚLTIMAS MOVIMENTAÇÕES



function renderizarUltimasMovimentacoes() {

    const container =
        document.getElementById("ultimasMovimentacoes");

    const lista = [...movimentacoes]
        .sort((a, b) =>
            new Date(b.data) - new Date(a.data)
        )
        .slice(0, 5);

    if (lista.length === 0) {

        container.innerHTML =
            `<div class="empty">
                Nenhuma movimentação registrada.
            </div>`;

        return;
    }

    container.innerHTML = lista
        .map(mov => {

            return `
                <div class="mov-item">

                    <div>
                        <strong>${mov.produtoNome}</strong>

                        <small>
                            ${formatarData(mov.data)}
                        </small>
                    </div>

                    <strong class="${mov.tipo}">
                        ${mov.tipo === "entrada" ? "+" : "-"}
                        ${mov.quantidade}
                    </strong>

                </div>
            `;

        })
        .join("");
}


// ========================== // RENDERIZAR PRODUTOS


function renderizarProdutos() {

    const tabela =
        document.getElementById("tabelaProdutos");

    const busca =
        document.getElementById("buscarProduto").value
            .toLowerCase();

    const categoria =
        document.getElementById("filtroCategoria").value;

    const filtroEstoque =
        document.getElementById("filtroEstoque").value;

    let lista = produtos.filter(produto => {

        const correspondeBusca =
            produto.nome.toLowerCase().includes(busca) ||
            produto.categoria.toLowerCase().includes(busca);

        const correspondeCategoria =
            !categoria ||
            produto.categoria === categoria;

        let correspondeEstoque = true;

        if (filtroEstoque === "baixo") {
            correspondeEstoque =
                produto.quantidade > 0 &&
                produto.quantidade <= produto.estoqueMinimo;
        }

        if (filtroEstoque === "zerado") {
            correspondeEstoque =
                produto.quantidade === 0;
        }

        if (filtroEstoque === "normal") {
            correspondeEstoque =
                produto.quantidade > produto.estoqueMinimo;
        }

        return (
            correspondeBusca &&
            correspondeCategoria &&
            correspondeEstoque
        );

    });

    document.getElementById("contadorProdutos").textContent =
        `${lista.length} produto${lista.length !== 1 ? "s" : ""}`;

    if (lista.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Nenhum produto encontrado.
                </td>
            </tr>
        `;

        return;
    }

    tabela.innerHTML = lista.map(produto => {

        const status = obterStatus(produto);

        return `
            <tr>

                <td>
                    <strong>${produto.nome}</strong>
                </td>

                <td>
                    ${produto.categoria}
                </td>

                <td>
                    ${formatarMoeda(produto.precoVenda)}
                </td>

                <td>
                    <strong>${produto.quantidade}</strong>
                </td>

                <td>
                    ${produto.estoqueMinimo}
                </td>

                <td>
                    <span class="status ${status.classe}">
                        ${status.texto}
                    </span>
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="btn-mov"
                            onclick="abrirMovimentacao(${produto.id})"
                            title="Movimentar"
                        >
                            ↕
                        </button>

                        <button
                            class="btn-edit"
                            onclick="editarProduto(${produto.id})"
                            title="Editar"
                        >
                            ✏️
                        </button>

                        <button
                            class="btn-danger"
                            onclick="excluirProduto(${produto.id})"
                            title="Excluir"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");
}


// ======================== // CATEGORIAS

function atualizarCategorias() {

    const select =
        document.getElementById("filtroCategoria");

    const categoriaAtual = select.value;

    const categorias = [
        ...new Set(
            produtos.map(produto => produto.categoria)
        )
    ].sort();

    select.innerHTML =
        `<option value="">Todas as categorias</option>`;

    categorias.forEach(categoria => {

        select.innerHTML += `
            <option value="${categoria}">
                ${categoria}
            </option>
        `;

    });

    select.value = categoriaAtual;
}


// =========================== // ABRIR MODAL DE PRODUTO


btnNovoProduto.addEventListener("click", () => {

    produtoEditando = null;

    document.getElementById("tituloModal").textContent =
        "Novo Produto";

    formProduto.reset();

    document.getElementById("produtoId").value = "";

    document.getElementById("estoqueMinimo").value = 5;

    modalProduto.classList.add("active");
});


// =================== // FECHAR MODAL


function fecharModalProduto() {

    modalProduto.classList.remove("active");

    formProduto.reset();

    produtoEditando = null;
}

fecharModal.addEventListener(
    "click",
    fecharModalProduto
);

cancelarModal.addEventListener(
    "click",
    fecharModalProduto
);


// ============== // SALVAR PRODUTO

formProduto.addEventListener("submit", event => {

    event.preventDefault();

    const nome =
        document.getElementById("nome").value.trim();

    const categoria =
        document.getElementById("categoria").value.trim();

    const precoCompra =
        Number(document.getElementById("precoCompra").value) || 0;

    const precoVenda =
        Number(document.getElementById("precoVenda").value);

    const quantidade =
        Number(document.getElementById("quantidade").value);

    const estoqueMinimo =
        Number(document.getElementById("estoqueMinimo").value);

    if (!nome || !categoria) {

        alert("Preencha os campos obrigatórios.");

        return;
    }

    if (produtoEditando) {

        const produto =
            produtos.find(p => p.id === produtoEditando);

        produto.nome = nome;
        produto.categoria = categoria;
        produto.precoCompra = precoCompra;
        produto.precoVenda = precoVenda;
        produto.quantidade = quantidade;
        produto.estoqueMinimo = estoqueMinimo;

    } else {

        const novoProduto = {

            id: Date.now(),

            nome,

            categoria,

            precoCompra,

            precoVenda,

            quantidade,

            estoqueMinimo,

            criadoEm: new Date().toISOString()

        };

        produtos.push(novoProduto);

    }

    salvarDados();

    atualizarTudo();

    fecharModalProduto();

    alert("Produto salvo com sucesso!");

});


// ================= // EDITAR PRODUTO

function editarProduto(id) {

    const produto =
        produtos.find(p => p.id === id);

    if (!produto) return;

    produtoEditando = id;

    document.getElementById("tituloModal").textContent =
        "Editar Produto";

    document.getElementById("produtoId").value =
        produto.id;

    document.getElementById("nome").value =
        produto.nome;

    document.getElementById("categoria").value =
        produto.categoria;

    document.getElementById("precoCompra").value =
        produto.precoCompra;

    document.getElementById("precoVenda").value =
        produto.precoVenda;

    document.getElementById("quantidade").value =
        produto.quantidade;

    document.getElementById("estoqueMinimo").value =
        produto.estoqueMinimo;

    modalProduto.classList.add("active");
}


// ===============================// EXCLUIR PRODUTO

function excluirProduto(id) {

    const produto =
        produtos.find(p => p.id === id);

    if (!produto) return;

    const confirmar = confirm(
        `Deseja realmente excluir "${produto.nome}"?`
    );

    if (!confirmar) return;

    produtos = produtos.filter(
        p => p.id !== id
    );

    salvarDados();

    atualizarTudo();

}


// ===========================// ABRIR MOVIMENTAÇÃO

function abrirMovimentacao(id) {

    const produto =
        produtos.find(p => p.id === id);

    if (!produto) return;

    document.getElementById("movProdutoId").value =
        produto.id;

    document.getElementById("movNomeProduto").textContent =
        produto.nome;

    document.getElementById("movEstoqueAtual").textContent =
        `Estoque atual: ${produto.quantidade} unidades`;

    document.getElementById("tipoMovimentacao").value =
        "entrada";

    document.getElementById("quantidadeMovimentacao").value =
        "";

    modalMovimentacao.classList.add("active");
}


// ======================= // FECHAR MOVIMENTAÇÃO


function fecharModalMov() {

    modalMovimentacao.classList.remove("active");

    formMovimentacao.reset();
}

fecharMovimentacao.addEventListener(
    "click",
    fecharModalMov
);

cancelarMovimentacao.addEventListener(
    "click",
    fecharModalMov
);


// ==================== // REALIZAR MOVIMENTAÇÃO

formMovimentacao.addEventListener("submit", event => {

    event.preventDefault();

    const id =
        Number(document.getElementById("movProdutoId").value);

    const tipo =
        document.getElementById("tipoMovimentacao").value;

    const quantidade =
        Number(
            document.getElementById("quantidadeMovimentacao").value
        );

    const produto =
        produtos.find(p => p.id === id);

    if (!produto) return;

    if (quantidade <= 0) {

        alert("Informe uma quantidade válida.");

        return;
    }

    if (
        tipo === "saida" &&
        quantidade > produto.quantidade
    ) {

        alert(
            "Não é possível retirar uma quantidade maior que o estoque atual."
        );

        return;
    }

    if (tipo === "entrada") {

        produto.quantidade += quantidade;

    } else {

        produto.quantidade -= quantidade;

    }

    movimentacoes.push({

        id: Date.now(),

        produtoId: produto.id,

        produtoNome: produto.nome,

        tipo,

        quantidade,

        estoqueAtual: produto.quantidade,

        data: new Date().toISOString()

    });

    salvarDados();

    atualizarTudo();

    fecharModalMov();

    alert(
        tipo === "entrada"
            ? "Entrada registrada com sucesso!"
            : "Saída registrada com sucesso!"
    );

});


// ======================// TABELA DE MOVIMENTAÇÕES

function renderizarMovimentacoes() {

    const tabela =
        document.getElementById("tabelaMovimentacoes");

    const filtro =
        document.getElementById("filtroMovimentacao").value;

    let lista = [...movimentacoes];

    if (filtro) {

        lista = lista.filter(
            mov => mov.tipo === filtro
        );

    }

    lista.sort(
        (a, b) =>
            new Date(b.data) -
            new Date(a.data)
    );

    if (lista.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Nenhuma movimentação encontrada.
                </td>
            </tr>
        `;

        return;
    }

    tabela.innerHTML = lista.map(mov => {

        return `
            <tr>

                <td>
                    ${formatarData(mov.data)}
                </td>

                <td>
                    <strong>${mov.produtoNome}</strong>
                </td>

                <td>

                    <span class="${mov.tipo}">
                        ${mov.tipo === "entrada"
                            ? "⬆ Entrada"
                            : "⬇ Saída"}
                    </span>

                </td>

                <td>
                    ${mov.quantidade}
                </td>

                <td>
                    ${mov.estoqueAtual}
                </td>

            </tr>
        `;

    }).join("");
}


// ================ // FILTROS


document
    .getElementById("buscarProduto")
    .addEventListener(
        "input",
        renderizarProdutos
    );

document
    .getElementById("filtroCategoria")
    .addEventListener(
        "change",
        renderizarProdutos
    );

document
    .getElementById("filtroEstoque")
    .addEventListener(
        "change",
        renderizarProdutos
    );

document
    .getElementById("filtroMovimentacao")
    .addEventListener(
        "change",
        renderizarMovimentacoes
    );


// ========================= // ATUALIZAR SISTEMA

function atualizarTudo() {

    atualizarCategorias();

    renderizarProdutos();

    renderizarMovimentacoes();

    atualizarDashboard();
}


// ========================== // FECHAR MODAIS CLICANDO FORA


modalProduto.addEventListener("click", event => {

    if (event.target === modalProduto) {
        fecharModalProduto();
    }

});

modalMovimentacao.addEventListener("click", event => {

    if (event.target === modalMovimentacao) {
        fecharModalMov();
    }

});


// ======================= // INICIALIZAÇÃO


atualizarTudo();