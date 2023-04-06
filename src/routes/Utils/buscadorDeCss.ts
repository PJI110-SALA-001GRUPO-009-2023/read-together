import fileSystem from 'fs'
import path from 'path'

export default function pesquisarArquivosCSS(diretorioBase?: string): string[] {
    if (!diretorioBase) {
        return []
    }
    
    let nomes:string[] = []
    try {
        nomes = fileSystem.readdirSync(path.join(__dirname, `../../../public/css/${diretorioBase}`))
    } catch (err) {
        console.log(err)
    }
    return nomes
}
