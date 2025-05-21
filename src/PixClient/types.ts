/**
 * Opções para o cliente Pix.
 */
export interface PixClientOptions {
    /**
     * Token do Mercado Pago. O token pode ser obtido acessando:
     * https://www.mercadopago.com.br/developers/panel
     */
    mpToken: string;

    /**
     * Token do ngrok. Caso não seja passado, requisições periódicas (pooling)
     * serão usadas para verificar o status do pagamento.
     * O token pode ser obtido acessando:
     * https://dashboard.ngrok.com/get-started/your-authtoken
     */
    ngrokToken?: string;

    /**
     * Porta para o ngrok, caso o token do ngrok também seja passado.
     * @default 8888
     */
    ngrokPort?: number;

    /**
     * Intervalo para verificar o status do pagamento, em milissegundos.
     * @default 10000
     */
    poolingMs?: number;
}