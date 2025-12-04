#!/bin/bash

# AstraLearn Test Execution Guide
# Run this file to execute all tests or use individual commands

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        AstraLearn - Comprehensive Test Execution           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Function to run tests
run_test() {
    local test_name=$1
    local command=$2
    local directory=$3

    echo -e "\n${YELLOW}Running: ${test_name}${NC}"
    echo -e "${BLUE}Command: ${command}${NC}"
    echo -e "${BLUE}Directory: ${directory}${NC}\n"
    
    if cd "${directory}" && eval "${command}"; then
        echo -e "${GREEN}✓ ${test_name} passed${NC}"
        return 0
    else
        echo -e "${RED}✗ ${test_name} failed${NC}"
        return 1
    fi
}

# Track results
BACKEND_TESTS_PASSED=0
BACKEND_TESTS_FAILED=0
FRONTEND_TESTS_PASSED=0
FRONTEND_TESTS_FAILED=0

# Backend Tests
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}BACKEND TEST SUITE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Test 1: Auth & Security
if run_test "Auth & Security Tests" "npm test -- auth-security.test.js" "server"; then
    ((BACKEND_TESTS_PASSED++))
else
    ((BACKEND_TESTS_FAILED++))
fi

# Test 2: Course Management
if run_test "Course Management Tests" "npm test -- courses.test.js" "server"; then
    ((BACKEND_TESTS_PASSED++))
else
    ((BACKEND_TESTS_FAILED++))
fi

# Test 3: Video Upload
if run_test "Video Upload Tests" "npm test -- video-upload.test.js" "server"; then
    ((BACKEND_TESTS_PASSED++))
else
    ((BACKEND_TESTS_FAILED++))
fi

# Test 4: AI Ingestion
if run_test "AI Ingestion Tests" "npm test -- ai-ingestion.test.js" "server"; then
    ((BACKEND_TESTS_PASSED++))
else
    ((BACKEND_TESTS_FAILED++))
fi

# Test 5: Integration Tests
if run_test "Teacher Workflow Integration Tests" "npm run test:integration -- teacher-workflow" "server"; then
    ((BACKEND_TESTS_PASSED++))
else
    ((BACKEND_TESTS_FAILED++))
fi

# Frontend Tests
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}FRONTEND TEST SUITE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Check if testing is configured
if ! grep -q '"test"' client/package.json 2>/dev/null; then
    echo -e "${YELLOW}⚠  Frontend testing not yet configured${NC}"
    echo -e "${YELLOW}To set up Jest testing, run:${NC}"
    echo -e "${BLUE}cd client && npm install --save-dev @testing-library/react @testing-library/jest-dom jest @babel/preset-react${NC}"
else
    # Test 1: RoleBasedRedirect
    if run_test "RoleBasedRedirect Tests" "npm test -- RoleBasedRedirect.test.jsx" "client"; then
        ((FRONTEND_TESTS_PASSED++))
    else
        ((FRONTEND_TESTS_FAILED++))
    fi

    # Test 2: VideoUpload
    if run_test "VideoUpload Tests" "npm test -- VideoUpload.test.jsx" "client"; then
        ((FRONTEND_TESTS_PASSED++))
    else
        ((FRONTEND_TESTS_FAILED++))
    fi

    # Test 3: ContentIngestion
    if run_test "ContentIngestion Tests" "npm test -- ContentIngestion.test.jsx" "client"; then
        ((FRONTEND_TESTS_PASSED++))
    else
        ((FRONTEND_TESTS_FAILED++))
    fi

    # Test 4: TeacherDashboard
    if run_test "TeacherDashboard Tests" "npm test -- TeacherDashboard.test.jsx" "client"; then
        ((FRONTEND_TESTS_PASSED++))
    else
        ((FRONTEND_TESTS_FAILED++))
    fi
fi

# Print Summary
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Backend Tests:${NC}"
echo -e "  ${GREEN}✓ Passed: ${BACKEND_TESTS_PASSED}${NC}"
echo -e "  ${RED}✗ Failed: ${BACKEND_TESTS_FAILED}${NC}"

echo -e "\n${BLUE}Frontend Tests:${NC}"
echo -e "  ${GREEN}✓ Passed: ${FRONTEND_TESTS_PASSED}${NC}"
echo -e "  ${RED}✗ Failed: ${FRONTEND_TESTS_FAILED}${NC}"

TOTAL_PASSED=$((BACKEND_TESTS_PASSED + FRONTEND_TESTS_PASSED))
TOTAL_FAILED=$((BACKEND_TESTS_FAILED + FRONTEND_TESTS_FAILED))
TOTAL_TESTS=$((TOTAL_PASSED + TOTAL_FAILED))

if [ $TOTAL_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}\n"
    exit 0
else
    echo -e "\n${RED}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}✗ SOME TESTS FAILED (${TOTAL_FAILED}/${TOTAL_TESTS})${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}\n"
    exit 1
fi
