import { body } from 'express-validator';

// Validation rules for user registration and login
const registerValidator = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Name must be between 3 and 100 characters'),

    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),
    body('otp')
    .notEmpty()
    .withMessage('otp is required')
    .isLength({ min: 6, max: 6})
    .withMessage('otp must be at 6 characters long'),
];

const loginValidator = [
    body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),
];

export default {
    loginValidator, 
    registerValidator
}
