#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"

echo "=== Testing TradingPool Backend API ==="
echo ""

# Test 1: Register
echo "1. Testing Registration..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","confirmPassword":"Test123!"}' | jq '.'

echo ""

# Test 2: Login Admin
echo "2. Testing Admin Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"sesshomaru@admin.com","password":"inyasha"}')

echo "$LOGIN_RESPONSE" | jq '.'

# Extract token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.tokens.accessToken')

echo ""
echo "Access Token: $ACCESS_TOKEN"
echo ""

# Test 3: Get Current User
echo "3. Testing Get Current User..."
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

echo ""

# Test 4: Get Pools
echo "4. Testing Get Pools..."
curl -s -X GET "$BASE_URL/pools" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

echo ""

# Test 5: Admin Dashboard
echo "5. Testing Admin Dashboard..."
curl -s -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

echo ""
echo "=== Tests Complete ==="
