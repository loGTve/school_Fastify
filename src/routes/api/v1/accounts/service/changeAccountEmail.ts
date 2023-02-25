import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {IAuthWithJwtHeader, QueryType} from "../../../../../utils/types";
import {validateEmailAddress} from "../../../../../utils/common";
import {fastifyErrorWrapper} from "../../../../../utils/error";
import humps from "humps";
import {JwtSignaturePayload, JwtSignatureUser} from "../../../../../middleware/authentication";

export type changeAccountEmailBodyRequest = {
    currentEmail: string,
    changeRequestEmail: string
};

export type ChangeAccountEmailResponse = {
    changedEmail: string
};

type SelectAccountResult = {
    email: string
}

type UpdateAccountEmailResult = {
    email: string
}

const changeAccountEmailService = async (
        request: FastifyRequest<{
            Body: changeAccountEmailBodyRequest,
            Headers: IAuthWithJwtHeader
        }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    if (!validateEmailAddress(request.body.changeRequestEmail)) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'CHANGE_REQUEST_EMAIL_ADDRESS_INCORRECT'));
    }

    if (request.body.currentEmail === request.body.changeRequestEmail) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'CURRENT_EMAIL_ADDRESS_SAME_CHANGE_REQUEST_EMAIL_ADDRESS'));
    }

    const getAccountById = await fastify.pg.transact<SelectAccountResult>(async client => {
        const query: QueryType = {
            text: `SELECT email FROM accounts
             WHERE id::TEXT
             LIKE $1
             LIMIT 1`,
            values: [request.user.id]
        }
        return <SelectAccountResult> humps.camelizeKeys((await client.query<SelectAccountResult>(query)).rows)[0];
    });

    if (getAccountById.email !== request.body.currentEmail) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'MISMATCH_AND_WRONG_CURRENT_EMAIL_ADDRESS'));
    }

    const updateAccountEmailById = await fastify.pg.transact<{
        email: string
    }>(async client => {
        const query: QueryType = {
            text: `UPDATE accounts SET email = $1
             WHERE id::TEXT LIKE $2
             RETURNING email`,
            values: [
                request.body.changeRequestEmail,
                request.user.id
            ]
        }
        return <UpdateAccountEmailResult> humps.camelizeKeys((await client.query<UpdateAccountEmailResult>(query)).rows)[0];
    });

    const response: ChangeAccountEmailResponse = {
        changedEmail: updateAccountEmailById.email
    };

    return reply
    .code(201)
    .type('application/json')
    .send(response);
}

export default changeAccountEmailService;