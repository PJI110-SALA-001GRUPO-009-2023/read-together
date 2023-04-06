import { Response } from 'express'
import pesquisarArquivosCSS from './buscadorDeCss'

/**
 * Definição das opcoes de renderização.
 *
 * @prop {string} titulo => Obrigatório.
 * @prop {string? | null} diretorioBase => Opcional.
 * @prop {string[]?} cssCustomizados => Opcional.
 */
interface IOpcoesDeRenderizacao {
    titulo: string,
    diretorioBase?: string | null,
    cssCustomizados?: string[]
}

/**
 * Lida com a renderização de páginas .html
 * 
 * @param {Response} res Objeto response (res) do Express.
 * @param {string} view Nome da view/página .html a ser renderizada.
 * @param {string} titulo Texto a ser exibido como \<title\> da página.
 */
const renderCustomizado = function customRender(res: Response, view: string, titulo: string): void {
    const _diretorioBase = extrairDiretorioBase(view)
    const opcoesRenderizacao: IOpcoesDeRenderizacao = {
        titulo: titulo,
        diretorioBase: _diretorioBase,
        cssCustomizados: pesquisarArquivosCSS(_diretorioBase)
    }
    res.render(view, opcoesRenderizacao)
}

function extrairDiretorioBase(view?: string): string | undefined {
    if (!view) {
        return undefined
    } else {
        return view.split('/')[0]
    }
}


export default renderCustomizado