import {
	authReducer,
	setUser,
	clearAuth,
	allowResetPassword,
	syncAccessToken,
} from '../src/services/auth/reducer';

// Начальное состояние
const initialState = {
	user: null,
	accessToken: null,
	refreshToken: null,
	loading: false,
	error: null,
	authChecked: false,
	resetPasswordAllowed: false,
};

// Мокаем localStorage
global.localStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
};

describe('authReducer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		console.error.mockRestore();
	});

	it('should return the initial state', () => {
		expect(authReducer(undefined, {})).toEqual(initialState);
	});

	describe('Synchronous actions', () => {
		it('should handle setUser', () => {
			const action = setUser({ email: 'test@example.com', name: 'Test User' });
			const expectedState = {
				...initialState,
				user: { email: 'test@example.com', name: 'Test User' },
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle setUser with null', () => {
			const action = setUser(null);
			const expectedState = { ...initialState, user: null };
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle clearAuth', () => {
			const state = {
				...initialState,
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: 'token',
				refreshToken: 'refresh',
				error: 'error',
				resetPasswordAllowed: true,
			};
			const action = clearAuth();
			const expectedState = {
				...initialState,
				user: null,
				accessToken: null,
				refreshToken: null,
				error: null,
				resetPasswordAllowed: false,
			};
			expect(authReducer(state, action)).toEqual(expectedState);
		});

		it('should handle allowResetPassword', () => {
			const action = allowResetPassword();
			const expectedState = { ...initialState, resetPasswordAllowed: true };
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle syncAccessToken with cookie', () => {
			Object.defineProperty(document, 'cookie', {
				writable: true,
				value: 'accessToken=mocked-token',
			});
			const action = syncAccessToken();
			const expectedState = { ...initialState, accessToken: 'mocked-token' };
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle syncAccessToken without cookie', () => {
			Object.defineProperty(document, 'cookie', {
				writable: true,
				value: '',
			});
			const action = syncAccessToken();
			const expectedState = { ...initialState, accessToken: null };
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});
	});

	describe('Asynchronous actions', () => {
		it('should handle registerUser.pending', () => {
			const action = { type: 'auth/registerUser/pending' };
			const expectedState = { ...initialState, loading: true, error: null };
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
				...initialState,
				loading: false,
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: 'token',
				refreshToken: 'refresh',
				authChecked: true,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle registerUser.rejected', () => {
			const action = {
				type: 'auth/registerUser/rejected',
				payload: 'Registration failed',
			};
			const expectedState = {
				...initialState,
				loading: false,
				error: 'Registration failed',
				authChecked: true,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle loginUser.pending', () => {
			const action = { type: 'auth/loginUser/pending' };
			const expectedState = { ...initialState, loading: true, error: null };
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
				...initialState,
				loading: false,
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: 'token',
				refreshToken: 'refresh',
				authChecked: true,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle loginUser.rejected', () => {
			const action = {
				type: 'auth/loginUser/rejected',
				payload: 'Login failed',
			};
			const expectedState = {
				...initialState,
				loading: false,
				error: 'Login failed',
				authChecked: true,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle logoutUser.pending', () => {
			const action = { type: 'auth/logoutUser/pending' };
			const expectedState = { ...initialState, loading: true, error: null };
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle logoutUser.fulfilled', () => {
			const state = {
				...initialState,
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: 'token',
				refreshToken: 'refresh',
			};
			const action = { type: 'auth/logoutUser/fulfilled' };
			const expectedState = {
				...initialState,
				loading: false,
				user: null,
				accessToken: null,
				refreshToken: null,
			};
			expect(authReducer(state, action)).toEqual(expectedState);
		});

		it('should handle logoutUser.rejected', () => {
			const action = {
				type: 'auth/logoutUser/rejected',
				payload: 'Logout failed',
			};
			const expectedState = {
				...initialState,
				loading: false,
				error: 'Logout failed',
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle refreshToken.pending', () => {
			const action = { type: 'auth/refreshToken/pending' };
			const expectedState = { ...initialState, loading: true, error: null };
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle refreshToken.fulfilled', () => {
			const action = {
				type: 'auth/refreshToken/fulfilled',
				payload: { accessToken: 'new-token', refreshToken: 'new-refresh' },
			};
			const expectedState = {
				...initialState,
				loading: false,
				accessToken: 'new-token',
				refreshToken: 'new-refresh',
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle refreshToken.rejected', () => {
			const action = {
				type: 'auth/refreshToken/rejected',
				payload: 'Refresh failed',
			};
			const expectedState = {
				...initialState,
				loading: false,
				error: 'Refresh failed',
				authChecked: true,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle checkAuth.pending', () => {
			const action = { type: 'auth/checkAuth/pending' };
			const expectedState = { ...initialState, loading: true, error: null };
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
				...initialState,
				loading: false,
				user: { email: 'test@example.com', name: 'Test User' },
				accessToken: 'token',
				refreshToken: 'refresh',
				authChecked: true,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle checkAuth.rejected', () => {
			const action = {
				type: 'auth/checkAuth/rejected',
				payload: 'Check auth failed',
			};
			const expectedState = {
				...initialState,
				loading: false,
				error: 'Check auth failed',
				user: null,
				accessToken: null,
				refreshToken: null,
				authChecked: true,
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle getUser.pending', () => {
			const action = { type: 'auth/getUser/pending' };
			const expectedState = { ...initialState, loading: true, error: null };
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle getUser.fulfilled', () => {
			const action = {
				type: 'auth/getUser/fulfilled',
				payload: { email: 'test@example.com', name: 'Test User' },
			};
			const expectedState = {
				...initialState,
				loading: false,
				user: { email: 'test@example.com', name: 'Test User' },
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle getUser.rejected', () => {
			const action = {
				type: 'auth/getUser/rejected',
				payload: 'Get user failed',
			};
			const expectedState = {
				...initialState,
				loading: false,
				error: 'Get user failed',
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle updateUser.pending', () => {
			const action = { type: 'auth/updateUser/pending' };
			const expectedState = { ...initialState, loading: true, error: null };
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle updateUser.fulfilled', () => {
			const action = {
				type: 'auth/updateUser/fulfilled',
				payload: { email: 'new@example.com', name: 'New User' },
			};
			const expectedState = {
				...initialState,
				loading: false,
				user: { email: 'new@example.com', name: 'New User' },
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle updateUser.rejected', () => {
			const action = {
				type: 'auth/updateUser/rejected',
				payload: 'Update user failed',
			};
			const expectedState = {
				...initialState,
				loading: false,
				error: 'Update user failed',
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle forgotPassword.pending', () => {
			const action = { type: 'auth/forgotPassword/pending' };
			const expectedState = { ...initialState, loading: true, error: null };
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle forgotPassword.fulfilled', () => {
			const action = { type: 'auth/forgotPassword/fulfilled' };
			const expectedState = {
				...initialState,
				loading: false,
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
				...initialState,
				loading: false,
				error: 'Forgot password failed',
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle resetPassword.pending', () => {
			const action = { type: 'auth/resetPassword/pending' };
			const expectedState = { ...initialState, loading: true, error: null };
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});

		it('should handle resetPassword.fulfilled', () => {
			const action = { type: 'auth/resetPassword/fulfilled' };
			const expectedState = {
				...initialState,
				loading: false,
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
				...initialState,
				loading: false,
				error: 'Reset password failed',
			};
			expect(authReducer(initialState, action)).toEqual(expectedState);
		});
	});
});
