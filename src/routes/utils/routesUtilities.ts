import { readdirSync } from 'fs'
import { join } from 'path'

const CSS_ROOT = join(__dirname, '..', '..', '..', 'public/css')

/**
 * Busca arquivos CSS em um diretório especificado.
 * @param {string} dir - O diretório a ser buscado. O padrão é uma string vazia.
 * @returns {string[]} Uma lista de nomes de arquivo CSS encontrados no diretório especificado.
*/
export function buscarCSS(view:string, dir = ''): string[] {
    const caminhoAbsolutoDoDiretorio = join(CSS_ROOT, dir)
    const conteudoDoDiretorio = readdirSync(caminhoAbsolutoDoDiretorio, { withFileTypes: true })
    const arquivosCSS = conteudoDoDiretorio
        .filter(conteudo => conteudo.isFile() &&
            conteudo.name.includes(view) &&
            !conteudo.name.includes('main') &&
            conteudo.name.includes('.css'))
        .map(file => file.name)
    return arquivosCSS
}
