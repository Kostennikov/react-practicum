import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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
import { AuthState, RootState } from '../../types/types';

// Утилиты для работы с куками
const setCookie = (
	name: string,
	value: string,
	options: { [key: string]: any } = {}
) => {
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

const getCookie = (name: string): string | undefined => {
	const matches = document.cookie.match(
		new RegExp(
			`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

const deleteCookie = (name: string) => {
	setCookie(name, '', { expires: -1 });
};

// Регистрация
export const registerUser = createAsyncThunk(
	'auth/registerUser',
	async (
		{
			email,
			password,
			name,
		}: { email: string; password: string; name: string },
		{ rejectWithValue }
	) => {
		try {
			const data = await request(AUTH_REGISTER_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({ email, password, name }),
			});

			if (!data.accessToken || !data.refreshToken) {
				throw new Error('Токены не получены');
			}
			setCookie('accessToken', data.accessToken.split('Bearer ')[1], {
				expires: 20 * 60,
			});
			localStorage.setItem('refreshToken', data.refreshToken);
			return data;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Авторизация
export const loginUser = createAsyncThunk(
	'auth/loginUser',
	async (
		{ email, password }: { email: string; password: string },
		{ rejectWithValue }
	) => {
		try {
			const data = await request(AUTH_LOGIN_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			});

			if (!data.accessToken || !data.refreshToken) {
				throw new Error('Токены не получены');
			}
			setCookie('accessToken', data.accessToken.split('Bearer ')[1], {
				expires: 20 * 60,
			});
			localStorage.setItem('refreshToken', data.refreshToken);
			return data;
		} catch (error: any) {
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
		} catch (error: any) {
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
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Обновление данных пользователя
export const updateUser = createAsyncThunk(
	'auth/updateUser',
	async (
		{
			name,
			email,
			password,
		}: { name: string; email: string; password?: string },
		{ rejectWithValue }
	) => {
		try {
			const accessToken = getCookie('accessToken');
			if (!accessToken) throw new Error('Токен отсутствует');

			const body: { name: string; email: string; password?: string } = {
				name,
				email,
			};
			if (password) body.password = password;

			const data = await request(AUTH_USER_ENDPOINT, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(body),
			});

			return data.user;
		} catch (error: any) {
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

			if (!data.accessToken || !data.refreshToken) {
				throw new Error('Токены не получены');
			}
			setCookie('accessToken', data.accessToken.split('Bearer ')[1], {
				expires: 20 * 60,
			});
			localStorage.setItem('refreshToken', data.refreshToken);
			return {
				accessToken: data.accessToken,
				refreshToken: data.refreshToken,
			};
		} catch (error: any) {
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
				if (!refreshResult.accessToken) {
					console.error('checkAuth: Failed to refresh token');
					throw new Error('Не удалось обновить токен');
				}
			}

			const data = await request(AUTH_USER_ENDPOINT, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${getCookie('accessToken')}`,
				},
			});

			return data;
		} catch (error: any) {
			if (error.message === 'Не удалось обновить токен') {
				throw error;
			}

			if (error.message.includes('401')) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				const refreshResult = await dispatch(refreshToken()).unwrap();
				if (!refreshResult.accessToken) {
					console.error('checkAuth: Failed to refresh token after 401');
					throw new Error('Не удалось обновить токен');
				}

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

// Запрос сброса пароля
export const forgotPassword = createAsyncThunk(
	'auth/forgotPassword',
	async (email: string, { rejectWithValue }) => {
		try {
			const data = await request(PASSWORD_RESET_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({ email }),
			});

			return data;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Подтверждение сброса пароля
export const resetPassword = createAsyncThunk(
	'auth/resetPassword',
	async (
		{ password, token }: { password: string; token: string },
		{ rejectWithValue }
	) => {
		try {
			const data = await request(PASSWORD_RESET_CONFIRM_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({ password, token }),
			});

			return data;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

const initialState: AuthState = {
	user: null,
	accessToken: null,
	refreshToken: null,
	loading: false,
	error: null,
	authChecked: false,
	resetPasswordAllowed: false,
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser: (
			state,
			action: PayloadAction<{ email: string; name: string } | null>
		) => {
			state.user = action.payload;
		},
		clearAuth: (state) => {
			state.user = null;
			state.accessToken = null;
			state.refreshToken = null;
			state.error = null;
			state.resetPasswordAllowed = false;
		},
		allowResetPassword: (state) => {
			state.resetPasswordAllowed = true;
		},
		// Новое действие для синхронизации
		syncAccessToken: (state) => {
			const accessToken = getCookie('accessToken');
			if (accessToken) {
				state.accessToken = accessToken;
			}
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
				state.user = action.payload.user ?? null;
				state.accessToken = action.payload.accessToken ?? null;
				state.refreshToken = action.payload.refreshToken ?? null;
				state.authChecked = true;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
				state.authChecked = true;
			})
			.addCase(loginUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user ?? null;
				state.accessToken = action.payload.accessToken ?? null;
				state.refreshToken = action.payload.refreshToken ?? null;
				state.authChecked = true;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
				state.authChecked = true;
			})
			.addCase(logoutUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(logoutUser.fulfilled, (state) => {
				state.loading = false;
				state.user = null;
				state.accessToken = null;
				state.refreshToken = null;
			})
			.addCase(logoutUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(refreshToken.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(refreshToken.fulfilled, (state, action) => {
				state.loading = false;
				state.accessToken = action.payload.accessToken ?? null;
				state.refreshToken = action.payload.refreshToken ?? null;
			})
			.addCase(refreshToken.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
				state.authChecked = true;
			})
			.addCase(checkAuth.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(checkAuth.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user ?? null;
				state.accessToken = action.payload.accessToken ?? state.accessToken;
				state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
				state.authChecked = true;
			})
			.addCase(checkAuth.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
				state.user = null;
				state.accessToken = null;
				state.refreshToken = null;
				state.authChecked = true;
			})
			.addCase(getUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(getUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload ?? null;
			})
			.addCase(getUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload ?? null;
			})
			.addCase(updateUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(forgotPassword.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(forgotPassword.fulfilled, (state) => {
				state.loading = false;
				state.resetPasswordAllowed = true;
			})
			.addCase(forgotPassword.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(resetPassword.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(resetPassword.fulfilled, (state) => {
				state.loading = false;
				state.resetPasswordAllowed = false;
			})
			.addCase(resetPassword.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const { setUser, clearAuth, allowResetPassword, syncAccessToken } =
	authSlice.actions;
export const { reducer: authReducer } = authSlice;
export default authSlice;
