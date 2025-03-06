import {addTask as addTaskApi, deleteTaskById, getProjectTasks} from "../../utils/todoist-api.js";
import {createAsyncThunk} from "@reduxjs/toolkit";

export const addTask = createAsyncThunk(
    "tasks/addTask",
    async (text) => {
        return addTaskApi(text);
    }
);

export const deleteTask = createAsyncThunk(
    "tasks/deleteTask",
    async (id) => {
        await deleteTaskById(id);
        return id;
    }
);

export const logAddTask = text => (dispatch) => {
    console.log(`add ${text}`);
    dispatch(addTask(text));
}

export const loadTasks = createAsyncThunk(
    "tasks/loadTasks",
    async () => {
        return getProjectTasks();
    }
);