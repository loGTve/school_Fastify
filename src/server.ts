import dotenv from 'dotenv';
import * as path from 'path';
import Fastify from 'fastify';
import _ from 'lodash';


const envFilePath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../env/.env.production')
    : path.join(__dirname, '../env/.env.development');

dotenv.config({
    path: envFilePath
});

const fastify = Fastify({
    logger: Boolean(process.env.FASTIFY_LOGGING || true)
});

fastify.listen({
    port: _.toNumber(process.env.SERVER_PORT || 9000),
    host: '0.0.0.0'
}, (err, addr) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.info(`Server Listening at ${addr}`);
});