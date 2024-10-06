import React, {useState} from 'react';
import {CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js';
import {useLocation, useNavigate} from 'react-router-dom';

const poolData = {
    UserPoolId: 'us-east-2_3NUtAHXmB', ClientId: '6j8660ir99eu0afl3n0o52am7'
};

const userPool = new CognitoUserPool(poolData);

function ConfirmSignUp() {
    const [code, setCode] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const {email, tenantId} = location.state || {};

    const handleConfirm = (e) => {
        e.preventDefault();
        const userData = {
            Username: email, Pool: userPool
        };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Confirmation result:', result);
            // Redirect to login page after successful confirmation
            navigate('/login', {state: {email, tenantId}});
        });
    };

    const handleUpdateEmail = (e) => {
        e.preventDefault();
        // Implement email update logic here
        console.log('Update email to:', newEmail);
    };

    return (<div>
        <form onSubmit={handleConfirm}>
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Verification Code"
                required
            />
            <button type="submit">Confirm</button>
        </form>
        <form onSubmit={handleUpdateEmail}>
            <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New Email"
                required
            />
            <button type="submit">Update Email</button>
        </form>
    </div>);
}

export default ConfirmSignUp;
