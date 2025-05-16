describe('Ingredient Details Modal', () => {
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
		cy.task('log', 'Home page loaded');
	});

	it('should open and close ingredient details modal', () => {
		// Кликаем на ингредиент
		cy.get('[data-testid="ingredient-643d69a5c3f7b9001cfa093c"]', {
			timeout: 5000,
		})
			.should('exist')
			.click();
		cy.task('log', 'Ingredient clicked');

		// Проверяем, что модалка открылась
		cy.get('[data-testid="modal"]', { timeout: 10000 }).should('be.visible');
		cy.wait(1000); // Увеличиваем ожидание анимации
		cy.task('log', 'Modal opened');

		// Проверяем данные ингредиента
		cy.get('[data-testid="ingredient-details"]').should('exist');
		cy.get('[data-testid="ingredient-details-title"]').should(
			'contain',
			'Детали ингредиента'
		);
		cy.get('[data-testid="ingredient-name"]').should(
			'contain',
			'Краторная булка N-200i'
		);
		cy.get('[data-testid="ingredient-calories"]').should('contain', '420');
		cy.get('[data-testid="ingredient-proteins"]').should('contain', '80');
		cy.get('[data-testid="ingredient-fat"]').should('contain', '24');
		cy.get('[data-testid="ingredient-carbohydrates"]').should('contain', '53');
		cy.task('log', 'Ingredient details verified');

		// Закрываем модалку через кнопку
		cy.get('[data-testid="modal-close-button"]', { timeout: 10000 })
			.should('exist')
			.click({ force: true }); // Оставляем force из-за предыдущей ошибки
		cy.get('[data-testid="modal"]', { timeout: 5000 }).should('not.exist');
		cy.task('log', 'Modal closed via button');

		// Снова открываем модалку
		cy.get('[data-testid="ingredient-643d69a5c3f7b9001cfa093c"]', {
			timeout: 5000,
		}).click();
		cy.get('[data-testid="modal"]', { timeout: 10000 }).should('be.visible');
		cy.wait(1000); // Увеличиваем ожидание анимации
		cy.task('log', 'Modal reopened');

		// Закрываем модалку через оверлей
		cy.get('[data-testid="modal-overlay"]', { timeout: 10000 })
			.should('exist')
			.click({ force: true }); // Добавляем force из-за перекрытия
		cy.get('[data-testid="modal"]', { timeout: 5000 }).should('not.exist');
		cy.task('log', 'Modal closed via overlay');
	});
});
