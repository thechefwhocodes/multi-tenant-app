import React, {useEffect, useState} from 'react';
import {CognitoUserPool} from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'us-east-2_3NUtAHXmB', ClientId: '6j8660ir99eu0afl3n0o52am7'
};

const userPool = new CognitoUserPool(poolData);

function Success() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.getSession((err, session) => {
                if (err) {
                    console.error(err);
                    return;
                }
                setUser(cognitoUser);
            });
        }
    }, []);

    return (<div>
        <h1>Login Successful!</h1>
        {user && <p>Welcome, {user.getUsername()}</p>}
    </div>);
}

export default Success;