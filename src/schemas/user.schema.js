const Joi = require('joi');

const userSchema = Joi.object({ 
    id: Joi.number().integer().min(1),
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
    role: Joi.string().valid('admin', 'user').required(),
    created_at: Joi.date().timestamp().required(),
    updated_at: Joi.date().timestamp().required()
});

module.exports = {
    userSchema
};