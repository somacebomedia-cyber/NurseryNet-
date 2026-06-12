import { importSchoolsAction } from '../src/app/admin/import/actions';

async function main() {
  console.log('Starting import to Firestore...');
  const result = await importSchoolsAction();
  if (result.success) {
    console.log(`✅ Success: ${result.message}`);
  } else {
    console.error(`❌ Failed: ${result.message}`);
  }
}

main();
