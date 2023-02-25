import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {IAuthWithJwtHeader, QueryType} from "../../../../../utils/types";
import {DiaryTag} from "./createDiary";
import humps from "humps";
import _ from "lodash";
import {fastifyErrorWrapper} from "../../../../../utils/error";

export type GetDiaryByIdParamRequest = {
    diaryId: string
};

export type GetDiaryByIdQueryRequest = {
    secretCode: string
};

type SelectDiaryResult = {
    id: string,
    createdAt: string,
    updatedAt: string,
    diaryDate: string,
    title: string,
    content: string,
    pinned: boolean,
    tags: DiaryTag[] | null,
    secretCode: string
};

type GetDiaryByIdResponse = {
    id: string,
    createdAt: string,
    updatedAt: string,
    diaryDate: string,
    title: string,
    content: string,
    pinned: boolean,
    tags: DiaryTag[] | null
};

const getDiaryByIdService = async (
        request: FastifyRequest<{
            Params: GetDiaryByIdParamRequest,
            Querystring: GetDiaryByIdQueryRequest,
            Headers: IAuthWithJwtHeader
        }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    const selectDiary = await fastify.pg.transact<SelectDiaryResult>(async client => {
        const query: QueryType = {
            text: `SELECT diary_content.id,
                    created_at,
                    updated_at,
                    diary_date,
                    title,
                    content,
                    pinned,
                    array_agg((
                        SELECT row_to_json(row_tags)
                        FROM (SELECT diary_tag.id AS tag_id, diary_tag.tag AS tag)
                                 AS row_tags
                    )) AS tags,
                    secret_code
             FROM diary_content
             LEFT JOIN diary_tag ON diary_content.id::TEXT LIKE diary_tag.diary_id::TEXT
             WHERE diary_content.id::TEXT LIKE $1
             AND diary_content.account_id::TEXT LIKE $2
             GROUP BY diary_content.id, created_at, updated_at, diary_date, title, content, pinned, secret_code`,
            values: [
                request.params.diaryId,
                request.user.id
            ]
        }
        return <SelectDiaryResult> humps.camelizeKeys((await client.query<SelectDiaryResult>(query)).rows)[0];
    });

    if (!_.isNull(selectDiary.secretCode) && selectDiary.secretCode !== request.query.secretCode) {
        return reply
      .code(400)
      .type('application/json')
      .send(fastifyErrorWrapper(400, 'SECRET_CODE_MISMATCH'));
    }

    const response: GetDiaryByIdResponse = {
        id: selectDiary.id,
        createdAt: selectDiary.createdAt,
        updatedAt: selectDiary.updatedAt,
        diaryDate: selectDiary.diaryDate,
        title: selectDiary.title,
        content: selectDiary.content,
        pinned: selectDiary.pinned,
        tags: selectDiary.tags
    };

    return reply
    .code(200)
    .type('application/json')
    .send(response);
}

export default getDiaryByIdService;