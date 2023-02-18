import fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import ApiV1Router from "./v1";

const ApiRouter = async (
    fastify: FastifyInstance,
    opts: FastifyServerOptions
) => {
    // V1
    fastify.register(ApiV1Router, {
        prefix: '/v1'
    });
}

export default ApiRouter;