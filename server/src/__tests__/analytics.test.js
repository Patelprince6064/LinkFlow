import * as analyticsService from "../services/analytics.service.js";
import * as analyticsController from "../controllers/analytics.controller.js";

let passed = 0;
let failed = 0;

const test = (name, fn) => {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${error.message}`);
    failed++;
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

console.log("\nAnalytics Tests (no database required)\n");

console.log("Analytics Service:");

test("exports getOverview function", () => {
  assert(typeof analyticsService.getOverview === "function", "getOverview should be a function");
});

test("exports getClicksOverTime function", () => {
  assert(typeof analyticsService.getClicksOverTime === "function", "getClicksOverTime should be a function");
});

test("exports getTopReferrers function", () => {
  assert(typeof analyticsService.getTopReferrers === "function", "getTopReferrers should be a function");
});

test("exports getDeviceDistribution function", () => {
  assert(typeof analyticsService.getDeviceDistribution === "function", "getDeviceDistribution should be a function");
});

test("exports getLinkAnalytics function", () => {
  assert(typeof analyticsService.getLinkAnalytics === "function", "getLinkAnalytics should be a function");
});

console.log("\nAnalytics Controller:");

test("exports overview function", () => {
  assert(typeof analyticsController.overview === "function", "overview should be a function");
});

test("exports clicksOverTime function", () => {
  assert(typeof analyticsController.clicksOverTime === "function", "clicksOverTime should be a function");
});

test("exports referrers function", () => {
  assert(typeof analyticsController.referrers === "function", "referrers should be a function");
});

test("exports devices function", () => {
  assert(typeof analyticsController.devices === "function", "devices should be a function");
});

test("exports linkAnalytics function", () => {
  assert(typeof analyticsController.linkAnalytics === "function", "linkAnalytics should be a function");
});

console.log("\nAnalytics Routes:");

test("has all expected route handlers defined", () => {
  const controllerFns = [
    analyticsController.overview,
    analyticsController.clicksOverTime,
    analyticsController.referrers,
    analyticsController.devices,
    analyticsController.linkAnalytics,
  ];
  controllerFns.forEach((fn, i) => {
    assert(typeof fn === "function", `Controller function ${i} should be a function`);
  });
});

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
process.exit(failed > 0 ? 1 : 0);
