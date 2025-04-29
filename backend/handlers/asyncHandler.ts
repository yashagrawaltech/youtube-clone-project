import type { NextFunction, Request, Response } from 'express';
import type { AsyncHandler } from '../types';
import { devlog } from '../utils';

export const asyncHandler: AsyncHandler = (cb) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await cb(req, res, next);
        } catch (error) {
            next(
                error instanceof Error
                    ? error
                    : new Error('Something went wrong')
            );
        }
    };
};
