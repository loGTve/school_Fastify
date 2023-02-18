import {FastifyInstance, FastifyRegister, FastifyReply, FastifyRequest} from "fastify";
import {
    validateBloodType,
    validateDate,
    validateEmailAddress,
    validateGender,
    validateMbtiType,
    validatePhoneNumber
} from "../../../../../utils/common";
import {fastifyErrorWrapper} from "../../../../../utils/error";
import _ from 'lodash';
import {QueryType} from "../../../../../utils/types";
import humps from "humps";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { JwtSignaturePayload } from "../../../../../middleware/authentication";

export type RegisterAccountBodyRequest = {
    email: string,
    password: string,
    phoneNumber: string | null,
    gender: string | null,
    firstName: string | null,
    lastName: string | null,
    nickname: string,
    birthDate: string | null,
    mbtiType: string | null,
    bloodType: string | null
};

export type RegisterAccountResponse = {
    nickname: string,
    accessToken: string
};

type SelectAccountEmailResult = {
    id: string
};

type SelectAccountNicknameResult = {
    id: string
};

type InsertAccountResult = {
    id: string,
    nickname: string,
    email: string
};

const registerAccountService = async(
        request: FastifyRequest<{ Body: RegisterAccountBodyRequest }>,
        reply: FastifyReply,
        fastify: FastifyInstance
) => {
    if (!validateEmailAddress(request.body.email)) {
        return reply
            .code(400)
            .type('application/json')
            .send(fastifyErrorWrapper(400, 'EMAIL_ADDRESS_INCORRECT'));
    }

    if(!_.isNull(request.body.phoneNumber) && !validatePhoneNumber(request.body.phoneNumber)) {
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

    if(!_.isNull(request.body.birthDate) && !validateDate(request.body.birthDate)) {
        return reply
            .code(400)
            .type('application/json')
            .send(fastifyErrorWrapper(400, 'BIRTH_DATE_IS_NOT_VALID'));
    }

    if(!_.isNull(request.body.mbtiType) && !validateMbtiType(request.body.mbtiType)) {
        return reply
            .code(400)
            .type('application/json')
            .send(fastifyErrorWrapper(400, 'MBTI_TYPE_IS_NOT_VALID'));
    }

    if(!_.isNull(request.body.bloodType) && !validateBloodType(request.body.bloodType)) {
        return reply
            .code(400)
            .type('application/json')
            .send(fastifyErrorWrapper(400, 'BLOOD_TYPE_IS_NOT_VALID'));
    }

    //dup check
    const findSameEmail = await fastify.pg.transact<SelectAccountEmailResult>(async client => {
        const query: QueryType = {
            text: `SELECT id FROM accounts
                   WHERE email LIKE $1
                   LIMIT 1`,
            values: [request.body.email]
        }
        return <SelectAccountEmailResult> humps.camelizeKeys((
                await client.query<SelectAccountEmailResult>(query)
        ).rows)[0];
    });

    if (findSameEmail) {
        return reply
            .code(409)
            .type('application/json')
            .send(fastifyErrorWrapper(409, 'EMAIL_ADDRESS_ALREADY_EXISTS'));
    }

    const findSameNickname = await fastify.pg.transact<SelectAccountNicknameResult>(async client => {
        const query: QueryType = {
            text: `SELECT id FROM accounts
                   WHERE nickname LIKE $1
                   LIMIT 1`,
            values: [request.body.nickname]
        }
        return <SelectAccountNicknameResult> humps.camelizeKeys((
                await client.query<SelectAccountNicknameResult>(query)
        ).rows)[0];
    });

    if(findSameNickname) {
        return reply
            .code(409)
            .type('application/json')
            .send(fastifyErrorWrapper(409, 'NICKNAME_ALREADY_EXISTS'));
    }

    const insertAccount = await fastify.pg.transact<InsertAccountResult>(async client => {
       const query: QueryType = {
           text: `INSERT INTO accounts
           (id, email, password, phone_number,
           gender, first_name, last_name, nickname,
           birth_date, mbti_type, blood_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING id, email, nickname`,
           values: [
               uuidv4(),
               request.body.email,
               await bcrypt.hash(request.body.password, 10),
               request.body.phoneNumber || null,
               request.body.gender || null,
               request.body.firstName || null,
               request.body.lastName || null,
               request.body.nickname,
               request.body.birthDate || null,
               request.body.mbtiType || null,
               request.body.bloodType || null
           ]
       }
        return <InsertAccountResult> humps.camelizeKeys((
                await client.query<InsertAccountResult>(query)
        ).rows) [0];
    });

    await fastify.pg.transact(async client => {
        const query: QueryType = {
            text: `INSERT INTO app_settings
                   (account_id, visibility_mbti, visibility_blood_type)
                   VALUES ($1, $2::BOOLEAN, $3::BOOLEAN)`,
            values: [
                insertAccount.id,
                false,
                false
            ]
        }
        await client.query(query);
    });

    const jwtPayload: JwtSignaturePayload = {
        id: insertAccount.id
    };

    const response: RegisterAccountResponse = {
        nickname: insertAccount.nickname,
        accessToken: fastify.jwt.sign(jwtPayload, {
            expiresIn: '2h'
        })
    };

    return reply
        .code(201)
        .type('application/json')
        .send(response);
};

export default registerAccountService;