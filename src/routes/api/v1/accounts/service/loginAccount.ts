import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {validateEmailAddress} from "../../../../../utils/common";
import {fastifyErrorWrapper} from "../../../../../utils/error";
import {QueryType} from "../../../../../utils/types";
import bcrypt from "bcrypt";
import {JwtSignaturePayload} from "../../../../../middleware/authentication";
import humps from "humps";

export type LoginAccountBodyRequest = {
    email: string,
    password: string
};

export type LoginAccountResponse = {
    nickname: string,
    accessToken: string
};

type SelectAccountResult = {
    id: string,
    email: string,
    password: string,
    nickname: string
};

const loginAccountService = async (
        request: FastifyRequest<{ Body: LoginAccountBodyRequest }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    if (!validateEmailAddress(request.body.email)) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'EMAIL_ADDRESS_INCORRECT'));
    }

    const findAccount = await fastify.pg.transact<SelectAccountResult>(async client => {
        const query: QueryType = {
            text: `SELECT id, email, password, nickname FROM accounts
             WHERE email
             LIKE $1
             LIMIT 1`,
            values: [request.body.email]
        }
        return <SelectAccountResult> humps.camelizeKeys((await client.query<SelectAccountResult>(query)).rows)[0];
    });

    if (!findAccount) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'ACCOUNT_NOT_FOUND'));
    }

    if (!(await bcrypt.compare(request.body.password, findAccount.password))) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'PASSWORD_MISMATCH'));
    }

    const jwtPayload: JwtSignaturePayload = {
        id: findAccount.id
    };

    let response: LoginAccountResponse = {
        nickname: findAccount.nickname,
        accessToken: fastify.jwt.sign(jwtPayload, {
            expiresIn: '2h'
        })
    };

    return reply
    .code(200)
    .type('application/json')
    .send(response);
}

export default loginAccountService;