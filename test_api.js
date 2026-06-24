const http = require('http');

async function test() {
  const res = await fetch('http://localhost:3000/api/wallet/transfer-offline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clerkId: 'test_id', amount: 500, direction: 'to_offline' })
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}
test();
