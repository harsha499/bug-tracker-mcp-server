import { spawn } from 'child_process';

const testRequests = [
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
  },
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'change_defect_status',
      arguments: {
        defectId: 'BUG-6',
        status: 'In Progress',
      },
    },
  },
];

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: process.env,
});

server.stdout.on('data', data => {
  console.log('Server Response:', data.toString());
});

// Send test requests
testRequests.forEach((request, index) => {
  setTimeout(() => {
    console.log(`Sending request ${index + 1}:`, request);
    server.stdin.write(JSON.stringify(request) + '\n');
  }, index * 10000);
});

setTimeout(() => {
  server.kill();
}, 500000);
