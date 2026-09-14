import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  avatarUrl?: string;
  givenName?: string;
  familyName?: string;
}

export class GoogleAuthProvider {
  private static getClient(redirectUri?: string): OAuth2Client {
    return new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      redirectUri || env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generates official Google OAuth 2.0 Authorization URL.
   */
  static getAuthUrl(state?: string, redirectUri?: string): string {
    if (!env.GOOGLE_CLIENT_ID) {
      throw {
        statusCode: 503,
        code: 'SERVICE_NOT_CONFIGURED',
        message: 'Google OAuth Client ID is not configured on the server.',
      };
    }
    const client = this.getClient(redirectUri);
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'openid',
      ],
      prompt: 'consent',
      state,
    });
  }

  /**
   * Exchanges an OAuth authorization code for tokens and verifies the ID token.
   */
  static async verifyCode(code: string, redirectUri?: string): Promise<GoogleUserPayload> {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw {
        statusCode: 503,
        code: 'SERVICE_NOT_CONFIGURED',
        message: 'Google OAuth credentials are not configured on the server.',
      };
    }

    const client = this.getClient(redirectUri);
    let tokens;
    try {
      const response = await client.getToken(code);
      tokens = response.tokens;
    } catch (err: any) {
      throw {
        statusCode: 401,
        code: 'AUTH_INVALID_GOOGLE_CODE',
        message: 'Failed to exchange authorization code with Google.',
        details: err?.message,
      };
    }

    if (!tokens.id_token) {
      throw {
        statusCode: 401,
        code: 'AUTH_MISSING_ID_TOKEN',
        message: 'No ID token received from Google.',
      };
    }

    return this.verifyIdToken(tokens.id_token, redirectUri);
  }

  /**
   * Verifies Google ID Token claims, signature, audience, issuer, expiration, and email_verified.
   */
  static async verifyIdToken(idToken: string, redirectUri?: string): Promise<GoogleUserPayload> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw {
        statusCode: 503,
        code: 'SERVICE_NOT_CONFIGURED',
        message: 'Google OAuth Client ID is not configured on the server.',
      };
    }

    const client = this.getClient(redirectUri);
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });
    } catch (err: any) {
      throw {
        statusCode: 401,
        code: 'AUTH_INVALID_GOOGLE_TOKEN',
        message: 'Google ID token verification failed or token is expired/invalid.',
        details: err?.message,
      };
    }

    const payload = ticket.getPayload();
    if (!payload) {
      throw {
        statusCode: 401,
        code: 'AUTH_INVALID_GOOGLE_PAYLOAD',
        message: 'Google token payload is empty.',
      };
    }

    if (!payload.email) {
      throw {
        statusCode: 400,
        code: 'AUTH_MISSING_EMAIL',
        message: 'Google account does not have an email address.',
      };
    }

    const emailVerified = Boolean(payload.email_verified);
    const googleId = payload.sub;
    const fullName = payload.name || payload.given_name || payload.email.split('@')[0] || 'Farmer';
    const avatarUrl = payload.picture;

    return {
      googleId,
      email: payload.email.toLowerCase().trim(),
      emailVerified,
      fullName,
      avatarUrl,
      givenName: payload.given_name,
      familyName: payload.family_name,
    };
  }
}
