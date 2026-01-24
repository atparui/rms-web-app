#!/usr/bin/env node

/**
 * Test script to fetch and decode Keycloak token
 * This helps debug role assignment issues
 */

const axios = require('axios');

// Configuration from environment variables
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'https://rmsauth.atparui.com';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'gateway';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'gateway-web';
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || '';

async function testToken() {
  if (!KEYCLOAK_CLIENT_SECRET) {
    console.error('❌ KEYCLOAK_CLIENT_SECRET is not set');
    process.exit(1);
  }

  try {
    console.log('🔐 Fetching token from Keycloak...');
    console.log(`   URL: ${KEYCLOAK_URL}`);
    console.log(`   Realm: ${KEYCLOAK_REALM}`);
    console.log(`   Client ID: ${KEYCLOAK_CLIENT_ID}`);
    console.log('');

    const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
    
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = response.data;
    
    // Decode token (JWT is base64 encoded, we can decode the payload)
    const parts = access_token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    
    // Decode payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    
    console.log('✅ Token received successfully!');
    console.log('');
    console.log('📋 Token Claims:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');
    
    // Check for roles
    console.log('🔍 Role Analysis:');
    
    let roleFound = false;
    
    // Check direct roles claim first (common for service accounts)
    if (payload.roles && Array.isArray(payload.roles)) {
      console.log(`   ✅ Direct roles claim found: ${payload.roles.join(', ')}`);
      if (payload.roles.includes('ROLE_ADMIN')) {
        console.log('   ✅ ROLE_ADMIN is present in direct roles claim');
        roleFound = true;
      } else {
        console.log('   ❌ ROLE_ADMIN is NOT in direct roles claim');
      }
    }
    
    // Check realm_access.roles
    if (payload.realm_access && payload.realm_access.roles) {
      console.log(`   ✅ Realm roles found: ${payload.realm_access.roles.join(', ')}`);
      if (payload.realm_access.roles.includes('ROLE_ADMIN')) {
        console.log('   ✅ ROLE_ADMIN is present in realm_access.roles');
        roleFound = true;
      } else {
        console.log('   ❌ ROLE_ADMIN is NOT in realm_access.roles');
      }
    } else {
      console.log('   ℹ️  No realm_access.roles found');
    }
    
    // Check resource_access
    if (payload.resource_access) {
      console.log('   📦 Resource access:');
      Object.keys(payload.resource_access).forEach(clientId => {
        const roles = payload.resource_access[clientId].roles || [];
        console.log(`      - ${clientId}: ${roles.join(', ') || 'no roles'}`);
        if (roles.includes('ROLE_ADMIN')) {
          console.log(`        ✅ ROLE_ADMIN found in ${clientId}`);
          roleFound = true;
        }
      });
    } else {
      console.log('   ℹ️  No resource_access found');
    }
    
    // Check for other role claims
    if (payload.authorities) {
      console.log(`   📋 Authorities claim: ${payload.authorities.join(', ')}`);
      if (payload.authorities.includes('ROLE_ADMIN')) {
        roleFound = true;
      }
    }
    
    // Summary
    console.log('');
    if (roleFound) {
      console.log('   ✅ ROLE_ADMIN is present in the token!');
    } else {
      console.log('   ❌ ROLE_ADMIN is NOT found in any role claim location');
      console.log('   💡 Ensure ROLE_ADMIN is assigned to the service account in Keycloak');
    }
    
    console.log('');
    console.log('🔗 Full token:');
    console.log(access_token);
    console.log('');
    console.log('💡 To decode the full token, visit: https://jwt.io');
    console.log('   Paste the token above to see all claims');
    
    // Test gateway access
    const GATEWAY_URL = process.env.GATEWAY_URL || 'https://rmsgateway.atparui.com';
    const API_DOCS_ENDPOINT = process.env.API_DOCS_ENDPOINT || '/services/rms-service/v3/api-docs';
    
    console.log('');
    console.log('🧪 Testing gateway access...');
    try {
      const gatewayResponse = await axios.get(`${GATEWAY_URL}${API_DOCS_ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        timeout: 10000,
      });
      console.log('✅ Gateway access successful!');
      console.log(`   Response status: ${gatewayResponse.status}`);
    } catch (gatewayError) {
      console.log('❌ Gateway access failed:');
      if (gatewayError.response) {
        console.log(`   Status: ${gatewayError.response.status}`);
        console.log(`   Error: ${gatewayError.response.statusText}`);
        if (gatewayError.response.data) {
          console.log(`   Details: ${JSON.stringify(gatewayError.response.data).substring(0, 200)}`);
        }
      } else {
        console.log(`   Error: ${gatewayError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fetching token:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   Message: ${error.message}`);
    }
    process.exit(1);
  }
}

testToken();

