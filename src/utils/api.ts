import { BASE_URL } from '../config';
import { refreshToken } from '../services/auth/reducer';

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	accessToken?: string;
	refreshToken?: string;
	user?: { name: string; email: string };
	order?: { number: number };
	orders?: { number: number };
	name?: string;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
	method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	headers?: Record<string, string>;
	body?: Record<string, unknown> | string;
}

export interface RequestResponse<T> {
	status: number;
	data: ApiResponse<T>;
}

const getCookie = (name: string): string | undefined => {
	const matches = document.cookie.match(
		new RegExp(
			'(?:^|; )' + name.replace(/([.$?*|{}()[]\\\/+^])/g, '\\$1') + '=([^;]*)'
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

export async function checkResponse<T>(res: Response): Promise<ApiResponse<T>> {
	if (res.ok) {
		return res.json() as Promise<ApiResponse<T>>;
	}
	return res
		.json()
		.then((data: ApiResponse<T>) => {
			const errorMessage =
				data.message || `Ошибка: ${res.status} ${res.statusText}`;
			throw new Error(`${res.status} ${errorMessage}`);
		})
		.catch(() => {
			throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
		});
}

export async function request<T>(
	endpoint: string,
	options: RequestOptions = {},
	dispatch?: any
): Promise<ApiResponse<T>> {
	const url = `${BASE_URL}${endpoint}`;

	const makeRequest = async (customOptions: RequestOptions) => {
		const token =
			getCookie('accessToken') || localStorage.getItem('accessToken');

		const res = await fetch(url, {
			...customOptions,
			body:
				typeof customOptions.body === 'string'
					? customOptions.body
					: customOptions.body
					? JSON.stringify(customOptions.body)
					: undefined,
			headers: {
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...customOptions.headers,
			},
		});
		return checkResponse<T>(res);
	};

	try {
		return await makeRequest(options);
	} catch (error: any) {
		if (error.message.includes('403') && dispatch) {
			try {
				const refreshResult = await dispatch(refreshToken()).unwrap();
				if (!refreshResult.accessToken) {
					throw new Error('Не удалось обновить токен');
				}

				// Сохраняем новый токен
				localStorage.setItem(
					'accessToken',
					refreshResult.accessToken.replace('Bearer ', '')
				);
				document.cookie = `accessToken=${refreshResult.accessToken.replace(
					'Bearer ',
					''
				)}; path=/`;

				const newOptions = {
					...options,
					headers: {
						...options.headers,
						Authorization: refreshResult.accessToken,
					},
				};
				return await makeRequest(newOptions);
			} catch (refreshError: any) {
				console.error(
					`Request to ${endpoint}: Refresh token failed:`,
					refreshError.message
				);
				throw refreshError;
			}
		}
		throw error;
	}
}
