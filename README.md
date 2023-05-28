# Read Together Server

Servidor da nossa aplicação. Tecnologias usadas:

- [Node (18.15.0 - LTS)](https://nodejs.org/en/download)
- NPM (9.5.0)
- ExpressJS (4.18)
- TypeScript (5.0)
- Prisma (4.12)

## Instalação

Primeiro realize o `git clone` :

```sh
git clone git@github.com:PJI110-SALA-001GRUPO-009-2023/read-together-server.git
```

Em seguida, acesse a raiz do projeto:

```sh
cd read-together-server
```

E rode a instalação:

```sh
npm install
```

Configure o arquivo `.env`, lembrando-se de especificar a variável `IS_DOCKER`
```js
IS_DOCKER='false' // para executar com docker, substituir false por true
```
gere o `PrismaClient`:
```sh
npx prisma generate
```

## Rodando a Aplicação (Desenvolvimento)

Para rodar a aplicação, na raiz do projeto:

```sh
npm run dev
```
## Rodando a Aplicação com Docker (Desenvolvimento)

Para rodar a aplicação utilizando docker, é necessário antes ter instalado
- Ou [Docker Engine](https://nodejs.org/en/download)
-- apenas para linux e mac
- Ou [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
-- para linux, mac e windows

#### Docker Engine
Para rodar utilizando Docker Engine, primeiro certifique-se de estar na pasta raiz do projeto (logo após o `git clone`).

Feito isso, execute o comando abaixo para construir a imagem da aplicação
```sh
sudo docker build \
    --no-cache -t \
    read-together-app:latest .
```

E depois execute o comando seguinte para "subir" a arquitetura de containeres e rodar o projeto
```sh
    docker compose up
```
> use "-d" caso queira executar como tarefa em background (para ter informações da execução, precisará usar o comando `docker compose logs´). 
Caso contrário, apenas não use a flag.
