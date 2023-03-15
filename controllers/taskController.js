import {request, response} from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const addTask = async(req = request, res = response) => {
    const {project} = req.body;
    const existsProject = await Project.findById(project);

    if (!existsProject) {
        const err = new Error('The project does not exist');
        return res.status(404).json({msg: err.message});
    }

    if (existsProject.creator.toString() !== req.user._id.toString()) {
        const err = new Error('You do not have the permissions to add tasks');
        return res.status(404).json({msg: err.message});
    }

    try {
        const storedTask = await Task.create(req.body);
        existsProject.tasks.push(storedTask._id);
        await existsProject.save();
        res.json(storedTask);
    } catch (err) {
        console.log(err);
    }
}

const getTask = async(req = request, res = response) => {
    const {id} = req.params;
    const task = await Task.findById(id).populate('project');

    if (!task) {
        const err = new Error('Invalid action');
        return res.status(404).json({msg: err.message});
    }

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const err = new Error('Task not found');
        return res.status(403).json({msg: err.message});
    }

    res.json(task);
}

const updateTask = async(req = request, res = response) => {
    const {id} = req.params;
    const task = await Task.findById(id).populate('project');

    if (!task) {
        const err = new Error('Invalid action');
        return res.status(404).json({msg: err.message});
    }

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const err = new Error('Task not found');
        return res.status(403).json({msg: err.message});
    }

    task.name = req.body.name || task.name;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.deliveryDate = req.body.deliveryDate || task.deliveryDate;

    try {
        const storedTask = await task.save();
        res.json(storedTask);
    } catch (err) {
        console.log(err);
    }
}

const deleteTask = async(req = request, res = response) => {
    const {id} = req.params;
    const task = await Task.findById(id).populate('project');

    if (!task) {
        const err = new Error('Invalid action');
        return res.status(404).json({msg: err.message});
    }

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const err = new Error('Task not found');
        return res.status(403).json({msg: err.message});
    }

    try {
        const project = await Project.findById(task.project);
        project.tasks.pull(task._id);

        await Promise.allSettled([await project.save(), await task.deleteOne()]);

        res.json({msg: 'The task was delete'})
    } catch (err) {
        console.log(err);
    }
}

const changeState = async(req = request, res = response) => {
    const {id} = req.params;
    const task = await Task.findById(id).populate('project').populate('complete');

    if (!task) {
        const err = new Error('Invalid action');
        return res.status(404).json({msg: err.message});
    }

    if (task.project.creator.toString() !== req.user._id.toString() && !tasks.project.collaborators.some(collaborator => collaborator._id.toString() === req.user._id.toString())) {
        const err = new Error('Action not valid');
        return res.status(403).json({msg: err.message});
    }

    task.state = !task.state;
    task.complete = req.user._id;
    await task.save();

    const taskStored = await Task.findById(id).populate('project').populate('complete');
    res.json(taskStored);
}

export {
    addTask,
    getTask,
    updateTask,
    deleteTask,
    changeState
}