## Multi-Tenant Authentication System

This project implements a **multi-tenant authentication system** using **React** for the front-end and **AWS Cognito**
for user authentication. The system ensures tenant-specific sign-up and login processes where users can only sign up and
log in to their specific tenant’s portal, identified via subdomains (e.g., `tenant1.example.com`).

The core functionalities include:

- **Tenant-Specific Sign-Up**: Users can sign up only for their specific tenant, identified via the subdomain.
- **Email Confirmation**: Users must confirm their email via a code sent by AWS Cognito.
- **Tenant-Specific Login**: Users can log in only to their assigned tenant's portal.
- **Security Features**: The system validates tenant-specific actions using AWS Lambda functions (PreSignUp and
  PreAuthentication triggers).

### Front-End Components

- **SignUp Component**: Allows users to sign up for their specific tenant.
- **ConfirmSignUp Component**: Confirms the user's registration using a verification code sent via email.
- **Login Component**: Authenticates users and restricts login to the tenant they belong to.
- **Success Component**: Displays a success message upon successful login.
- **App Component**: Sets up the routes for the application.

---

## Prerequisites

Before setting up this project, ensure you have the following:

1. **AWS Account** with access to **Cognito** and **Lambda** services.
2. **Node.js** and **npm** installed locally.
3. **React** installed (if not, you can set up a new React app via `npx create-react-app`).
4. **AWS SDK** and **Cognito Identity JS** libraries.

---

## Setup Instructions

### 1. AWS Cognito User Pool Setup

#### Step 1: Create a Cognito User Pool

1. Go to **AWS Cognito** in the AWS Management Console.
2. Create a new **User Pool**.
    - **Name**: Give your pool a relevant name.
    - Choose **Email** as the sign-in option.
    - Set **self-sign-up** to enabled.
    - Add a custom attribute `tenantId` for storing the tenant information during user sign-up.
3. Set up **App Clients**.
    - Disable **client secret** for public clients.
4. **MFA**: For this demo, you can leave MFA disabled.
5. **Triggers**: We will add **PreSignUp** and **PreAuthentication** Lambda functions in later steps.
6. **Domain Name**: Set up a domain name for your Cognito User Pool (e.g., `your-app.auth.us-east-2.amazoncognito.com`).
7. Save the pool and take note of the **UserPoolId** and **ClientId** for later configuration.

#### Step 2: Configure Custom Attributes

In the **Attributes** section of the Cognito User Pool, ensure that the custom attribute `tenantId` is added. This will
hold the tenant ID for each user, which is essential for ensuring that users log into the correct tenant.

---

### 2. Lambda Function Setup

#### PreSignUp Lambda Function

- **Purpose**: Validates the tenant information during the sign-up process.
- **Trigger**: Attach this Lambda function to the **PreSignUp** trigger in Cognito.

##### PreSignUp Lambda Code (Python Example):

```python
import json
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    # Log the incoming event
    logger.info(f"Received event: {json.dumps(event)}")

    try:
        # Extract tenant subdomain from the event's client metadata (sent from the front-end)
        subdomain = event['request']['clientMetadata']['subdomain']
        logger.info(f"Extracted subdomain: {subdomain}")

        # Extract the custom tenant ID from the user's sign-up attributes
        user_attributes = event['request']['userAttributes']
        tenant_id = user_attributes.get('custom:tenantId')
        logger.info(f"Extracted tenant ID from user attributes: {tenant_id}")

        # Simulate the subdomain-to-tenant mapping (replace with actual logic if needed)
        tenant_mapping = {
            'tenant1': 'tenant1',
            'tenant2': 'tenant2'
        }
        logger.info(f"Tenant mapping: {tenant_mapping}")

        # Ensure the subdomain corresponds to the tenant the user is signing up for
        expected_tenant_id = tenant_mapping.get(subdomain)
        logger.info(f"Expected tenant ID for subdomain '{subdomain}': {expected_tenant_id}")

        if not expected_tenant_id or expected_tenant_id != tenant_id:
            error_message = f"Sign-up is not allowed for tenant: {tenant_id}. Expected tenant: {expected_tenant_id}."
            logger.error(error_message)
            raise Exception(error_message)

        # Allow sign-up if tenant IDs match
        logger.info("Tenant ID matches, allowing sign-up.")
        event['response']['autoConfirmUser'] = False  # You can set this to True if you want auto-confirmation
        event['response']['autoVerifyEmail'] = False  # Auto-verify email if needed (usually kept False)

        return event

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        raise e

```

Attach the Lambda function to the **PreSignUp** trigger of the user pool.

#### PreAuthentication Lambda Function

