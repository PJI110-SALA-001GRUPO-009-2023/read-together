import { Prisma, Usuario, Clube, Livro, GeneroLivro, Leitura } from '@prisma/client'

export type LeituraDadosCriar = Omit<Prisma.LeituraCreateInput, 'livro' | 'clube'>
export type PostagemDadosCriar = Omit<Prisma.PostagemCreateInput, 'leitura' | 'usuario'>

/**
 * Seleciona as propriedades K, como exigidos (required), de um tipo T. Demais propriedades
 * ficam como opcionais. Pode ser usado em casos que deseja apenas algumas propriedades 
 * enquanto ignora o restante sem filtrá-las.
 * 
 * @param K chaves
 * @param T tipo
 */
export type PropsExigidosOutrasOpcional<T, K extends keyof T> = Pick<T, K> & Partial<T>
export type UsuarioDadosPK = PropsExigidosOutrasOpcional<Usuario, 'idUsuario'>
export type GeneroLivroDadosPK = PropsExigidosOutrasOpcional<GeneroLivro, 'codGenero'>
export type ClubeDadosPK = PropsExigidosOutrasOpcional<Clube, 'idClube'>
export type LivroDadosPK = PropsExigidosOutrasOpcional<Livro, 'isbn'>
export type LeituraDadosPK = PropsExigidosOutrasOpcional<Leitura, 'idLeitura'>
