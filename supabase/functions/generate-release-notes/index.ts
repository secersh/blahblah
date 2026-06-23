// Supabase Edge Function: generate-release-notes
//
// Worker: validates the request, returns 202 immediately, then fetches the
// selected GitHub tag comparison in the background, asks Gemini to draft release
// notes, and stores the markdown result.
//
// All DB/Storage work runs with the *caller's* JWT (the `authenticated` role),
// which has the table grants + RLS access + storage-folder access it needs.
// NOTE: the future webhook trigger has no user JWT, so that path will need a
// service identity (grant the relevant role on release_notes) instead.
//
// Deploy: supabase functions deploy generate-release-notes
// (verify_jwt defaults to true, so the caller's user JWT is required.)

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

type GeneratePayload = {
  releaseNoteId: string;
  repositoryFullName: string;
  owner: string;
  repo: string;
  installationId: number;
  startTag: string | null;
  endTag: string;
  storagePath: string;
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const GITHUB_APP_ID = Deno.env.get('GITHUB_APP_ID')!;
const GITHUB_APP_PRIVATE_KEY = Deno.env.get('GITHUB_APP_PRIVATE_KEY')!;
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.1-flash-lite';

const GITHUB_API_HEADERS = {
  accept: 'application/vnd.github+json',
  'user-agent': 'Blah Blah',
  'x-github-api-version': '2022-11-28'
};

const RELEASE_NOTE_TEMPLATE = [
  '# {repository} {version}',
  '',
  '## Summary',
  '',
  'A short 1-2 sentence summary of what changed in this release.',
  '',
  '## Changes',
  '',
  '### Added',
  '',
  '- User-facing features or newly introduced behavior.',
  '',
  '### Changed',
  '',
  '- Behavior changes, refactors with product impact, or notable improvements.',
  '',
  '### Fixed',
  '',
  '- Bug fixes and corrected behavior.',
  '',
  '### Maintenance',
  '',
  '- Dependency updates, internal cleanup, tooling, documentation, or chores.',
  '',
  '## Upgrade Notes',
  '',
  '- Migration steps, breaking changes, configuration changes, or compatibility notes. Use "None." if not applicable.'
].join('\n');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });

type GitHubCompareFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
};

type GitHubCompareCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    } | null;
  };
  author: {
    login: string;
    html_url: string;
  } | null;
};

type GitHubCompareResponse = {
  url: string;
  html_url: string;
  permalink_url: string;
  diff_url: string;
  patch_url: string;
  base_commit: { sha: string; html_url: string };
  merge_base_commit: { sha: string; html_url: string };
  status: string;
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  commits: GitHubCompareCommit[];
  files?: GitHubCompareFile[];
};

type GitHubCommitResponse = GitHubCompareCommit & {
  files?: GitHubCompareFile[];
};

type ReleaseInput = {
  mode: 'compare' | 'initial';
  rangeUrl: string;
  status: string;
  totalCommits: number;
  aheadBy?: number;
  behindBy?: number;
  commits: GitHubCompareCommit[];
  files: GitHubCompareFile[];
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
};

