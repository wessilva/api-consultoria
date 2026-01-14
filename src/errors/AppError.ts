import { error } from "console";

export class AppError extends Error {
  constructor(
    public message: string,          // Mensagem do erro
    public statusCode: number = 400, // Código HTTP (padrão: 400)
    public code?: string             // Código interno opcional
  ) {
    super(message);
    
    // Define o nome da classe como nome do erro
    // Exemplo: se for ValidationError, this.name = "ValidationError"
    this.name = this.constructor.name;
    
    // Captura o stack trace para facilitar debug
    // Remove a própria classe do stack, mostrando apenas onde o erro foi lançado
    Error.captureStackTrace(this, this.constructor);
  }

  // Método para serializar o erro em JSON
  // Útil quando enviamos o erro na resposta HTTP
  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Dados inválidos', 
    public errors?: any // Detalhes dos erros de validação (opcional)
  ) {
    super(message, 400, 'VALIDATION_ERROR');
  }

  // Sobrescreve toJSON para incluir os detalhes dos erros
  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      errors: this.errors, // Lista de erros específicos por campo
    };
  }
}

/**
 * UnauthorizedError - 401 Unauthorized
 * Usado quando o usuário não está autenticado (não fez login)
 * 
 * Quando usar:
 * - Token não foi fornecido
 * - Token é inválido ou expirado
 * - Credenciais (email/senha) estão incorretas
 * 
 * Exemplo: throw new UnauthorizedError('Token inválido');
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * ForbiddenError - 403 Forbidden
 * Usado quando o usuário está autenticado, mas não tem permissão
 * 
 * Diferença entre 401 e 403:
 * - 401: Você não está logado (precisa fazer login)
 * - 403: Você está logado, mas não pode acessar isso (falta permissão)
 * 
 * Exemplo: Usuário comum tentando acessar rota de administrador
 * throw new ForbiddenError('Apenas administradores podem acessar');
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * NotFoundError - 404 Not Found
 * Usado quando um recurso solicitado não existe no banco de dados
 * 
 * Quando usar:
 * - Buscar usuário por ID que não existe
 * - Buscar attendance card que não existe
 * - Buscar qualquer recurso que deveria existir mas não foi encontrado
 * 
 * Exemplo: throw new NotFoundError('Usuário não encontrado');
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * ConflictError - 409 Conflict
 * Usado quando há conflito de dados (violação de constraint UNIQUE)
 * 
 * Quando usar:
 * - Email já cadastrado (unique constraint)
 * - CPF duplicado
 * - Qualquer tentativa de criar recurso que viola regra de unicidade
 * 
 * Exemplo: throw new ConflictError('Email já cadastrado');
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflito de dados') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * InternalServerError - 500 Internal Server Error
 * Usado para erros inesperados do servidor
 * 
 * Quando usar:
 * - Erro inesperado que você não sabe como tratar
 * - Falha ao conectar no banco de dados
 * - Falha em serviço externo (API de terceiros)
 * - Qualquer erro não previsto
 * 
 * Exemplo: throw new InternalServerError('Falha ao processar pagamento');
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Erro interno do servidor') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

