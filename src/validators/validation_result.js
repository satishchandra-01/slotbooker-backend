import {validationResult} from 'express-validator';

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            code: "validation_failed",
            error: errors.array()[0].msg,
        });
    }
    next();
};

export default handleValidationErrors;
