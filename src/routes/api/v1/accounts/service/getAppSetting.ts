import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import humps from "humps";
import {IAuthWithJwtHeader, QueryType} from "../../../../../utils/types";
import {GetAccountInfoResponse} from "./getAccountInfo";

export type GetAppSettingResponse = {
    visibilityMbti: boolean,
    visibilityBloodType: boolean
};

type SelectAppSettingResult = GetAppSettingResponse;

const getAppSettingService = async (
        request: FastifyRequest<{ Headers: IAuthWithJwtHeader }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    const findAccountInfo = await fastify.pg.transact<SelectAppSettingResult>(async client => {
        const query: QueryType = {
            text: `SELECT visibility_mbti,
                    visibility_blood_type
             FROM app_settings
             WHERE account_id::TEXT LIKE $1
             LIMIT 1`,
            values: [request.user.id]
        }
        return <SelectAppSettingResult> humps.camelizeKeys((await client.query<SelectAppSettingResult>(query)).rows)[0];
    });

    const response: GetAppSettingResponse = {
        visibilityMbti: findAccountInfo.visibilityMbti,
        visibilityBloodType: findAccountInfo.visibilityBloodType
    };

    return reply
    .code(200)
    .type('application/json')
    .send(response);
}

export default getAppSettingService;