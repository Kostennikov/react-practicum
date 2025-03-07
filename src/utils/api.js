const BASE_URL = 'https://norma.nomoreparties.space/api';

export function checkResponse(res) {
	if (res.ok) {
		return res.json();
	}
	return res.text().then((text) => {
		const error = new Error(text || `Ошибка: ${res.status} ${res.statusText}`);
		throw error;
	});
}

export async function request(endpoint, options = {}) {
	const url = `${BASE_URL}${endpoint}`;
	const res = await fetch(url, options);
	return checkResponse(res);
}
