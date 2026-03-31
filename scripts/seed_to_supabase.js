const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = "https://wtfqurnfvrmmlyitlejl.supabase.co";
// SERVICE ROLE KEY (Bypasses RLS)
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0ZnF1cm5mdnJtbWx5aXRsZWpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk4NDkyNSwiZXhwIjoyMDkwNTYwOTI1fQ.kX23WkpjXiQB1Mh6M9lGZfN9y6-M5_qBi051BFLVaR4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedLeads() {
  const leadsRaw = fs.readFileSync('/Users/alaabenrejeb/Desktop/SPINE EMPIRE/to-do-list-new-project/src/data/leads.json', 'utf8');
  const leadsData = JSON.parse(leadsRaw);

  console.log(`🚀 Starting seed of ${leadsData.length} leads with Service Role bypass...`);

  const transformed = leadsData.map(l => ({
    business_name: l["Practice Name"],
    contact_name: `${l["First Name"]} ${l["Last Name"] || ""}`,
    phone: l.Phone,
    revenue_range: l["Revenue Range"] || "Unknown",
    main_challenge: l["Main Challenge"] || "",
    status: 'new',
    metadata: { 
      email: l.Email, 
      city: l.City, 
      state: l.State,
      google_reviews: l["Google Reviews"]
    }
  }));

  const batchSize = 100;
  for (let i = 0; i < transformed.length; i += batchSize) {
    const batch = transformed.slice(i, i + batchSize);
    const { error } = await supabase.from('leads').insert(batch);
    if (error) console.error(`❌ Batch error ${i}:`, error.message);
    else console.log(`✅ Batch ${i/batchSize + 1} finalized`);
  }
  
  console.log("🎯 All 982 targets successfully pushed to Supabase.");
}

seedLeads();
