import { adicionarToggleATodosOsBotoes } from './lerMaisUtility.js'

const btnEdicao = document.querySelector('button#btn-edicao:has(i.gear-icon)')
const btnCancelar = document.querySelector('button#btn-edicao-cancelar')
const btnSalvar = document.querySelector('button#btn-edicao-salvar')
const figureBackup = document.querySelector('figure#overview-figure').cloneNode(true)
const sectionBackup = document.querySelector('section#overview-section').cloneNode(true)
let estadoInicial = {}, estadoEditado = {}

window.addEventListener('DOMContentLoaded', (e) => {
    const elementosEditaveis = new ElementosEditaveis()

    btnEdicao.addEventListener('click', (e) => {
        elementosEditaveis.habilitarEdicao()
    })

    btnCancelar.addEventListener('click', (e) => {
        elementosEditaveis.reverterAlteracoes()
    })

    btnSalvar.addEventListener('click', (e) => {
        elementosEditaveis.realizarEnvio()
    })

})

class OperacoesBaseElementos {
    toggleUtilidadeLerMais() {
        const lerMaisFunc = document.querySelector('.overview-pagina .btn-ler-mais')
        lerMaisFunc?.classList.toggle('d-none')
        lerMaisFunc?.previousElementSibling.classList.remove('text-truncate')
    }
    contentEditableFalse(elemento) {
        elemento.setAttribute('contenteditable', 'false')
    }
    contentEditableTrue(elemento) {
        elemento.setAttribute('contenteditable', 'true')
    }
    toggleClasseCSS(elemento, classAntiga, classNova = null) {
        if (elemento.classList.contains(classAntiga)) {
            elemento.classList.replace(classAntiga, classNova)
        } else if (elemento.classList.contains(classNova)) {
            elemento.classList.replace(classNova, classAntiga)
        }
    }
}

class ElementosEditaveis extends OperacoesBaseElementos {
    #elementos
    #estadoInicial = {}
    #estadoEditado = {}

    constructor() {
        super()
        this.#elementos = document.querySelectorAll('.can-edit')
        this.#estadoInicial = this.obterEstado(this.#elementos)
    }


    obterEstado(htmlCollection) {
        const resultado = {}
        htmlCollection.forEach(el => {
            if (el.tagName === 'IMG') {
                return
            }

            if (el.dataset.name !== 'redesSociais')
                resultado[el.dataset.name] = el.textContent.trim()
            else
                resultado[el.dataset.name] = el.textContent.trim().replace(/\s+/g, ',').replace(/,+/g, ',')
        })
        return resultado
    }

    asArray() {
        return Array.from(this.#elementos)
    }

    habilitarEdicao() {
        const i = btnEdicao.querySelector('i')
        if (i.classList.contains('gear-icon-active')) {
            return
        }
        this.toggleClasseCSS(i, 'gear-icon', 'gear-icon-active')

        this.#elementos.forEach(elEdit => {
            if (elEdit.tagName !== 'IMG') {
                this.toggleClasseCSS(elEdit, 'editavel', '')
                this.contentEditableTrue(elEdit)
            } else {
                const iconeLapisEdicao = document.querySelector('label[for=imageUpload] i.representante-edicao')
                iconeLapisEdicao.classList.toggle('editavel')
            }
        })

        this.toggleUtilidadeLerMais()
        this.toggleClasseCSS(btnSalvar, 'd-none')
        this.toggleClasseCSS(btnCancelar, 'd-none')
    }

    reverterAlteracoes() {
        this.toggleClasseCSS(btnCancelar, null, 'd-none')
        this.toggleClasseCSS(btnSalvar, null, 'd-none')
        this.toggleClasseCSS(btnEdicao.querySelector('i'), 'gear-icon-active', 'gear-icon')
        document.querySelector('figure#overview-figure').replaceWith(figureBackup)
        document.querySelector('section#overview-section').replaceWith(sectionBackup)
        adicionarToggleATodosOsBotoes()
    }

    compararOsEstados(objAntes, objDepois) {
        const keys1 = Object.keys(objAntes)
        const keys2 = Object.keys(objDepois)
        const diferencas = {}

        for (let key of keys1) {
            if (objAntes[key] !== objDepois[key]) {
                diferencas[key] = [objAntes[key], objDepois[key]]
            }
        }

        return diferencas
    }

    obterFatorEscalaParaAlturaAlvo(alturaImagem, alturaAlvo) {
        const fatorCalculadoArredondado = Math.floor((alturaAlvo * 100) / alturaImagem)
        const fatorEmPorcentagem = fatorCalculadoArredondado / 100
        return fatorEmPorcentagem
    }

    transformarImagemEmBase64() {
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
                        const FATOR_ESCALA = this.obterFatorEscalaParaAlturaAlvo(e.target.height, 600)

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

    obterModificacoes(objDiferenca) {
        return new Promise((resolve, reject) => {
            try {
                const modificados = {}
                for (let campo in objDiferenca) {
                    let [, depois] = objDiferenca[campo]
                    modificados[campo] = depois
                }
                resolve(modificados)
            } catch (error) {
                reject(error)
            }
        })
    }

    async realizarEnvio() {
        try {
            const id = Number(document.querySelector('input[name^=id]').value)
            this.#estadoEditado = this.obterEstado(document.querySelectorAll('.can-edit'))
            const imagemBase64 = await this.transformarImagemEmBase64()
            const diferencasEntreOsEstados = this.compararOsEstados(this.#estadoInicial, this.#estadoEditado)

            if (!diferencasEntreOsEstados) {
                this.reverterAlteracoes()
                return
            }

            const conteudoModificado = await this.obterModificacoes(diferencasEntreOsEstados)

            document.body.style.cursor = 'wait'
            
            const [resImg, resText] = await Promise.all([imagemBase64, conteudoModificado])

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
            const responseObject = await response
            if (responseObject.status === 200) {

                setTimeout(() => location.reload(), 1000)
            }

        } catch (err) {
            console.error(err)
        }
    }
}