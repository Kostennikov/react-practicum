import {
	authReducer,
	setUser,
	clearAuth,
	allowResetPassword,
	syncAccessToken,
} from '../src/services/auth/reducer';

// Мокаем localStorage
global.localStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
};

// Получаем начальное состояние
const initialState = authReducer(undefined, { type: '' });

describe('authReducer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		console.error.mockRestore();
	});

	it('should return the initial state', () => {
		expect(authReducer(undefined, { type: '' })).toEqual(initialState);
	});

	describe('Synchronous actions', () => {
		it('should handle setUser', () => {
			const action = setUser({ email: 'test@example.com', name: 'Test User' });
			const expectedState = {
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle setUser with null', () => {
			const action = setUser(null);
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle clearAuth', () => {
			const state = {
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: 'token',
				refreshToken: 'refresh',
				loading: false,
				error: 'error',
				authChecked: true,
				resetPasswordAllowed: true,
			};
			const action = clearAuth();
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: true, // Исправлено с false на true
				resetPasswordAllowed: false,
			};
			expect(authReducer(state, action)).toEqual(expectedState);
		});

		it('should handle allowResetPassword', () => {
			const action = allowResetPassword();
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: false,
				resetPasswordAllowed: true,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle syncAccessToken with cookie', () => {
			Object.defineProperty(document, 'cookie', {
				writable: true,
				value: 'accessToken=mocked-token',
			});
			const action = syncAccessToken();
			const expectedState = {
				user: null,
				accessToken: 'mocked-token',
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle syncAccessToken without cookie', () => {
			Object.defineProperty(document, 'cookie', {
				writable: true,
				value: '',
			});
			const action = syncAccessToken();
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});
	});

	describe('Asynchronous actions', () => {
		it('should handle registerUser.pending', () => {
			const action = { type: 'auth/registerUser/pending' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: true,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle registerUser.fulfilled', () => {
			const action = {
				type: 'auth/registerUser/fulfilled',
				payload: {
					user: { email: 'test@example.com', name: 'Test User' },
					accessToken: 'token',
					refreshToken: 'refresh',
				},
			};
			const expectedState = {
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: 'token',
				refreshToken: 'refresh',
				loading: false,
				error: null,
				authChecked: true,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle registerUser.rejected', () => {
			const action = {
				type: 'auth/registerUser/rejected',
				payload: 'Registration failed',
			};
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: 'Registration failed',
				authChecked: true,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle loginUser.pending', () => {
			const action = { type: 'auth/loginUser/pending' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: true,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle loginUser.fulfilled', () => {
			const action = {
				type: 'auth/loginUser/fulfilled',
				payload: {
					user: { email: 'test@example.com', name: 'Test User' },
					accessToken: 'token',
					refreshToken: 'refresh',
				},
			};
			const expectedState = {
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: 'token',
				refreshToken: 'refresh',
				loading: false,
				error: null,
				authChecked: true,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle loginUser.rejected', () => {
			const action = {
				type: 'auth/loginUser/rejected',
				payload: 'Login failed',
			};
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: 'Login failed',
				authChecked: true,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle logoutUser.pending', () => {
			const action = { type: 'auth/logoutUser/pending' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: true,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle logoutUser.fulfilled', () => {
			const state = {
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: 'token',
				refreshToken: 'refresh',
				loading: false,
				error: null,
				authChecked: true,
				resetPasswordAllowed: false,
			};
			const action = { type: 'auth/logoutUser/fulfilled' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: true, // Исправлено с false на true
				resetPasswordAllowed: false,
			};
			expect(authReducer(state, action)).toEqual(expectedState);
		});

		it('should handle logoutUser.rejected', () => {
			const action = {
				type: 'auth/logoutUser/rejected',
				payload: 'Logout failed',
			};
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: 'Logout failed',
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle refreshToken.pending', () => {
			const action = { type: 'auth/refreshToken/pending' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: true,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle refreshToken.fulfilled', () => {
			const action = {
				type: 'auth/refreshToken/fulfilled',
				payload: { accessToken: 'new-token', refreshToken: 'new-refresh' },
			};
			const expectedState = {
				user: null,
				accessToken: 'new-token',
				refreshToken: 'new-refresh',
				loading: false,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle refreshToken.rejected', () => {
			const action = {
				type: 'auth/refreshToken/rejected',
				payload: 'Refresh failed',
			};
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: 'Refresh failed',
				authChecked: true,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle checkAuth.pending', () => {
			const action = { type: 'auth/checkAuth/pending' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: true,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle checkAuth.fulfilled', () => {
			const action = {
				type: 'auth/checkAuth/fulfilled',
				payload: {
					user: { email: 'test@example.com', name: 'Test User' },
					accessToken: 'token',
					refreshToken: 'refresh',
				},
			};
			const expectedState = {
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: 'token',
				refreshToken: 'refresh',
				loading: false,
				error: null,
				authChecked: true,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle checkAuth.rejected', () => {
			const action = {
				type: 'auth/checkAuth/rejected',
				payload: 'Check auth failed',
			};
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: 'Check auth failed',
				authChecked: true,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle getUser.pending', () => {
			const action = { type: 'auth/getUser/pending' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: true,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle getUser.fulfilled', () => {
			const action = {
				type: 'auth/getUser/fulfilled',
				payload: { email: 'test@example.com', name: 'Test User' },
			};
			const expectedState = {
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle getUser.rejected', () => {
			const action = {
				type: 'auth/getUser/rejected',
				payload: 'Get user failed',
			};
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: 'Get user failed',
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle updateUser.pending', () => {
			const action = { type: 'auth/updateUser/pending' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: true,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle updateUser.fulfilled', () => {
			const action = {
				type: 'auth/updateUser/fulfilled',
				payload: { email: 'new@example.com', name: 'New User' },
			};
			const expectedState = {
				user: { email: 'new@example.com', name: 'New User' },
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle updateUser.rejected', () => {
			const action = {
				type: 'auth/updateUser/rejected',
				payload: 'Update user failed',
			};
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: 'Update user failed',
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle forgotPassword.pending', () => {
			const action = { type: 'auth/forgotPassword/pending' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: true,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle forgotPassword.fulfilled', () => {
			const action = { type: 'auth/forgotPassword/fulfilled' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: false,
				resetPasswordAllowed: true,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle forgotPassword.rejected', () => {
			const action = {
				type: 'auth/forgotPassword/rejected',
				payload: 'Forgot password failed',
			};
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: 'Forgot password failed',
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle resetPassword.pending', () => {
			const action = { type: 'auth/resetPassword/pending' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: true,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle resetPassword.fulfilled', () => {
			const action = { type: 'auth/resetPassword/fulfilled' };
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle resetPassword.rejected', () => {
			const action = {
				type: 'auth/resetPassword/rejected',
				payload: 'Reset password failed',
			};
			const expectedState = {
				user: null,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: 'Reset password failed',
				authChecked: false,
				resetPasswordAllowed: false,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});
	});
});
