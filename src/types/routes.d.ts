export interface ClubeRequestParams {
    idClube: number
}

export type RequestDadosOpcionaisDe<T> = {
    [Property in keyof T]?: string
}

export type RequestDadosDe<T> = {
    [Property in keyof T]: string
}

export interface UsuarioRequestParams {
    idUsuario: number
}

export interface ViewOptionsInterface {
    titulo: string,
    diretorioBase: string,
    cssCustomizados: string[],
    layout: string | undefined
}