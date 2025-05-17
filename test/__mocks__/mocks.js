// Мок для localStorage
const mockLocalStorage = {
	store: {},
	getItem: jest.fn((key) => mockLocalStorage.store[key] || '{}'),
	setItem: jest.fn((key, value) => {
		mockLocalStorage.store[key] = value;
	}),
	clear: jest.fn(() => {
		mockLocalStorage.store = {};
	}),
};

// Мок для Date
const mockDate = (dateString) => {
	const mockTime = new Date(dateString).getTime();
	const OriginalDate = global.Date;
	jest.spyOn(global, 'Date').mockImplementation((arg) => {
		if (arg) {
			return new OriginalDate(arg); // Для new Date(order.createdAt)
		}
		return new OriginalDate(mockTime); // Для new Date()
	});
	Date.now = jest.fn(() => mockTime);
};

// Мок для fetch
const mockFetch = (response, ok = true) => {
	global.fetch = jest.fn(() =>
		Promise.resolve({
			ok,
			json: () => Promise.resolve(response),
		})
	);
};

// Мок для getCookie (опционально, если используется)
const mockGetCookie = (cookies = {}) => {
	// Проверяем, определена ли функция getCookie
	if (!global.getCookie) {
		global.getCookie = jest.fn();
	}
	jest.spyOn(global, 'getCookie').mockImplementation((name) => cookies[name]);
};

module.exports = {
	mockLocalStorage,
	mockDate,
	mockFetch,
	mockGetCookie,
};
