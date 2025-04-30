import express from 'express';
import { config } from './config';
import type { AddressInfo } from 'net';
import cookieParser from 'cookie-parser';
import { errorHandler } from './handlers/errorHandler';
import { ApiResponse, devlog } from './utils';
import { asyncHandler } from './handlers/asyncHandler';
import { httpResponseCodes } from './constants';
import cors from 'cors';
import { connectToMongoDB, getDBStatus } from './db';

// App Initialization
const app = express();

// Common Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: config.frontend_urls,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

// Logger Middleware
app.use(
    asyncHandler(async (req, res, next) => {
        res.on('finish', () => {
            // Log the request method, URL, and response status code when the response is finished only in development mode
            devlog(`[${req.method}] ${req.originalUrl} -> ${res.statusCode}`);
        });
        next();
    })
);

// Routes

// Not Found Route
app.use(
    asyncHandler(async (req, res, next) => {
        return res
            .status(httpResponseCodes.NotFound)
            .json(
                new ApiResponse(
                    httpResponseCodes.NotFound,
                    'Route not found',
                    null
                )
            );
    })
);

// Error Handler
app.use(errorHandler);

// Server
const server = app.listen(config.port, async () => {
    const addr = server.address();
    if (addr && typeof addr === 'object') {
        const { address, port } = addr as AddressInfo;
        console.log(
            `Server running at http://${address === '::' ? 'localhost' : address}:${port}`
        );
    } else {
        console.log('Server is running...');
    }
    devlog('debugger is running');
    await connectToMongoDB();
    const DBStatus = getDBStatus();
    devlog(`
        DB Connection Status: ${DBStatus.isConnected},
        DB Host: ${DBStatus.host}
        DB Name: ${DBStatus.name}
        DB Ready State: ${DBStatus.readyState}
    `);
});
