#!/bin/bash

# Get token dari login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adi@karbone-k.id","password":"adi123"}')

echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Login failed!"
  exit 1
fi

# Test registration
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/events/14/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"category":"single","level":"open"}')

echo "Register response: $REGISTER_RESPONSE"
