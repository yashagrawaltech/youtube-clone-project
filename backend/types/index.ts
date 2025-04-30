import type { NextFunction, Request, Response } from 'express';

export interface ApiResponseInterface<T> {
    statusCode: number;
    message: string;
    data: T;
    success: boolean;
}

export interface ApiErrorInterface<T> {
    statusCode: number;
    message: string;
    errors?: T;
    success: false;
    stack?: string | undefined;
}

export type AsyncHandlerCB = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

export type AsyncHandler = (
    cb: AsyncHandlerCB
) => (req: Request, res: Response, next: NextFunction) => Promise<void>;

export type ErrorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => void;

export interface ConnectToDBInterface {
    uri: string;
    connect: () => void;
    handleDisconnection: () => void;
    handleConnectionError: (error: unknown) => Promise<void>;
    handleAppTermination: () => void;
    getDBConnectionStatus: () => DBStatus;
}

export type DBStatus = {
    isConnected: boolean;
    readyState: number;
    host: string;
    name: string;
};
