import { request, response } from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const getProjects = async(req = request, res = response) => {
    const projects = await Project.find({
        '$or' : [
            {'collaborators': {$in: req.user}},
            {'creator': {$in: req.user}},
        ]
    }).select('-tasks');

    res.json(projects);
}

const newProject = async(req = request, res = response) => {
    const project = new Project(req.body);
    project.creator = req.user._id;

    try {
        const storedProject = await project.save();
        res.json(storedProject);
    } catch (err) {
        console.log(err);
    }
}

const getProject = async(req = request, res = response) => {
    const {id} = req.params;
    const project = await Project.findById(id).populate({path: 'tasks', populate: {path: 'complete', select: 'name'}}).populate('collaborators', 'name email');

    if (!project) {
        const err = new Error('Not found');
        return res.status(404).json({msg: err.message});
    }

    if (project.creator.toString() !== req.user._id.toString() && !project.collaborators.some(collaborator => collaborator._id.toString() === req.user._id.toString())) {
        const err = new Error('Invalid action');
        return res.status(401).json({msg: err.message});
    }

    res.json(project);
}

const editProject = async(req = request, res = response) => {
    const {id} = req.params;
    const project = await Project.findById(id);

    if (!project) {
        const err = new Error('Not found');
        return res.status(404).json({msg: err.message});
    }

    if (project.creator.toString() !== req.user._id.toString()) {
        const err = new Error('Invalid action');
        return res.status(401).json({msg: err.message});
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.deliveryDate = req.body.deliveryDate || project.deliveryDate;
    project.client = req.body.client || project.client;

    try {
        const storedProject = await project.save();
        res.json(storedProject);
    } catch (err) {
        console.log(err);
    }
}

const deleteProject = async(req = request, res = response) => {
    const {id} = req.params;
    const project = await Project.findById(id);

    if (!project) {
        const err = new Error('Not found');
        return res.status(404).json({msg: err.message});
    }

    if (project.creator.toString() !== req.user._id.toString()) {
        const err = new Error('Invalid action');
        return res.status(401).json({msg: err.message});
    }

    try {
        await project.deleteOne();
        res.json({msg: 'Project delete'})
    } catch (err) {
        console.log(err);
    }
}

const searchCollaborator = async(req = request, res = response) => {
    const {email} = req.body;
    const user = await User.findOne({email}).select('-confirmed -createdAt -updatedAt -password -token -__v');

    if (!user) {
        const err = new Error('User not found');
        return res.status(404).json({msg: err.message});
    }

    res.json(user);
}

const addCollaborator = async(req = request, res = response) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        const err = new Error('Project not found');
        return res.status(404).json({msg: err.message});
    }

    if (project.creator.toString() !== req.user._id.toString()) {
        const err = new Error('Action not valid');
        return res.status(404).json({msg: err.message});
    }

    const {email} = req.body;
    const user = await User.findOne({email}).select('-confirmed -createdAt -updatedAt -password -token -__v');

    if (!user) {
        const err = new Error('User not found');
        return res.status(404).json({msg: err.message});
    }

    if (project.creator.toString() === user._id.toString()) {
        const err = new Error('The creator of the project cannot be a collaborator');
        return res.status(404).json({msg: err.message});
    }

    if (project.collaborators.includes(user._id)) {
        const err = new Error('The user already belongs to the project');
        return res.status(404).json({msg: err.message});
    }

    project.collaborators.push(user._id);
    await project.save();
    res.json({msg: 'Contributor successfully added'});
}

const deleteCollaborator = async(req = request, res = response) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        const err = new Error('Project not found');
        return res.status(404).json({msg: err.message});
    }

    if (project.creator.toString() !== req.user._id.toString()) {
        const err = new Error('Action not valid');
        return res.status(404).json({msg: err.message});
    }

    const {email} = req.body;

    project.collaborators.pull(req.body.id);
    await project.save();
    res.json({msg: 'Contributor successfully removed'});
}

export {
    getProjects,
    newProject,
    getProject,
    editProject,
    deleteProject,
    searchCollaborator,
    addCollaborator,
    deleteCollaborator
}