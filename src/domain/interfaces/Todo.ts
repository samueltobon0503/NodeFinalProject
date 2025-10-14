import { model, Schema } from "mongoose"
import { ITodo } from "../models/ITodo";

const todoSchema = new Schema<ITodo>({
    title: { type: String, required: true},
    body: { type: String, required: true},
    isDone: { type: Boolean, default: false},
    createdAt: { type: Date, default: new Date()},
});

export const Todo = model<ITodo>('Todo', todoSchema);