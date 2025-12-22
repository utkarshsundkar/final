#!/bin/bash

# Test script for local server authentication endpoints
# This simulates what the React Native app does

echo "🧪 Testing Local Server Authentication Flow"
echo "=============================================="
echo ""

SERVER_URL="http://192.168.0.105:3000/api/v2/users"
TEST_EMAIL="testuser@example.com"

echo "📍 Server URL: $SERVER_URL"
echo "📧 Test Email: $TEST_EMAIL"
echo ""

# Test 1: Check Email Exists
echo "1️⃣  Testing /check-email endpoint..."
RESPONSE=$(curl -s -X POST "$SERVER_URL/check-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

echo "Response: $RESPONSE"
echo ""

# Test 2: Auth with MojoAuth (simulating successful OTP verification)
echo "2️⃣  Testing /auth-mojo endpoint (simulating successful login)..."
RESPONSE=$(curl -s -X POST "$SERVER_URL/auth-mojo" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"name\":\"Test User\",\"mojoToken\":\"test-token-123\"}")

echo "Response: $RESPONSE"
echo ""

# Extract user ID and access token from response
USER_ID=$(echo $RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
ACCESS_TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo "✅ Authentication successful!"
    echo "   User ID: $USER_ID"
    echo "   Access Token: ${ACCESS_TOKEN:0:50}..."
    echo ""
    
    # Test 3: Get Current User (protected endpoint)
    echo "3️⃣  Testing /current-user endpoint (protected)..."
    RESPONSE=$(curl -s -X GET "$SERVER_URL/current-user" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    echo "Response: $RESPONSE"
    echo ""
    
    if echo "$RESPONSE" | grep -q "User fetched successfully"; then
        echo "✅ All tests passed! Server is working correctly."
    else
        echo "⚠️  Protected endpoint test failed. Check JWT verification."
    fi
else
    echo "❌ Authentication failed. Check server logs."
fi

echo ""
echo "=============================================="
echo "💡 Next Steps:"
echo "   1. Rebuild your React Native app"
echo "   2. Make sure your device is on the same WiFi"
echo "   3. Try the email login flow"
echo "=============================================="
