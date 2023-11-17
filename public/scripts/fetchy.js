export default class Fetchy {
    url = ''

    constructor(baseUrl = null) {
        this.url = baseUrl
    }

    /**
    * Realiza um request GET.
    * @param {string} url - a URL para o request.
    * @returns {Promise<Response>}
    */
    async get(url) {
        const response = await fetch(url ?? this.baseUrl)
        return response
    }

    /**
    * Realiza um request POST.
    * @param {string} url - a URL para o request.
    * @param {Object} body - Os dados do corpo da solicitação.
    * @returns {Promise<Response>}
 */
    async post(url, body) {
        return this.#sendRequest('POST', url, body)
    }

    /**
     * Realiza um request PUT.
     * @param {string} url - a URL para o request.
     * @param {Object} body - Os dados do corpo da solicitação.
     * @returns {Promise<Response>}
     */
    async put(url, body) {
        return this.#sendRequest('PUT', url, body)
    }

    /**
     * envia o request HTTP.
     * @private
     * @param {string} method - o método HTTP.
     * @param {string} url - a URL para o request.
     * @param {Object} body - Os dados do corpo da solicitação.
     * @returns {Promise<Response>}
     */
    async #sendRequest(method, body, url = null) {
        const headers = { 'Content-Type': 'application/json' }

        const response = await fetch(url ?? this.baseUrl, {
            method: method,
            headers: headers,
            body: JSON.stringify(body),
        })

        return response
    }
}