import { Todo } from "../interfaces/Todo"
import { ITodo } from "../models/ITodo";

export const getTodos = async () => {
    try {
        return await Todo.find();
    } catch (error) {
        console.error(error);
        throw new Error("Se cagó obteniendo todos");
    }
}

export const saveTodo = async (todo: ITodo) => {
    try {
        const newTodo = new Todo(todo);
        await newTodo.save();
        return newTodo;
    } catch (error) {
        console.error(error);
        throw new Error("Se cagó la creación del todo");
    }

}