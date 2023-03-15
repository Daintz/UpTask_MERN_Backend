import { request, response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const checkAuth = async(req = request, res = response, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password -confirmed -token -createdAt -updatedAt -__v");

            return next();
        } catch (err) {
            return res.status(404).json({msg: 'There was an error'});
        }
    }

    if (!token) {
        const err = new Error('Token not valid');
        return res.status(401).json({msg: err.message});
    }

    next();
};

export default checkAuth;