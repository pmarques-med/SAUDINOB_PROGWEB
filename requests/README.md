# Pedidos HTTP para testar a API

Estes ficheiros permitem testar o backend diretamente no Visual Studio Code, de forma semelhante ao Postman.

## Como utilizar

1. Inicie o backend na porta 3000.
2. No VS Code, instale uma extensão compatível com ficheiros `.http`, por exemplo **REST Client**.
3. Abra primeiro `01-auth.http`.
4. Execute o login do médico.
5. Copie o valor de `token` devolvido pela API.
6. Substitua `COLOCAR_TOKEN_AQUI` nos restantes ficheiros.
7. Execute os pedidos individualmente através da opção **Send Request** apresentada pelo editor.

Os dados de demonstração usam:
- médico: `miguel.doctor@example.org`
- password: `demo123`
- ID do médico: `10`
- doentes iniciais: `1`, `2` e `3`

> Os valores de frequência cardíaca são simulados pelo backend e não são armazenados. Execute o mesmo pedido várias vezes para observar a alteração do valor.

## Ordem sugerida

1. `01-auth.http` — autenticação e JWT
2. `02-patients.http` — lista e detalhe
3. `03-new-patient.http` — POST e JSON
4. `04-measurements.http` — histórico usado no gráfico de IMC
5. `05-vitals.http` — dados dinâmicos/polling
6. `06-errors.http` — 401, 403, 404 e validação
