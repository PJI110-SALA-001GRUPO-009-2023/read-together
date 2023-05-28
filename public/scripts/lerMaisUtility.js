/**
 * Estiliza um botão adicionando classes CSS.
 * @param {HTMLButtonElement} button - O elemento de botão a ser estilizado.
 */
function estilizarBotao(button) {
    button.classList.add('naked-btn', 'small-text')
}

/**
 * Adiciona o comportamento de alternância a um botão.
 * @param {Event} e - O evento de clique.
 */
function adicionarComportamentoToggle(e) {
    let btn = e.target
    const paragDescricao = btn.previousElementSibling
    const textoEstaEscondido = paragDescricao.getAttribute('class').includes('text-truncate')
        ? true
        : false
    if (textoEstaEscondido) {
        btn.textContent = '» guardar «'
        paragDescricao.setAttribute('class', paragDescricao.getAttribute('class').replace('text-truncate', ''))
        paragDescricao.setAttribute('aria-expanded', 'true')
    } else {
        btn.textContent = '« Ler mais »'
        paragDescricao.setAttribute('class', `${paragDescricao.getAttribute('class')} text-truncate`)
        paragDescricao.setAttribute('aria-expanded', 'false')
    }
}

/**
 * Função executada quando o DOM é carregado.
 */
document.addEventListener('DOMContentLoaded', function () {
    /**
 * Seleciona todos os botões "Ler mais".
 * @type {NodeList}
 */
    const botoesLerMais = document.querySelectorAll('button.btn-ler-mais')

    /**
 * Adiciona o estilo e comportamento de alternância a cada botão "Ler mais".
 */
    botoesLerMais.forEach(btnLerMais => {
        estilizarBotao(btnLerMais)
        btnLerMais.addEventListener('click', adicionarComportamentoToggle)
    })
})