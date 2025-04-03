import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { clsx } from 'clsx';
import s from './app.module.scss';
import { AppHeader } from '../../components/app-header/app-header';
import { Home } from '../../pages/home/home';

export const App = () => {
	return (
		<div className='page'>
			<AppHeader />
			<Router>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/employees' element={<Employees />} />
				</Routes>
			</Router>
		</div>
	);
};
