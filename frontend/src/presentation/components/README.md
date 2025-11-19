# Presentation Components

This directory contains reusable presentation components following Clean Architecture principles.

## Error Handling Components

### ErrorBoundary
Class-based React Error Boundary for catching render errors in component tree.

**Import:**
```tsx
import { ErrorBoundary } from '@/presentation/components';
```

**Basic Usage:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**With Context:**
```tsx
<ErrorBoundary context={{ component: 'Home', userId: user.id }}>
  <Home />
</ErrorBoundary>
```

**With Custom Fallback:**
```tsx
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h1>Error in this section</h1>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
>
  <MovieSection />
</ErrorBoundary>
```

### ErrorFallback
Reusable error UI component with customization options.

**Import:**
```tsx
import { ErrorFallback } from '@/presentation/components';
```

**Basic Usage:**
```tsx
<ErrorFallback error={error} resetError={handleReset} />
```

**Customized:**
```tsx
<ErrorFallback
  error={error}
  size="small"
  title="Failed to Load Movies"
  message="We couldn't load the movies. Please try again."
  actions={[
    { label: 'Retry', onClick: handleRetry, variant: 'primary' },
    { label: 'Go Back', onClick: handleBack, variant: 'secondary' }
  ]}
/>
```

**Size Variants:**
- `small`: Compact error display
- `medium`: Default size (recommended)
- `large`: Larger display with more padding
- `fullscreen`: Full-screen error page

### ErrorTest (Development Only)
Component for testing error scenarios during development.

**Import:**
```tsx
import { ErrorTest } from '@/presentation/components/ErrorTest';
```

**Usage:**
```tsx
function DevPage() {
  return (
    <>
      <YourPageContent />
      {import.meta.env.DEV && <ErrorTest />}
    </>
  );
}
```

**Important:** Remove from production builds or gate with `import.meta.env.DEV`.

## Advanced Patterns

### Route-Level Error Boundaries
Wrap each route for granular error handling:

```tsx
<Routes>
  <Route
    path="/home"
    element={
      <ErrorBoundary context={{ route: 'home' }}>
        <Home />
      </ErrorBoundary>
    }
  />
  <Route
    path="/movie/:id"
    element={
      <ErrorBoundary context={{ route: 'movie-details' }}>
        <MovieDetailsPage />
      </ErrorBoundary>
    }
  />
</Routes>
```

### Feature-Level Error Boundaries
Isolate errors to specific features:

```tsx
function Dashboard() {
  return (
    <div>
      <ErrorBoundary context={{ feature: 'user-stats' }}>
        <UserStats />
      </ErrorBoundary>

      <ErrorBoundary context={{ feature: 'movie-list' }}>
        <MovieList />
      </ErrorBoundary>

      <ErrorBoundary context={{ feature: 'recommendations' }}>
        <Recommendations />
      </ErrorBoundary>
    </div>
  );
}
```

### Custom Error Recovery
Implement custom recovery logic:

```tsx
function MovieSection() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <ErrorBoundary
      key={resetKey}
      onError={(error, errorInfo) => {
        console.error('Movie section error:', error);
        // Custom logging or analytics
      }}
      fallback={(error, reset) => (
        <ErrorFallback
          error={error}
          resetError={() => {
            reset();
            setResetKey(k => k + 1);
            // Additional reset logic
          }}
        />
      )}
    >
      <MovieCard />
    </ErrorBoundary>
  );
}
```

### Combining with useErrorHandler
Use ErrorBoundary for render errors, useErrorHandler for async errors:

```tsx
function MovieCard() {
  const { handleAsyncError } = useErrorHandler();

  const loadMovie = async () => {
    // useErrorHandler catches async errors
    const movie = await handleAsyncError(
      fetchMovie(id),
      { component: 'MovieCard', movieId: id }
    );
    return movie;
  };

  // ErrorBoundary catches render errors
  if (someInvalidState) {
    throw new Error('Invalid render state');
  }

  return <div>{/* ... */}</div>;
}

// Wrap with ErrorBoundary
<ErrorBoundary>
  <MovieCard />
</ErrorBoundary>
```

## Architecture Notes

### Why Class Component?
ErrorBoundary uses a class component because React only provides error boundary lifecycle methods (`componentDidCatch`, `getDerivedStateFromError`) in class components. There are no equivalent hooks.

### Separation of Concerns
- **ErrorBoundary:** Error capture logic (class component)
- **ErrorFallback:** Error presentation UI (functional component)

This separation follows Single Responsibility Principle and allows reuse of ErrorFallback in non-boundary contexts.

### Integration with Error System
These components integrate with:
- `ErrorClassifier`: Classifies errors and determines handling strategy
- `errorLogger`: Logs errors with structured context
- `useErrorHandler`: Provides error handling in functional components

## Testing

### Manual Testing
1. Use `<ErrorTest />` component in development
2. Test different error types
3. Verify error UI displays correctly
4. Test retry functionality
5. Check console logs

### Unit Testing
```tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/presentation/components';

test('catches render errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

## Best Practices

### ✅ Do
- Wrap entire application at root level
- Use route-level boundaries for granular control
- Provide meaningful context in error logs
- Use custom fallbacks for specific sections
- Test error scenarios during development

### ❌ Don't
- Wrap every single component (too granular)
- Use for expected errors (use try/catch instead)
- Ignore error logs in development
- Hide technical details in development
- Ship ErrorTest component to production

## Future Enhancements
- Error analytics integration (Sentry, LogRocket)
- Automatic retry with exponential backoff
- User feedback/reporting form
- Error recovery strategies
- Custom error pages (404, 500)

See `PHASE-8-ERROR-BOUNDARY.md` for complete documentation.
