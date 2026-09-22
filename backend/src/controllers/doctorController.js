// Importamos as funções da camada de serviços.
// O controller trata dos pedidos HTTP;
// o service contém a lógica de acesso/manipulação dos dados.
import {
    getDoctorPatients,
    getDoctorAlerts,
    createDoctorPatient
} from "../services/doctorService.js";


// Função auxiliar para verificar se o utilizador autenticado
// tem autorização para aceder aos recursos deste médico.
//
// req.user foi preenchido anteriormente pelo middleware de autenticação,
// depois de validar o JWT.
//
// É permitido o acesso quando:
// 1. o utilizador é ADMIN
// OU
// 2. é DOCTOR e o seu ID corresponde ao ID do médico pedido na rota.
//
// Exemplo:
// token → { sub: 10, role: "DOCTOR" }
// pedido → GET /api/doctors/10/patients
// resultado → permitido
//
// Mas:
// pedido → GET /api/doctors/20/patients
// resultado → não permitido
const allowed = (req, id) =>
    req.user.role === "ADMIN" ||
    (
        req.user.role === "DOCTOR" &&
        Number(req.user.sub) === Number(id)
    );


// ======================================================
// GET /api/doctors/:id/patients
// ======================================================
//
// Devolve a lista de pacientes associados a um médico.
export function getDoctorPatientsController(req, res, next) {

    try {

        // req.params.id corresponde ao :id existente na rota.
        //
        // Exemplo:
        // GET /api/doctors/10/patients
        //
        // req.params.id será "10".
        //
        // Antes de obter os dados, verificamos se o utilizador
        // autenticado tem autorização para consultar este médico.
        if (!allowed(req, req.params.id)) {

            // 403 Forbidden:
            // o utilizador está autenticado, mas não tem autorização
            // para executar esta operação.
            return res.status(403).json({
                error: "Forbidden"
            });
        }


        // Se estiver autorizado, chamamos o service.
        // O resultado é convertido automaticamente para JSON.
        res.json(
            getDoctorPatients(req.params.id)
        );

    } catch (e) {

        // Se ocorrer um erro inesperado, passamo-lo para
        // o middleware global de tratamento de erros.
        next(e);
    }
}


// ======================================================
// GET /api/doctors/:id/alerts
// ======================================================
//
// Devolve os alertas associados aos pacientes de um médico.
export function getDoctorAlertsController(req, res, next) {

    try {

        // Verificar autorização.
        if (!allowed(req, req.params.id)) {

            return res.status(403).json({
                error: "Forbidden"
            });
        }


        // Pedir os dados ao service e devolver JSON.
        res.json(
            getDoctorAlerts(req.params.id)
        );

    } catch (e) {

        next(e);
    }
}


// ======================================================
// POST /api/doctors/:id/patients
// ======================================================
//
// Cria um novo paciente e associa-o ao médico.
//
// Os dados do paciente são enviados pelo frontend
// no body do pedido HTTP em formato JSON.
export function createDoctorPatientController(req, res, next) {

    try {

        // Primeiro verificamos se o utilizador autenticado
        // pode criar um paciente para este médico.
        if (!allowed(req, req.params.id)) {

            return res.status(403).json({
                error: "Forbidden"
            });
        }


        // req.body contém o JSON enviado pelo frontend.
        //
        // Por exemplo:
        //
        // {
        //   "name": "Maria Silva",
        //   "email": "maria@example.org",
        //   "birthDate": "1980-05-20",
        //   "sex": "F",
        //   "admissionDate": "2026-09-19",
        //   "height": 1.65,
        //   "weight": 70
        // }
        const d = req.body;


        // Campos que consideramos obrigatórios.
        const required = [
            "name",
            "email",
            "birthDate",
            "sex",
            "admissionDate",
            "height",
            "weight"
        ];


        // Procuramos campos obrigatórios que:
        // - não existem (undefined)
        // - são null
        // - são uma string vazia
        //
        // filter() devolve um array apenas com os campos
        // que satisfazem esta condição.
        const missing = required.filter(
            k =>
                d[k] === undefined ||
                d[k] === null ||
                d[k] === ""
        );


        // Se existir pelo menos um campo em falta,
        // devolvemos 400 Bad Request.
        if (missing.length) {

            return res.status(400).json({
                error:
                    `Missing required fields: ${missing.join(", ")}`
            });
        }


        // Os dados recebidos através de HTTP podem não ter
        // necessariamente o tipo que esperamos.
        //
        // Convertemos explicitamente height e weight para Number.
        const height = Number(d.height);
        const weight = Number(d.weight);


        // Validamos os valores.
        //
        // Number.isFinite() garante que temos um número válido
        // e não, por exemplo, NaN ou Infinity.
        //
        // Também exigimos valores superiores a zero.
        if (
            !Number.isFinite(height) ||
            height <= 0 ||
            !Number.isFinite(weight) ||
            weight <= 0
        ) {

            return res.status(400).json({
                error:
                    "height and weight must be positive numbers"
            });
        }


        // Depois da validação, passamos os dados para o service.
        //
        // {...d, height, weight}
        //
        // usa o spread operator para copiar os restantes campos
        // de d, substituindo height e weight pelas versões
        // já convertidas para Number.
        const patient = createDoctorPatient(
            req.params.id,
            {
                ...d,
                height,
                weight
            }
        );


        // O recurso foi criado com sucesso.
        //
        // 201 Created é mais apropriado do que 200
        // quando um POST cria um novo recurso.
        res.status(201).json(patient);


    } catch (e) {

        // Neste caso específico, verificamos se a base de dados
        // recusou a criação porque já existe um utilizador
        // com o mesmo email.
        if (
            String(e.message).includes(
                "UNIQUE constraint failed: users.email"
            )
        ) {

            // 409 Conflict:
            // o pedido é válido, mas entra em conflito
            // com um recurso que já existe.
            return res.status(409).json({
                error: "Email already exists"
            });
        }


        // Qualquer outro erro é enviado para o middleware
        // global de tratamento de erros.
        next(e);
    }
}