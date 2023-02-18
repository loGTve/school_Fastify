import fastify, { FastifyInstance, FastifyRequest, FastifyServerOptions } from "fastify";
import registerAccountService, { RegisterAccountBodyRequest } from "./service/registerAccount";

const AccountsRouter = async (
    fastify: FastifyInstance,
    opts: FastifyServerOptions
) => {
    // POST Register Account /api/v1/accounts/register
    fastify.post(
        '/register',
        (
            request: FastifyRequest<{ Body: RegisterAccountBodyRequest }>,
            reply
            ) => registerAccountService(request, reply, fastify)
            );
}

export default AccountsRouter;