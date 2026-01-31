import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validateRequest = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);

        if (errors.isEmpty()) {
            next();
            return;
        }

        const formattedErrors = errors.array().map(error => ({
            field: 'path' in error ? error.path : 'unknown',
            message: error.msg
        }));

        res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: formattedErrors
        });
    };
};

export default validateRequest;
