import { defineConfig } from 'cypress';

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:8080', // Базовый URL для E2E-тестов
		specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', // Паттерн для тестов
		supportFile: 'cypress/support/e2e.ts', // Файл поддержки для E2E
		fixturesFolder: 'cypress/fixtures', // Папка для фикстур
		setupNodeEvents(on, config) {
			// Добавляем обработчики событий, если нужно
			// Например, для мокирования или логирования
			on('task', {
				log(message) {
					console.log(message);
					return null;
				},
			});
			return config;
		},
	},

	component: {
		devServer: {
			framework: 'react',
			bundler: 'webpack',
		},
		specPattern: 'cypress/component/**/*.{js,jsx,ts,tsx}', // Паттерн для компонентных тестов
		supportFile: 'cypress/support/component.ts', // Файл поддержки для компонентов
	},

	// Глобальные настройки
	retries: {
		runMode: 2, // Повторные попытки в run mode
		openMode: 0, // Без повторов в open mode
	},
	screenshotOnRunFailure: true, // Снимать скриншоты при ошибках
	video: false, // Отключить запись видео (включай при необходимости)
});
