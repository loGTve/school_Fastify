import {FastifyInstance, FastifyRequest, FastifyServerOptions} from "fastify";
import fastifyPlugin from "fastify-plugin";
import registerAccountService, {RegisterAccountBodyRequest} from "./service/registerAccount";
import loginAccountService, {LoginAccountBodyRequest} from "./service/loginAccount";
import getAccountInfoService from "./service/getAccountInfo";
import {IAuthWithJwtHeader} from "../../../../utils/types";
import getAppSettingService from "./service/getAppSetting";
import changeAccountInfoService, {ChangeAccountInfoBodyRequest} from "./service/changeAccountInfo";
import changeAccountEmailService, {changeAccountEmailBodyRequest} from "./service/changeAccountEmail";
import changeAccountPasswordService, {ChangeAccountPasswordBodyRequest} from "./service/changeAccountPassword";
import changeAppSettingService, {ChangeAppSettingBodyRequest} from "./service/changeAppSetting";
import {authenticationWithJwt} from "../../../../middleware/authentication";

const AccountsRouter = async (
  fastify: FastifyInstance,
  opts: FastifyServerOptions
) => {
  // POST Register Account
  fastify.post(
    '/register',
    (
      request: FastifyRequest<{ Body: RegisterAccountBodyRequest }>,
      reply
    ) => registerAccountService(request, reply, fastify)
  );

  // POST Login
  fastify.post(
    '/login',
    (
      request: FastifyRequest<{ Body: LoginAccountBodyRequest }>,
      reply
    ) => loginAccountService(request, reply, fastify)
  );

  // GET Account Information
  fastify.get(
    '/info',
    {
      preValidation: (request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>, reply) =>
        authenticationWithJwt(request, reply, fastify)
    },
    (
      request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>,
      reply
    ) => getAccountInfoService(request, reply, fastify)
  );

  // POST Change Account Information
  fastify.post(
    '/info',
    {
      preValidation: (request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>, reply) =>
        authenticationWithJwt(request, reply, fastify)
    },
    (
      request: FastifyRequest<{
        Body: ChangeAccountInfoBodyRequest,
        Headers: IAuthWithJwtHeader
      }>,
      reply
    ) => changeAccountInfoService(request, reply, fastify)
  );

  // POST Change Email Account
  fastify.post(
    '/email',
    {
      preValidation: (request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>, reply) =>
        authenticationWithJwt(request, reply, fastify)
    },
    (
      request: FastifyRequest<{
        Body: changeAccountEmailBodyRequest,
        Headers: IAuthWithJwtHeader
      }>,
      reply
    ) => changeAccountEmailService(request, reply, fastify)
  );

  // POST Change Password Account
  fastify.post(
    '/password',
    {
      preValidation: (request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>, reply) =>
        authenticationWithJwt(request, reply, fastify)
    },
    (
      request: FastifyRequest<{
        Body: ChangeAccountPasswordBodyRequest,
        Headers: IAuthWithJwtHeader
      }>,
      reply
    ) => changeAccountPasswordService(request, reply, fastify)
  );

  // GET App Setting
  fastify.get(
    '/app-setting',
    {
      preValidation: (request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>, reply) =>
        authenticationWithJwt(request, reply, fastify)
    },
    (
      request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>,
      reply
    ) => getAppSettingService(request, reply, fastify)
  );

  // POST Change App Setting
  fastify.post(
    '/app-setting',
    {
      preValidation: (request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>, reply) =>
        authenticationWithJwt(request, reply, fastify)
    },
    (
      request: FastifyRequest<{
        Body: ChangeAppSettingBodyRequest,
        Headers: IAuthWithJwtHeader
      }>,
      reply
    ) => changeAppSettingService(request, reply, fastify)
    );
}

export default AccountsRouter;