import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import AccountsRouter from "./accounts";

const ApiV1Router = async (
    fastify: FastifyInstance,
    opts: FastifyServerOptions
) => {
    // Accounts
    fastify.register(AccountsRouter, {
        prefix: "/accounts"
    });

    // Diary
}

export default ApiV1Router;