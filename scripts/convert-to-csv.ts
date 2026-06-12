import fs from 'fs';
import path from 'path';

const inputFile = path.join(process.cwd(), 'src/lib/data/preschools.json');
const outputFile = path.join(process.cwd(), 'public/preschools.csv');

try {
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  
  if (data.length === 0) {
    console.log('No data to convert.');
    process.exit(0);
  }

  // Extract headers
  const headers = ['InstitutionName', 'City', 'StreetAddress', 'Telephone', 'Email', 'Source', 'DoE_Status'];
  
  let csvContent = headers.join(',') + '\n';

  data.forEach((school: any) => {
    const row = [
      `"${(school.name || '').replace(/"/g, '""')}"`,
      `"${(school.city || '').replace(/"/g, '""')}"`,
      `"${(school.location || '').replace(/"/g, '""')}"`,
      `"${(school.phone || '').replace(/"/g, '""')}"`,
      `"${(school.email || '').replace(/"/g, '""')}"`,
      `"Google Places API"`,
      `"OPEN"`
    ];
    csvContent += row.join(',') + '\n';
  });

  fs.writeFileSync(outputFile, csvContent);
  console.log(`✅ Successfully converted ${data.length} records to CSV at ${outputFile}`);
} catch (error) {
  console.error('Error converting JSON to CSV:', error);
}
