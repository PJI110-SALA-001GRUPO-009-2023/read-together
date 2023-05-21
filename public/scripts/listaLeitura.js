class LeituraManager {
    constructor() {
        this.selectElement = document.querySelector('select')
        this.container = document.querySelector('#lista-leituras')
        this.qtddSelecionada = null
        this.leituras = null
    }

    async obterLeiturasExistentes() {
        try {
            const response = await fetch('/clube/leituras')
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            const json = await response.json()
            return json
        } catch (err) {
            console.error(err)
        }
    }

    async buildLeituraStorage() {
        if (!localStorage.getItem('leituras')) {
            localStorage.clear()
            this.leituras = await this.obterLeiturasExistentes()
            localStorage.setItem('leituras', JSON.stringify(this.leituras))
        } else if (!localStorage.getItem('5-1') || !localStorage.getItem('10-1')) {
            return
        } else {
            this.leituras = JSON.parse(localStorage.getItem('leituras'))
        }

        [5, 10].map(qtddSelecionada => {
            let quantidadeExibidaPorPagina = Math.ceil(this.leituras.length / qtddSelecionada)
            for (let i = 0; i < quantidadeExibidaPorPagina; i++) {
                let offsetInicial = i * qtddSelecionada
                let offsetFinal = (i + 1) * qtddSelecionada
                let rangeDeLeitura = this.leituras.slice(offsetInicial, offsetFinal)
                localStorage.setItem(`${qtddSelecionada}-${i + 1}`, JSON.stringify(rangeDeLeitura))
            }
        })
    }

    criarListaDeLeituras(qtddParaMostrar) {
        let htmlString = ''
        const leiturasDivididasPorPaginaKeys = Object.keys(localStorage).filter(val => val.includes(`${qtddParaMostrar}`)).sort()
        const leiturasDestaPagina = JSON.parse(localStorage.getItem(`${leiturasDivididasPorPaginaKeys[0]}`))

        for (let { titulo, pagina } of leiturasDestaPagina) {
            htmlString += `<li class="list-group-item"><a href="${pagina}">${titulo}</a></li>`
        }
        this.container.innerHTML = htmlString
    }

    init() {
        this.selectElement.addEventListener('change', (e) => {
            this.qtddSelecionada = e.target.children[e.target.selectedIndex].value
            this.criarListaDeLeituras(this.qtddSelecionada)
        })

        this.qtddSelecionada = this.selectElement.children[this.selectElement.selectedIndex].value
        this.buildLeituraStorage()
        this.criarListaDeLeituras(this.qtddSelecionada)
    }
}

// Usage
const leituraManager = new LeituraManager()
window.addEventListener('load', () => {
    leituraManager.init()
})
