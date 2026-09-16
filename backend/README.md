# Backend base — Programação Web

Versão sem dependências SQLite nativas, preparada para Node.js moderno e VS Code.

## Arranque

1. Copiar `.env.example` para `.env`
2. No terminal:

```bash
npm install
npm run dev
```

3. Abrir `http://localhost:3000/api/health`

Resposta esperada:

```json
{"status":"ok"}
```

## Contas de demonstração

Password comum: `demo123`

- Utente: `ana.patient@example.org` (ID 1)
- Utente sem avaliações: `bruno.patient@example.org` (ID 2)
- Utente: `carla.patient@example.org` (ID 3)
- Médico: `miguel.doctor@example.org` (ID 10)
- Admin: `admin@example.org` (ID 20)

## Nota

A base de dados usa `node:sqlite`, incluído no Node.js. Não é necessário instalar `sqlite3`,
`node-gyp` ou ferramentas de compilação.
