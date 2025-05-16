import '@4tw/cypress-drag-drop';

describe('Burger Constructor Drag and Drop', () => {
	beforeEach(() => {
		// Мокируем запросы
		cy.intercept('GET', '/api/auth/user', { fixture: 'user.json' }).as(
			'getUser'
		);
		cy.intercept('GET', '/api/ingredients', { fixture: 'ingredients.json' }).as(
			'getIngredients'
		);

		// Устанавливаем токены
		cy.window().then((win) => {
			win.localStorage.setItem(
				'refreshToken',
				JSON.stringify('test-refreshToken')
			);
		});
		cy.setCookie('accessToken', 'test-accessToken');

		// Заходим на главную страницу и ждем загрузки
		cy.visit('/');
		cy.wait(['@getUser', '@getIngredients'], { timeout: 15000 });
		cy.get('[data-testid="home-page"]', { timeout: 10000 }).should(
			'be.visible'
		);
	});

	it('should add bun and ingredient to constructor via drag and drop', () => {
		// Находим булку
		cy.get('[data-testid="ingredient-643d69a5c3f7b9001cfa093c"]', {
			timeout: 5000,
		}).as('bun');

		// Перетаскиваем булку в конструктор
		cy.get('@bun').drag('[data-testid="bun-top"]');
		cy.wait(500); // Ждем обновления DOM

		// Проверяем, что булка появилась сверху и снизу
		cy.get('[data-testid="bun-top-element"]', { timeout: 5000 })
			.should('exist')
			.and('contain', 'Краторная булка N-200i (верх)');
		cy.get('[data-testid="bun-bottom-element"]', { timeout: 10000 })
			.should('exist')
			.and('contain', 'Краторная булка N-200i (низ)');

		// Находим ингредиент
		cy.get('[data-testid="ingredient-643d69a5c3f7b9001cfa093d"]', {
			timeout: 5000,
		}).as('ingredient');

		// Перетаскиваем ингредиент в конструктор
		cy.get('@ingredient').drag('[data-testid="constructor-ingredients"]');
		cy.wait(500); // Ждем обновления DOM

		// Проверяем, что ингредиент появился в конструкторе
		cy.get('[data-testid="constructor-ingredient-643d69a5c3f7b9001cfa093d"]', {
			timeout: 10000,
		}).should('exist');
	});
});
