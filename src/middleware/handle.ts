import { FastifyError, FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { FastifyErrorResponseType } from "../utils/error";

const ErrorHandlerMiddleware = async (
        fastify: FastifyInstance,
        opts: FastifyPluginOptions
        ) => {
    fastify.setErrorHandler((
            error: FastifyError,
            request: FastifyRequest,
            reply: FastifyReply
            ) => {
        console.error(error);

        const response: FastifyErrorResponseType = {
            code: error.statusCode || 500,
            message: error.message || 'INTERNAL_SERVER_ERROR'
        }

        reply
            .status(error.statusCode || 500)
            .type('application/json')
            .send(response);
    });

    fastify.setNotFoundHandler((
            request: FastifyRequest,
            reply: FastifyReply
            ) => {
        reply
            .status(404)
            .type('text/html')
            .sendFile('./not_found.html');
    });
}

export default fastifyPlugin(ErrorHandlerMiddleware);