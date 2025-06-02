#!/bin/bash

# 🧪 FRAMETALE SYSTEM TEST SCRIPT
# Run this script to test all endpoints after starting the server

echo "🚀 Testing Frametale Backend System..."
echo "Make sure the server is running on http://localhost:3000"
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        if [ -z "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ SUCCESS${NC} (HTTP $http_code)"
        echo "Response: $(echo "$body" | jq -r '.message // .status // "Success"' 2>/dev/null || echo "Success")"
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        echo "Error: $body"
    fi
    echo ""
}

echo "🔍 1. SYSTEM HEALTH CHECK"
test_endpoint "GET" "/test/system-status" "System Status Check"

echo "💰 2. PRINT-ON-DEMAND PRICING TESTS"
test_endpoint "POST" "/pricing/print-on-demand/examples/photo-book-pricing" "Photo Book Pricing Example"

echo "🎨 3. CUSTOMIZATION PRICING TESTS"
test_endpoint "POST" "/pricing/customizations/examples/extra-pages" "Extra Pages Pricing Example"

echo "📋 4. CANVAS MANAGEMENT TESTS"
test_endpoint "GET" "/canvas/examples/size-guide" "Canvas Size Guide"

echo "🎯 5. TEMPLATE SYSTEM TESTS"
test_endpoint "GET" "/templates/featured" "Featured Templates"

echo "🧪 6. COMPLETE SYSTEM INTEGRATION TEST"
test_endpoint "POST" "/test/run-complete-system-test" "Complete System Test"

echo "📊 7. DEMO SCENARIOS"
test_endpoint "GET" "/test/demo-scenarios" "Demo Scenarios for Boss"

echo ""
echo "🎉 TESTING COMPLETE!"
echo ""
echo "If all tests show ✅ SUCCESS, your system is ready for the boss demo!"
echo ""
echo "🎯 QUICK DEMO COMMANDS FOR YOUR BOSS:"
echo "1. curl -X GET $BASE_URL/test/system-status"
echo "2. curl -X POST $BASE_URL/pricing/print-on-demand/examples/photo-book-pricing"
echo "3. curl -X POST $BASE_URL/pricing/customizations/examples/extra-pages"
echo "4. curl -X POST $BASE_URL/test/run-complete-system-test"
echo ""
echo "💡 Each command shows a different aspect of your sophisticated system!"
