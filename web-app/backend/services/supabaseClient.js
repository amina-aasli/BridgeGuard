const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

let client = null;

function isConfigured() {
  return (
    config.supabaseUrl &&
    config.supabaseServiceKey &&
    !config.supabaseUrl.includes('your-project')
  );
}

function getSupabase() {
  if (!isConfigured()) return null;
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseServiceKey);
  }
  return client;
}

module.exports = { getSupabase, isConfigured };
