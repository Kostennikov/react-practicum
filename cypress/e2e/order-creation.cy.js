import '@4tw/cypress-drag-drop';

describe('Order Creation', () => {
	beforeEach(() => {
		// Мокируем запросы
		cy.intercept('GET', '/api/auth/user', { fixture: 'user.json' }).as(
			'getUser'
		);
		cy.intercept('GET', '/api/ingredients', { fixture: 'ingredients.json' }).as(
			'getIngredients'
		);
		cy.intercept('POST', '/api/orders', { fixture: 'order.json' }).as(
			'postOrder'
		);

		// Устанавливаем токены

		cy.window().then((win) => {
			win.localStorage.setItem(
				'accessToken',
				JSON.stringify('test-accessToken')
			);
		});

		cy.setCookie('accessToken', 'test-accessToken');

		// Заходим на главную страницу и ждем загрузки
		cy.visit('/');
		cy.wait(['@getUser', '@getIngredients'], { timeout: 15000 });
		cy.get('[data-testid="home-page"]', { timeout: 10000 }).should(
			'be.visible'
		);
		cy.task('log', 'Home page loaded');

		// Проверяем авторизацию
		cy.get('@getUser')
			.its('response.body')
			.should('have.property', 'success', true);
		cy.get('@getUser').its('response.body.user').should('deep.equal', {
			email: 'pavel.kostennikov@gmail.com',
			name: 'Pavel2',
		});
		cy.task('log', 'User is authenticated');
	});

	it('should create order', () => {
		// Находим булку
		cy.get('[data-testid="ingredient-643d69a5c3f7b9001cfa093c"]', {
			timeout: 5000,
		}).as('bun');
		cy.task('log', 'Bun element found');

		// Перетаскиваем булку в конструктор
		cy.get('@bun').drag('[data-testid="bun-top"]');
		cy.wait(500); // Ждем обновления DOM
		cy.task('log', 'Bun dragged');

		// Проверяем, что булка появилась сверху и снизу
		cy.get('[data-testid="bun-top-element"]', { timeout: 10000 })
			.should('exist')
			.and('contain', 'Краторная булка N-200i (верх)');
		cy.get('[data-testid="bun-bottom-element"]', { timeout: 10000 })
			.should('exist')
			.and('contain', 'Краторная булка N-200i (низ)');
		cy.task('log', 'Bun elements rendered');

		// Находим ингредиент
		cy.get('[data-testid="ingredient-643d69a5c3f7b9001cfa093d"]', {
			timeout: 5000,
		}).as('ingredient');
		cy.task('log', 'Ingredient element found');

		// Перетаскиваем ингредиент в конструктор
		cy.get('@ingredient').drag('[data-testid="constructor-ingredients"]');
		cy.wait(500); // Ждем обновления DOM
		cy.task('log', 'Ingredient dragged');

		// Проверяем, что ингредиент появился в конструкторе
		cy.get('[data-testid="constructor-ingredient-643d69a5c3f7b9001cfa093d"]', {
			timeout: 10000,
		}).should('exist');
		cy.task('log', 'Ingredient rendered in constructor');

		// Проверяем, что кнопка заказа активна
		cy.get('[data-testid="order-button"]', { timeout: 10000 })
			.should('not.be.disabled')
			.and('contain', 'Оформить заказ');
		cy.task('log', 'Order button is enabled');

		// Проверяем, что конструктор содержит ингредиенты
		cy.get('[data-testid="bun-top-element"]').should('exist');
		cy.get('[data-testid="constructor-ingredients"]')
			.children()
			.should('have.length.at.least', 1);
		cy.task('log', 'Constructor state verified');

		// Кликаем на кнопку заказа
		cy.get('[data-testid="order-button"]').click();
		cy.task('log', 'Order button clicked');

		// Ждем ответа от API
		cy.wait('@postOrder', { timeout: 3000 })
			.its('response')
			.should('have.property', 'statusCode', 200);
		cy.task('log', 'Order API responded');

		// Проверяем модалку с номером заказа
		cy.get('[data-testid="modal"]', { timeout: 10000 }).should('be.visible');
		cy.wait(1000); // Ждем анимации открытия
		cy.get('[data-testid="order-details"]').should('exist');
		cy.get('[data-testid="order-number"]').contains('12345').should('exist');
		cy.get('[data-testid="order-subtitle"]')
			.contains('идентификатор заказа')
			.should('exist');
		cy.get('[data-testid="order-status"]')
			.contains('Ваш заказ начали готовить')
			.should('exist');
		cy.get('[data-testid="order-instruction"]')
			.contains('Дождитесь готовности на орбитальной станции')
			.should('exist');
		cy.task('log', 'Order modal verified');

		// Закрываем модалку
		cy.get('[data-testid="modal-close-button"]', { timeout: 10000 })
			.should('be.visible')
			.click();
		cy.wait(1000); // Ждем анимации закрытия
		cy.get('[data-testid="modal"]', { timeout: 10000 }).should('not.exist');
		cy.task('log', 'Order modal closed');
	});
});
