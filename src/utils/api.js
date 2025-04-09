import { BASE_URL } from '../config';

export function checkResponse(res) {
	if (res.ok) {
		return res.json();
	}
	return res
		.json()
		.then((data) => {
			const errorMessage =
				data.message || `Ошибка: ${res.status} ${res.statusText}`;
			throw new Error(errorMessage);
		})
		.catch(() => {
			throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
		});
}

export async function request(endpoint, options = {}) {
	const url = `${BASE_URL}${endpoint}`;
	const res = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	});
	return checkResponse(res);
}
