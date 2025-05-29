export interface IRepository<T> {
    create(data: T): Promise<T>;
    select(whereCol: string, identifier: number): Promise<T[]>;
    selectOne(whereCol: string, identifier: number): Promise<T | null>;
    update(whereCol: string, identifier: number | string, changes: Partial<T>): Promise<T>;
    delete(whereCol: string, identifier: number): Promise<T | T[]>
}