# Custom Policy Development Guide

This guide will walk you through creating, packaging, and publishing custom policies for the WSO2 API Platform Policy Hub.

## Introduction

Custom policies allow you to extend the functionality of WSO2 API Manager with your own business logic and requirements. They enable you to:

- Implement custom security mechanisms
- Add specialized traffic control features
- Integrate with external systems
- Create domain-specific transformations
- Implement compliance requirements

## Policy Architecture

### Core Components

Every policy consists of several key components:

1. **Policy Definition** - JSON schema defining the policy configuration
2. **Implementation Code** - The actual policy logic (JavaScript, Java, etc.)
3. **Metadata** - Information about the policy, versions, and compatibility
4. **Documentation** - User-facing documentation in Markdown format
5. **Assets** - Icons, banners, and other visual resources

### Policy Lifecycle

```
Development → Testing → Packaging → Publishing → Distribution
```

## Project Structure

A standard policy project should follow this directory structure:

```
my-custom-policy/
├── policy-definition.json    # Core policy configuration
├── metadata.json            # Policy metadata
├── implementation/          # Policy implementation files
│   ├── policy.js           # Main policy logic
│   └── utils/              # Helper utilities
├── docs/                   # Documentation files
│   ├── overview.md         # Policy overview
│   ├── configuration.md    # Configuration guide
│   ├── examples.md         # Usage examples
│   └── faq.md             # Frequently asked questions
├── assets/                 # Visual assets
│   ├── icon.svg           # Policy icon
│   └── banner.png         # Policy banner
└── tests/                  # Test files
    ├── unit/
    └── integration/
```

### Policy Definition Schema

The `policy-definition.json` file defines your policy's configuration schema:

```json
{
  "policyName": "my-custom-policy",
  "version": "1.0.0",
  "displayName": "My Custom Policy",
  "description": "A custom policy for specific business requirements",
  "category": "security",
  "applicableFlows": ["request", "response"],
  "supportedGateways": ["Synapse", "Choreo Connect"],
  "policyAttributes": [
    {
      "name": "apiKey",
      "displayName": "API Key",
      "description": "API key for external service",
      "type": "String",
      "required": true,
      "validationRegex": "^[A-Za-z0-9]{32}$"
    },
    {
      "name": "timeout",
      "displayName": "Timeout (ms)",
      "description": "Request timeout in milliseconds",
      "type": "Integer",
      "required": false,
      "defaultValue": 5000,
      "validationRegex": "^[1-9][0-9]*$"
    }
  ]
}
```

### Metadata Configuration

The `metadata.json` file contains policy metadata:

```json
{
  "name": "my-custom-policy",
  "displayName": "My Custom Policy",
  "description": "A comprehensive description of what this policy does",
  "provider": "Your Organization",
  "version": "1.0.0",
  "releaseDate": "2025-01-15",
  "categories": ["security", "authentication"],
  "tags": ["api-key", "custom", "security"],
  "supportedPlatforms": ["apim-4.5+"],
  "license": "Apache-2.0",
  "repository": "https://github.com/yourorg/my-custom-policy",
  "documentation": "https://docs.yourorg.com/policies/my-custom-policy",
  "maintainers": [
    {
      "name": "Your Name",
      "email": "your.email@yourorg.com"
    }
  ]
}
```

## Implementation Guidelines

### JavaScript Policy Example

```javascript
// policy.js - Main policy implementation
function executePolicy(context) {
    // Get policy configuration
    const config = context.getPolicyConfiguration();
    const apiKey = config.get('apiKey');
    const timeout = config.get('timeout') || 5000;
    
    // Implement your policy logic
    try {
        // Example: Validate API key
        if (!validateApiKey(apiKey)) {
            context.setError(401, 'Invalid API Key');
            return false;
        }
        
        // Example: Add custom headers
        context.setHeader('X-Custom-Policy', 'v1.0.0');
        context.setHeader('X-Processing-Time', Date.now());
        
        return true;
    } catch (error) {
        context.setError(500, 'Policy execution failed: ' + error.message);
        return false;
    }
}

function validateApiKey(apiKey) {
    // Implement your validation logic
    return apiKey && apiKey.length === 32;
}
```

### Best Practices

1. **Error Handling**: Always implement proper error handling and return meaningful error messages
2. **Performance**: Keep policy execution lightweight and avoid blocking operations
3. **Security**: Validate all inputs and sanitize data appropriately
4. **Logging**: Use structured logging for debugging and monitoring
5. **Testing**: Write comprehensive unit and integration tests

## Documentation Standards

