import { addTask, deleteTask, loadTasks } from './action.js';
import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
	tasks: [],
	loading: false,
	error: null,
};

export const tasksSlice = createSlice({
	name: 'tasks',
	initialState,
	reducers: {},
	selectors: {
		getAllTasks: (state) => state.tasks,
		getTasksLoading: (state) => state.loading,
		getTasksError: (state) => state.error,
		getTasksWithTwo: createSelector(
			(state) => tasksSlice.getSelectors().getAllTasks(state),
			(tasks) => tasks.filter((task) => task.content.includes('2'))
		),
	},
	extraReducers: (builder) => {
		builder
			.addCase(addTask.fulfilled, (state, action) => {
				state.tasks.push(action.payload);
			})
			.addCase(deleteTask.fulfilled, (state, action) => {
				state.tasks = state.tasks.filter((task) => task.id !== action.payload);
			})
			.addCase(loadTasks.pending, (state, action) => {
				state.loading = true;
			})
			.addCase(loadTasks.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error?.message;
			})
			.addCase(loadTasks.fulfilled, (state, action) => {
				state.tasks = action.payload;
				state.loading = false;
			});
	},
});

export const { getAllTasks, getTasksLoading, getTasksError, getTasksWithTwo } =
	tasksSlice.selectors;
