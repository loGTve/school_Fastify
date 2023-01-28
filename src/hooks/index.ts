import fastify, {
    DoneFuncWithErrOrRes,
    FastifyInstance,
    FastifyPluginOptions,
    FastifyReply,
    FastifyRequest
} from 'fastify';
import humps from 'humps';;
import fastifyPlugin from 'fastify-plugin';

const FastifyHooks = async (
        fastify: FastifyInstance,
        opts: FastifyPluginOptions
) => {
    fastify.addHook('preParsing', async (
            request: FastifyRequest,
            reply: FastifyReply,
            payload
    ) => {
        request.query = humps.camelizeKeys(request.query);
        return payload;
    });
    fastify.addHook('preSerialization', async (
            request: FastifyRequest,
            reply: FastifyReply,
            payload
    ) => {
        return humps.decamelizeKeys(payload);
    });
}

export default fastifyPlugin()