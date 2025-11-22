import xml.etree.ElementTree as ET
import json
import re

def parse_kml_to_custom_json(kml_file, output_file):
    # Register namespaces usually found in KML
    namespaces = {'kml': 'http://www.opengis.net/kml/2.2'}
    
    try:
        tree = ET.parse(kml_file)
        root = tree.getroot()
    except Exception as e:
        print(f"Error parsing KML: {e}")
        return

    # Configuration for types and colors based on KML Folder names
    type_styles = {
        "Academics": {"color": "#3b82f6", "prefix": "ACAD"}, # Blue
        "Residence Halls": {"color": "#f59e0b", "prefix": "RES"}, # Orange
        "Community Areas": {"color": "#10b981", "prefix": "COMM"}, # Emerald
        "Athletics": {"color": "#ef4444", "prefix": "ATHL"}, # Red
        "Greek Housing": {"color": "#8b5cf6", "prefix": "GRK"}, # Purple
        "Parking": {"color": "#6b7280", "prefix": "PRK"}, # Gray
        "default": {"color": "#6366f1", "prefix": "BLDG"} # Indigo
    }

    geojson_output = {
        "type": "FeatureCollection",
        "features": []
    }

    # Counter for IDs
    id_counters = {}

    # Find all Folders
    folders = root.findall('.//kml:Folder', namespaces)
    
    for folder in folders:
        folder_name = folder.find('kml:name', namespaces).text
        style_config = type_styles.get(folder_name, type_styles["default"])
        
        # Initialize ID counter for this type
        prefix = style_config["prefix"]
        if prefix not in id_counters:
            id_counters[prefix] = 1

        # Find Placemarks within this folder
        placemarks = folder.findall('.//kml:Placemark', namespaces)
        
        for placemark in placemarks:
            # 1. Extract Name
            name_tag = placemark.find('kml:name', namespaces)
            name = name_tag.text if name_tag is not None else "Unknown Building"

            # 2. Extract and Clean Description (Remove HTML tags)
            desc_tag = placemark.find('kml:description', namespaces)
            raw_desc = desc_tag.text if desc_tag is not None else ""
            # Regex to strip HTML tags (like <img> or <br>)
            clean_desc = re.sub('<[^<]+?>', ' ', raw_desc).strip()
            clean_desc = re.sub('\s+', ' ', clean_desc) # Remove extra whitespace

            # 3. Extract Polygon Coordinates
            polygon = placemark.find('.//kml:Polygon', namespaces)
            if polygon is not None:
                coords_text = polygon.find('.//kml:coordinates', namespaces).text
                
                # Convert KML string "lon,lat,z lon,lat,z" to [[lon, lat], [lon, lat]]
                coords_list = []
                for pair in coords_text.strip().split():
                    parts = pair.split(',')
                    if len(parts) >= 2:
                        # KML is Lon, Lat. GeoJSON is also Lon, Lat.
                        coords_list.append([float(parts[0]), float(parts[1])])

                # Create the Feature object
                feature = {
                    "type": "Feature",
                    "properties": {
                        "id": f"{prefix}-{id_counters[prefix]:03d}",
                        "name": name,
                        "type": folder_name,
                        "floors": 1, # Default value as KML doesn't have this
                        "occupancy": "Unknown", # Default value
                        "description": clean_desc,
                        "color": style_config["color"]
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [coords_list]
                    }
                }

                geojson_output["features"].append(feature)
                id_counters[prefix] += 1

    # Write to file
    with open(output_file, 'w') as f:
        json.dump(geojson_output, f, indent=2)
    
    print(f"Successfully converted {len(geojson_output['features'])} buildings to {output_file}")

# Usage
# Make sure 'doc.kml' is in the same folder as this script
parse_kml_to_custom_json('doc.kml', 'buildings.json')