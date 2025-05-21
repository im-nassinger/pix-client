# pix-client

O pix-client é um pacote do NPM que facilita a comunicação com a API do Mercado
Pago para gerar pagamentos via PIX e gerenciar webhooks de notificação. Com ele,
você pode verificar rapidamente se um pagamento foi concluído e definir um tempo
de expiração para o pagamento, garantindo uma experiência prática e eficiente. É
a solução ideal para quem busca uma abordagem minimalista e fácil de
implementar, sem a necessidade de contas pagas ou assinaturas em serviços.

## Requisitos

Antes de utilizar o pix-client, é necessário obter um token de acesso do Mercado
Pago. Você pode adquirir um token criando uma conta gratuita, e depois acessando
[este link](https://www.mercadopago.com.br/developers/panel).

## Instalação ([NPM](https://www.npmjs.com/package/pix-client)):

```bash
npm install pix-client
```

## Modos de Uso

O pix-client oferece dois modos de operação:

1. **Modo Ngrok**: Este modo cria um túnel usando o Ngrok, permitindo receber
   eventos do Mercado Pago em tempo real. O status do pagamento é atualizado
   instantaneamente. Para usar este modo, você precisa de um token de acesso do
   Ngrok. Após criar sua conta gratuita no ngrok, acesse
   [este link](https://dashboard.ngrok.com/get-started/your-authtoken).

2. **Modo Pooling**: Neste modo, o pacote realiza verificações em intervalos
   configuráveis pelo usuário. Embora não seja em tempo real, não requer um
   servidor HTTP nem um token de acesso do Ngrok.

## Exemplos de Uso

Aqui está um exemplo de como utilizar o pix-client para gerar um pagamento via
PIX:

```js
import { PixClient } from 'pix-client';
import dotenv from 'dotenv';
import qrcode from 'qrcode-terminal';

dotenv.config();

const pixClient = new PixClient({
    // obrigatório:
    // https://www.mercadopago.com.br/developers/panel
    mpToken: process.env.MP_TOKEN,

    // opcional:
    // https://dashboard.ngrok.com/get-started/your-authtoken
    ngrokToken: process.env.NGROK_TOKEN
});

try {
    await pixClient.webhook.listen(); // recebe notificações do mercadopago

    const pix = await pixClient.generatePix({
        description: 'Teste de pagamento PIX',
        transactionAmount: 2.50,
        durationMinutes: 5
    });

    console.log('Pix gerado! Escaneie o QR Code abaixo para realizar o pagamento:');

    qrcode.generate(pix.qrCode.content, { small: true });

    pix.once('paid', () => console.log('O pagamento foi realizado com sucesso! :)'));

    pix.once('expired', () => console.log('O pagamento não foi realizado a tempo :('));
} catch(error) {
    console.error('Erro ao gerar o PIX:', error.message);
}
```
