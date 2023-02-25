import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {IAuthWithJwtHeader, QueryType} from "../../../../../utils/types";
import {DiaryTag} from "./createDiary";
import humps from "humps";
import _ from "lodash";
import {fastifyErrorWrapper} from "../../../../../utils/error";
import {bulkInsertValueString} from "../../../../../utils/common";
import {v4 as uuidv4} from "uuid";

export type UpdateDiaryParamRequest = {
    diaryId: string
};

export type UpdateDiaryBodyRequest = {
    diaryDate: string,
    title: string,
    content: string,
    pinned: boolean,
    secretCode: string | null,
    changeRequestSecretCode: string | null,
    tags: DiaryTag[] | null
};

export type UpdateDiaryResponse = {
    id: string,
    createdAt: string,
    updatedAt: string,
    diaryDate: string,
    title: string,
    content: string,
    pinned: boolean,
    tags: DiaryTag[] | null
};

type SelectDiaryResult = {
    id: string,
    secretCode: string | null
};

type UpdateDiaryResult = {
    id: string,
    createdAt: string,
    updatedAt: string,
    diaryDate: string,
    title: string,
    content: string,
    pinned: boolean
};

const updateDiaryService = async (
        request: FastifyRequest<{
            Params: UpdateDiaryParamRequest,
            Body: UpdateDiaryBodyRequest,
            Headers: IAuthWithJwtHeader
        }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    const selectDiary = await fastify.pg.transact<SelectDiaryResult>(async client => {
        const query: QueryType = {
            text: `SELECT id, secret_code FROM diary_content
             WHERE account_id::TEXT LIKE $1
             AND id::TEXT LIKE $2
             LIMIT 1`,
            values: [
                request.user.id,
                request.params.diaryId
            ]
        }
        return <SelectDiaryResult> humps.camelizeKeys((await client.query<SelectDiaryResult>(query)).rows)[0];
    });

    if (!_.isNull(selectDiary.secretCode) && selectDiary.secretCode !== request.body.secretCode) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'SECRET_CODE_MISMATCH'));
    }

    const updateDiary = await fastify.pg.transact<UpdateDiaryResult>(async client => {
        const query: QueryType = {
            text: `UPDATE diary_content
             SET diary_date = $1,
                 title = $2,
                 content = $3,
                 pinned = $4,
                 secret_code = $5
             WHERE id::TEXT LIKE $6
             AND account_id::TEXT LIKE $7
             RETURNING id, created_at, updated_at, diary_date, title, content, pinned`,
            values: [
                request.body.diaryDate,
                request.body.title,
                client.escapeLiteral(request.body.content),
                request.body.pinned,
                request.body.changeRequestSecretCode,
                request.params.diaryId,
                request.user.id
            ]
        }
        return <UpdateDiaryResult> humps.camelizeKeys((await client.query<UpdateDiaryResult>(query)).rows)[0];
    });

    try {
        await fastify.pg.transact(async client => {
            const query: QueryType = {
                text: `DELETE FROM diary_tag
               WHERE account_id::TEXT LIKE $1
               AND diary_id::TEXT LIKE $2`,
                values: [
                    request.user.id,
                    request.params.diaryId
                ]
            }
            await client.query(query);
        });
    } catch (error) {
        return reply
      .code(500)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'DIARY_TAG_UPDATE_FAILED'));
    }

    let tags: DiaryTag[] = null;

    if (!_.isEmpty(request.body.tags)) {
        tags = await fastify.pg.transact<DiaryTag[]>(async client => {
            const query: QueryType = {
                text: `INSERT INTO diary_tag (id, account_id, diary_id, tag)
               VALUES ` + bulkInsertValueString(request.body.tags.length, 4, 1) + ` ` +
          `RETURNING id, tag`,
                values: [].concat(_.map(request.body.tags, value => {
                    return [uuidv4(), request.user.id, updateDiary.id, value]
                }).flat())
            }

            return <DiaryTag[]> humps.camelizeKeys((await client.query<DiaryTag>(query)).rows);
        });
    }

    const response: UpdateDiaryResponse = {
        id: updateDiary.id,
        createdAt: updateDiary.createdAt,
        updatedAt: updateDiary.updatedAt,
        diaryDate: updateDiary.diaryDate,
        title: updateDiary.title,
        content: updateDiary.content,
        pinned: updateDiary.pinned,
        tags: tags
    };

    return reply
    .code(201)
    .type('application/json')
    .send(response);
}

export default updateDiaryService;