import * as config from '../config'
import { EmailClient, EmailMessage, KnownEmailSendStatus } from '@azure/communication-email'
import { AzureKeyCredential } from '@azure/core-auth'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import logger from '../logger'
import jwtServiceInstance from './jwtService'

class EmailService {
    #emailClient: EmailClient
    #POLLER_TEMPO_ESPERA: number
    #dominioEmailApp: string
    #azureEmailCommsEndpoint: string
    #azureEmailCommsKey: AzureKeyCredential

    constructor() {
        this.#azureEmailCommsEndpoint = config.ENDPOINT_AZURE_EMAIL_COMMUNICATION_SERVICE
        this.#azureEmailCommsKey = new AzureKeyCredential(config.CHAVE_AZURE_EMAIL_COMMUNICATION_SERVICE)
        this.#emailClient = new EmailClient(this.#azureEmailCommsEndpoint, this.#azureEmailCommsKey)
        this.#POLLER_TEMPO_ESPERA = 10
        this.#dominioEmailApp = config.DOMINIO_AZURE_EMAIL_COMMUNICATION_SERVICE
    }

    #obterTemplateEmailHtmlPreenchidoComVariaveis(
        nomeClube: string,
        nomeRemetente: string,
        idClube: number,
        idUsuarioRemetente: number,
        emailUsuarioRemetente: string,
        host: string,
        emailDestinatario: string
    ): string {
        const htmlBase = readFileSync(
            resolve('views', 'templates', 'convite-email.min.html'),
            { encoding: 'utf8' }
        )

        const jwtToken = jwtServiceInstance.sign({ idClube, idUsuarioRemetente, emailUsuarioRemetente, emailConvidado: emailDestinatario }, )
        const endpoint = host + '/usuario/cadastro/convite'

        const htmlDefinitivo = htmlBase
            .replace('${nome_clube}', nomeClube)
            .replace('${nome_remetente}', nomeRemetente)
            .replace('${nome_destinatario}', 'Leitor')
            .replace('${link}', `${endpoint}?token=${jwtToken}`)
        return htmlDefinitivo
    }

    #contruirConteudoEmail(
        nomeClube: string,
        nomeRemetente: string,
        emailDestinatario: string,
        idClube: number,
        idUsuarioRemetente: number,
        emailUsuarioRemetente: string,
        host: string): EmailMessage {
        const message: EmailMessage = {
            senderAddress: this.#dominioEmailApp,
            content: {
                subject: 'Convite para Participar do Clube do Livro',
                html: this.#obterTemplateEmailHtmlPreenchidoComVariaveis(
                    nomeClube,
                    nomeRemetente,
                    idClube,
                    idUsuarioRemetente,
                    emailUsuarioRemetente,
                    host,
                    emailDestinatario)
            },
            recipients: {
                to: [{
                    address: `<${emailDestinatario}>`,
                    displayName: 'DoNotReply'
                }]
            }
        }
        return message
    }

    async enviarEmailDeConvite(
        nomeClube: string,
        nomeRemetente: string,
        emailDestinatario: string,
        idClube: number,
        idUsuarioRemetente: number,
        emailUsuarioRemetente: string,
        host: string) {
        try {
            const mensagemEmail = this.#contruirConteudoEmail(
                nomeClube,
                nomeRemetente,
                emailDestinatario,
                idClube,
                idUsuarioRemetente,
                emailUsuarioRemetente,
                host)
            const poller = await this.#emailClient.beginSend(mensagemEmail)
            if (!poller.getOperationState().isStarted) {
                throw new Error('Email send polling in progress')
            }

            let tempoDecorrido = 0
            while (!poller.isDone()) {
                poller.poll()
                console.log('Envio de e-mail em progresso')

                await new Promise(resolve => setTimeout(resolve, this.#POLLER_TEMPO_ESPERA * 1000))
                tempoDecorrido += 10

                if (tempoDecorrido > 18 * this.#POLLER_TEMPO_ESPERA) {
                    logger.error('Envio de e-mail demorou demais...')
                    return
                }
            }

            if (poller.getResult()?.status === KnownEmailSendStatus.Succeeded) {
                console.log('email enviado!')
            } else {
                console.error(poller.getResult()?.error)
            }
        } catch (e) {
            console.error(e)
        }
    }
}

/**
 * Instância Global EmailService
 */
const emailServiceInstance: EmailService = new EmailService()

export default emailServiceInstance