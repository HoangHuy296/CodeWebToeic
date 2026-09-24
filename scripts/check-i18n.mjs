import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const languages = ['vi', 'en'];
const pluralSuffix = /_(zero|one|two|few|many|other)$/;
const interpolation = /\{\{\s*-?\s*([^{}]+?)\s*\}\}/g;

function parameters(value) {
  return [...new Set([...value.matchAll(interpolation)].map((match) => match[1].split(',')[0].trim()))]
    .sort().join(',');
}

function flatten(value, path, output, errors) {
  if (typeof value === 'string') {
    if (!value.trim()) errors.push(`${path}: empty translation`);
    if (value.includes('\uFFFD')) errors.push(`${path}: invalid Unicode replacement character`);
    if (/\{\{|\}\}/.test(value.replace(interpolation, ''))) errors.push(`${path}: malformed interpolation`);
    output.set(path, value);
    return;
  }
  if (!value || typeof value !== 'object') {
    errors.push(`${path}: expected a string, object, or array`);
    return;
  }
  const entries = Object.entries(value);
  if (!entries.length) errors.push(`${path}: empty translation group`);
  for (const [key, child] of entries) flatten(child, path ? `${path}.${key}` : key, output, errors);
}

// Compare logical keys, allowing English _one/_other and Vietnamese _other.
// Every variant retains the same interpolation parameters by project convention.
export function validateLocales(resources) {
  const errors = [];
  const counts = {};
  const namespaces = new Set(languages.flatMap((language) => Object.keys(resources[language] ?? {})));
  if (!namespaces.size) errors.push('No translation namespaces found');
  for (const namespace of [...namespaces].sort()) {
    const groupsByLanguage = {};
    for (const language of languages) {
      const resource = resources[language]?.[namespace];
      if (!resource) {
        errors.push(`${language}/${namespace}: missing namespace`);
        continue;
      }
      const leaves = new Map();
      const localErrors = [];
      flatten(resource, '', leaves, localErrors);
      errors.push(...localErrors.map((error) => `${language}/${namespace}:${error}`));
      counts[`${language}/${namespace}`] = leaves.size;
      const groups = new Map();
      for (const [key, value] of leaves) {
        const base = key.replace(pluralSuffix, '');
        if (!groups.has(base)) groups.set(base, []);
        groups.get(base).push({ key, value });
      }
      for (const [base, variants] of groups) {
        const expected = parameters(variants[0].value);
        for (const variant of variants) {
          if (parameters(variant.value) !== expected) {
            errors.push(`${language}/${namespace}:${variant.key}: interpolation differs from ${variants[0].key}`);
          }
        }
        if (variants.some(({ key }) => pluralSuffix.test(key))) {
          for (const category of new Intl.PluralRules(language).resolvedOptions().pluralCategories) {
            if (!leaves.has(`${base}_${category}`)) errors.push(`${language}/${namespace}:${base}_${category}: missing plural variant`);
          }
        }
      }
      groupsByLanguage[language] = groups;
    }
    const logicalKeys = new Set(languages.flatMap((language) => [...(groupsByLanguage[language]?.keys() ?? [])]));
    for (const key of logicalKeys) {
      const vi = groupsByLanguage.vi?.get(key);
      const en = groupsByLanguage.en?.get(key);
      if (!vi || !en) {
        errors.push(`${!vi ? 'vi' : 'en'}/${namespace}:${key}: missing key`);
      } else if (parameters(vi[0].value) !== parameters(en[0].value)) {
        errors.push(`${namespace}:${key}: interpolation mismatch (vi: ${parameters(vi[0].value)}; en: ${parameters(en[0].value)})`);
      }
    }
  }
  return { errors, counts, namespaces: namespaces.size };
}

export function readLocales(root) {
  const resources = {};
  for (const language of languages) {
    resources[language] = {};
    for (const name of readdirSync(join(root, language)).filter((file) => file.endsWith('.json')).sort()) {
      const file = join(root, language, name);
      try {
        resources[language][name.slice(0, -5)] = JSON.parse(readFileSync(file, 'utf8'));
      } catch (error) {
        throw new Error(`${file}: ${error.message}`);
      }
    }
  }
  return resources;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '../frontend/src/i18n/locales');
    const result = validateLocales(readLocales(root));
    if (result.errors.length) {
      console.error(result.errors.join('\n'));
      process.exitCode = 1;
    } else {
      console.log(`i18n OK: ${result.namespaces} namespaces, ${Object.values(result.counts).reduce((sum, count) => sum + count, 0)} translated strings across vi/en.`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
