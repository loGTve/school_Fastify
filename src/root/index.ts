import { FastifyInstance, FastifyServerOptions } from "fastify";
import RootRouter from "./root";

const FastifyRotuer = async (
    fastify: FastifyInstance,
    opts: FastifyServerOptions
) => {
    // Index
    fastify.register(RootRouter, {
        prefix: "/"
    });

    // API V1
}

export default FastifyRotuer;