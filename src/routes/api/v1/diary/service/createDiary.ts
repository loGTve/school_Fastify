import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {IAuthWithJwtHeader, QueryType} from "../../../../../utils/types";
import {bulkInsertValueString, validateDate} from "../../../../../utils/common";
import {fastifyErrorWrapper} from "../../../../../utils/error";
import _ from "lodash";
import humps from "humps";
import { v4 as uuidv4 } from 'uuid';

export type CreateDiaryBodyRequest = {
    diaryDate: string,
    title: string,
    content: string,
    pinned: boolean,
    secretCode: string | null,
    tags: string[] | null
};

export type CreateDiaryResponse = {
    id: string,
    createdAt: string,
    updatedAt: string,
    diaryDate: string,
    title: string,
    content: string,
    pinned: boolean,
    tags: DiaryTag[] | null
};

type InsertDiaryResult = {
    id: string,
    createdAt: string,
    updatedAt: string,
    diaryDate: string,
    title: string,
    content: string,
    pinned: boolean
};

export type DiaryTag = {
    id: string,
    tag: string
}

const createDiaryService = async (
        request: FastifyRequest<{
            Body: CreateDiaryBodyRequest,
            Headers: IAuthWithJwtHeader
        }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    if (!validateDate(request.body.diaryDate)) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'DIARY_DATE_IS_NOT_VALID'));
    }

    if (_.isEmpty(request.body.title)) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'TITLE_IS_NOT_VALID'));
    }

    if (_.isEmpty(request.body.content)) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'CONTENT_IS_NOT_VALID'));
    }

    const insertDiary = await fastify.pg.transact<InsertDiaryResult>(async client => {
        const query: QueryType = {
            text: `INSERT INTO diary_content (id, diary_date, title, content, pinned, secret_code, account_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, created_at, updated_at, diary_date, title, content, pinned`,
            values: [
                uuidv4(),
                request.body.diaryDate,
                request.body.title,
                client.escapeLiteral(request.body.content),
                request.body.pinned,
                request.body.secretCode,
                request.user.id
            ]

        }
        return <InsertDiaryResult> humps.camelizeKeys((await client.query<InsertDiaryResult>(query)).rows)[0];
    });

    let tags: DiaryTag[] = null;

    if (!_.isEmpty(request.body.tags)) {
        tags = await fastify.pg.transact<DiaryTag[]>(async client => {
            const query: QueryType = {
                text: `INSERT INTO diary_tag (id, account_id, diary_id, tag)
               VALUES ` + bulkInsertValueString(request.body.tags.length, 4, 1) + ` ` +
              `RETURNING id, tag`,
                values: [].concat(_.map(request.body.tags, value => {
                    return [uuidv4(), request.user.id, insertDiary.id, value]
                }).flat())
            }

            return <DiaryTag[]> humps.camelizeKeys((await client.query<DiaryTag>(query)).rows);
        });
    }

    const response: CreateDiaryResponse = {
        id: insertDiary.id,
        createdAt: insertDiary.createdAt,
        updatedAt: insertDiary.updatedAt,
        diaryDate: insertDiary.diaryDate,
        title: insertDiary.title,
        content: insertDiary.content,
        pinned: insertDiary.pinned,
        tags: tags
    };

    return reply
    .code(201)
    .type('application/json')
    .send(response);
}

export default createDiaryService;