import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'https://norma.nomoreparties.space/api';

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
			const response = await fetch(`${API_URL}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, name }),
			});
			if (!response.ok) throw new Error('Ошибка регистрации');
			const data = await response.json();
			if (!data.success) throw new Error(data.message || 'Ошибка регистрации');
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
			const response = await fetch(`${API_URL}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});
			if (!response.ok) throw new Error('Ошибка авторизации');
			const data = await response.json();
			if (!data.success) throw new Error(data.message || 'Ошибка авторизации');
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
			const response = await fetch(`${API_URL}/auth/logout`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: refreshToken }),
			});
			if (!response.ok) throw new Error('Ошибка выхода');
			const data = await response.json();
			if (!data.success) throw new Error(data.message || 'Ошибка выхода');
			deleteCookie('accessToken');
			localStorage.removeItem('refreshToken');
			return data;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const getUser = createAsyncThunk(
	'auth/getUser',
	async (_, { rejectWithValue, getState }) => {
		try {
			const accessToken = getCookie('accessToken');
			if (!accessToken) throw new Error('Токен отсутствует');

			const response = await fetch(
				'https://norma.nomoreparties.space/api/auth/user',
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (!response.ok) throw new Error('Ошибка получения данных пользователя');
			const data = await response.json();
			if (!data.success)
				throw new Error(data.message || 'Ошибка получения данных');
			return data.user;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateUser = createAsyncThunk(
	'auth/updateUser',
	async ({ name, email, password }, { rejectWithValue, getState }) => {
		try {
			const accessToken = getCookie('accessToken');
			if (!accessToken) throw new Error('Токен отсутствует');

			const body = { name, email };
			// if (password) body.password = password;

			const response = await fetch(
				'https://norma.nomoreparties.space/api/auth/user',
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify(body),
				}
			);

			if (!response.ok)
				throw new Error('Ошибка обновления данных пользователя');
			const data = await response.json();
			if (!data.success)
				throw new Error(data.message || 'Ошибка обновления данных');
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
			const response = await fetch(`${API_URL}/auth/token`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: refreshToken }),
			});
			if (!response.ok) throw new Error('Ошибка обновления токена');
			const data = await response.json();
			if (!data.success)
				throw new Error(data.message || 'Ошибка обновления токена');
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

			const response = await fetch(`${API_URL}/auth/user`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getCookie('accessToken')}`,
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					const refreshResult = await dispatch(refreshToken()).unwrap();
					if (!refreshResult.success)
						throw new Error('Не удалось обновить токен');
					const retryResponse = await fetch(`${API_URL}/auth/user`, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${getCookie('accessToken')}`,
						},
					});
					if (!retryResponse.ok) throw new Error('Ошибка проверки авторизации');
					const retryData = await retryResponse.json();
					if (!retryData.success)
						throw new Error(retryData.message || 'Ошибка проверки');
					return retryData;
				}
				throw new Error('Ошибка проверки авторизации');
			}

			const data = await response.json();
			if (!data.success) throw new Error(data.message || 'Ошибка проверки');
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
			});
	},
});

export const { setUser, clearAuth, allowResetPassword } = authSlice.actions;

export const { reducer: authReducer } = authSlice;
export default authSlice;
