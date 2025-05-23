import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
// import { configureStore } from './services/store';
import { store } from './services/store';

import { App } from './App';
import './styles.css';

// Типизация domNode
const domNode = document.getElementById('root') as HTMLDivElement;
const root = createRoot(domNode);

// const store = configureStore();

root.render(
	<StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</Provider>
	</StrictMode>
);
