import { useNavigate } from 'react-router-dom';
import LoginForm from '../LoginForm/LoginForm';
import './BusinessLogin.scss';

function BusinessLogin() {
	const navigate = useNavigate();

	return (
		<div className='business-login-container'>
			<div className='business-login-form'>
				<LoginForm onSuccess={() => navigate('/admin', { replace: true })} />
			</div>
		</div>
	);
}

export default BusinessLogin;
