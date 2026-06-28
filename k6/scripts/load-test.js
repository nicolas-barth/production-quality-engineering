import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const cloudflareBlocks = new Counter('cloudflare_blocks');
const http403          = new Counter('http_403');
const http429          = new Counter('http_429');
const http500          = new Counter('http_500');
const http503          = new Counter('http_503');
const networkErrors    = new Counter('network_errors');
const timeouts         = new Counter('timeouts');
const unexpectedHtml   = new Counter('unexpected_html');
const failedChecks     = new Counter('failed_checks');

const infraErrorRate = new Rate('infra_error_rate');
const appErrorRate   = new Rate('app_error_rate');

const homepageDuration = new Trend('homepage_duration', true);
const searchDuration   = new Trend('search_duration', true);
const pdpDuration      = new Trend('pdp_duration', true);
const cartDuration     = new Trend('cart_duration', true);

const BASE_URL = 'https://demo.opencart.com/en-gb';

const PARAMS = {
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Cache-Control': 'no-cache',
  },
  timeout: '30s',
};

function isCloudflare(res) {
  return (
    !!res.headers['Cf-Ray'] ||
    !!res.headers['cf-ray'] ||
    (typeof res.body === 'string' && res.body.includes('Cloudflare'))
  );
}

function classify(res) {
  if (!res || res.status === 0) {
    networkErrors.add(1);
    if (res && res.error_code === 1050) timeouts.add(1);
    infraErrorRate.add(1);
    appErrorRate.add(0);
    return 'network';
  }

  const s = res.status;

  if (s === 403) {
    http403.add(1);
    if (isCloudflare(res)) cloudflareBlocks.add(1);
    infraErrorRate.add(1);
    appErrorRate.add(0);
    return 'infra';
  }

  if (s === 429) {
    http429.add(1);
    cloudflareBlocks.add(1);
    infraErrorRate.add(1);
    appErrorRate.add(0);
    return 'infra';
  }

  if (s === 503) {
    http503.add(1);
    if (isCloudflare(res)) cloudflareBlocks.add(1);
    infraErrorRate.add(1);
    appErrorRate.add(0);
    return 'infra';
  }

  if (s === 500 || s === 502 || s === 504) {
    http500.add(1);
    infraErrorRate.add(0);
    appErrorRate.add(1);
    return 'app';
  }

  if (s !== 200) {
    infraErrorRate.add(0);
    appErrorRate.add(1);
    return 'other';
  }

  infraErrorRate.add(0);
  return 'ok';
}

function recordCheck(passed) {
  if (!passed) {
    failedChecks.add(1);
    unexpectedHtml.add(1);
    appErrorRate.add(1);
  } else {
    appErrorRate.add(0);
  }
}

export const options = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 10 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    app_error_rate:    ['rate<0.05'],
    http_req_duration: ['p(95)<3000', 'p(99)<8000'],
    homepage_duration: ['p(95)<3000'],
    search_duration:   ['p(95)<3000'],
    pdp_duration:      ['p(95)<3000'],
    cart_duration:     ['p(95)<5000'],
    http_req_failed:   ['rate<0.10'],
  },
};

