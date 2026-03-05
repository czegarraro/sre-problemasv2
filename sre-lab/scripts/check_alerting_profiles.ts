import * as dotenv from 'dotenv';
dotenv.config();

async function getAlertingProfiles() {
  const url = `${process.env.DT_ENVIRONMENT_URL}/api/config/v1/alertingProfiles`;
  const token = process.env.DT_API_TOKEN;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Api-Token ${token}`
      }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: any = await response.json();
    const profiles = data.values;
    console.log(`Found ${profiles.length} alerting profiles. Fetching details...`);

    for (const profileRef of profiles) {
      const detailUrl = `${url}/${profileRef.id}`;
      const detailResponse = await fetch(detailUrl, {
        headers: { 'Authorization': `Api-Token ${token}` }
      });
      const detailData: any = await detailResponse.json();
      console.log(`\n--- Profile: ${detailData.displayName} ---`);
      
      const rules = detailData.rules || [];
      const infraRules = rules.filter((r: any) => r.severityLevel === 'INFRASTRUCTURE');
      
      if (infraRules.length > 0) {
         console.log(`Has ${infraRules.length} INFRASTRUCTURE rule(s).`);
         infraRules.forEach((rule: any, idx: number) => {
            console.log(`  Rule ${idx + 1}: delayInMinutes = ${rule.delayInMinutes}`);
         });
      } else {
         console.log('No INFRASTRUCTURE rules explicitly defined (uses default).');
      }
    }

  } catch (error) {
    console.error('Error fetching profiles:', String(error));
  }
}

getAlertingProfiles();
