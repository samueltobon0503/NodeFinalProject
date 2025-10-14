import { Request, Response } from "express";
import { getTodos, saveTodo } from "../../domain/services/todo-service";
import { todoResponse } from "./interfaces/todo-response";
import { ITodo } from "../../domain/models/ITodo";

export const fetchTodos = async (request: Request, response: Response) => {

    try {
        // const todos = await getTodos();
        response.json({
            ok: true,
            data: 'hi'
        })
    } catch (error) {
        console.error(error);
        throw new Error("Se cagó la creación del todo");
    }

};

export const createTodo = async (request: Request, response: Response) => {
    try {
        const { title, body } = request.body;
        const newTodo: ITodo = {
            title: title,
            body: body,
            createdAt: new Date()
        }
        const result = await saveTodo(newTodo);
        response.json({
        ok: true,
        staus: 'created',
        data: result
    })
    } catch (error) {
        console.error(error);
        throw new Error("Se cagó la creación del todo");
    }

};