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
import { request, ApiResponse } from '../../utils/api';
import { AuthState, RootState, AppDispatch } from '../../types/types';

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

// Тип для ответа авторизации
interface AuthResponse {
	success: boolean;
	user: { email: string; name: string };
	accessToken: string;
	refreshToken: string;
}

// Регистрация
export const registerUser = createAsyncThunk<
	AuthResponse,
	{ email: string; password: string; name: string },
	{ dispatch: AppDispatch; state: RootState }
>(
	'auth/registerUser',
	async (
		{
			email,
			password,
			name,
		}: { email: string; password: string; name: string },
		{ dispatch, rejectWithValue }
	) => {
		try {
			const response = await request<{
				success: boolean;
				user: { email: string; name: string };
				accessToken: string;
				refreshToken: string;
			}>(
				AUTH_REGISTER_ENDPOINT,
				{
					method: 'POST',
					body: JSON.stringify({ email, password, name }),
				},
				dispatch
			);

			if (
				!response.success ||
				!response.accessToken ||
				!response.refreshToken ||
				!response.user
			) {
				throw new Error('Ошибка регистрации: некорректный ответ сервера');
			}

			setCookie('accessToken', response.accessToken.split('Bearer ')[1], {
				expires: 20 * 60,
			});
			localStorage.setItem('refreshToken', response.refreshToken);
			return {
				success: response.success,
				user: response.user,
				accessToken: response.accessToken,
				refreshToken: response.refreshToken,
			};
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Авторизация
export const loginUser = createAsyncThunk<
	AuthResponse,
	{ email: string; password: string },
	{ dispatch: AppDispatch; state: RootState }
>(
	'auth/loginUser',
	async (
		{ email, password }: { email: string; password: string },
		{ dispatch, rejectWithValue }
	) => {
		try {
			const response = await request<{
				success: boolean;
				user: { email: string; name: string };
				accessToken: string;
				refreshToken: string;
			}>(
				AUTH_LOGIN_ENDPOINT,
				{
					method: 'POST',
					body: JSON.stringify({ email, password }),
				},
				dispatch
			);

			if (
				!response.success ||
				!response.accessToken ||
				!response.refreshToken ||
				!response.user
			) {
				throw new Error('Ошибка авторизации: некорректный ответ сервера');
			}

			setCookie('accessToken', response.accessToken.split('Bearer ')[1], {
				expires: 20 * 60,
			});
			localStorage.setItem('refreshToken', response.refreshToken);
			return {
				success: response.success,
				user: response.user,
				accessToken: response.accessToken,
				refreshToken: response.refreshToken,
			};
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Выход
export const logoutUser = createAsyncThunk<
	{ success: boolean },
	void,
	{ dispatch: AppDispatch; state: RootState }
>('auth/logoutUser', async (_, { dispatch, rejectWithValue }) => {
	try {
		const refreshToken = localStorage.getItem('refreshToken');
		if (!refreshToken) throw new Error('Токен обновления отсутствует');

		const response = await request<{ success: boolean }>(
			AUTH_LOGOUT_ENDPOINT,
			{
				method: 'POST',
				body: JSON.stringify({ token: refreshToken }),
			},
			dispatch
		);

		if (!response.success) {
			throw new Error('Ошибка выхода: некорректный ответ сервера');
		}
		deleteCookie('accessToken');
		localStorage.removeItem('refreshToken');
		return response;
	} catch (error: any) {
		return rejectWithValue(error.message);
	}
});

// Получение данных пользователя
export const getUser = createAsyncThunk<
	{ email: string; name: string },
	void,
	{ dispatch: AppDispatch; state: RootState }
>('auth/getUser', async (_, { dispatch, rejectWithValue }) => {
	try {
		const accessToken = getCookie('accessToken');
		if (!accessToken) throw new Error('Токен отсутствует');

		const response = await request<{
			success: boolean;
			user: { email: string; name: string };
		}>(
			AUTH_USER_ENDPOINT,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
			dispatch
		);

		if (!response.success || !response.user) {
			throw new Error(
				'Ошибка получения пользователя: некорректный ответ сервера'
			);
		}
		return response.user;
	} catch (error: any) {
		return rejectWithValue(error.message);
	}
});

// Обновление данных пользователя
export const updateUser = createAsyncThunk<
	{ email: string; name: string },
	{ name: string; email: string; password?: string },
	{ dispatch: AppDispatch; state: RootState }
>(
	'auth/updateUser',
	async (
		{
			name,
			email,
			password,
		}: { name: string; email: string; password?: string },
		{ dispatch, rejectWithValue }
	) => {
		try {
			const accessToken = getCookie('accessToken');
			if (!accessToken) throw new Error('Токен отсутствует');

			const body: { name: string; email: string; password?: string } = {
				name,
				email,
			};
			if (password) body.password = password;

			const response = await request<{
				success: boolean;
				user: { email: string; name: string };
			}>(
				AUTH_USER_ENDPOINT,
				{
					method: 'PATCH',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify(body),
				},
				dispatch
			);

			if (!response.success || !response.user) {
				throw new Error(
					'Ошибка обновления пользователя: некорректный ответ сервера'
				);
			}
			return response.user;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Обновление токена
export const refreshToken = createAsyncThunk<
	{ accessToken: string; refreshToken: string },
	void,
	{ dispatch: AppDispatch; state: RootState }
>('auth/refreshToken', async (_, { dispatch, rejectWithValue }) => {
	try {
		const refreshToken = localStorage.getItem('refreshToken');
		if (!refreshToken) throw new Error('Токен обновления отсутствует');

		const response = await request<{
			success: boolean;
			accessToken: string;
			refreshToken: string;
		}>(
			AUTH_TOKEN_ENDPOINT,
			{
				method: 'POST',
				body: JSON.stringify({ token: refreshToken }),
			},
			dispatch
		);

		if (!response.success || !response.accessToken || !response.refreshToken) {
			throw new Error('Ошибка обновления токена: некорректный ответ сервера');
		}
		setCookie('accessToken', response.accessToken.split('Bearer ')[1], {
			expires: 20 * 60,
		});
		localStorage.setItem('refreshToken', response.refreshToken);
		return {
			accessToken: response.accessToken,
			refreshToken: response.refreshToken,
		};
	} catch (error: any) {
		return rejectWithValue(error.message);
	}
});

// Проверка авторизации
export const checkAuth = createAsyncThunk<
	AuthResponse,
	void,
	{ dispatch: AppDispatch; state: RootState }
>('auth/checkAuth', async (_, { dispatch, rejectWithValue }) => {
	try {
		const accessToken = getCookie('accessToken');
		if (!accessToken) {
			const refreshResult = await dispatch(refreshToken()).unwrap();
			if (!refreshResult.accessToken) {
				throw new Error('Не удалось обновить токен');
			}
		}

		const response = await request<{
			success: boolean;
			user: { email: string; name: string };
			accessToken: string;
			refreshToken: string;
		}>(
			AUTH_USER_ENDPOINT,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${getCookie('accessToken')}`,
				},
			},
			dispatch
		);

		if (
			!response.success ||
			!response.user ||
			!response.accessToken ||
			!response.refreshToken
		) {
			throw new Error(
				'Ошибка проверки авторизации: некорректный ответ сервера'
			);
		}

		return {
			success: response.success,
			user: response.user,
			accessToken: response.accessToken,
			refreshToken: response.refreshToken,
		};
	} catch (error: any) {
		if (error.message === 'Не удалось обновить токен') {
			return rejectWithValue(error.message);
		}

		if (error.message.includes('401')) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			const refreshResult = await dispatch(refreshToken()).unwrap();
			if (!refreshResult.accessToken) {
				throw new Error('Не удалось обновить токен');
			}

			const retryResponse = await request<{
				success: boolean;
				user: { email: string; name: string };
				accessToken: string;
				refreshToken: string;
			}>(
				AUTH_USER_ENDPOINT,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${getCookie('accessToken')}`,
					},
				},
				dispatch
			);

			if (
				!retryResponse.success ||
				!retryResponse.user ||
				!retryResponse.accessToken ||
				!retryResponse.refreshToken
			) {
				throw new Error(
					'Ошибка повторной проверки авторизации: некорректный ответ сервера'
				);
			}

			return {
				success: retryResponse.success,
				user: retryResponse.user,
				accessToken: retryResponse.accessToken,
				refreshToken: retryResponse.refreshToken,
			};
		}

		return rejectWithValue(error.message);
	}
});

// Запрос сброса пароля
export const forgotPassword = createAsyncThunk<
	{ success: boolean },
	string,
	{ dispatch: AppDispatch; state: RootState }
>(
	'auth/forgotPassword',
	async (email: string, { dispatch, rejectWithValue }) => {
		try {
			const response = await request<{ success: boolean }>(
				PASSWORD_RESET_ENDPOINT,
				{
					method: 'POST',
					body: JSON.stringify({ email }),
				},
				dispatch
			);

			if (!response.success) {
				throw new Error(
					'Ошибка запроса сброса пароля: некорректный ответ сервера'
				);
			}
			return response;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Подтверждение сброса пароля
export const resetPassword = createAsyncThunk<
	{ success: boolean },
	{ password: string; token: string },
	{ dispatch: AppDispatch; state: RootState }
>(
	'auth/resetPassword',
	async (
		{ password, token }: { password: string; token: string },
		{ dispatch, rejectWithValue }
	) => {
		try {
			const response = await request<{ success: boolean }>(
				PASSWORD_RESET_CONFIRM_ENDPOINT,
				{
					method: 'POST',
					body: JSON.stringify({ password, token }),
				},
				dispatch
			);

			if (!response.success) {
				throw new Error('Ошибка сброса пароля: некорректный ответ сервера');
			}
			return response;
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
				state.user = action.payload.user;
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
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
				state.user = action.payload.user;
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
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
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
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
				state.user = action.payload.user;
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
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
				state.user = action.payload;
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
				state.user = action.payload;
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
