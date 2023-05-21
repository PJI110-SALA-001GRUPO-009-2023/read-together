/**
 * Enum que representa as Roles na Aplicação
 */
export const enum RoleEnum {
    ADMIN = 1,
    MEMBRO = 2
}

/**
 * Enum que representa HTTP Status Codes comumente utilizados (foco nesta aplicação)
 */
export const enum StatusCodes {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    MOVED_TEMPORARILY = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    REQUEST_TOO_LONG = 413,
    REQUEST_URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
}

export const enum DadosClubeERoleValidacaoInfo {
    CLUBE_NAO_EXISTE = 'CLUBE NAO ENCONTRADO',
    USUARIO_NAO_PARTICIPANTE = 'USUARIO NAO FAZ PARTE DESTE CLUBE'
}

export const enum DadosClubeERoleValidacaoCodes {
    CLUBE_NAO_EXISTE = 1,
    USUARIO_NAO_PARTICIPANTE = 2
}