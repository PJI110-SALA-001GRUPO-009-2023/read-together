/**
 * Classe para editar informações de um card.
 * @class
 */
class EditorInformacoesCard {
    #conteudoInicial
    #conteudoEditado
    #btnEdicao
    #btnCancelar
    #btnSalvar
    #itensEditaveis
    #mapeamentoElementoDominio

    /**
     * Cria uma instância da classe EditorInformacoesCard.
     * @constructor
     */
    constructor() {
        this.#btnEdicao = document.querySelector('button#btn-edicao:has(i.gear-icon)')
        this.#btnCancelar = document.querySelector('button#btn-edicao-cancelar')
        this.#btnSalvar = document.querySelector('button#btn-edicao-salvar')
        this.#itensEditaveis = document.querySelectorAll('.can-edit')
        this.#mapeamentoElementoDominio = this.#obterMapeamentoElementosDominio()
        console.log(this.#mapeamentoElementoDominio)

        this.#btnEdicao.addEventListener('click', this.#iniciarEdicao.bind(this))
        this.#btnCancelar.addEventListener('click', this.#cancelarEdicao.bind(this))
        this.#btnSalvar.addEventListener('click', this.#salvarEdicao.bind(this))
    }

    /**
     * Contrói o objeto de mapeamento entre elementos HTML e membros da entidate
     * @private
     * @param {Object} estadoPrimario
     * @returns {Object.<string, string>} Estado do card.
     */
    #obterMapeamentoElementosDominio() {
        const tagLogs = {}
        this.#itensEditaveis.forEach((el) => {
            const item = el.dataset.name
            let tagName = el.tagName
            let tagCounter = 0
            let objKey = tagName + tagCounter

            if (item) {
                while (tagLogs[objKey]) {
                    tagCounter++
                    objKey = tagName + tagCounter
                }

                tagLogs[objKey] = item
            }
        })
        return tagLogs
    }

    /**
     * Captura o estado atual do card.
     * @private
     * @returns {Object.<string, Array.<HTMLElement>>} Estado do card.
     */
    #capturarEstadoDoCard() {
        /**
         * @type {Object}.
         */
        const result = {}

        this.#itensEditaveis.forEach((element) => {
            /** * @type {string} */
            const tagName = element.tagName

            /** * @type {HTMLElement} */
            const cloneDoElemento = element.cloneNode(true)

            if (!result[tagName]) {
                result[tagName] = []
            }

            result[tagName].push(cloneDoElemento)
        })

        return result
    }

    /**
     * Inicia o modo de edição.
     * @private
     */
    #iniciarEdicao() {
        const iElement = this.#btnEdicao.querySelector('i')
        if (iElement.classList.contains('gear-icon-active')) {
            return
        }

        iElement.classList.replace('gear-icon', 'gear-icon-active')
        this.#conteudoInicial = this.#capturarEstadoDoCard()

        this.#itensEditaveis.forEach(element => {
            if (element.tagName !== 'IMG') {
                element.classList.toggle('editavel')
                element.setAttribute('contenteditable', 'true')
            } else {
                document.querySelector('.overview-pagina i.representante-edicao').classList.toggle('editavel')
            }
        })

        this.#toggleUtilidadeLerMais()
        this.#btnCancelar.classList.remove('d-none')
        this.#btnSalvar.classList.remove('d-none')
    }

    /**
     * Alterna a utilidade "Ler mais".
     * @private
     */
    #toggleUtilidadeLerMais() {
        const lerMaisFunc = document.querySelector('.overview-pagina .btn-ler-mais')
        lerMaisFunc?.classList.toggle('d-none')
        lerMaisFunc?.previousElementSibling.classList.remove('text-truncate')
    }

    /**
     * Cancela a edição e restaura o estado inicial.
     * @private
     */
    #cancelarEdicao() {
        this.#restaurarEstadoInicial()
        this.#atualizarInterfaceEdicao(false)
        this.#toggleRepresentanteEdicao()
        this.#toggleBtnLerMais()
    }

    /**
     * Restaura o estado inicial dos elementos editáveis.
     * @private
     */
    #restaurarEstadoInicial() {
        this.#itensEditaveis.forEach(element => {
            const elementoNoEstadoInicial = this.#obterElementoNoEstadoInicial(element.tagName)
            element.replaceWith(elementoNoEstadoInicial)
        })
    }

    /**
     * Obtém o elemento no estado inicial com base em sua tag.
     * @private
     * @param {string} tagName - A tag do elemento.
     * @returns {Element} O elemento no estado inicial.
     */
    #obterElementoNoEstadoInicial(tagName) {
        return this.#conteudoInicial[tagName]?.shift() || this.#conteudoInicial[tagName]
    }

    /**
     * Atualiza a interface de edição.
     * @private
     * @param {boolean} emEdicao - Indica se a edição está ativada ou desativada.
     */
    #atualizarInterfaceEdicao(emEdicao) {
        this.#btnEdicao.querySelector('i').classList.replace('gear-icon-active', 'gear-icon')
        this.#btnCancelar.classList.toggle('d-none', !emEdicao)
        this.#btnSalvar.classList.toggle('d-none', !emEdicao)
    }

    /**
     * Alterna a classe 'editavel' no representante de edição.
     * @private
     */
    #toggleRepresentanteEdicao() {
        document.querySelector('.overview-pagina i.representante-edicao').classList.toggle('editavel')
    }

    /**
     * Alterna a classe 'd-none' no botão 'btn-ler-mais'.
     * @private
     */
    #toggleBtnLerMais() {
        const btnLerMais = document.querySelector('.overview-pagina .btn-ler-mais')
        if (btnLerMais) {
            btnLerMais.classList.toggle('d-none')
        }
    }


    /**
     * Obtém os conteúdos em texto do card.
     * @private
     * @param {Object.<string, Array.<HTMLElement>>} estadoDoCard - Estado atual do card.
     * @returns {Object.<string, Array.<string>>} Conteúdos em texto do card.
     */
    #obterConteudosEmTextoDoCard(estadoDoCard) {
        return Object.entries(estadoDoCard).reduce((result, [key, value]) => {
            result[key] = value?.map(element => {
                let content = element.textContent.trim()
                return content.includes('\n') ? content.match(/(?:https?:\/\/)?([^\s]+)/g) : content
            })
            return result
        }, {})
    }

    /**
     * Encontra as diferenças entre dois objetos.
     * @private
     * @param {Object} obj1 - Primeiro objeto a ser comparado.
     * @param {Object} obj2 - Segundo objeto a ser comparado.
     * @returns {Array.<Array.<string, number>>} Diferenças encontradas.
     */
    #encontrarDiferencas(obj1, obj2) {
        const differences = []

        // Recursive comparison function
        function compareProperties(prop1, prop2, path) {
            // Check if both properties are objects
            if (typeof prop1 === 'object' && typeof prop2 === 'object') {
                // Check if both properties are null
                if (prop1 === null && prop2 === null) {
                    return
                }

                // Check if both properties have the same keys
                const keys1 = Object.keys(prop1)
                const keys2 = Object.keys(prop2)
                const allKeys = new Set([...keys1, ...keys2])

                allKeys.forEach(key => {
                    const newPath = path ? `${path}.${key}` : key
                    compareProperties(prop1[key], prop2[key], newPath)
                })
            } else if (prop1 !== prop2) {
                differences.push(path)
            }
        }

        compareProperties(obj1, obj2, '')

        return differences.map(x => [x.split('.')[0], Number(x.split('.')[1])])
    }

    #obterFatorEscalaParaAlturaAlvo(alturaImagem, alturaAlvo) {
        const fatorCalculadoArredondado = Math.floor(( alturaAlvo * 100 ) / alturaImagem)
        const fatorEmPorcentagem = fatorCalculadoArredondado / 100
        return fatorEmPorcentagem
    }

    /**
     * Converts an image to base64 and returns a JSON object with the representation.
     * @param {number} id - The ID of the main entity on the page (club | user).
     * @returns {Promise<Base64Image>} A promise that resolves to a JSON object with a base64-encoded image.
     * @throws {Error} Throws an error if no file is selected or the file exceeds 7MB.
     */
    #transformarImagemEmBase64() {
        return new Promise((resolve, reject) => {
            const response = { temImagem: false, tamanhoPermitido: false, base64: null }
            try {
                const inputImgElemento = document.querySelector('input#imageUpload')

                if (inputImgElemento.files.length === 0) {
                    resolve(response)
                } else if ((inputImgElemento.files[0].size / (1024 * 1024)) > 7) {
                    response.temImagem = true
                    response.tamanhoPermitido = false
                    resolve(response)
                }

                response.tamanhoPermitido = true
                response.temImagem = true

                const fr = new FileReader()
                fr.readAsDataURL(inputImgElemento.files[0])

                fr.addEventListener('load', (e) => {
                    const novaImg = new Image()
                    novaImg.src = e.target.result
                    novaImg.onload = (e) => {
                        const canvas = document.createElement('canvas')
                        const FATOR_ESCALA = this.#obterFatorEscalaParaAlturaAlvo(e.target.height, 600)

                        canvas.height = e.target.height * FATOR_ESCALA
                        canvas.width = e.target.width * FATOR_ESCALA

                        const ctx = canvas.getContext('2d')
                        ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height)

                        response.base64 = canvas.toDataURL()
                        resolve(response)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
 * Salva as alterações realizadas.
 * @private
 */
    async #salvarEdicao() {
        try {

            const id = this.#obterIdDoCard()
            this.#conteudoEditado = this.#capturarEstadoDoCard()
            const jsonEnvioImagem = await this.#transformarImagemEmBase64()
            console.log('a')

            const editados = this.#obterConteudosEmTextoDoCard(this.#conteudoEditado)
            const originais = this.#obterConteudosEmTextoDoCard(this.#conteudoInicial)
            const diferenca = this.#encontrarDiferencas(originais, editados)

            const modificadoesTextuaisMapeadas = await this.#mapearModificacoesTextuais(diferenca, editados)
            let jsonModificacoesTextuais = { ...modificadoesTextuaisMapeadas }

            const [resImg, resText] = await Promise.all([jsonEnvioImagem, jsonModificacoesTextuais])
            let body = { id: id }
            body.base64 = resImg.base64
            body = { ...body, ...resText }

            console.log(body)
            const response = await fetch('./edicao-conteudo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            const jsonResponse = await response.json()
            console.log(jsonResponse)

            this.#atualizarInterfaceEdicao(false)
            this.#toggleRepresentanteEdicao()


        } catch (error) {
            this.#atualizarInterfaceEdicao(false)
            this.#toggleRepresentanteEdicao()
            console.error(error)
        }
    }

    /**
     * Obtém o ID da entidate principal da página.
     * @private
     * @returns {number} O ID da entidate (clube ou usuario).
     */
    #obterIdDoCard() {
        return Number(document.querySelector('input[name^=id]').value)
    }

    /**
     * Mapeia as modificações textuais.
     * @private
     * @param {Array} diferenca - A diferença entre os conteúdos originais e editados.
     * @param {Object} editados - Os conteúdos editados do card.
     * @returns {Object} As modificações textuais mapeadas.
     */
    #mapearModificacoesTextuais(diferenca, editados) {
        return new Promise((resolve, reject) => {
            try {
                const modificadoesTextuaisMapeadas = {}
                for (let [key, pos] of diferenca) {
                    modificadoesTextuaisMapeadas[this.#mapeamentoElementoDominio[`${key}${pos}`]] = '' + editados[key][pos]
                }
                resolve(modificadoesTextuaisMapeadas)
            } catch (error) {
                reject(error)
            }
        })
    }
}

document.addEventListener('DOMContentLoaded', (e) => {
    const editor = new EditorInformacoesCard()
})