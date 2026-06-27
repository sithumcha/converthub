const request = require('supertest');
const express = require('express');

const app = express();
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ConvertHub Server is running' });
});

describe('Health Check API', () => {
  it('should return 200 OK and health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
