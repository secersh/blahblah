import { GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY_PATH } from '$env/static/private';
import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string | null;
  owner: {
    login: string;
  };
};

type GitHubRepositoriesResponse = {
  repositories: GitHubRepository[];
};

type GitHubTag = {
  name: string;
  commit: {
    sha: string;
  };
  zipball_url: string;
  tarball_url: string;
};

function resolvePrivateKeyPath(path: string) {
  return isAbsolute(path) ? path : resolve(process.cwd(), '..', path);
}

async function createGitHubAppJwt() {
  if (!GITHUB_APP_ID) {
    throw new Error('GITHUB_APP_ID is not configured.');
  }

  if (!GITHUB_APP_PRIVATE_KEY_PATH) {
    throw new Error('GITHUB_APP_PRIVATE_KEY_PATH is not configured.');
  }

  const privateKey = await readFile(resolvePrivateKeyPath(GITHUB_APP_PRIVATE_KEY_PATH), 'utf8');
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: GITHUB_APP_ID
    })
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = createSign('RSA-SHA256').update(unsignedToken).sign(privateKey);

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

async function createInstallationAccessToken(installationId: number) {
  const jwt = await createGitHubAppJwt();
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${jwt}`,
        'x-github-api-version': '2022-11-28'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub installation token request failed with ${response.status}.`);
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

export async function listInstallationRepositories(installationId: number) {
  const token = await createInstallationAccessToken(installationId);
  const response = await fetch('https://api.github.com/installation/repositories?per_page=100', {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub repository sync failed with ${response.status}.`);
  }

  const data = (await response.json()) as GitHubRepositoriesResponse;
  return data.repositories;
}

export async function listRepositoryTags(options: {
  installationId: number;
  owner: string;
  repo: string;
}) {
  const token = await createInstallationAccessToken(options.installationId);
  const response = await fetch(
    `https://api.github.com/repos/${options.owner}/${options.repo}/tags?per_page=100`,
    {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'x-github-api-version': '2022-11-28'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub tag fetch failed with ${response.status}.`);
  }

  return (await response.json()) as GitHubTag[];
}
