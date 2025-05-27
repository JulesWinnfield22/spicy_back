# Enhanced asyncCall Utility

The `asyncCall` function is a powerful utility for handling asynchronous operations with improved error handling, type safety, and response formatting.

## Key Features

- **Type-safe error handling** using discriminated unions
- **Automatic conversion** of Mongoose documents to plain objects
- **Data transformation** capabilities for both success and error cases
- **Metadata support** for additional context
- **Fully typed** with TypeScript for better developer experience

## Basic Usage

```typescript
import { asyncCall } from "../utils/utils";

// Basic usage
const result = await asyncCall(() => someAsyncFunction());

if (result.success) {
  console.log("Success:", result.data);
} else {
  console.error("Error:", result.error);
}
```

## Type Definitions

```typescript
// Success result type
type Success<T> = {
  success: true;
  data: T;
  error: null;
  timestamp: Date;
  meta?: Record<string, any>;
};

// Failure result type
type Failure<E = Error> = {
  success: false;
  data: null;
  error: E;
  timestamp: Date;
  meta?: Record<string, any>;
};

// Result type - discriminated union
type Result<T, E = Error> = Success<T> | Failure<E>;

// Options for the asyncCall function
interface AsyncCallOptions<T, E = Error> {
  transformData?: (data: T) => any;
  transformError?: (error: any) => E;
  meta?: Record<string, any>;
  convertMongoose?: boolean;
}
```

## Advanced Options

### Data Transformation

Transform the successful response data:

```typescript
const result = await asyncCall(
  () => userModel.findOne({ email }),
  {
    transformData: (user) => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      isActive: user.status === 'ACTIVE'
    })
  }
);

// result.data will contain the transformed object
```

### Error Transformation

Customize error objects:

```typescript
const result = await asyncCall(
  () => someAsyncFunction(),
  {
    transformError: (error) => ({
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      isOperational: error.name === 'MongoError',
      retryable: error.name === 'MongoNetworkError'
    })
  }
);

// If an error occurs, result.error will contain the transformed error
```

### Metadata

Add additional context to the result:

```typescript
const result = await asyncCall(
  () => userModel.findOne({ email }),
  {
    meta: { 
      source: 'database',
      queryType: 'user',
      timestamp: new Date()
    }
  }
);

// result.meta will contain the provided metadata
```

### Mongoose Integration

By default, the function automatically converts Mongoose documents to plain objects:

```typescript
const result = await asyncCall(() => userModel.findOne({ email }));

// result.data will be a plain object, not a Mongoose document
// This means you won't have access to Mongoose document methods

// To keep the original Mongoose document:
const result = await asyncCall(
  () => userModel.findOne({ email }),
  { convertMongoose: false }
);
```

## Express Integration

The function works great with Express:

```typescript
app.get('/users/:email', async (req, res) => {
  const { email } = req.params;
  const result = await asyncCall(() => userModel.findOne({ email }));
  
  if (result.success) {
    if (!result.data) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(result.data);
  } else {
    return res.status(500).json({ 
      message: 'Error fetching user',
      error: result.error.message
    });
  }
});
```

## Backward Compatibility

For backward compatibility with existing code, you can convert the result to the old tuple format:

```typescript
const result = await asyncCall(() => userModel.findOne({ email }));
const [error, data] = result.success 
  ? [null, result.data] 
  : [result.error, null];
```

## Complete Example

```typescript
import { asyncCall } from "../utils/utils";
import userModel from "../db/models/UsersSchema";

async function getUserProfile(email: string) {
  const result = await asyncCall(
    () => userModel.findOne({ email }),
    {
      transformData: (user) => user ? {
        id: user._id,
        name: `${user.firstName} ${user.fathersName}`,
        email: user.email,
        isActive: user.status === 'ACTIVE'
      } : null,
      transformError: (error) => ({
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        retryable: error.name === 'MongoNetworkError'
      }),
      meta: { 
        source: 'database',
        queryType: 'profile'
      }
    }
  );
  
  if (result.success) {
    console.log(`User profile retrieved at: ${result.timestamp}`);
    return result.data;
  } else {
    console.error(`Error: ${result.error.message}`);
    return null;
  }
}
```
