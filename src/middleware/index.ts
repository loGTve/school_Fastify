import fastifyHelmet from "@fastify/helmet";
import fastifyPostgres from "@fastify/postgres";
import fastifyStatic from "@fastify/static";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";
import * as path from "path";
import AuthenticationMiddleware from "./authentication";
import ErrorHandlerMiddleware from "./handle";

const FastifyMiddleware = async (
        fastify: FastifyInstance,
        opts: FastifyPluginOptions
        ) => {
    fastify.register(fastifyStatic, {
        root: path.join(__dirname, '../../public')
    });

    fastify.register(fastifyPostgres, {
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        port: Number(process.env.DATABASE_PORT)
    });

    fastify.register(fastifyHelmet, {
        global: true,
        contentSecurityPolicy: false
    });

    fastify.register(AuthenticationMiddleware);

    fastify.register(ErrorHandlerMiddleware);
};

export default fastifyPlugin(FastifyMiddleware);