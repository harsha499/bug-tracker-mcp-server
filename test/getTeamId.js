import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.LINEAR_API_KEY; // set in your terminal or .env

async function main() {
  const query = `
    query {
      teams {
        nodes {
          id
          key
          name
        }
      }
    }
  `;

  const headers = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['Authorization'] = API_KEY;
  }

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
