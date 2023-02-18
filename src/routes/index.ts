import { FastifyInstance, FastifyServerOptions } from "fastify";
import ApiRouter from "./api";
import RootRouter from "./root";

const FastifyRouter = async (
        fastify: FastifyInstance,
        opts: FastifyServerOptions
        ) => {
    // Index
    fastify.register(RootRouter, {
        prefix: "/"
    });

    // API V1
    fastify.register(ApiRouter, {
        prefix: "/api"
    });
}

export default FastifyRouter;