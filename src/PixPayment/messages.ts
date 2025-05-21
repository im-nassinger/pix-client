import { type PaymentStatusObject, PaymentStatusType } from './types.js';

export const PixPaymentErrorMessages = {
    InvalidResponse: 'Resposta inválida do Mercado Pago.',
    FailedToGetStatus: 'Falha ao obter status do pagamento.',
    FailedToUpdateStatus: 'Falha ao atualizar status do pagamento.',
    FailedToExpirePayment: 'Falha ao expirar pagamento.',
    FailedToCancelPayment: 'Falha ao cancelar pagamento.',
    CanNotGetStatusWithoutId: 'Não é possível obter o status de um pagamento que não foi gerado.',
    CanNotCancelPaymentWithoutId: 'Não é possível cancelar um pagamento que não foi gerado.',
    CanNotCancelCompletePayment: 'Não é possível cancelar um pagamento que já foi concluído.',
} as const;

export const PixPaymentWarningMessages = {
    WebhookNotReady:
        'Este primeiro pagamento levará um pouco mais de tempo para ser gerado devido à inicialização do webhook.\n' +
        'Considere usar o método "<PixClient>.webhook.listen()" antes de gerar pagamentos para agilizar o processo.',
} as const;

export const PixPaymentStatusMessages = {
    pending: {
        type: 'pending',
        title: 'Aguardando',
        description: 'O usuário ainda não concluiu o processo de pagamento...'
    },
    approved: {
        type: 'approved',
        title: 'Aprovado',
        description: 'O pagamento foi aprovado e creditado com sucesso.'
    },
    authorized: {
        type: 'authorized',
        title: 'Autorizado',
        description: 'O pagamento foi autorizado, mas ainda não foi capturado.'
    },
    in_process: {
        type: 'in_process',
        title: 'Em Análise',
        description: 'O pagamento está em análise.'
    },
    in_mediation: {
        type: 'in_mediation',
        title: 'Em Mediação',
        description: 'O usuário iniciou uma disputa.'
    },
    rejected: {
        type: 'rejected',
        title: 'Rejeitado',
        description: 'O pagamento foi rejeitado (o usuário pode tentar pagar novamente).'
    },
    cancelled: {
        type: 'cancelled',
        title: 'Cancelado',
        description: 'O pagamento foi cancelado por uma das partes ou expirou.'
    },
    refunded: {
        type: 'refunded',
        title: 'Reembolsado',
        description: 'O pagamento foi reembolsado ao usuário.'
    },
    charged_back: {
        type: 'charged_back',
        title: 'Estornado',
        description: 'Um chargeback foi aplicado no cartão de crédito do comprador.'
    }
} as const satisfies Record<PaymentStatusType, PaymentStatusObject>;