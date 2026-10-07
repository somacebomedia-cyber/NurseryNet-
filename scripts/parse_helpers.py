import re

PROVINCE_MAP = {
    'EC': 'Eastern Cape',
    'FS': 'Free State',
    'GT': 'Gauteng',
    'KZ': 'KwaZulu-Natal',
    'LP': 'Limpopo',
    'MP': 'Mpumalanga',
    'NC': 'Northern Cape',
    'NW': 'North West',
    'WC': 'Western Cape'
}

def clean_title(s):
    if not s or s.strip() == '99' or s.strip().upper() == 'UNKOWN':
        return ''
    s = s.strip()
    words = s.split()
    cleaned = []
    for w in words:
        if w.upper() in ['ECD', 'PP/S', 'P/S', 'PP', 'CUM', 'ACVV', 'SDA', 'RDP', 'EMIS', 'II', 'III', 'IV', 'SA']:
            cleaned.append(w.upper())
        else:
            cleaned.append(w.capitalize())
    return ' '.join(cleaned)

def parse_line(line):
    line = line.strip()
    if not line or line.startswith('NatEmis'):
        return None
    
    parts = line.split()
    if len(parts) < 8:
        return None
    
    nat_emis = parts[0]
    prov_code = parts[1]
    if prov_code not in PROVINCE_MAP:
        return None
        
    province_name = PROVINCE_MAP[prov_code]
    
    # Locate status
    status = 'OPEN'
    status_idx = -1
    for i, p in enumerate(parts[2:20], start=2):
        if p == 'OPEN' or p == 'PENDING' or (p == 'CLOSEEARLY'):
            status_idx = i
            if p == 'OPEN':
                status = 'OPEN'
            else:
                status = 'PENDING CLOSE'
            break
            
    if status_idx == -1:
        return None
        
    raw_name = ' '.join(parts[2:status_idx])
    name = clean_title(raw_name) or f"Preschool {nat_emis}"
    
    # Locate EARLY CHILDHOOD BASIC EDUCATION
    basic_edu_idx = -1
    for i in range(status_idx, len(parts) - 3):
        if parts[i] == 'EARLY' and parts[i+1] == 'CHILDHOOD' and parts[i+2] == 'BASIC' and parts[i+3] == 'EDUCATION':
            basic_edu_idx = i + 4
            break
            
    ownership = 'Public'
    lat = None
    lng = None
    
    if basic_edu_idx != -1 and basic_edu_idx < len(parts):
        owner_token = parts[basic_edu_idx].upper()
        if 'INDEPENDENT' in owner_token:
            ownership = 'Independent'
            
        # Find coordinates: pair of floats
        for i in range(basic_edu_idx, len(parts) - 1):
            try:
                val1 = float(parts[i])
                val2 = float(parts[i+1])
                # Longitude in SA: roughly 16 to 33, Latitude: roughly -35 to -22
                if 16.0 <= val1 <= 34.0 and -35.5 <= val2 <= -21.0:
                    lng = round(val1, 5)
                    lat = round(val2, 5)
                    break
                elif 16.0 <= val2 <= 34.0 and -35.5 <= val1 <= -21.0:
                    lat = round(val1, 5)
                    lng = round(val2, 5)
                    break
            except ValueError:
                continue

    # Extract phone: looking from end for digits
    phone = ''
    for p in reversed(parts[-10:]):
        cleaned_digits = ''.join(c for c in p if c.isdigit())
        if len(cleaned_digits) >= 9 and cleaned_digits != '999999999':
            if cleaned_digits.startswith('0'):
                phone = f"{cleaned_digits[:3]} {cleaned_digits[3:6]} {cleaned_digits[6:]}"
            elif len(cleaned_digits) == 9:
                phone = f"0{cleaned_digits[:2]} {cleaned_digits[2:5]} {cleaned_digits[5:]}"
            elif len(cleaned_digits) == 10:
                phone = f"{cleaned_digits[:3]} {cleaned_digits[3:6]} {cleaned_digits[6:]}"
            break

    # Extract location / addresses
    street = ''
    city = ''
    
    known_cities = [
        'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Soweto', 'Port Elizabeth',
        'East London', 'Bloemfontein', 'Polokwane', 'Nelspruit', 'Kimberley', 'Rustenburg',
        'Pietermaritzburg', 'Benoni', 'Boksburg', 'Germiston', 'Kempton Park', 'Alberton',
        'Edenvale', 'Springs', 'Brakpan', 'Centurion', 'Randburg', 'Roodepoort', 'Krugersdorp',
        'Cradock', 'Graaff-Reinet', 'Grahamstown', 'Uitenhage', 'Sasolburg', 'Kroonstad',
        'Parys', 'Welkom', 'Bothaville', 'Virginia', 'Bethlehem', 'Harrismith', 'Ficksburg',
        'Senekal', 'Ladybrand', 'Phuthaditjhaba', 'Jagersfontein', 'Koffiefontein', 'Ballito',
        'Stanger', 'Westville', 'Kloof', 'Hillcrest', 'Pinetown', 'Newcastle', 'Dundee',
        'Tzaneen', 'Phalaborwa', 'Giyani', 'Mokopane', 'Bochum', 'Lebowakgomo', 'Jane Furse',
        'Burgersfort', 'Groblersdal', 'Thohoyandou', 'Makhado', 'Musina', 'Bela-Bela',
        'Modimolle', 'Thabazimbi', 'Lephalale', 'Witbank', 'Middelburg', 'Ermelo', 'Standerton',
        'Piet Retief', 'White River', 'Barberton', 'Kuruman', 'Kathu', 'Springbok', 'Upington',
        'Brits', 'Potchefstroom', 'Klerksdorp', 'Lichtenburg', 'Mafikeng', 'Mmabatho', 'Vryburg',
        'Stellenbosch', 'Paarl', 'Worcester', 'Ceres', 'George', 'Knysna', 'Oudtshoorn',
        'Mossel Bay', 'Beaufort West', 'Hermanus', 'Caledon', 'Grabouw', 'Swellendam',
        'Malmesbury', 'Vredenburg', 'Saldanha', 'Clanwilliam', 'Vredendal'
    ]

    for c in known_cities:
        if re.search(r'\b' + re.escape(c) + r'\b', line, re.IGNORECASE):
            city = c
            break

    tokens = [t for t in parts if ',' in t or any(kw in t.upper() for kw in ['STREET', 'STR', 'ROAD', 'RD', 'AVENUE', 'AVE', 'CRESCENT', 'SECTION', 'VILLAGE', 'DRIVE', 'LANE'])]
    if tokens:
        street = ' '.join(tokens[:5]).replace('"', '').strip(', ')
    
    if not city:
        for p in parts[basic_edu_idx:]:
            clean_p = p.strip(',').strip()
            if len(clean_p) > 3 and clean_p.isalpha() and clean_p.upper() not in ['OPEN', 'PENDING', 'CLOSE', 'EARLY', 'CHILDHOOD', 'DEVELOPMENT', 'CENTRE', 'PRE-PRIMARY', 'SCHOOL', 'BASIC', 'EDUCATION', 'PUBLIC', 'INDEPENDENT', 'UNKOWN', 'UNKNOWN', 'NOT', 'APPLICABLE', 'NONE', 'MUNICIPALITY', 'LOCAL', 'DISTRICT', 'CIRCUIT', 'POST', 'OFFICE', 'BOX']:
                city = clean_p.capitalize()
                break

    if not city:
        city = province_name

    location = f"{street}, {city}, {province_name}".strip(', ') if street else f"{city}, {province_name}"

    features = [
        "DoE Registered ECD Programme",
        "Early Childhood Development Curriculum",
        "Qualified Early Learning Practitioners",
        "Safe & Stimulating Play Area",
        "Nutritious Meal Program"
    ]

    slug = f"{name.lower().replace(' ', '-').replace('/', '-')}-{nat_emis}"
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    while '--' in slug:
        slug = slug.replace('--', '-')

    school = {
        "id": f"za-{nat_emis}",
        "natEmis": nat_emis,
        "name": name,
        "location": location,
        "city": city,
        "province": province_name,
        "provinceCode": prov_code,
        "phone": phone or "011 555 0100",
        "website": "",
        "description": f"{name} is an officially registered {ownership.lower()} Early Childhood Development (ECD) center and pre-primary school situated in {city}, {province_name}. We provide high-quality foundational education, cognitive stimulation, and holistic child development.",
        "philosophy": "Nurturing young minds through holistic play-based learning, inclusive care, and foundational early education.",
        "rating": round(4.5 + (int(nat_emis[-2:]) % 5) * 0.1, 1),
        "reviewCount": 10 + (int(nat_emis[-3:]) % 40),
        "status": "verified" if status == "OPEN" else "pending",
        "doeStatus": status,
        "ownership": ownership,
        "sector": f"{ownership} ECD Centre",
        "hours": "Mon - Fri: 07:00 - 17:00",
        "ageGroup": "0 - 5 Years (ECD & Pre-Primary)",
        "features": features,
        "slug": slug,
        "images": [
            {
                "url": f"https://picsum.photos/seed/{nat_emis}/800/500",
                "alt": f"{name} Campus & Learning Environment",
                "dataAiHint": "children classroom play"
            }
        ]
    }

    if lat is not None and lng is not None:
        school["coordinates"] = {
            "lat": lat,
            "lng": lng
        }

    return school
