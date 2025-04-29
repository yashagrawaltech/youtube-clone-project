import { ApiError } from '../utils';
import type { ErrorHandler } from '../types';
import { httpResponseCodes } from '../constants';

export const errorHandler: ErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res
            .status(err.statusCode || httpResponseCodes.InternalServerError)
            .json(
                new ApiError<unknown>(
                    err.statusCode,
                    err.message || 'Something went wrong',
                    err.errors || null
                )
            );
    } else if (err instanceof Error) {
        return res
            .status(httpResponseCodes.InternalServerError)
            .json(
                new ApiError(
                    httpResponseCodes.InternalServerError,
                    err.message || 'Something went wrong',
                    null
                )
            );
    } else {
        return res
            .status(httpResponseCodes.InternalServerError)
            .json(
                new ApiError(
                    httpResponseCodes.InternalServerError,
                    'An unknown error occurred',
                    null
                )
            );
    }
};
