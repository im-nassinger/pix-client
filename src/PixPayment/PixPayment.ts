import { randomUUID } from 'crypto';
import EventEmitter from 'events';
import { Payment } from 'mercadopago';
import { PixClient } from '../PixClient/index.js';
import { PixError } from '../PixError/index.js';
import { QRCode } from '../QRCode/index.js';
import { PixPaymentErrorMessages, PixPaymentStatusMessages, PixPaymentWarningMessages } from './messages.js';
import { PaymentStatusType, type PaymentEvents, type PixPaymentOptions } from './types.js';

export class PixPayment extends EventEmitter<PaymentEvents> {
    pixClient: PixClient;
    mpPayment: Payment;
    description: string | undefined;
    transactionAmount: number;
    durationMinutes: number;
    payerEmail: string;
    status: PaymentStatusType;
    id: string | null = null;
    qrCode: QRCode = new QRCode({ content: '', base64: '' });
    webhookCallback: ((id?: string) => void) | null = null;
    expireTimeout?: ReturnType<typeof setTimeout> | null = null;

    constructor(pixClient: PixClient, options: PixPaymentOptions) {
        super();

        this.pixClient = pixClient;
        this.mpPayment = new Payment(pixClient.mpConfig);
        this.description = options.description;
        this.transactionAmount = options.transactionAmount;
        this.durationMinutes = options.durationMinutes || 60;
        this.payerEmail = options.payerEmail || 'a@b.co';
        this.status = 'pending';
    }

    get isComplete() {
        return (
            this.status === 'approved' ||
            this.status === 'cancelled'
        );
    }

    get statusObject() {
        return PixPaymentStatusMessages[this.status];
    }

    async generate() {
        if (!this.pixClient.webhook.isReady) {
            console.warn(PixPaymentWarningMessages.WebhookNotReady);

            await this.pixClient.webhook.listen();
        }

        const response = await this.mpPayment.create({
            body: {
                payment_method_id: 'pix',
                transaction_amount: this.transactionAmount,
                notification_url: this.pixClient.webhook.ngrokUrl ?? undefined,
                payer: { email: this.payerEmail }
            },
            requestOptions: {
                idempotencyKey: randomUUID()
            }
        });

        const data = response.point_of_interaction?.transaction_data;

        if (!data || !response.id) {
            throw new PixError(PixPaymentErrorMessages.InvalidResponse);
        }

        const qrCode = data.qr_code;
        const qrCodeBase64 = data.qr_code_base64;

        if (!qrCode || !qrCodeBase64) {
            throw new PixError(PixPaymentErrorMessages.InvalidResponse);
        }

        this.id = response.id.toString();
        this.qrCode.content = qrCode;
        this.qrCode.image.base64 = qrCodeBase64;

        this.addWebhookListener();
        this.startExpirationTimeout();

        return this;
    }

    addWebhookListener() {
        if (this.webhookCallback) return;

        this.webhookCallback = (id?: string) => {
            if (!id || id === this.id) this.updateStatus();
        };

        this.pixClient.webhook.on('update', this.webhookCallback);
    }

    removeWebhookListener() {
        if (!this.webhookCallback) return;

        this.pixClient.webhook.off('update', this.webhookCallback);

        this.webhookCallback = null;
    }

    startExpirationTimeout() {
        const durationMs = this.durationMinutes * 60 * 1000;

        this.expireTimeout = setTimeout(async () => {
            if (this.isComplete) return;

            try {
                await this.cancel();

                this.emit('expired');
            } catch (error) {
                throw new PixError(PixPaymentErrorMessages.FailedToExpirePayment, error);
            }
        }, durationMs);
    }

    async updateStatus() {
        try {
            const newStatus = await this.getStatus();
            const notChanged = newStatus === this.status;

            if (notChanged) return;

            this.status = newStatus;

            if (newStatus === 'approved') {
                this.emit('paid');
                this.cleanup();
            } else if (newStatus === 'cancelled') {
                this.emit('cancelled');
                this.cleanup();
            }

            this.emit('status', this.statusObject);
        } catch (error) {
            throw new PixError(PixPaymentErrorMessages.FailedToUpdateStatus, error);
        }
    }

    async getStatus() {
        try {
            if (!this.id) {
                throw new PixError(PixPaymentErrorMessages.CanNotGetStatusWithoutId);
            }

            const { status } = await this.mpPayment.get({ id: this.id });

            if (!status) throw new PixError(PixPaymentErrorMessages.InvalidResponse);

            const isValidStatus = Object.values(PaymentStatusType)
                .includes(status as PaymentStatusType);

            if (!isValidStatus) throw new PixError(PixPaymentErrorMessages.InvalidResponse);

            return status as `${PaymentStatusType}`;
        } catch (error) {
            throw new PixError(PixPaymentErrorMessages.FailedToGetStatus, error);
        }
    }

    async cancel() {
        try {
            if (!this.id) {
                throw new PixError(PixPaymentErrorMessages.CanNotCancelPaymentWithoutId);
            }

            if (this.isComplete) {
                throw new PixError(PixPaymentErrorMessages.CanNotCancelCompletePayment);
            }

            await this.mpPayment.cancel({ id: this.id });

            this.cleanup();

            this.status = 'cancelled';

            this.emit('cancelled');
            this.emit('status', this.statusObject);
        } catch (error) {
            await this.updateStatus();

            if (!this.isComplete) {
                throw new PixError(PixPaymentErrorMessages.FailedToCancelPayment, error);
            }
        }
    }

    cleanup() {
        this.removeWebhookListener();

        if (typeof this.expireTimeout === 'number') {
            clearTimeout(this.expireTimeout);
            this.expireTimeout = null;
        }
    }
}