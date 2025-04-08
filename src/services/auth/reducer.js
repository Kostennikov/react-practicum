// src/services/auth/reducer.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
	AUTH_LOGIN_ENDPOINT,
	AUTH_REGISTER_ENDPOINT,
	AUTH_LOGOUT_ENDPOINT,
	AUTH_TOKEN_ENDPOINT,
	AUTH_USER_ENDPOINT,
	PASSWORD_RESET_ENDPOINT,
	PASSWORD_RESET_CONFIRM_ENDPOINT,
} from '../../config';
import { request } from '../../utils/api';

// Утилиты для работы с куками
const setCookie = (name, value, options = {}) => {
	options = { path: '/', ...options };
	if (typeof options.expires === 'number') {
		const d = new Date();
		d.setTime(d.getTime() + options.expires * 1000);
		options.expires = d;
	}
	if (options.expires) options.expires = options.expires.toUTCString();
	value = encodeURIComponent(value);
	let updatedCookie = `${name}=${value}`;
	for (const optionKey in options) {
		updatedCookie += `; ${optionKey}`;
		const optionValue = options[optionKey];
		if (optionValue !== true) updatedCookie += `=${optionValue}`;
	}
	document.cookie = updatedCookie;
};

const getCookie = (name) => {
	const matches = document.cookie.match(
		new RegExp(
			`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

const deleteCookie = (name) => {
	setCookie(name, '', { expires: -1 });
};

// Регистрация
export const registerUser = createAsyncThunk(
	'auth/registerUser',
	async ({ email, password, name }, { rejectWithValue }) => {
		try {
			const data = await request(AUTH_REGISTER_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({ email, password, name }),
			});

			setCookie('accessToken', data.accessToken.split('Bearer ')[1], {
				expires: 20 * 60,
			});
			localStorage.setItem('refreshToken', data.refreshToken);
			return data;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

// Авторизация
export const loginUser = createAsyncThunk(
	'auth/loginUser',
	async ({ email, password }, { rejectWithValue }) => {
		try {
			const data = await request(AUTH_LOGIN_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			});

			setCookie('accessToken', data.accessToken.split('Bearer ')[1], {
				expires: 20 * 60,
			});
			localStorage.setItem('refreshToken', data.refreshToken);
			return data;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

// Выход
export const logoutUser = createAsyncThunk(
	'auth/logoutUser',
	async (_, { rejectWithValue }) => {
		try {
			const refreshToken = localStorage.getItem('refreshToken');
			if (!refreshToken) throw new Error('Токен обновления отсутствует');

			const data = await request(AUTH_LOGOUT_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({ token: refreshToken }),
			});

			deleteCookie('accessToken');
			localStorage.removeItem('refreshToken');
			return data;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

// Получение данных пользователя
export const getUser = createAsyncThunk(
	'auth/getUser',
	async (_, { rejectWithValue }) => {
		try {
			const accessToken = getCookie('accessToken');
			if (!accessToken) throw new Error('Токен отсутствует');

			const data = await request(AUTH_USER_ENDPOINT, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			return data.user;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

// Обновление данных пользователя
export const updateUser = createAsyncThunk(
	'auth/updateUser',
	async ({ name, email, password }, { rejectWithValue }) => {
		try {
			const accessToken = getCookie('accessToken');
			if (!accessToken) throw new Error('Токен отсутствует');

			const body = { name, email };
			// if (password) body.password = password;

			const data = await request(AUTH_USER_ENDPOINT, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(body),
			});

			return data.user;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

// Обновление токена
export const refreshToken = createAsyncThunk(
	'auth/refreshToken',
	async (_, { rejectWithValue }) => {
		try {
			const refreshToken = localStorage.getItem('refreshToken');
			if (!refreshToken) throw new Error('Токен обновления отсутствует');

			const data = await request(AUTH_TOKEN_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({ token: refreshToken }),
			});

			setCookie('accessToken', data.accessToken.split('Bearer ')[1], {
				expires: 20 * 60,
			});
			localStorage.setItem('refreshToken', data.refreshToken);
			return data;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

// Проверка авторизации
export const checkAuth = createAsyncThunk(
	'auth/checkAuth',
	async (_, { dispatch, rejectWithValue }) => {
		try {
			const accessToken = getCookie('accessToken');
			if (!accessToken) {
				const refreshResult = await dispatch(refreshToken()).unwrap();
				if (!refreshResult.success)
					throw new Error('Не удалось обновить токен');
			}

			const data = await request(AUTH_USER_ENDPOINT, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${getCookie('accessToken')}`,
				},
			});

			return data;
		} catch (error) {
			if (error.message === 'Не удалось обновить токен') {
				throw error; // Пропускаем повторную попытку
			}

			// Если ошибка связана с истекшим токеном, пробуем обновить
			if (error.message.includes('401')) {
				const refreshResult = await dispatch(refreshToken()).unwrap();
				if (!refreshResult.success)
					throw new Error('Не удалось обновить токен');

				const retryData = await request(AUTH_USER_ENDPOINT, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${getCookie('accessToken')}`,
					},
				});

				return retryData;
			}

			throw error;
		}
	}
);

// Экшен для запроса сброса пароля
export const forgotPassword = createAsyncThunk(
	'auth/forgotPassword',
	async (email, { rejectWithValue }) => {
		try {
			const data = await request(PASSWORD_RESET_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({ email }),
			});

			return data;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

// Экшен для подтверждения сброса пароля
export const resetPassword = createAsyncThunk(
	'auth/resetPassword',
	async ({ password, token }, { rejectWithValue }) => {
		try {
			const data = await request(PASSWORD_RESET_CONFIRM_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({ password, token }),
			});

			return data;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState: {
		user: null,
		loading: false,
		error: null,
		authChecked: false,
		resetPasswordAllowed: false,
	},
	reducers: {
		setUser: (state, action) => {
			state.user = action.payload;
		},
		clearAuth: (state) => {
			state.user = null;
			state.error = null;
			state.resetPasswordAllowed = false;
			// authChecked не сбрасываем, так как проверка уже была выполнена
		},
		allowResetPassword: (state) => {
			state.resetPasswordAllowed = true;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(registerUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user;
				state.authChecked = true;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.authChecked = true;
			})
			.addCase(loginUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user;
				state.authChecked = true;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.authChecked = true;
			})
			.addCase(logoutUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(logoutUser.fulfilled, (state) => {
				state.loading = false;
				state.user = null;
				// authChecked не сбрасываем
			})
			.addCase(logoutUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			.addCase(refreshToken.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(refreshToken.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(refreshToken.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.authChecked = true;
			})
			.addCase(checkAuth.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(checkAuth.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user;
				state.authChecked = true;
			})
			.addCase(checkAuth.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.user = null;
				state.authChecked = true;
			})
			.addCase(getUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(getUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
			})
			.addCase(getUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			.addCase(updateUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
			})
			.addCase(updateUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// forgotPassword
			.addCase(forgotPassword.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(forgotPassword.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(forgotPassword.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// resetPassword
			.addCase(resetPassword.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(resetPassword.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(resetPassword.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { setUser, clearAuth, allowResetPassword } = authSlice.actions;

export const { reducer: authReducer } = authSlice;
export default authSlice;
