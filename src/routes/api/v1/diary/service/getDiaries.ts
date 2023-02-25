import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {IAuthWithJwtHeader, QueryType} from "../../../../../utils/types";
import {DiaryTag} from "./createDiary";
import humps from "humps";

export type GetDiariesQueryRequest = {
    page: number,
    limit: number
};

export type SelectDiariesResult = {
    id: string,
    diaryDate: string,
    title: string,
    pinned: string,
    hasSecretCode: boolean,
    tags: DiaryTag[] | null
};

export type GetDiariesRequestInfo = {
    page: number,
    limit: number,
    data_count: number
}

export type GetDiariesResponse = {
    information: GetDiariesRequestInfo,
    data: SelectDiariesResult[]
}

const getDiariesService = async (
        request: FastifyRequest<{
            Querystring: GetDiariesQueryRequest,
            Headers: IAuthWithJwtHeader
        }>,
        reply: FastifyReply,
        fastify: FastifyInstance
        ) => {
    
    const selectDiaries = await fastify.pg.transact<SelectDiariesResult[]>(async client => {
        const query: QueryType = {
            text: `SELECT diary_content.id,
                    TO_CHAR(diary_date AT TIME ZONE 'KST' AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS diary_date,
                    title,
                    pinned,
                    CASE WHEN secret_code IS NOT NULL THEN true ELSE false END AS secret_code,
                    array_agg((
                        SELECT row_to_json(row_tags)
                        FROM (SELECT diary_tag.id AS tag_id, diary_tag.tag AS tag)
                                 AS row_tags
                    )) AS tags
             FROM diary_content
             LEFT JOIN diary_tag ON diary_content.id::TEXT LIKE diary_tag.diary_id::TEXT
             WHERE diary_content.account_id::TEXT LIKE $1
             GROUP BY diary_content.id, diary_date, title, pinned, secret_code
             ORDER BY pinned DESC, diary_date DESC
             LIMIT $2
             OFFSET ($3 - 1) * $2`,
            values: [
                request.user.id,
                request.query.limit,
                request.query.page
            ]
        }
        return <SelectDiariesResult[]> humps.camelizeKeys((await client.query<SelectDiariesResult>(query)).rows);
    });

    const response: GetDiariesResponse = {
        information: {
            page: request.query.page,
            limit: request.query.limit,
            data_count: selectDiaries.length
        },
        data: selectDiaries
    };

    return reply
    .code(200)
    .type('application/json')
    .send(response);
}

export default getDiariesService;