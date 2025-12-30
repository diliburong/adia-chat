import nextConfig from 'eslint-config-next';

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      '.cache/**',
    ],
  },
  ...nextConfig,
];

export default eslintConfig;
