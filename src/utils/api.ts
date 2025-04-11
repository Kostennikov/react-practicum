import { BASE_URL } from '../config';

// Тип для ответа от сервера (общий)
interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	accessToken?: string;
	refreshToken?: string;
	user?: { name: string; email: string };
	order?: { number: number };
	name?: string;
}

// Тип для опций запроса
interface RequestOptions extends Omit<RequestInit, 'body'> {
	method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	headers?: Record<string, string>;
	body?: Record<string, unknown> | string;
}

export async function checkResponse<T>(res: Response): Promise<ApiResponse<T>> {
	if (res.ok) {
		return res.json() as Promise<ApiResponse<T>>;
	}
	return res
		.json()
		.then((data: ApiResponse<T>) => {
			const errorMessage =
				data.message || `Ошибка: ${res.status} ${res.statusText}`;
			throw new Error(errorMessage);
		})
		.catch(() => {
			throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
		});
}

export async function request<T>(
	endpoint: string,
	options: RequestOptions = {}
): Promise<ApiResponse<T>> {
	const url = `${BASE_URL}${endpoint}`;
	const res = await fetch(url, {
		...options,
		body:
			typeof options.body === 'string'
				? options.body
				: options.body
				? JSON.stringify(options.body)
				: undefined,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	});
	return checkResponse<T>(res);
}
