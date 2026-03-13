"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, ArrowLeft, Bug } from "lucide-react"
import { useTranslations } from 'next-intl'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log detailed error information
    console.error("Error caught by boundary:", error)
    console.error("Component stack:", errorInfo.componentStack)
    console.error("Error boundary stack:", errorInfo)

    // Update state with error info
    this.setState({ errorInfo })
  }

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          onGoBack={this.handleGoBack}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  onRetry: () => void
  onGoBack: () => void
}

function ErrorFallback({ error, errorInfo, onRetry, onGoBack }: ErrorFallbackProps) {
  const t = useTranslations('common');
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="flex items-center justify-center min-h-[500px] p-6">
      <Card className="max-w-2xl w-full border-destructive/50 shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription className="text-base mt-1">
                {error?.message || "An unexpected error occurred while rendering this component"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Bug className="h-4 w-4" />
                <span>Error Message</span>
              </div>
              <code className="block text-sm text-destructive break-words">
                {error.toString()}
              </code>
            </div>
          )}

          {/* Technical Details (Collapsible) */}
          {errorInfo && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full"
              >
                {showDetails ? "Hide" : "Show"} Technical Details
              </Button>

              {showDetails && (
                <div className="rounded-lg bg-muted p-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <Bug className="h-4 w-4" />
                      <span>Component Stack</span>
                    </div>
                    <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>

                  {process.env.NODE_ENV === 'development' && error?.stack && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <span>Stack Trace</span>
                      </div>
                      <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recovery Options */}
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button
              variant="outline"
              onClick={onGoBack}
              className="flex-1"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button
              variant="secondary"
              onClick={onRetry}
              className="flex-1"
              size="lg"
            >
              Try Again
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center text-sm text-muted-foreground">
            If this problem persists, please check the console for more details or contact support.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
