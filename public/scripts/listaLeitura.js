/**
 * Classe responsável pela gestão da leitura.
 * @class
 */
class LeituraManager {

    /**
 * Cria uma instância da classe LeituraManager.
 * @constructor
 */
    constructor() {
        this.selectElement = document.querySelector('select')
        this.container = document.querySelector('#lista-leituras')
        this.qtddSelecionada = null
        this.leituras = null
    }

    /**
     * Obtém as leituras existentes.
     * @public
     * @async
     * @returns {Promise.<Array.<Object>>} Leituras existentes.
     */
    async obterLeiturasExistentes() {
        const clubeId = window.location.toString().substring(window.location.toString().lastIndexOf('/')+1)

        try {
            const response = await fetch('/clube/leituras?clubeId='+clubeId)
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            const json = await response.json()
            return json
        } catch (err) {
            console.error(err)
        }
    }

    /**
     * Constrói o armazenamento de leituras.
     * @public
     * @async
     */
    async construirOArmazenamentoDeLeituras() {
        if (!sessionStorage.getItem('leituras')) {
            sessionStorage.clear()
            this.leituras = await this.obterLeiturasExistentes()
            sessionStorage.setItem('leituras', JSON.stringify(this.leituras))
        } else if (!sessionStorage.getItem('5-1') || !sessionStorage.getItem('10-1')) {
            return
        } else {
            this.leituras = JSON.parse(sessionStorage.getItem('leituras'))
        }

        [5, 10].map(qtddSelecionada => {
            let quantidadeExibidaPorPagina = Math.ceil(this.leituras.length / qtddSelecionada)
            for (let i = 0; i < quantidadeExibidaPorPagina; i++) {
                let offsetInicial = i * qtddSelecionada
                let offsetFinal = (i + 1) * qtddSelecionada
                let rangeDeLeitura = this.leituras.slice(offsetInicial, offsetFinal)
                sessionStorage.setItem(`${qtddSelecionada}-${i + 1}`, JSON.stringify(rangeDeLeitura))
            }
        })
    }

    /**
     * Cria a lista de leituras a ser exibida.
     * @public
     * @param {number} qtddParaMostrar - Quantidade de leituras a serem exibidas por página.
     */
    criarListaDeLeituras(qtddParaMostrar) {
        let htmlString = ''
        const leiturasDivididasPorPaginaKeys = Object
            .keys(sessionStorage)
            .filter(val => val.includes(`${qtddParaMostrar}`))
            .sort();
        const leiturasDestaPagina = JSON.parse(sessionStorage.getItem(`${leiturasDivididasPorPaginaKeys[0]}`))

        for (let { titulo, pagina } of leiturasDestaPagina) {
            htmlString += `<li class="list-group-item"><a href="${pagina}">${titulo}</a></li>`
        }
        this.container.innerHTML = htmlString
    }

    /**
     * Inicializa o gerenciador de leituras.
     * @public
     */
    init() {
        this.selectElement.addEventListener('change', (e) => {
            this.qtddSelecionada = e.target.children[e.target.selectedIndex].value
            this.criarListaDeLeituras(this.qtddSelecionada)
        })

        this.qtddSelecionada = this.selectElement.children[this.selectElement.selectedIndex].value
        this.construirOArmazenamentoDeLeituras()
        this.criarListaDeLeituras(this.qtddSelecionada)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LeituraManager().init()
})
