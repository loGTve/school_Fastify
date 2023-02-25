import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {IAuthWithJwtHeader, QueryType} from "../../../../../utils/types";
import {
    validateDate,
    validateBloodType,
    validateGender,
    validateMbtiType,
    validatePhoneNumber
} from "../../../../../utils/common";
import _ from "lodash";
import {fastifyErrorWrapper} from "../../../../../utils/error";
import humps from "humps";

export type ChangeAccountInfoBodyRequest = {
    phoneNumber: string | null,
    gender: string | null,
    firstName: string | null,
    lastName: string | null,
    nickname: string,
    birthDate: string | null,
    mbtiType: string | null,
    bloodType: string | null
};

export type UpdateAccountInfoResult = ChangeAccountInfoBodyRequest;
export type ChangeAccountInfoResponse = ChangeAccountInfoBodyRequest;

const changeAccountInfoService = async (
        request: FastifyRequest<{
            Body: ChangeAccountInfoBodyRequest,
            Headers: IAuthWithJwtHeader
        }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    if (!_.isNull(request.body.phoneNumber) && !validatePhoneNumber(request.body.phoneNumber)) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'PHONE_NUMBER_IS_NOT_VALID'));
    }

    if (!_.isNull(request.body.gender) && !validateGender(request.body.gender)) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'GENDER_TYPE_IS_NOT_VALID'));
    }

    if (!_.isNull(request.body.birthDate) && !validateDate(request.body.birthDate)) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'BIRTH_DATE_IS_NOT_VALID'));
    }

    if (!_.isNull(request.body.mbtiType) && !validateMbtiType(request.body.mbtiType)) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'MBTI_TYPE_IS_NOT_VALID'));
    }

    if (!_.isNull(request.body.bloodType) && !validateBloodType(request.body.bloodType)) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'BLOOD_TYPE_IS_NOT_VALID'));
    }

    const updateAccountInfoById = await fastify.pg.transact<UpdateAccountInfoResult>(async client => {
        const query: QueryType = {
            text: `UPDATE accounts SET phone_number = $1,
                                 gender = $2,
                                 first_name = $3,
                                 last_name = $4,
                                 nickname = $5,
                                 birth_date = $6,
                                 mbti_type = $7,
                                 blood_type = $8
             WHERE id::TEXT LIKE $9
             RETURNING phone_number, gender, first_name, last_name, nickname, birth_date, mbti_type, blood_type`,
            values: [
                request.body.phoneNumber,
                request.body.gender,
                request.body.firstName,
                request.body.lastName,
                request.body.nickname,
                request.body.birthDate,
                request.body.mbtiType,
                request.body.bloodType,
                request.user.id
            ]
        }
        return <UpdateAccountInfoResult> (humps.camelizeKeys((await client.query<UpdateAccountInfoResult>(query)).rows)[0]);
    });

    const response: ChangeAccountInfoResponse = {
        phoneNumber: updateAccountInfoById.phoneNumber,
        gender: updateAccountInfoById.gender,
        firstName: updateAccountInfoById.firstName,
        lastName: updateAccountInfoById.lastName,
        nickname: updateAccountInfoById.nickname,
        birthDate: updateAccountInfoById.birthDate,
        mbtiType: updateAccountInfoById.mbtiType,
        bloodType: updateAccountInfoById.bloodType
    };

    return reply
    .code(201)
    .type('application/json')
    .send(response)
}

export default changeAccountInfoService;