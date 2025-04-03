import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { clsx } from 'clsx';
// import s from './app.module.scss';
import { AppHeader } from './components/app-header/app-header';
import { Home } from './pages/home/home';
import { SignIn } from './pages/registration/sign-in/sign-in';
import { Registration } from './pages/registration/registration/registration';
import { ForgotPassword } from './pages/registration/forgot-password/forgot-password';
import { ResetPassword } from './pages/registration/reset-password/reset-password';

export const App = () => {
	return (
		<div className='page'>
			<AppHeader />
			<Router>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/sign-in' element={<SignIn />} />
					<Route path='/registration' element={<Registration />} />
					<Route path='/forgot-password' element={<ForgotPassword />} />
					<Route path='/reset-password' element={<ResetPassword />} />
				</Routes>
			</Router>
		</div>
	);
};
