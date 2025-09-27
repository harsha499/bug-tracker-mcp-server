import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: true,
      shims: true,
    },
  ],
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  tools: {
    rspack: {
      module: {
        rules: [
          {
            test: /\.node$/,
            use: 'node-loader',
          },
        ],
      },
      externals: {
        // Keep these as external dependencies
        '@modelcontextprotocol/sdk': '@modelcontextprotocol/sdk',
        'axios': 'axios',
        'openai': 'openai',
        'dotenv': 'dotenv',
      },
      resolve: {
        extensions: ['.ts', '.js', '.json'],
      },
    },
  },
});