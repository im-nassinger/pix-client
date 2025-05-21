export const PixWebhookErrorMessages = {
    FailedToStartNgrok: 'Não foi possível iniciar o ngrok, talvez o token esteja inválido.\nAcesse https://dashboard.ngrok.com/get-started/your-authtoken',
    FailedToStartServer: 'Não foi possível iniciar o servidor',
    FailedToStartWebhook: 'Não foi possível iniciar o webhook',
    InvalidRequest: 'Requisição inválida recebida',
    FailedToProcessRequest: 'Falha ao processar requisição',
    InvalidRequestBody: 'Corpo da requisição inválido'
} as const;

export const PixWebhookWarningMessages = {
    IgnoringInvalidRequest: 'Ignorando requisição inválida do Mercado Pago',
    WebhookPooling: 'Ngrok não configurado, o webhook está em modo de pooling (verificação periódica).'
} as const;