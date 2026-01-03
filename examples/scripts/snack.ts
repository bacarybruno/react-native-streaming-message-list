import {
  Snack,
  type SDKVersion,
  type SnackDependencies,
  type SnackFiles,
} from 'snack-sdk';
import { readFileSync, readdirSync } from 'node:fs';
import packageJson from '../../package.json';
import examplePackageJson from '../package.json';
import 'dotenv/config';

if (!process.env.SNACK_ACCOUNT_ACCESS_TOKEN) {
  console.error('Cannot upload snack: SNACK_ACCOUNT_ACCESS_TOKEN is not set');
  process.exit(0);
}

const sourceFiles = readdirSync('./src', {
  recursive: true,
  withFileTypes: true,
})
  .filter((file) => file.isFile())
  .reduce<SnackFiles>(
    (acc, file) => ({
      ...acc,
      [`${file.parentPath}/${file.name}`]: {
        type: 'CODE',
        contents: readFileSync(`${file.parentPath}/${file.name}`, 'utf8'),
      },
    }),
    {}
  );

const dependencies = Object.keys(
  examplePackageJson.dependencies
).reduce<SnackDependencies>(
  (acc, key) => ({
    ...acc,
    [key]: {
      version:
        examplePackageJson.dependencies[
          key as keyof typeof examplePackageJson.dependencies
        ],
    },
  }),
  {}
);

const snack = new Snack({
  name: `${packageJson.name} demo`,
  description: `A demo of the ${packageJson.name} library, version ${packageJson.version}`,
  dependencies: {
    ...dependencies,
    'react-native-streaming-message-list': {
      version: packageJson.version,
    },
  },
  files: {
    'App.tsx': {
      type: 'CODE',
      contents: readFileSync('App.tsx', 'utf8'),
    },
    'README.md': {
      type: 'CODE',
      contents: readFileSync('../README.md', 'utf8'),
    },
    ...sourceFiles,
  },
  sdkVersion: examplePackageJson.dependencies.expo.replace(
    '~',
    ''
  ) as SDKVersion,
  user: {
    accessToken: process.env.SNACK_ACCOUNT_ACCESS_TOKEN,
  },
});

const result = await snack.saveAsync();
console.log(`Snack saved: ${JSON.stringify(result, null, 2)} 🎉`);
