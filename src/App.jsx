import { useState } from 'react'
import './Login.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('Your sign-in form is ready to connect to an authentication provider.')
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
        <span className="photo-credit">A QUIETER KIND OF PRODUCTIVITY</span>
      </section>

      <section className="form-panel" id="sign-in" aria-labelledby="login-title">
        <div className="form-wrap">
          <p className="form-eyebrow">WELCOME BACK</p>
          <h1 id="login-title">Come on in.</h1>
          <p className="form-intro">Sign in to find your way back to today.</p>

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
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setMessage('')
                }}
                required
              />
            </div>

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
                onClick={() => setMessage('Password recovery is not connected yet.')}
              >
                Forgot password?
              </button>
            </div>

            <button className="sign-in-button" type="submit">
              <span>Sign in</span>
              <span aria-hidden="true">&#8594;</span>
            </button>
            <p className="form-message" role="status" aria-live="polite">{message}</p>
          </form>

          <p className="signup-prompt">
            New around here?{' '}
            <button
              className="text-button signup-button"
              type="button"
              onClick={() => setMessage('Account creation is not connected yet.')}
            >
              Create an account
            </button>
          </p>
          <p className="form-footnote">Take your time. You are right where you need to be.</p>
        </div>
      </section>
    </main>
  )
}

export default App
