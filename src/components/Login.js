import React, {useState} from 'react';
import {AuthenticationDetails, CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js';
import {useNavigate} from 'react-router-dom';

const poolData = {
    UserPoolId: 'us-east-2_3NUtAHXmB', ClientId: '6j8660ir99eu0afl3n0o52am7'
};

// Initialize CognitoUserPool
const userPool = new CognitoUserPool(poolData);

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(''); // Reset error message before new login attempt

        const tenantIdFromSubdomain = window.location.hostname.split('.')[0];

        // Create AuthenticationDetails object with user's credentials
        const authenticationDetails = new AuthenticationDetails({
            Username: email, Password: password,
        });

        // Prepare user data for Cognito
        const userData = {
            Username: email, Pool: userPool,
        };

        // Initialize CognitoUser object
        const cognitoUser = new CognitoUser(userData);

        // Authenticate the user
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                // On successful login, retrieve and store the access token
                const accessToken = result.getAccessToken().getJwtToken();
                localStorage.setItem('accessToken', accessToken);

                // Redirect to success page
                navigate('/success');
            }, onFailure: (err) => {
                // Handle login failure and display error message to user
                setErrorMessage('Login failed. Please check your credentials and try again.');
                console.error('Login error:', err);
            }, // Pass clientMetadata to ensure tenant validation during the login process
            clientMetadata: {
                tenantId: tenantIdFromSubdomain, // Send tenant ID from the subdomain
            },
        });
    };

    return (<div>
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <button type="submit">Login</button>
        </form>
        {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
    </div>);
}

export default Login;
