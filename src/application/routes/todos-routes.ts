import express, { Router, Request, Response } from "express";
import { todoParamsValidation } from "../middlewares/todosValidators";
import { createTodo, fetchTodos } from "../controllers/todo-controller";

const todoRouter: Router = express.Router();

todoRouter.get('/todos', fetchTodos);

todoRouter.post('/todos', createTodo);

export default todoRouter;