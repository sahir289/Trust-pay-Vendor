export interface ParamsState {
    page: number;
    limit: number;
    [key: string]: string | number | string[] | undefined; 
}