async function createGitHubAppJwt() {
  if (!GITHUB_APP_ID) {
    throw new Error('GITHUB_APP_ID is not configured.');
  }

  if (!GITHUB_APP_PRIVATE_KEY) {
    throw new Error('GITHUB_APP_PRIVATE_KEY is not configured.');
  }

  const privateKey = await importGitHubPrivateKey(GITHUB_APP_PRIVATE_KEY.replaceAll('\\n', '\n'));
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

async function fetchGitHubCompare(payload: GeneratePayload) {
  const token = await createInstallationAccessToken(payload.installationId);
  if (!payload.startTag) {
    throw new Error('startTag is required for GitHub compare requests.');
  }

  const response = await fetch(
    `https://api.github.com/repos/${payload.owner}/${payload.repo}/compare/${encodeURIComponent(
      payload.startTag
    )}...${encodeURIComponent(payload.endTag)}`,
    {
      headers: {
        ...GITHUB_API_HEADERS,
        authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub compare request failed with ${response.status}: ${await response.text()}`);
  }

  return (await response.json()) as GitHubCompareResponse;
}

async function fetchInitialReleaseInput(payload: GeneratePayload): Promise<ReleaseInput> {
  const token = await createInstallationAccessToken(payload.installationId);
  const headers = {
    ...GITHUB_API_HEADERS,
    authorization: `Bearer ${token}`
  };

  const commitsResponse = await fetch(
    `https://api.github.com/repos/${payload.owner}/${payload.repo}/commits?sha=${encodeURIComponent(
      payload.endTag
    )}&per_page=100`,
    { headers }
  );

  if (!commitsResponse.ok) {
    throw new Error(
      `GitHub initial release commit list failed with ${commitsResponse.status}: ${await commitsResponse.text()}`
    );
  }

  const commits = (await commitsResponse.json()) as GitHubCompareCommit[];
  const taggedCommitSha = commits[0]?.sha ?? payload.endTag;
  const commitResponse = await fetch(
    `https://api.github.com/repos/${payload.owner}/${payload.repo}/commits/${encodeURIComponent(taggedCommitSha)}`,
    { headers }
  );

  if (!commitResponse.ok) {
    throw new Error(
      `GitHub initial release commit fetch failed with ${commitResponse.status}: ${await commitResponse.text()}`
    );
  }

  const taggedCommit = (await commitResponse.json()) as GitHubCommitResponse;

  return {
    mode: 'initial',
    rangeUrl: taggedCommit.html_url,
    status: 'initial release',
    totalCommits: commits.length,
    commits,
    files: taggedCommit.files ?? []
  };
}

async function fetchReleaseInput(payload: GeneratePayload): Promise<ReleaseInput> {
  if (!payload.startTag) {
    return fetchInitialReleaseInput(payload);
  }

  const compare = await fetchGitHubCompare(payload);

  return {
    mode: 'compare',
    rangeUrl: compare.html_url,
    status: compare.status,
    totalCommits: compare.total_commits,
    aheadBy: compare.ahead_by,
    behindBy: compare.behind_by,
    commits: compare.commits ?? [],
    files: compare.files ?? []
  };
}

function buildGeminiPrompt(payload: GeneratePayload, input: ReleaseInput): string {
  const files = input.files;
  const commits = input.commits;

  return [
    `Generate concise, useful markdown release notes for ${payload.repositoryFullName}.`,
    '',
    'Requirements:',
    '- Return markdown only.',
    '- Follow the template exactly: keep the same heading order and heading names.',
    '- Replace placeholders with the actual repository and end tag.',
    '- Keep sections concise and remove empty subsections only when there is no evidence for that category.',
    '- Use "None." for Upgrade Notes unless the input clearly shows migration steps, breaking changes, configuration changes, or compatibility notes.',
    '- Mention breaking changes only if the input clearly supports them.',
    '- Do not invent issue numbers, PR numbers, authors, or changes that are not present in the input.',
    '- Keep wording clear and product-facing.',
    '- Do not include raw commit dumps, raw diffs, or implementation details unless they are useful to users.',
    '',
    'Template:',
    '```md',
    RELEASE_NOTE_TEMPLATE,
    '```',
    '',
    'Release range:',
    `- From: ${payload.startTag ?? 'Initial release'}`,
    `- To: ${payload.endTag}`,
    `- URL: ${input.rangeUrl}`,
    `- Mode: ${input.mode === 'initial' ? 'Initial release' : 'Tag comparison'}`,
    `- Status: ${input.status}`,
    `- Total commits: ${input.totalCommits}`,
    input.aheadBy === undefined ? null : `- Ahead by: ${input.aheadBy}`,
    input.behindBy === undefined ? null : `- Behind by: ${input.behindBy}`,
    '',
    'Commits:',
    commits.length === 0
      ? '- No commits returned by GitHub.'
      : commits
          .map((commit, index) =>
            [
              `${index + 1}. ${commit.sha.slice(0, 7)}`,
              `- Author: ${commit.author?.login ?? commit.commit.author?.name ?? 'unknown'}`,
              `- Date: ${commit.commit.author?.date ?? 'unknown'}`,
              `- URL: ${commit.html_url}`,
              `- Message: ${truncate(commit.commit.message, 2_000)}`
            ].join('\n')
          )
          .join('\n\n'),
    '',
    'Changed files:',
    files.length === 0
      ? '- No files returned by GitHub.'
      : files
          .map((file, index) =>
            [
              `${index + 1}. ${file.filename}`,
              `- Status: ${file.status}`,
              file.previous_filename ? `- Previous filename: ${file.previous_filename}` : null,
              `- Additions: ${file.additions}`,
              `- Deletions: ${file.deletions}`,
              `- Changes: ${file.changes}`,
              file.patch ? `- Patch:\n\`\`\`diff\n${truncate(file.patch, 6_000)}\n\`\`\`` : '- No patch returned.'
            ]
              .filter(Boolean)
              .join('\n')
          )
          .join('\n\n'),
    ''
  ]
    .filter((line) => line !== null)
    .join('\n');
}

async function generateReleaseNotesMarkdown(payload: GeneratePayload, input: ReleaseInput) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const prompt = truncate(buildGeminiPrompt(payload, input), 120_000);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.3
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini generation failed with ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  const markdown =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim() ?? '';

  if (!markdown) {
    const reason = data.promptFeedback?.blockReason ?? data.candidates?.[0]?.finishReason ?? 'unknown';
    throw new Error(`Gemini returned no release note content. Reason: ${reason}`);
  }

  return markdown;
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}\n\n... truncated ${value.length - maxLength} characters ...`;
}

async function runGeneration(db: SupabaseClient, payload: GeneratePayload) {
  try {
    const input = await fetchReleaseInput(payload);
    const markdown = await generateReleaseNotesMarkdown(payload, input);

    const { error: uploadError } = await db.storage
      .from('release-notes')
      .upload(payload.storagePath, markdown, { contentType: 'text/markdown', upsert: true });
    if (uploadError) throw uploadError;

    // Only mark draft if the note is still awaiting generation. If it was
    // deleted (or otherwise changed) mid-run, this touches 0 rows — so clean
    // up the file we just uploaded instead of leaving an orphan in Storage.
    const { data: updated, error: updateError } = await db
      .from('release_notes')
      .update({ status: 'draft', error_message: null })
      .eq('id', payload.releaseNoteId)
      .eq('status', 'generating')
      .select('id');
    if (updateError) throw updateError;

    if (!updated || updated.length === 0) {
      await db.storage.from('release-notes').remove([payload.storagePath]);
    }
  } catch (err) {
    console.error('Release note generation failed', err);
    // Best-effort: only flip to failed if the note is still around and generating.
    await db
      .from('release_notes')
      .update({ status: 'failed', error_message: String((err as Error)?.message ?? err) })
      .eq('id', payload.releaseNoteId)
      .eq('status', 'generating');
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Run everything as the caller (authenticated role) via their forwarded JWT.
  const authHeader = req.headers.get('Authorization') ?? '';
  const db = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });

  const {
    data: { user }
  } = await db.auth.getUser();
  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let payload: GeneratePayload;
  try {
    payload = (await req.json()) as GeneratePayload;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!payload.releaseNoteId || !payload.storagePath) {
    return json({ error: 'Missing releaseNoteId or storagePath' }, 400);
  }

  // RLS scopes this to the caller's own rows.
  const { data: note, error: noteError } = await db
    .from('release_notes')
    .select('id, status')
    .eq('id', payload.releaseNoteId)
    .maybeSingle();

  if (noteError) {
    return json({ error: 'lookup_failed', detail: noteError.message }, 500);
  }
  if (!note) {
    return json({ error: 'note_not_found', releaseNoteId: payload.releaseNoteId }, 404);
  }
  if (note.status !== 'generating') {
    return json({ error: 'wrong_status', status: note.status }, 409);
  }

  // Do the slow work after responding.
  EdgeRuntime.waitUntil(runGeneration(db, payload));

  return json({ accepted: true, releaseNoteId: payload.releaseNoteId }, 202);
});
