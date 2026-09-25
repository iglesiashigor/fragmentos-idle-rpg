# Fragmentos — Idle RPG

Jogo web em React, Vite e Supabase. O deploy de produção usa Vercel.

## Rodar localmente

```bash
npm ci
npm run dev
```

Sem variáveis de ambiente, o modo de desenvolvimento usa uma conta local de teste no navegador. O deploy exige Supabase e não ativa esse modo local.

## Configurar Supabase

1. Execute [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor do projeto Supabase.
2. Crie um arquivo `.env.local` com:

```dotenv
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
```

3. Configure as mesmas variáveis no projeto da Vercel e faça um novo deploy.

Use somente a chave publicável no frontend. Nunca coloque a chave `service_role` em variáveis com prefixo `VITE_`.

## Verificar

```bash
npm run check
```

Esse comando executa a checagem de tipos, o lint e o build de produção.
