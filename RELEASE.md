# CI/CD and Release Process

This project uses GitHub Actions for automated continuous integration and deployment.

## Automated Workflows

### CI/CD Pipeline (`ci-cd.yml`)

- **Triggers**: Push to master/main, Pull requests, GitHub releases
- **Tests**: Runs on Node.js 20.x and 22.x (18.x excluded due to compatibility issues)
- **Steps**: Install dependencies → **Build package** → Run tests → Publish to npm (on release)
- **Important**: Build runs before tests because tests depend on the built `dist/` files

### Auto Version Bump (`auto-version.yml`)

- **Triggers**: Push to master/main (excluding version bump commits)
- **Logic**:
  - `major:` or `BREAKING CHANGE` → Major version bump
  - `feat:` or `feature:` → Minor version bump
  - Everything else → Patch version bump

## TypeScript Support (v1.1.0)

### Implementation Details

The package now includes comprehensive TypeScript support while maintaining full JavaScript compatibility:

**TypeScript Declarations (`src/types/index.d.ts`)**:

- Complete type definitions for all exports
- Type-safe interfaces for `UseEposPrinterReturn`, `EposClientOptions`, `EposEndpoint`
- Union types for `PrinterStatus` with proper IntelliSense support
- Runtime type validation with `isValidPrinterStatus` type guard

**Package Configuration**:

- Added `"types": "dist/index.d.ts"` field in package.json
- Configured exports map for proper ESM/CJS resolution with types
- Added `build:types` script to copy declarations to dist folder
- Added `test:types` script for TypeScript validation

**Developer Experience**:

- Full IntelliSense support in VS Code and other TypeScript-enabled editors
- Compile-time type checking for better error catching
- Proper autocompletion for status constants, method parameters, and return values
- Examples provided for both JavaScript and TypeScript usage patterns

**Approach Used**: Manual TypeScript declarations (Option 1)

- **Pros**: Minimal build complexity, fast builds, precise control over API surface
- **Cons**: Requires manual maintenance of type definitions
- **Why chosen**: Small package size, ESM-first architecture, existing JavaScript codebase
- **Output**: Creates git tag and GitHub release

## Manual Release Process

### Option 1: Using npm scripts

```bash
# Patch release (1.0.0 → 1.0.1)
npm run release:patch

# Minor release (1.0.0 → 1.1.0)
npm run release:minor

# Major release (1.0.0 → 2.0.0)
npm run release:major
```

### Option 2: Using GitHub releases

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Tag version: `v1.0.1` (follow semantic versioning)
4. Release title: `Release v1.0.1`
5. Describe the changes
6. Click "Publish release"

The GitHub Action will automatically publish to npm when you create a release.

## Setup Requirements

### 1. NPM Token

1. Go to [npmjs.com](https://www.npmjs.com) → Account → Access Tokens
2. Create a new "Automation" token
3. Copy the token
4. In your GitHub repo: Settings → Secrets and variables → Actions
5. Add new secret: `NPM_TOKEN` with your token value

### 2. GitHub Token

The `GITHUB_TOKEN` is automatically provided by GitHub Actions.

### 3. Repository Settings

- Enable Actions in your repository settings
- Ensure you have write access to the repository

## Commit Message Conventions

For automated version bumping, use conventional commit formats:

- `fix: bug description` → Patch version
- `feat: new feature` → Minor version
- `feat: new feature\n\nBREAKING CHANGE: description` → Major version
- `major: breaking change` → Major version

## Manual Testing Before Release

```bash
# Run full test suite
npm test

# Test coverage
npm run test:coverage

# Build package
npm run build

# Test the built package
npm pack
```

## Troubleshooting

### Failed npm publish

- Check NPM_TOKEN is correctly set
- Ensure version hasn't been published already
- Verify package name is available

### Failed tests in CI

- Ensure all dependencies are in package.json (not just devDependencies for build tools)
- Check Node.js version compatibility
- Review test output in GitHub Actions logs

### Node.js Version Compatibility

- **Supported**: Node.js 20.x and 22.x
- **Not Supported**: Node.js 18.x (dependency compatibility issues)
- **Recommended**: Node.js 20.x (LTS) for development
