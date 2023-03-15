import { request, response } from "express";
import User from "../models/User.js";
import generateId from "../helpers/generateId.js";
import generateJWT from "../helpers/generateJWT.js";
import { emailRegister, emailForgotPassword } from "../helpers/email.js";

const register = async(req = request, res = response) => {

    const {email} = req.body;
    const userExists = await User.findOne({email});

    if (userExists) {
        const err = new Error('User already registered');
        return res.status(400).json({msg: err.message})
    }

    try {
        const user = new User(req.body);
        user.token = generateId();
        await user.save();

        emailRegister({
            email: user.email,
            name: user.name,
            token: user.token
        });

        res.json({msg: 'User created successfully, check your email to confirm your account'});
    } catch (err) {
        console.log(err);
    }
};

const authenticate = async(req = request, res = response) => {
    const {email, password} = req.body;

    const user = await User.findOne({ email });
    if(!user) {
        const err = new Error('User does not exist');
        return res.status(404).json({msg: err.message});
    }

    if(!user.confirmed) {
        const err = new Error('Your account has not been confirmed');
        return res.status(403).json({msg: err.message});
    }

    if(await user.checkPassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateJWT(user._id)
        })
    } else {
        const err = new Error('The password is incorrect');
        return res.status(403).json({msg: err.message});
    }
};

const confirmed = async(req = request, res = response) => {
    const {token} = req.params;
    const userConfirmed = await User.findOne({token});
    if(!userConfirmed) {
        const err = new Error('Token not valid');
        return res.status(403).json({msg: err.message});
    }

    try {
        userConfirmed.confirmed = true;
        userConfirmed.token = '';
        await userConfirmed.save();
        res.json({msg: 'User successfully confirmed'});
    } catch (err) {
        console.log(err);
    }
};

const forgotPassword = async(req = request, res = response) => {
    const {email} = req.body;
    const user = await User.findOne({ email });
    if(!user) {
        const err = new Error('User does not exist');
        return res.status(404).json({msg: err.message});
    };

    try {
        user.token = generateId();
        await user.save();

        emailForgotPassword({
            email: user.email,
            name: user.name,
            token: user.token
        });

        res.json({msg: 'We have sent you an e-mail with instructions'});
    } catch (err) {
        console.log(err);
    }
};

const checkToken = async(req = request, res = response) => {
    const {token} = req.params;

    const tokenValid = await User.findOne({token});

    if (tokenValid) {
        res.json({msg: 'Token valid and user exists'});
    } else {
        const err = new Error('Token not invalid');
        return res.status(404).json({msg: err.message});
    }
}

const newPassword = async(req = request, res = response) => {
    const {token} = req.params;
    const {password} = req.body;

    const user = await User.findOne({token});

    if (user) {
        user.password = password;
        user.token = '';
        try {
            await user.save();
            res.json({msg: 'password changed correctly'})
        } catch (err) {
            console.log(err);
        }
    } else {
        const err = new Error('Token not invalid');
        return res.status(404).json({msg: err.message});
    }

    console.log(token);
    console.log(password);
};

const profile = async(req = request, res = response) => {
    const { user } = req;

    res.json(user);
}

export {
    register,
    authenticate,
    confirmed,
    forgotPassword,
    checkToken,
    newPassword,
    profile
};