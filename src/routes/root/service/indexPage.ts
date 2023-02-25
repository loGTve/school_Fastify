import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";

const indexPageService = async (request: FastifyRequest, reply: FastifyReply, fastify: FastifyInstance) => {
  const servingFilePath = './index.html';

  return reply
    .code(200)
    .type('text/html')
    .sendFile(servingFilePath);
}

export default indexPageService;