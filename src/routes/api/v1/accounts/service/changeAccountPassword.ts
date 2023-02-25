import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {IAuthWithJwtHeader, QueryType} from "../../../../../utils/types";
import bcrypt from "bcrypt";
import {fastifyErrorWrapper} from "../../../../../utils/error";
import humps from "humps";

export type ChangeAccountPasswordBodyRequest = {
    currentPassword: string,
    changeRequestPassword: string
};

type SelectAccountResult = {
    password: string
}

type UpdateAccountPasswordResult = {
    id: string
};

const changeAccountPasswordService = async (
        request: FastifyRequest<{
            Body: ChangeAccountPasswordBodyRequest,
            Headers: IAuthWithJwtHeader
        }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    if (request.body.currentPassword === request.body.changeRequestPassword) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'CURRENT_PASSWORD_SAME_CHANGE_REQUEST_PASSWORD'));
    }

    const findAccountPassword = await fastify.pg.transact<SelectAccountResult>(async client => {
        const query: QueryType = {
            text: `SELECT password FROM accounts
             WHERE id::TEXT
             LIKE $1
             LIMIT 1`,
            values: [request.user.id]
        }
        return <SelectAccountResult> humps.camelizeKeys((await client.query<SelectAccountResult>(query)).rows)[0];
    });

    if (!(await bcrypt.compare(request.body.currentPassword, findAccountPassword.password))) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'CURRENT_PASSWORD_MISMATCH'));
    }

    const updateAccountPasswordById = await fastify.pg.transact<UpdateAccountPasswordResult>(async client => {
        const query: QueryType = {
            text: `UPDATE accounts SET password = $1
             WHERE id::TEXT LIKE $2
             RETURNING id`,
            values: [
                await bcrypt.hash(request.body.changeRequestPassword, 10),
                request.user.id
            ]
        }
        return <UpdateAccountPasswordResult> humps.camelizeKeys((await client.query<UpdateAccountPasswordResult>(query)).rows)[0];
    });

    if (!updateAccountPasswordById) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'PASSWORD_CHANGE_FAILED'));
    }

    return reply
    .code(201)
    .type(null)
    .send();
}

export default changeAccountPasswordService;