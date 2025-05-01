import { httpResponseCodes } from '../constants';
import { asyncHandler } from '../handlers/asyncHandler';
import { ApiResponse } from '../utils';

export const checkHealth = asyncHandler(async (req, res, next) => {
    return res
        .status(httpResponseCodes.OK)
        .json(
            new ApiResponse(httpResponseCodes.OK, 'Health check ok', undefined)
        );
});
