import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const responseDuration = new Trend('spike_response_duration', true);

const BASE_URL = 'https://demo.opencart.com/en-gb';

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '2m', target: 5 }, // Baseline
        { duration: '10s', target: 150 }, // Spike (near-instant)
        { duration: '3m', target: 150 }, // Hold spike
        { duration: '10s', target: 5 }, // Recovery
        { duration: '2m', target: 5 }, // Confirm recovery
        { duration: '30s', target: 0 }, // Ramp down
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // Allow up to 5% errors during spike
    error_rate: ['rate<0.05'],
    spike_response_duration: ['p(95)<8000'], // Relaxed threshold during spike
  },
};

export default function () {
  group('Spike — Critical Pages', () => {
    const start = Date.now();

    // Focus on the most critical page (homepage) during spike
    const res = http.get(`${BASE_URL}?route=common/home`, {
      headers: { Accept: 'text/html' },
      timeout: '30s',
    });

    responseDuration.add(Date.now() - start);

    const passed = check(res, {
      'spike: status 200 or 503': (r) => r.status === 200 || r.status === 503,
      'spike: not 500': (r) => r.status !== 500,
      'spike: response time < 8s': (r) => r.timings.duration < 8000,
    });

    errorRate.add(passed ? 0 : 1);
  });

  sleep(1);
}

export function handleSummary(data) {
  const metrics = data.metrics;
  const errorPct = (metrics.error_rate?.values?.rate * 100).toFixed(2);
  const p95 = metrics.spike_response_duration?.values?.['p(95)'];

  const summary = {
    testType: 'spike',
    maxVUs: 150,
    errorRate: `${errorPct}%`,
    p95ResponseTime: `${p95}ms`,
    passed: parseFloat(errorPct) < 5 && p95 < 8000,
  };

  return {
    'k6-spike-summary.json': JSON.stringify({ ...data, qeSummary: summary }, null, 2),
  };
}
