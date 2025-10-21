'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

function GoogleAuthContent() {
  const searchParams = useSearchParams();
  const [refreshToken, setRefreshToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for refresh token or error in URL
    const token = searchParams.get('refresh_token');
    const urlError = searchParams.get('error');
    
    if (token) {
      setRefreshToken(token);
    }
    if (urlError) {
      setError(urlError);
    }
  }, [searchParams]);

  const handleAuthorize = () => {
    // Build OAuth URL
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      setError('Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.');
      return;
    }

    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar.events';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Open in new window
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Google Calendar Authorization
            </h1>
            <p className="text-xl text-gray-600">
              Connect your Google Calendar to automatically sync bookings
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <AlertCircle className="mr-2" size={20} />
                Before You Start
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                <li>Make sure you've created a Google Cloud Project</li>
                <li>Enabled the Google Calendar API</li>
                <li>Created OAuth 2.0 credentials</li>
                <li>Added the redirect URI to your OAuth client</li>
                <li>Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local</li>
              </ol>
            </div>

            {/* Authorization Button */}
            <div className="text-center py-8">
              <button
                onClick={handleAuthorize}
                disabled={loading}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <ExternalLink size={24} />
                <span>Connect Google Calendar</span>
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Success Display */}
            {refreshToken && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <CheckCircle className="mr-2" size={20} />
                  Authorization Successful!
                </h3>
                <p className="text-green-800 text-sm mb-4">
                  Copy this refresh token and add it to your environment variables:
                </p>
                <div className="bg-white border border-green-300 rounded p-4 font-mono text-sm break-all">
                  {refreshToken}
                </div>
                <p className="text-green-700 text-sm mt-4">
                  Add this to your <code className="bg-green-100 px-2 py-1 rounded">.env.local</code>:
                </p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded mt-2 text-sm overflow-x-auto">
GOOGLE_REFRESH_TOKEN={refreshToken}
                </pre>
              </div>
            )}

            {/* What Happens Next */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">What Happens Next?</h3>
              <ol className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Click "Connect Google Calendar" button above</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Sign in with your Google account</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Grant calendar access permissions</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span>You'll be redirected back with your refresh token</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">5.</span>
                  <span>Copy the token and add it to your environment variables</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">6.</span>
                  <span>Restart your development server</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">7.</span>
                  <span>Test by creating a booking - it should appear in your Google Calendar!</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoogleAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <GoogleAuthContent />
    </Suspense>
  );
}
