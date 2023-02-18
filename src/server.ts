import dotenv from 'dotenv';
import * as path from 'path';
import Fastify from 'fastify';
import _ from 'lodash';
import FastifyMiddleware from './middleware';
import FastifyHooks from './hooks';
import FastifyContentTypeParser from './parser';
import FastifyRouter from './routes';

const envFilePath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../env/.env.production')
    : path.join(__dirname, '../env/.env.development');

dotenv.config({
    path: envFilePath
});

const fastity = Fastify({
    logger: Boolean(process.env.FASTIFY_LOGGING || true)
});

fastity.register(FastifyMiddleware);

fastity.register(FastifyContentTypeParser);

fastity.register(FastifyHooks);

fastity.register(FastifyRouter);

fastity.listen({
    port: _.toNumber(process.env.SERVER_PORT || 9000),
    host: '0.0.0.0'
}, (err, addr) => {
    if (err) {
        fastity.log.error(err);
        process.exit(1);
    }

    console.info(`server listening at ${addr}`);
});