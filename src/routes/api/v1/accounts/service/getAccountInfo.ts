import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {IAuthWithJwtHeader, QueryType} from "../../../../../utils/types";
import humps from "humps";

export type GetAccountInfoResponse = {
    email: string,
    phoneNumber: string | null,
    gender: string | null,
    firstName: string | null,
    lastName: string | null,
    nickname: string,
    birthDate: string | null,
    mbtiType: string | null,
    bloodType: string | null
};

type SelectAccountResult = GetAccountInfoResponse;

const getAccountInfoService = async (
        request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    const findAccountInfo = await fastify.pg.transact<SelectAccountResult>(async client => {
        const query: QueryType = {
            text: `SELECT email,
                    phone_number,
                    gender,
                    first_name,
                    last_name,
                    nickname,
                    birth_date,
                    mbti_type,
                    blood_type
             FROM accounts
             WHERE id::TEXT LIKE $1
             LIMIT 1`,
            values: [request.user.id]
        }
        return <SelectAccountResult> humps.camelizeKeys((await client.query<SelectAccountResult>(query)).rows)[0];
    });

    const response: GetAccountInfoResponse = {
        email: findAccountInfo.email,
        phoneNumber: findAccountInfo.phoneNumber,
        gender: findAccountInfo.gender,
        firstName: findAccountInfo.firstName,
        lastName: findAccountInfo.lastName,
        nickname: findAccountInfo.nickname,
        birthDate: findAccountInfo.birthDate,
        mbtiType: findAccountInfo.mbtiType,
        bloodType: findAccountInfo.bloodType
    };

    return reply
    .code(200)
    .type('application/json')
    .send(response);
}

export default getAccountInfoService;