export default function () {
  group('Homepage', () => {
    const res = http.get(`${BASE_URL}?route=common/home`, PARAMS);
    homepageDuration.add(res.timings.duration);

    if (classify(res) === 'ok') {
      recordCheck(check(res, {
        'homepage: status 200':        (r) => r.status === 200,
        'homepage: is full HTML page': (r) => r.body.length > 8000,
      }));
    }
  });

  sleep(1);

  group('Search', () => {
    const terms = ['macbook', 'iphone', 'camera'];
    const term  = terms[Math.floor(Math.random() * terms.length)];
    const res   = http.get(`${BASE_URL}?route=common/search&search=${term}`, PARAMS);
    searchDuration.add(res.timings.duration);

    if (classify(res) === 'ok') {
      recordCheck(check(res, {
        'search: status 200':        (r) => r.status === 200,
        'search: is full HTML page': (r) => r.body.length > 3000,
      }));
    }
  });

  sleep(2);

  group('Product Detail Page', () => {
    const ids = [40, 42, 43];
    const id  = ids[Math.floor(Math.random() * ids.length)];
    const res = http.get(`${BASE_URL}?route=product/product&product_id=${id}`, PARAMS);
    pdpDuration.add(res.timings.duration);

    if (classify(res) === 'ok') {
      recordCheck(check(res, {
        'pdp: status 200':        (r) => r.status === 200,
        'pdp: is full HTML page': (r) => r.body.length > 8000,
      }));
    }
  });

  sleep(1);

  group('Cart Page', () => {
    const res = http.get(`${BASE_URL}?route=checkout/cart`, PARAMS);
    cartDuration.add(res.timings.duration);

    if (classify(res) === 'ok') {
      recordCheck(check(res, {
        'cart: status 200':        (r) => r.status === 200,
        'cart: is full HTML page': (r) => r.body.length > 2000,
      }));
    }
  });

  sleep(2);

  group('Category Page', () => {
    const paths = [20, 24, 25];
    const path  = paths[Math.floor(Math.random() * paths.length)];
    const res   = http.get(`${BASE_URL}?route=product/category&path=${path}`, PARAMS);

    if (classify(res) === 'ok') {
      check(res, {
        'category: status 200': (r) => r.status === 200,
      });
    }
  });

  sleep(Math.random() * 3 + 1);
}

export function handleSummary(data) {
  const m   = data.metrics;
  const val = (k, s) => m[k]?.values?.[s] ?? 0;

  const totalReqs    = val('http_reqs', 'count');
  const cfBlocks     = val('cloudflare_blocks', 'count');
  const h403         = val('http_403', 'count');
  const h429         = val('http_429', 'count');
  const h500         = val('http_500', 'count');
  const h503         = val('http_503', 'count');
  const netErr       = val('network_errors', 'count');
  const tmOut        = val('timeouts', 'count');
  const htmlErr      = val('unexpected_html', 'count');
  const checkErr     = val('failed_checks', 'count');
  const appRate      = (val('app_error_rate', 'rate') * 100).toFixed(2);
  const infraRate    = (val('infra_error_rate', 'rate') * 100).toFixed(2);
  const p95          = val('http_req_duration', 'p(95)').toFixed(0);
  const p99          = val('http_req_duration', 'p(99)').toFixed(0);

  const diagnosis = [];
  if (cfBlocks > 0)  diagnosis.push(`Cloudflare blocked ${cfBlocks} requests (HTTP 429/403/503)`);
  if (h500 > 0)      diagnosis.push(`Application HTTP 500: ${h500} requests`);
  if (netErr > 0)    diagnosis.push(`Network-level failures: ${netErr}`);
  if (htmlErr > 0)   diagnosis.push(`Unexpected HTML on ${htmlErr} responses (body too small)`);
  if (parseFloat(appRate) === 0 && parseFloat(infraRate) > 0) {
    diagnosis.push('Application is healthy — all failures are Cloudflare/infrastructure');
  }
  if (parseFloat(appRate) === 0 && parseFloat(infraRate) === 0) {
    diagnosis.push('No failures — test passed cleanly');
  }

  return {
    'k6-load-summary.json': JSON.stringify({
      qeSummary: {
        totalRequests: totalReqs,
        infrastructure: {
          errorRate:       `${infraRate}%`,
          cloudflareBlocks: cfBlocks,
          http403:         h403,
          http429:         h429,
          http503:         h503,
          networkErrors:   netErr,
          timeouts:        tmOut,
        },
        application: {
          errorRate:    `${appRate}%`,
          http500:      h500,
          unexpectedHtml: htmlErr,
          failedChecks: checkErr,
        },
        performance: {
          p95ms: parseInt(p95, 10),
          p99ms: parseInt(p99, 10),
        },
        diagnosis: diagnosis.length ? diagnosis : ['No issues identified'],
      },
    }, null, 2),
  };
}
