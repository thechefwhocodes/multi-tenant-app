import React, {useState} from 'react';
import {CognitoUserAttribute, CognitoUserPool} from 'amazon-cognito-identity-js';
import {useNavigate} from 'react-router-dom';

const poolData = {
    UserPoolId: 'us-east-2_3NUtAHXmB', ClientId: '6j8660ir99eu0afl3n0o52am7'
};

const userPool = new CognitoUserPool(poolData);

function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Sign up form submitted');
        const tenantId = window.location.hostname.split('.')[0];
        console.log('Tenant ID:', tenantId);

        try {
            const attributeList = [new CognitoUserAttribute({
                Name: 'email', Value: email
            }), new CognitoUserAttribute({
                Name: 'custom:tenantId', Value: tenantId  // Pass the tenant ID as a custom attribute
            })];

            userPool.signUp(email, password, attributeList, null, (err, result) => {
                    if (err) {
                        console.error('Sign up error:', err);
                        return;
                    }
                    console.log('Sign up successful:', result);
                    navigate('/confirm', {state: {email}});
                }, {subdomain: tenantId} // Pass clientMetadata as the sixth parameter
            );
        } catch (error) {
            console.error('Unexpected error during sign up:', error);
        }
    };

    return (<form onSubmit={handleSubmit}>
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
        <button type="submit">Sign Up</button>
    </form>);
}

export default SignUp;
