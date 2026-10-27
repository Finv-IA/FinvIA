# FinvIA

**Cole o extrato. Mapeie seus ganhos.**

## Planos

| Plano       | Preço      | Tipo              |
|-------------|------------|-------------------|
| Mensal      | R$ 9,99    | recorrente        |
| Anual       | R$ 96,00   | recorrente        |
| Vitalício   | R$ 200,00  | pagamento único   |

Pagamento: **PIX** (aprovação manual no Admin) ou **cartão** (Stripe Payment Link).

Senha do Admin (fallback): `Admin2012`  
Recomendado: no Base44 → Users, defina seu usuário com `role = admin`.

---

## Publicar no Vercel (frontend)

O backend (login, banco, IA) continua no **Base44**. O Vercel serve só a interface.

### 1. Publique o app no Base44 pelo menos uma vez
```bash
base44 login
base44 link
base44 dashboard open
# Clique em Publish
```

### 2. Variáveis de ambiente no Vercel

No projeto Vercel → Settings → Environment Variables, adicione as mesmas que o Base44 usa no frontend (normalmente injetadas pelo plugin). Em geral:

- `VITE_*` se houver no seu `.env` local  
Ou, mais simples: faça o build apontando para o app publicado.

Na prática, o `@base44/vite-plugin` resolve o `appId` em build time quando o projeto está linkado (`base44/.app.jsonc`).

### 3. Deploy

```bash
# Com CLI
npm i -g vercel
vercel

# Ou conecte o repositório GitHub no dashboard da Vercel
# Framework: Vite
# Build: npm run build
# Output: dist
```

O arquivo `vercel.json` já configura SPA rewrite (todas as rotas → index.html).

### 4. Domínio

No Vercel: Project → Domains → adicione seu domínio.

---

## Configurar cartão (Stripe Payment Links)

1. Crie conta em [stripe.com](https://stripe.com)
2. Dashboard → **Payment Links** → Create
3. Crie 3 links:
   - Mensal R$ 9,99 (recorrente mensal)
   - Anual R$ 96 (recorrente anual)
   - Vitalício R$ 200 (pagamento único)
4. Cole cada URL em `src/lib/config.js` → campo `stripePaymentLink` de cada plano
5. Faça novo build/deploy

Enquanto os links estiverem vazios, o botão de cartão registra o pedido para você aprovar manualmente (igual ao PIX).

---

## Rodar localmente (Base44)

```bash
npm install
npm install -g base44@latest
base44 login
base44 link
base44 dev
```

Não use `npm run dev` sozinho — a API precisa do proxy do `base44 dev`.

---

## Fluxo de liberação

1. Cliente escolhe plano e paga (PIX ou cartão)
2. Clica em **Já fiz o pagamento** → Order `pending`
3. Você entra em **/admin** (código `Admin2012` ou role admin)
4. Aprova → status `paid` → acesso liberado em todas as abas

---

## Arquivos importantes

- `src/lib/config.js` — planos, PIX, admin, Payment Links
- `src/pages/Billing.jsx` — tela de planos e pagamento
- `base44/entities/Order.jsonc` — pedidos com plano e método
- `vercel.json` — deploy SPA na Vercel
