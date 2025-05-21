import { PixPaymentStatusMessages } from './messages.js';

export interface PixPaymentOptions {
    description?: string | undefined;
    transactionAmount: number;
    durationMinutes?: number;
    payerEmail?: string;
}

export const PaymentStatusType = [
    'pending',
    'approved',
    'authorized',
    'in_process',
    'in_mediation',
    'rejected',
    'cancelled',
    'refunded',
    'charged_back'
] as const;

export type PaymentStatusType = (typeof PaymentStatusType)[number];

export type PaymentEvents = { [key in PaymentStatusType]: [] } & {
    paid: [];
    expired: [];
    status: [typeof PixPaymentStatusMessages[keyof typeof PixPaymentStatusMessages]];
}

export interface PaymentStatusObject {
    type: PaymentStatusType;
    title: string;
    description: string;
};