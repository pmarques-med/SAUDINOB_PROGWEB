# API

Base URL: `http://localhost:3000/api`

- `GET /health`
- `POST /auth/login`
- `GET /patients/:id`
- `GET /patients/:id/carat`
- `POST /patients/:id/carat`
- `GET /patients/:id/alerts`
- `GET /doctors/:id/patients`
- `GET /doctors/:id/alerts`
- `PATCH /alerts/:id`

Exceto `/health` e `/auth/login`, enviar:

`Authorization: Bearer <token>`

### Login

```json
{"email":"ana.patient@example.org","password":"demo123"}
```

### Submeter CARAT

```json
{"score":18}
```

### Alterar estado de alerta

```json
{"status":"EM_SEGUIMENTO"}
```
