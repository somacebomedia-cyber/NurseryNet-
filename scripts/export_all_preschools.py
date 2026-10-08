import os
import sys
import glob
import json
import csv
from collections import Counter

# Ensure scripts directory is on PYTHONPATH
sys.path.insert(0, os.path.dirname(__file__))
from parse_helpers import parse_line

def main():
    print("🚀 Starting compilation and extraction of all preschool records...")
    
    raw_lines = []
    
    # 1. Load batch1.py
    batch1_path = os.path.join(os.path.dirname(__file__), 'batch1.py')
    if os.path.exists(batch1_path):
        with open(batch1_path, 'r', encoding='utf-8') as f:
            lines = [l.strip() for l in f if l.strip().startswith(('1', '2', '3', '4', '5', '6', '7', '8', '9'))]
            print(f"Loaded {len(lines)} lines from batch1.py")
            raw_lines.extend(lines)
            
    # 2. Load batch2.py
    batch2_path = os.path.join(os.path.dirname(__file__), 'batch2.py')
    if os.path.exists(batch2_path):
        with open(batch2_path, 'r', encoding='utf-8') as f:
            lines = [l.strip() for l in f if l.strip().startswith(('1', '2', '3', '4', '5', '6', '7', '8', '9'))]
            print(f"Loaded {len(lines)} lines from batch2.py")
            raw_lines.extend(lines)
            
    # 3. Load all raw_batches/*.txt
    batch_files = sorted(glob.glob(os.path.join(os.path.dirname(__file__), 'raw_batches', '*.txt')))
    for bfile in batch_files:
        with open(bfile, 'r', encoding='utf-8') as f:
            lines = [l.strip() for l in f if l.strip().startswith(('1', '2', '3', '4', '5', '6', '7', '8', '9'))]
            print(f"Loaded {len(lines)} lines from {os.path.basename(bfile)}")
            raw_lines.extend(lines)

    print(f"\nTotal raw lines collected: {len(raw_lines)}")

    parsed_schools = []
    seen_ids = set()
    seen_nat_emis = set()
    skipped_count = 0

    for line in raw_lines:
        school = parse_line(line)
        if not school:
            skipped_count += 1
            continue
            
        # Deduplication
        if school['id'] in seen_ids or school['natEmis'] in seen_nat_emis:
            continue
            
        seen_ids.add(school['id'])
        seen_nat_emis.add(school['natEmis'])
        parsed_schools.append(school)

    print(f"✅ Successfully parsed and deduplicated {len(parsed_schools)} preschools (skipped {skipped_count} invalid lines)")

    # Province and city breakdown
    prov_counts = Counter(s['province'] for s in parsed_schools)
    city_counts = Counter(s['city'] for s in parsed_schools)
    
    print("\n--- Breakdown by Province ---")
    for prov, count in prov_counts.most_common():
        print(f"  {prov}: {count}")

    print("\n--- Top 15 Cities / Municipalities ---")
    for city, count in city_counts.most_common(15):
        print(f"  {city}: {count}")

    # Output paths
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    json_path = os.path.join(base_dir, 'src', 'lib', 'data', 'preschools.json')
    csv_path = os.path.join(base_dir, 'public', 'preschools.csv')

    # Save JSON
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(parsed_schools, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Saved {len(parsed_schools)} records to JSON: {json_path}")

    # Save CSV
    fieldnames = [
        'InstitutionName',
        'City',
        'StreetAddress',
        'Telephone',
        'Email',
        'Source',
        'DoE_Status',
        'Province',
        'NatEmis',
        'Ownership',
        'Sector',
        'Latitude',
        'Longitude'
    ]
    
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for s in parsed_schools:
            coords = s.get('coordinates', {})
            writer.writerow({
                'InstitutionName': s['name'],
                'City': s['city'],
                'StreetAddress': s['location'],
                'Telephone': s.get('phone', ''),
                'Email': s.get('email', ''),
                'Source': 'Department of Basic Education EMIS',
                'DoE_Status': s.get('doeStatus', 'OPEN'),
                'Province': s.get('province', ''),
                'NatEmis': s.get('natEmis', ''),
                'Ownership': s.get('ownership', 'Independent'),
                'Sector': s.get('sector', ''),
                'Latitude': coords.get('lat', ''),
                'Longitude': coords.get('lng', '')
            })
    print(f"💾 Saved {len(parsed_schools)} records to CSV: {csv_path}")
    print("\n🎉 Extraction and export complete!")

if __name__ == '__main__':
    main()
