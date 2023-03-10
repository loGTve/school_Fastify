import {FastifyInstance, FastifyServerOptions} from "fastify";
import healthCheckService from "./service/healthCheck";
import indexPageService from "./service/indexPage";
import fastifyPlugin from "fastify-plugin";

const RootRouter = async (
  fastify: FastifyInstance,
  opts: FastifyServerOptions
) => {
  // Index Page :: ~/
  fastify.get(
    '/',
    (request, reply) => indexPageService(request, reply, fastify)
  );

  // Health Check Page :: ~/health-check 
  fastify.get(
    '/health-check',
    (request, reply) => healthCheckService(request, reply, fastify)
    );
}

export default RootRouter;