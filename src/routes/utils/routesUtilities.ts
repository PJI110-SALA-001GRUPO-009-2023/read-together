import { readdirSync } from 'fs'
import { dirname, join } from 'path'

const PROJECT_ROOT = dirname(dirname(dirname(__dirname))) // volta 3 diretórios na hierarquia "../../.." e captura pra dentro da variável o caminho absotulo resultante => a raiz do projeto.
const CSS_ROOT = join(PROJECT_ROOT, 'public/css')

/**
 * Busca arquivos CSS em um diretório especificado.
 * @param {string} dir - O diretório a ser buscado. O padrão é uma string vazia.
 * @returns {string[]} Uma lista de nomes de arquivo CSS encontrados no diretório especificado.
*/
export function buscarCSS(dir = ''): string[] {
    const caminhoAbsolutoDoDiretorio = join(CSS_ROOT, dir)
    const conteudoDoDiretorio = readdirSync(caminhoAbsolutoDoDiretorio, { withFileTypes: true })
    const arquivosCSS = conteudoDoDiretorio
        .filter(conteudo => conteudo.isFile() &&
            !conteudo.name.includes('main') &&
            conteudo.name.includes('.css'))
        .map(file => file.name)
    return arquivosCSS
}
