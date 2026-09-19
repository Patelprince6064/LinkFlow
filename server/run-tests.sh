#!/bin/bash
# Comprehensive Test Runner for LinkFlow
# Runs all test suites and reports results

echo "============================================"
echo "  LinkFlow - Comprehensive Test Suite"
echo "============================================"
echo ""

TOTAL_PASSED=0
TOTAL_FAILED=0
TOTAL_SUITES=0
FAILED_SUITES=""

run_suite() {
  local name=$1
  local cmd=$2
  TOTAL_SUITES=$((TOTAL_SUITES + 1))
  
  echo "Running: $name"
  if eval "$cmd"; then
    TOTAL_PASSED=$((TOTAL_PASSED + 1))
  else
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
    FAILED_SUITES="$FAILED_SUITES  - $name\n"
  fi
  echo ""
}

# Unit tests (no database required)
run_suite "Security (exports & validation)" "node src/__tests__/security.test.js"
run_suite "Analytics (exports)" "node src/__tests__/analytics.test.js"
run_suite "Bio (exports)" "node src/__tests__/bio.test.js"
run_suite "Redirect & Telemetry (device/IP/code)" "node src/__tests__/redirect.test.js"
run_suite "Comprehensive Validation" "node src/__tests__/validation.test.js"

# Database integration tests (requires MongoDB)
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
  echo "MongoDB detected - running integration tests..."
  run_suite "Auth Integration" "node src/__tests__/auth.test.js"
  run_suite "Links Integration" "node src/__tests__/links.test.js"
  run_suite "Bio Integration" "node src/__tests__/bio-full.test.js"
  run_suite "Analytics DB Integration" "node src/__tests__/analytics-db.test.js"
else
  echo "MongoDB not detected - skipping database integration tests"
  echo "  (auth.test.js, links.test.js, bio-full.test.js, analytics-db.test.js)"
fi

echo "============================================"
echo "  Test Suite Summary"
echo "============================================"
echo "Suites run:    $((TOTAL_PASSED + TOTAL_FAILED))"
echo "Suites passed: $TOTAL_PASSED"
echo "Suites failed: $TOTAL_FAILED"
if [ -n "$FAILED_SUITES" ]; then
  echo ""
  echo "Failed suites:"
  echo -e "$FAILED_SUITES"
fi
echo "============================================"

exit $TOTAL_FAILED
