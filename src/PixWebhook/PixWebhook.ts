import ngrok from '@ngrok/ngrok';
import { execSync } from 'child_process';
import EventEmitter from 'events';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { PixClient } from '../PixClient/index.js';
import { PixError } from '../PixError/index.js';
import { PixWebhookErrorMessages, PixWebhookWarningMessages } from './messages.js';
import type { MPRequestBody } from './types.js';

export class PixWebhook extends EventEmitter {
    public pixClient: PixClient;
    public httpServer?: Server;
    public isReady: boolean;
    public ngrokUrl: string | null = null;
    public poolingInterval?: ReturnType<typeof setTimeout> | null = null;

    constructor(pixClient: PixClient) {
        super();

        this.pixClient = pixClient;
        this.isReady = false;
    }

    async listen() {
        const { ngrokToken } = this.pixClient;

        ngrokToken ? await this.useNgrok() : this.usePooling();

        this.isReady = true;
    }

    async useNgrok() {
        try {
            await this.startServer();
            await this.startNgrok();
        } catch (error) {
            throw new PixError(PixWebhookErrorMessages.FailedToStartWebhook, error);
        }
    }

    usePooling() {
        const { poolingMs } = this.pixClient;

        this.poolingInterval = setInterval(() => this.emit('update'), poolingMs);

        console.warn(PixWebhookWarningMessages.WebhookPooling);
    }

    startServer() {
        return new Promise((resolve, reject) => {
            const server = createServer(async (req, res) => {
                try {
                    await this.onRequest(req, res);
                } catch {
                    console.warn(PixWebhookWarningMessages.IgnoringInvalidRequest);
                }
            });

            server.listen(this.pixClient.ngrokPort, () => resolve(server));

            server.on('error', (error) => {
                reject(new PixError(PixWebhookErrorMessages.FailedToStartServer, error));
            });

            this.httpServer = server;
        });
    }

    async onRequest(req: IncomingMessage, res: ServerResponse) {
        try {
            const json = await this.getBodyJson(req);
            const isEventRequest = 'action' in json;

            if (isEventRequest) {
                const id = json.data?.id?.toString();

                if (!id) {
                    throw new PixError(PixWebhookErrorMessages.InvalidRequest);
                }

                if (json.action === 'payment.updated') {
                    this.emit('update', id);
                }
            } else {
                const isTelemetryRequest = 'topic' in json;

                if (isTelemetryRequest) return;

                throw new PixError(PixWebhookErrorMessages.InvalidRequest);
            }

            res.writeHead(200);
            res.end();
        } catch (error) {
            res.writeHead(400);
            res.end();

            throw new PixError(PixWebhookErrorMessages.FailedToProcessRequest, error);
        }
    }

    getBodyJson(req: IncomingMessage): Promise<MPRequestBody> {
        return new Promise((resolve, reject) => {
            let bodyData = '';

            req.on('data', (chunk) => bodyData += chunk);

            req.on('end', () => {
                try {
                    const parsedBody = JSON.parse(bodyData);

                    if (typeof parsedBody !== 'object') {
                        throw new PixError(PixWebhookErrorMessages.InvalidRequestBody);
                    }

                    resolve(parsedBody);
                } catch (error) {
                    reject(new PixError(PixWebhookErrorMessages.InvalidRequestBody, error));
                }
            });
        });
    }

    killNgrokProcess() {
        const isWindows = process.platform === 'win32';
        const command = isWindows ? 'taskkill /f /im ngrok.exe' : 'pkill ngrok';

        try {
            execSync(command, { stdio: 'ignore' });
        } catch { }
    }

    async startNgrok() {
        try {
            this.killNgrokProcess();

            const authtoken = this.pixClient.ngrokToken!;
            const addr = this.pixClient.ngrokPort!;
            const connection = await ngrok.forward({ authtoken, addr });

            this.ngrokUrl = connection.url();
        } catch (error) {
            throw new PixError(PixWebhookErrorMessages.FailedToStartNgrok, error);
        }
    }
}