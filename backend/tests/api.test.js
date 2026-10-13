import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

const request = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
};

test('GET /api/health returns success and healthy status', async () => {
  const res = await request('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
});

test('GET /api/properties returns approved marketplace properties', async () => {
  const res = await request('/api/properties');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.properties));
  assert.ok(res.data.properties.length >= 5);
  // Ensure no pending properties are leaked in public search
  for (const prop of res.data.properties) {
    assert.strictEqual(prop.approvalStatus, 'approved');
    assert.strictEqual(prop.availabilityStatus, 'available');
  }
});

test('POST /api/auth/login validates credentials and returns token', async () => {
  const res = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'owner@propertyconnect.com', password: 'Owner@1234' },
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.token);
  assert.strictEqual(res.data.user.role, 'owner');
});

test('POST /api/auth/login rejects wrong password', async () => {
  const res = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'owner@propertyconnect.com', password: 'WrongPassword999' },
  });
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.data.success, false);
});
