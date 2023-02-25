import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";

const healthCheckService = async (request: FastifyRequest, reply: FastifyReply, fastify: FastifyInstance) => {
  const response = {
    'serverStatus': 'ok'
  }

  return reply
    .code(200)
    .type('application/json')
    .send(response);
}

export default healthCheckService;