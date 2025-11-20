# AWS Cognito Migration Guide

## Current Implementation

The application currently uses a **temporary multi-user system** with localStorage for storing user preferences and OpenAI API keys. This is a stopgap solution that provides basic user account functionality while you prepare for full AWS Cognito integration.

### How It Works Now

1. **User Preferences Service** (`src/services/userPreferencesService.js`)
   - Stores user data in localStorage with email-based namespacing
   - Each user's preferences are stored under `user_prefs_{email}`
   - Current user tracked in `current_user_email`

2. **User Account Selector** (`src/components/UserAccountSelector.js`)
   - Dropdown UI for switching between user accounts
   - Allows adding new accounts by email
   - Sign out returns to "Guest" mode (anonymous)

3. **OpenAI API Keys**
   - Stored per-user in their preferences object
   - Automatically loaded when user switches accounts
   - Migrates old single-key storage to new per-user system

## Migration to AWS Cognito

### Phase 1: AWS Setup

#### 1.1 Create Cognito User Pool

```bash
# Using AWS CLI
aws cognito-idp create-user-pool \
  --pool-name CoachPI-Users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true}" \
  --auto-verified-attributes email \
  --mfa-configuration OPTIONAL
```

Or via AWS Console:
1. Go to Amazon Cognito
2. Create User Pool
3. Configure sign-in options (Email)
4. Set password requirements
5. Configure MFA (optional)
6. Create app client

#### 1.2 Create DynamoDB Table for User Preferences

```bash
aws dynamodb create-table \
  --table-name CoachPI-UserPreferences \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

Table Schema:
```json
{
  "userId": "cognito-user-id",
  "openaiApiKey": "encrypted-api-key",
  "theme": "light",
  "notifications": true,
  "updatedAt": "2025-11-20T08:30:00Z"
}
```

#### 1.3 Create S3 Bucket for User Projects

```bash
aws s3 mb s3://coachpi-user-projects

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket coachpi-user-projects \
  --versioning-configuration Status=Enabled
```

Project structure:
```
s3://coachpi-user-projects/
  ├── {userId}/
  │   ├── project-1.cpi
  │   ├── project-2.cpi
  │   └── ...
```

#### 1.4 Set Up IAM Roles

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/CoachPI-UserPreferences",
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["${cognito-identity.amazonaws.com:sub}"]
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::coachpi-user-projects/${cognito-identity.amazonaws.com:sub}/*"
      ]
    }
  ]
}
```

### Phase 2: React Integration

#### 2.1 Install AWS Amplify

```bash
npm install aws-amplify @aws-amplify/ui-react
```

#### 2.2 Configure Amplify

Create `src/aws-config.js`:

```javascript
const awsConfig = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_XXXXXXXXX',
    userPoolWebClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
    identityPoolId: 'us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
  },
  Storage: {
    AWSS3: {
      bucket: 'coachpi-user-projects',
      region: 'us-east-1'
    }
  }
};

export default awsConfig;
```

#### 2.3 Update User Preferences Service

Replace localStorage calls with DynamoDB:

```javascript
import { API } from 'aws-amplify';

export const saveUserPreferences = async (preferences) => {
  const user = await Auth.currentAuthenticatedUser();
  
  await API.put('preferences', `/preferences/${user.attributes.sub}`, {
    body: {
      ...preferences,
      updatedAt: new Date().toISOString()
    }
  });
};

export const loadUserPreferences = async () => {
  const user = await Auth.currentAuthenticatedUser();
  
  const response = await API.get('preferences', `/preferences/${user.attributes.sub}`);
  return response;
};
```

#### 2.4 Replace User Account Selector

Replace `UserAccountSelector` with Cognito authentication:

```javascript
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
          <header>
            <div>Welcome, {user.attributes.email}</div>
            <button onClick={signOut}>Sign Out</button>
          </header>
          {/* Rest of your app */}
        </div>
      )}
    </Authenticator>
  );
}
```

### Phase 3: Data Migration

#### 3.1 Create Migration Script

```javascript
// migrate-to-cognito.js
import { Auth, API } from 'aws-amplify';

export const migrateLocalDataToCognito = async () => {
  const user = await Auth.currentAuthenticatedUser();
  const userId = user.attributes.sub;
  
  // Get current user email from localStorage
  const currentEmail = localStorage.getItem('current_user_email');
  
  if (currentEmail && currentEmail !== 'anonymous') {
    // Load preferences from localStorage
    const localKey = `user_prefs_${currentEmail}`;
    const localPrefs = JSON.parse(localStorage.getItem(localKey) || '{}');
    
    // Upload to DynamoDB
    await API.put('preferences', `/preferences/${userId}`, {
      body: {
        ...localPrefs,
        migratedFrom: currentEmail,
        migratedAt: new Date().toISOString()
      }
    });
    
    console.log('Migration successful!');
    
    // Optionally clear local storage
    if (window.confirm('Migration complete. Clear local data?')) {
      localStorage.removeItem(localKey);
      localStorage.removeItem('current_user_email');
    }
  }
};
```

