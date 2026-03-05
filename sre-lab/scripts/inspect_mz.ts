import fs from 'fs';

try {
  const content = fs.readFileSync('problem_sample.json', 'utf16le');
  const data = JSON.parse(content);
  
  if (data.problems && Array.isArray(data.problems)) {
    for (const p of data.problems) {
      // check management zones
      if (p.managementZones && p.managementZones.some((mz: any) => mz.name.includes('mz-aks'))) {
        console.log('FOUND IN MZ:', p.displayId, JSON.stringify(p.managementZones));
      }
      
      // check entity tags
      let foundInTags = false;
      const tags = p.evidenceDetails?.details?.[0]?.data?.entityTags || [];
      const tags2 = p.entityTags || [];
      const allTags = [...tags, ...tags2];
      
      allTags.forEach((t: any) => {
        if (t.key?.includes('cloud_application') || t.value?.includes('mz-aks') || t.context?.includes('cloud_application')) {
          console.log('FOUND IN TAGS:', p.displayId, t);
        }
      });
    }
  }
} catch (e) {
  console.error(e);
}
