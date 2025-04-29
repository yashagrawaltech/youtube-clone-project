import debug from 'debug';
import { config } from '../config';
import type { ApiErrorInterface, ApiResponseInterface } from '../types';

// Debugger
export const devlog =
    config.node_env === 'development' ? debug('development:app') : () => {};

export class ApiResponse<T> implements ApiResponseInterface<T> {
    public success: boolean;
    constructor(
        public statusCode: number,
        public message: string,
        public data: T
    ) {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
    }
}

export class ApiError<T> extends Error implements ApiErrorInterface<T> {
    public statusCode: number;
    public errors: T;
    public success: false = false;
    public override stack?: string;

    constructor(statusCode: number, message: string, errors: T) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;

        // Make `message` enumerable
        Object.defineProperty(this, 'message', {
            value: message,
            enumerable: true,
            writable: true,
        });

        // Capture the stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        if (config.node_env !== 'development') {
            this.stack = undefined;
        }
    }
}
