import { env } from '$env/dynamic/private';

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

const GITHUB_API_HEADERS = {
  accept: 'application/vnd.github+json',
  'user-agent': 'Blah Blah',
  'x-github-api-version': '2022-11-28'
};

async function createGitHubAppJwt() {
  if (!env.GITHUB_APP_ID) {
    throw new Error('GITHUB_APP_ID is not configured.');
  }

  if (!env.GITHUB_APP_PRIVATE_KEY) {
    throw new Error('GITHUB_APP_PRIVATE_KEY is not configured.');
  }

  const privateKey = await importGitHubPrivateKey(env.GITHUB_APP_PRIVATE_KEY.replaceAll('\\n', '\n'));
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: env.GITHUB_APP_ID
    })
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function importGitHubPrivateKey(pem: string) {
  const keyData = pem.includes('BEGIN RSA PRIVATE KEY')
    ? wrapPkcs1PrivateKey(pemToDer(pem))
    : pemToDer(pem);

  return crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function pemToDer(pem: string) {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function wrapPkcs1PrivateKey(pkcs1: Uint8Array) {
  const version = new Uint8Array([0x02, 0x01, 0x00]);
  const rsaAlgorithmIdentifier = new Uint8Array([
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00
  ]);

  return der(0x30, concat(version, rsaAlgorithmIdentifier, der(0x04, pkcs1)));
}

function der(tag: number, value: Uint8Array) {
  return concat(new Uint8Array([tag]), derLength(value.length), value);
}

function derLength(length: number) {
  if (length < 0x80) {
    return new Uint8Array([length]);
  }

  const bytes = [];
  let remaining = length;

  while (remaining > 0) {
    bytes.unshift(remaining & 0xff);
    remaining >>= 8;
  }

  return new Uint8Array([0x80 | bytes.length, ...bytes]);
}

function concat(...arrays: Uint8Array[]) {
  const length = arrays.reduce((total, array) => total + array.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;

  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }

  return result;
}

function base64UrlEncode(value: string | ArrayBuffer) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
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
        ...GITHUB_API_HEADERS,
        authorization: `Bearer ${jwt}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `GitHub installation token request failed with ${response.status}: ${await response.text()}`
    );
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

export async function listInstallationRepositories(installationId: number) {
  const token = await createInstallationAccessToken(installationId);
  const response = await fetch('https://api.github.com/installation/repositories?per_page=100', {
    headers: {
      ...GITHUB_API_HEADERS,
      authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub repository sync failed with ${response.status}: ${await response.text()}`);
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
        ...GITHUB_API_HEADERS,
        authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub tag fetch failed with ${response.status}: ${await response.text()}`);
  }

  return (await response.json()) as GitHubTag[];
}
