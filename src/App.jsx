import { useEffect, useState } from 'react'
import Dashboard from './Dashboard'
import './Login.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/auth/me', { signal: controller.signal })
      .then(async (response) => {
        if (response.ok) setCurrentUser(await response.json())
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setMessage('Backend unavailable. Start the Spring Boot server on port 8080.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsCheckingSession(false)
      })

    return () => controller.abort()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(`/api/auth/${isCreatingAccount ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        setMessage(result.message || 'Something went wrong. Please try again.')
        return
      }

      setCurrentUser(result)
      setPassword('')
    } catch {
      setMessage('Could not reach the backend. Check that Spring Boot is running on port 8080.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isCheckingSession && currentUser) {
    return <Dashboard user={currentUser} />
  }

  return (
    <main className="login-page">
      <section className="photo-panel" aria-label="Good, Slowly">
        <a className="login-wordmark" href="#sign-in" aria-label="Good, Slowly home">
          <span className="login-mark" aria-hidden="true">g.</span>
          <span>good, slowly</span>
        </a>
        <div className="photo-message">
          <p className="photo-kicker">A LITTLE SPACE TO BEGIN AGAIN</p>
          <p className="photo-quote">Make room<br />for what matters.</p>
          <span className="photo-caption">Your days, at your own pace.</span>
        </div>
        <span className="photo-credit">A PERSONAL PROJECT BY PANKAJ MOGARE</span>
      </section>

      <section className="form-panel" id="sign-in" aria-labelledby="login-title">
        <div className="form-wrap">
          {isCheckingSession ? (
            <p className="form-intro">Finding your place...</p>
          ) : (
            <>
              <p className="form-eyebrow">{isCreatingAccount ? 'A FRESH START' : 'WELCOME BACK'}</p>
              <h1 id="login-title">{isCreatingAccount ? 'Make yourself at home.' : 'Come on in.'}</h1>
              <p className="form-intro">
                {isCreatingAccount
                  ? 'Create an account to save your place.'
                  : 'Sign in to find your way back to today.'}
              </p>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="field-group">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setMessage('')
                    }}
                    required
                  />
                </div>

                <div className="field-group">
                  <div className="password-label-row">
                    <label htmlFor="password">Password</label>
                    <button
                      className="text-button"
                      type="button"
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isCreatingAccount ? 'new-password' : 'current-password'}
                    placeholder={isCreatingAccount ? 'At least 8 characters' : 'Enter your password'}
                    minLength={isCreatingAccount ? 8 : undefined}
                    maxLength={72}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setMessage('')
                    }}
                    required
                  />
                </div>

                {!isCreatingAccount && (
                  <div className="form-options">
                    <label className="remember-option">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => setMessage('Password recovery is not configured yet.')}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button className="sign-in-button" type="submit" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Please wait...' : isCreatingAccount ? 'Create account' : 'Sign in'}</span>
                  <span aria-hidden="true">&#8594;</span>
                </button>
                <p className={message ? 'form-message is-visible' : 'form-message'} role="status" aria-live="polite">
                  {message}
                </p>
              </form>

              <p className="signup-prompt">
                {isCreatingAccount ? 'Already have an account?' : 'New around here?'}{' '}
                <button
                  className="text-button signup-button"
                  type="button"
                  onClick={() => {
                    setIsCreatingAccount((creating) => !creating)
                    setMessage('')
                  }}
                >
                  {isCreatingAccount ? 'Sign in' : 'Create an account'}
                </button>
              </p>
            </>
          )}
          <p className="form-footnote">Take your time. You are right where you need to be.</p>
        </div>
      </section>
    </main>
  )
}

export default App
