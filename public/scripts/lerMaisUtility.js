export function adicionarToggleATodosOsBotoes() {
    function estilizarBotao(button) {
        button.classList.add('naked-btn', 'small-text')
    }

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

    const botoesLerMais = document.querySelectorAll('button.btn-ler-mais')
    botoesLerMais.forEach(btnLerMais => {
        estilizarBotao(btnLerMais)
        btnLerMais.addEventListener('click', adicionarComportamentoToggle)
    })
}

document.addEventListener('DOMContentLoaded', function () {
    adicionarToggleATodosOsBotoes()
})