### Phase 4: Security Enhancements

#### 4.1 Encrypt API Keys

Use AWS KMS to encrypt OpenAI API keys:

```javascript
import { KMS } from 'aws-sdk';

const kms = new KMS({ region: 'us-east-1' });

export const encryptApiKey = async (apiKey) => {
  const params = {
    KeyId: 'alias/coachpi-api-keys',
    Plaintext: apiKey
  };
  
  const { CiphertextBlob } = await kms.encrypt(params).promise();
  return CiphertextBlob.toString('base64');
};

export const decryptApiKey = async (encryptedKey) => {
  const params = {
    CiphertextBlob: Buffer.from(encryptedKey, 'base64')
  };
  
  const { Plaintext } = await kms.decrypt(params).promise();
  return Plaintext.toString('utf-8');
};
```

#### 4.2 Add API Gateway

Create Lambda function to proxy API key operations:

```javascript
// lambda/preferences-handler.js
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const kms = new AWS.KMS();

exports.handler = async (event) => {
  const userId = event.requestContext.authorizer.claims.sub;
  
  switch (event.httpMethod) {
    case 'GET':
      return await getPreferences(userId);
    case 'PUT':
      return await updatePreferences(userId, JSON.parse(event.body));
    default:
      return { statusCode: 400, body: 'Invalid method' };
  }
};
```

### Phase 5: Testing

#### 5.1 Test Checklist

- [ ] User can sign up with email/password
- [ ] User can sign in
- [ ] User can reset password
- [ ] OpenAI API key saves to DynamoDB
- [ ] API key loads on sign in
- [ ] Projects save to user's S3 folder
- [ ] Projects load from S3
- [ ] User can sign out
- [ ] Different users see different data
- [ ] Migration script works for existing users

#### 5.2 Load Testing

```bash
# Test concurrent users
artillery quick --count 10 --num 5 https://your-api.com/preferences/{userId}
```

### Phase 6: Deployment

#### 6.1 Update buildspec.yml

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - npm install
      - echo "Building with Cognito configuration"
  build:
    commands:
      - npm run build
      - aws s3 sync build/ s3://your-bucket/ --delete
      
artifacts:
  files:
    - '**/*'
  base-directory: build
```

#### 6.2 Environment Variables

Set in AWS Console or via AWS CLI:

```bash
aws ssm put-parameter \
  --name /coachpi/cognito/user-pool-id \
  --value "us-east-1_XXXXXXXXX" \
  --type SecureString

aws ssm put-parameter \
  --name /coachpi/cognito/app-client-id \
  --value "XXXXXXXXXXXXXXXXXXXXXXXXXX" \
  --type SecureString
```

### Rollback Plan

If issues arise during migration:

1. **Keep temporary system** - Don't remove localStorage code immediately
2. **Feature flag** - Use environment variable to toggle Cognito on/off
3. **Gradual rollout** - Enable Cognito for subset of users first
4. **Data backup** - Export all localStorage before migration

```javascript
// Feature flag example
const USE_COGNITO = process.env.REACT_APP_USE_COGNITO === 'true';

const userService = USE_COGNITO 
  ? require('./services/cognitoUserService')
  : require('./services/userPreferencesService');
```

## Cost Estimation

### AWS Cognito
- Free tier: 50,000 MAU (Monthly Active Users)
- After: $0.00550 per MAU

### DynamoDB
- Free tier: 25 GB storage, 25 write/read units
- On-demand: $1.25 per million writes, $0.25 per million reads

### S3
- Storage: $0.023 per GB per month
- Requests: $0.0004 per 1,000 PUT, $0.0004 per 10,000 GET

### Estimated Monthly Cost (100 users):
- Cognito: Free (under 50K MAU)
- DynamoDB: ~$1-5
- S3: ~$1-2
- **Total: ~$2-7/month**

## Support

For issues during migration:
1. Check CloudWatch logs
2. Review IAM policies
3. Verify Cognito user pool configuration
4. Test with AWS CLI first before React integration

## References

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [S3 Security](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