### Overview Documentation

The `docs/overview.md` should include:

- Policy purpose and use cases
- Key features and benefits
- Prerequisites and requirements
- Basic usage example

### Configuration Documentation

The `docs/configuration.md` should cover:

- Detailed parameter descriptions
- Configuration examples
- Default values and constraints
- Platform-specific considerations

### Examples Documentation

The `docs/examples.md` should provide:

- Real-world usage scenarios
- Step-by-step configuration guides
- Sample API calls and responses
- Troubleshooting common issues

## Versioning Guidelines

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/) principles:

- **Major version** (X.y.z): Breaking changes or incompatible API changes
- **Minor version** (x.Y.z): New features that are backwards compatible
- **Patch version** (x.y.Z): Backwards compatible bug fixes

### Version Management

- Each version should be immutable once published
- Always provide migration guides for major version changes
- Maintain backwards compatibility when possible
- Document breaking changes clearly in release notes

## Packaging and Publishing

### Package Structure

Create a distributable package:

```bash
# Create package directory
mkdir my-custom-policy-v1.0.0
cd my-custom-policy-v1.0.0

# Copy required files
cp ../policy-definition.json .
cp ../metadata.json .
cp -r ../implementation .
cp -r ../docs .
cp -r ../assets .

# Create package archive
tar -czf my-custom-policy-v1.0.0.tar.gz *
```

### Publishing Workflow

1. **Prepare Release**
   - Update version numbers
   - Update documentation
   - Run all tests
   - Create release notes

2. **Package Policy**
   - Create distribution package
   - Validate package structure
   - Test package installation

3. **Publish to Policy Hub**
   - Use the Policy Hub sync API
   - Provide source URLs
   - Validate policy registration

### Sync API Example

```bash
curl -X POST https://api.policyhub.wso2.com/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "policyName": "my-custom-policy",
    "version": "v1.0.0",
    "sourceType": "github",
    "sourceUrl": "https://github.com/yourorg/my-custom-policy",
    "definitionUrl": "https://raw.githubusercontent.com/yourorg/my-custom-policy/v1.0.0/policy-definition.json",
    "metadataUrl": "https://raw.githubusercontent.com/yourorg/my-custom-policy/v1.0.0/metadata.json",
    "docsBaseUrl": "https://raw.githubusercontent.com/yourorg/my-custom-policy/v1.0.0/docs/",
    "assetsBaseUrl": "https://raw.githubusercontent.com/yourorg/my-custom-policy/v1.0.0/assets/"
  }'
```

## Testing and Validation

### Unit Testing

```javascript
// tests/unit/policy.test.js
const { executePolicy } = require('../../implementation/policy');

describe('My Custom Policy', () => {
  test('should validate API key correctly', () => {
    const mockContext = {
      getPolicyConfiguration: () => new Map([['apiKey', 'valid32characterapikeystring123']]),
      setError: jest.fn(),
      setHeader: jest.fn()
    };
    
    const result = executePolicy(mockContext);
    expect(result).toBe(true);
    expect(mockContext.setError).not.toHaveBeenCalled();
  });
  
  test('should reject invalid API key', () => {
    const mockContext = {
      getPolicyConfiguration: () => new Map([['apiKey', 'invalid']]),
      setError: jest.fn(),
      setHeader: jest.fn()
    };
    
    const result = executePolicy(mockContext);
    expect(result).toBe(false);
    expect(mockContext.setError).toHaveBeenCalledWith(401, 'Invalid API Key');
  });
});
```

### Integration Testing

Test your policy in a real WSO2 API Manager environment:

1. Deploy policy to test environment
2. Create test APIs with policy applied
3. Execute test scenarios
4. Validate expected behavior
5. Monitor performance metrics

## Community and Support

### Getting Help

- **Documentation**: Check the official WSO2 documentation
- **Community Forum**: Ask questions in the WSO2 community
- **GitHub Issues**: Report bugs and feature requests
- **Stack Overflow**: Tag questions with `wso2` and `api-manager`

### Contributing

- Follow coding standards and conventions
- Write comprehensive tests
- Document your changes
- Submit pull requests for review

### Resources

- [WSO2 API Manager Documentation](https://docs.wso2.com/display/AM260/)
- [Policy Development Examples](https://github.com/wso2/product-apim/tree/master/modules/integration/tests-integration/tests-backend/src/test/java/org/wso2/am/integration/tests/api/lifecycle)
- [Community Forums](https://stackoverflow.com/questions/tagged/wso2)

---

**Ready to start building?** Check out our example policies to see these concepts in action.
