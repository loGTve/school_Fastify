export interface IAuthWithJwtHeader {
    'authorization': string;
}

export type QueryType = {
    text: string,
    values: any[]
} 