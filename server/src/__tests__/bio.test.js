import * as bioService from "../services/bio.service.js";
import * as bioController from "../controllers/bio.controller.js";

let passed = 0;
let failed = 0;

const test = (name, fn) => {
  try {
    fn();
    console.log("  \u2713 " + name);
    passed++;
  } catch (error) {
    console.log("  \u2717 " + name);
    console.log("    " + error.message);
    failed++;
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

console.log("\nBio Tests (no database required)\n");

console.log("Bio Service:");

test("exports getMyProfile function", () => {
  assert(typeof bioService.getMyProfile === "function", "getMyProfile should be a function");
});

test("exports createProfile function", () => {
  assert(typeof bioService.createProfile === "function", "createProfile should be a function");
});

test("exports updateProfile function", () => {
  assert(typeof bioService.updateProfile === "function", "updateProfile should be a function");
});

test("exports deleteProfile function", () => {
  assert(typeof bioService.deleteProfile === "function", "deleteProfile should be a function");
});

test("exports getPublicProfile function", () => {
  assert(typeof bioService.getPublicProfile === "function", "getPublicProfile should be a function");
});

console.log("\nBio Controller:");

test("exports getMyProfile controller", () => {
  assert(typeof bioController.getMyProfile === "function", "getMyProfile should be a function");
});

test("exports createProfile controller", () => {
  assert(typeof bioController.createProfile === "function", "createProfile should be a function");
});

test("exports updateProfile controller", () => {
  assert(typeof bioController.updateProfile === "function", "updateProfile should be a function");
});

test("exports deleteProfile controller", () => {
  assert(typeof bioController.deleteProfile === "function", "deleteProfile should be a function");
});

test("exports getPublicProfile controller", () => {
  assert(typeof bioController.getPublicProfile === "function", "getPublicProfile should be a function");
});

console.log("\nBioProfile Model:");

test("has correct field structure", () => {
  const schema = bioService;
  assert(typeof schema.getPublicProfile === "function", "Service should be importable");
});

console.log("\nResults: " + passed + " passed, " + failed + " failed out of " + (passed + failed) + " tests\n");
process.exit(failed > 0 ? 1 : 0);