- **Purpose**: Validates the tenant information before allowing the user to authenticate.
- **Trigger**: Attach this Lambda function to the **PreAuthentication** trigger in Cognito.

##### PreAuthentication Lambda Code (Python Example):

```python
import json
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        # Extract the tenant from clientMetadata (sent via client during login)
        client_metadata = event['request'].get('clientMetadata', {})
        tenant_from_subdomain = client_metadata.get('tenantId')

        # Extract the custom:tenantId from the user's attributes
        user_attributes = event['request'].get('userAttributes', {})
        user_tenant_id = user_attributes.get('custom:tenantId')

        logger.info("Validating tenant information during authentication")

        # Log client metadata and user attributes for debugging (mask sensitive info in production)
        logger.debug(f"Client metadata received: {json.dumps(client_metadata)}")
        logger.debug(f"User attributes received: {json.dumps(user_attributes)}")

        # Check if tenant ID from the subdomain is missing
        if tenant_from_subdomain is None:
            logger.error("Tenant ID from subdomain is missing in clientMetadata.")
            raise Exception("Authentication failed: Tenant ID from subdomain is missing.")

        # Check if user's tenant ID is missing
        if user_tenant_id is None:
            logger.error("User tenant ID is missing in Cognito user attributes.")
            raise Exception("Authentication failed: User tenant ID is missing.")

        # Validate the tenant ID from subdomain against the one stored in Cognito user attributes
        if tenant_from_subdomain != user_tenant_id:
            logger.error("Tenant ID mismatch. Authentication failed.")
            raise Exception("Authentication failed: Tenant ID mismatch.")

        # If tenant IDs match, allow the authentication to proceed
        logger.info(
            f"Tenant ID matched for user {user_attributes.get('email', 'Unknown user')}. Authentication proceeding.")
        return event

    except Exception as e:
        # Log the error with enough information for debugging but don't expose sensitive details
        logger.error(f"PreAuthentication error: {str(e)}", exc_info=True)
        raise Exception("Authentication failed due to tenant validation error.")

```

Attach the Lambda function to the **PreAuthentication** trigger of the user pool.

---

#### Key Files:

- **SignUp.js**: Handles the user sign-up process, including submitting the tenant ID as a custom attribute and sending
  `clientMetadata` during sign-up.
- **Login.js**: Handles user login, ensuring the tenant ID is submitted as `clientMetadata` and validated via the
  PreAuthentication Lambda.
- **ConfirmSignUp.js**: Allows users to confirm their registration via a verification code.
- **Success.js**: Displays a successful login message.
- **App.js**: Sets up routing for the application.

---

### 4. Running the Project

To run the project locally:

1. Clone the repository.
2. Ensure all dependencies are installed:
   ```bash
   npm install
   ```
3. Run the app:
   ```bash
   npm start
   ```

---

### 5. Testing the Multi-Tenant Setup Locally

To test the **multi-tenant authentication system** locally, we need to simulate multiple subdomains to represent
different tenants (e.g., `tenant1.localhost` and `tenant2.localhost`). Since browsers do not support subdomains directly
on `localhost`, we can simulate this behavior using the **hosts file** on your local machine.

### Step-by-Step Guide for Multi-Tenant Testing Locally

### 1. Modify the `hosts` File

The first step is to modify your system's `hosts` file to map `localhost` subdomains to `127.0.0.1`. This allows your
machine to treat `tenant1.localhost` and `tenant2.localhost` as valid domains that point to your local development
server.

#### Steps:

- **On Mac/Linux**:
    1. Open the terminal and run:
       ```bash
       sudo nano /etc/hosts
       ```
    2. Add the following lines at the end of the file:
       ```
       127.0.0.1 tenant1.localhost
       127.0.0.1 tenant2.localhost
       ```

- **On Windows**:
    1. Open **Notepad** as an administrator.
    2. Open the `hosts` file located at `C:\Windows\System32\drivers\etc\hosts`.
    3. Add the following lines:
       ```
       127.0.0.1 tenant1.localhost
       127.0.0.1 tenant2.localhost
       ```

- **Save** the file and close the editor.

- Open your browser and navigate to:
    - http://tenant1.localhost:3000 for Tenant 1
    - http://tenant2.localhost:3000 for Tenant 2

### 6. Important Notes

- **Security**: Ensure that your front-end uses HTTPS in production to protect sensitive data like passwords and
  authentication tokens.
- **Multi-Tenancy**: The system ensures that users can only log in to the tenant portal that corresponds to their
  account, thanks to the `PreSignUp` and `PreAuthentication` Lambda triggers.

---


