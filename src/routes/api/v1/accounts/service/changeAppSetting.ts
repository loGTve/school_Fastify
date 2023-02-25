import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import { values } from "lodash";
import {IAuthWithJwtHeader, QueryType} from "../../../../../utils/types";
import humps from "humps";

export type ChangeAppSettingBodyRequest = {
    visibilityMbti: boolean,
    visibilityBloodType: boolean
};

export type UpdateAppSettingResult = ChangeAppSettingBodyRequest;
export type ChangeAppSettingResponse = ChangeAppSettingBodyRequest;

const changeAppSettingService = async (
        request: FastifyRequest<{
            Body: ChangeAppSettingBodyRequest,
            Headers: IAuthWithJwtHeader
        }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    const updateAppSetting = await fastify.pg.transact<UpdateAppSettingResult>(async client => {
        const query: QueryType = {
            text: `UPDATE app_settings SET visibility_mbti = $1,
                                     visibility_blood_type = $2
             WHERE account_id::TEXT LIKE $3
             RETURNING visibility_mbti, visibility_blood_type`,
            values: [
                request.body.visibilityMbti,
                request.body.visibilityBloodType,
                request.user.id
            ]
        }
        return <UpdateAppSettingResult> humps.camelizeKeys((await client.query<UpdateAppSettingResult>(query)).rows)[0];
    });

    const response: ChangeAppSettingResponse = {
        visibilityMbti: updateAppSetting.visibilityMbti,
        visibilityBloodType: updateAppSetting.visibilityBloodType
    };

    return reply
    .code(201)
    .type('application/json')
    .send(response)
}

export default changeAppSettingService;