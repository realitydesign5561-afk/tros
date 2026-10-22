import { NextResponse } from 'next/server'
import { handleActivepiecesOAuthCallback } from '@/lib/activepieces'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')

  if (errorParam) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Failed</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f1110; color: #fff;">
          <div style="background: #1c1e1c; padding: 2rem; border-radius: 1rem; max-width: 400px; text-align: center; border: 1px solid #333;">
            <h3 style="color: #ef4444; margin-top: 0;">Authorization Cancelled or Failed</h3>
            <p style="font-size: 0.875rem; color: #a1a1aa;">${errorDesc || errorParam}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', provider: 'activepieces', error: ${JSON.stringify(errorDesc || errorParam)} }, '*');
                setTimeout(() => window.close(), 3000);
              }
            </script>
            <p style="font-size: 0.75rem; color: #71717a;">Closing window in 3 seconds...</p>
          </div>
        </body>
      </html>
    `
    return new NextResponse(errorHtml, { headers: { 'Content-Type': 'text/html' } })
  }

  if (!code || !state) {
    return new NextResponse('Missing code or state parameter', { status: 400 })
  }

  try {
    await handleActivepiecesOAuthCallback(code, state)

    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Successful</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f1110; color: #fff;">
          <div style="background: #1c1e1c; padding: 2.5rem; border-radius: 1.5rem; max-width: 420px; text-align: center; border: 1px solid #383b39; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: #eaf79f; color: #1b1e1c; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 1.5rem; font-weight: bold;">
              ✓
            </div>
            <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Activepieces MCP Connected</h2>
            <p style="font-size: 0.875rem; color: #9ca3af; line-height: 1.5; margin-bottom: 1.5rem;">
              Your Activepieces account is authorized. Handshake with the MCP platform server completed successfully.
            </p>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'activepieces' }, '*');
                  setTimeout(() => window.close(), 1200);
                } else {
                  setTimeout(() => { window.location.href = '/settings'; }, 2000);
                }
              } catch (e) {
                console.error(e);
              }
            </script>
            <p style="font-size: 0.75rem; color: #6b7280;">This window should close automatically...</p>
          </div>
        </body>
      </html>
    `
    return new NextResponse(successHtml, { headers: { 'Content-Type': 'text/html' } })
  } catch (error: any) {
    console.error('[Activepieces OAuth Callback Error]:', error)
    const failureHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f1110; color: #fff;">
          <div style="background: #1c1e1c; padding: 2rem; border-radius: 1rem; max-width: 440px; text-align: center; border: 1px solid #ef4444;">
            <h3 style="color: #ef4444; margin-top: 0;">Authentication Error</h3>
            <p style="font-size: 0.875rem; color: #d1d5db; margin-bottom: 1rem;">${error.message || 'Failed to exchange authorization token.'}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', provider: 'activepieces', error: ${JSON.stringify(error.message)} }, '*');
              }
            </script>
            <button onclick="window.close()" style="background: #374151; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `
    return new NextResponse(failureHtml, { status: 500, headers: { 'Content-Type': 'text/html' } })
  }
}
