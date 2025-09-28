import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: {
        bundle: false, // generate a single bundled .d.ts file
        distPath: './dist', // optional, output folder
        abortOnError: true, // optional, stop build if types fail
      },
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
        axios: 'axios',
        openai: 'openai',
        dotenv: 'dotenv',
      },
      resolve: {
        extensions: ['.ts', '.js', '.json'],
      },
    },
  },
});
