import { MercadoPagoConfig } from 'mercadopago';
import { PixPayment, type PixPaymentOptions } from '../PixPayment/index.js';
import { PixWebhook } from '../PixWebhook/index.js';
import { PixClientErrorMessages } from './messages.js';
import type { PixClientOptions } from './types.js';

export class PixClient {
    public mpToken: string;
    public ngrokToken?: string;
    public ngrokPort?: number;
    public poolingMs?: number;
    public webhook: PixWebhook;
    public mpConfig: MercadoPagoConfig;

    constructor(options: PixClientOptions) {
        if (!options.mpToken) {
            throw new Error(PixClientErrorMessages.mpTokenRequired);
        }

        this.mpToken = options.mpToken;
        this.ngrokToken = options.ngrokToken;

        this.ngrokToken ?
            this.ngrokPort = options.ngrokPort || 8888 :
            this.poolingMs = options.poolingMs || 10000;

        this.webhook = new PixWebhook(this);
        this.mpConfig = new MercadoPagoConfig({ accessToken: this.mpToken });
    }

    /**
     * @example
     * ```ts
     * const pix = await pixClient.generatePix({
     *    transactionAmount: 2.50,
     *    durationMinutes: 5
     * });
     * 
     * pix.once('paid', () => console.log('paid'));
     * pix.once('expired', () => console.log('expired'));
     * ```
     */
    generatePix(options: PixPaymentOptions) {
        const payment = new PixPayment(this, options);
        return payment.generate();
    }
}