import {
    FastifyInstance,
    FastifyPluginOptions,
    FastifyReply,
    FastifyRequest
} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { IAuthWithJwtHeader } from '../utils/types';
import { fastifyErrorWrapper } from '../utils/error';

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: JwtSignaturePayload,
        user: JwtSignatureUser
    }
}

export type JwtSignaturePayload = {
    id: string;
}

export type JwtSignatureUser = JwtSignaturePayload & {
    iat: number;
    exp: number;
}

const authenticationWithJwt = async (
        request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>,
        reply: FastifyReply,
        fastify: FastifyInstance
) => {
    try {
        await request.jwtVerify();
    } catch (error) {
        console.error(error);
        reply
            .code(401)
            .type('application/json')
            .send(fastifyErrorWrapper(401, "API_ACCESS_TOKEN_IS_INVALID_OR_EXPIRED"));
    }

};

const AuthenticationMiddleware = async (
        fastify: FastifyInstance,
        opts: FastifyPluginOptions
) => {
    fastify.register(fastifyJwt, {
        secret: process.env.FASTIFY_AUTH_JWT_SECRET
    });
}