import { Buffer } from 'buffer';
import type { QRCodeOptions } from './types.js';

/**
 * Representa uma imagem de QR Code.
 */
export class QRImage {
    base64: string;

    constructor(base64: string) {
        this.base64 = base64;
    }

    toBuffer() {
        return Buffer.from(this.base64, 'base64');
    }
}

/**
 * Representa um QR Code.
 */
export class QRCode {
    content: string;
    image: QRImage;

    constructor({ content, base64 }: QRCodeOptions) {
        this.content = content;
        this.image = new QRImage(base64);
    }
}