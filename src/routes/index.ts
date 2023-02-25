import {FastifyInstance, FastifyServerOptions} from "fastify";
import RootRouter from "./root";
import ApiRouter from "./api";
import fastifyPlugin from "fastify-plugin";

const FastifyRouter = async (
  fastify: FastifyInstance,
  opts: FastifyServerOptions
) => {
  // Index
  fastify.register(RootRouter, {
    prefix: "/"
  });

  // API v1 
  fastify.register(ApiRouter, {
    prefix: "/api"
  });
}

export default fastifyPlugin(FastifyRouter);