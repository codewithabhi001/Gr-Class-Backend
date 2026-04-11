import re
import os

# Path to the Joi schemas
JOI_FILE = 'src/middlewares/validate.middleware.js'

def parse_joi_to_openapi():
    with open(JOI_FILE, 'r') as f:
        content = f.read()

    # Find the schemas object
    schemas_match = re.search(r'export const schemas = \{(.*?)\};', content, re.DOTALL)
    if not schemas_match:
        print("Could not find schemas object")
        return

    schemas_text = schemas_match.group(1)
    
    # Split by schema name
    # This regex is tricky because of nested objects. 
    # We'll look for identifiers followed by Joi.object
    schema_entries = re.findall(r'(\w+):\s*Joi\.object\(\{([\s\S]*?)\}\)(?:\.unknown\(true\))?,', schemas_text + ',')
    
    results = {}
    
    for name, body in schema_entries:
        properties = {}
        required = []
        
        # Simple parsing for properties
        lines = body.strip().split('\n')
        for line in lines:
            line = line.strip()
            if not line or ':' not in line:
                continue
            
            prop_name_match = re.search(r'^(\w+):', line)
            if not prop_name_match:
                continue
            
            prop_name = prop_name_match.group(1)
            
            # Simple type detection
            prop_type = 'string'
            if 'Joi.number()' in line:
                prop_type = 'number'
                if 'integer()' in line:
                    prop_type = 'integer'
            elif 'Joi.boolean()' in line:
                prop_type = 'boolean'
            elif 'Joi.date()' in line:
                prop_type = 'string'
                # format: date-time
            elif 'Joi.array()' in line:
                prop_type = 'array'
            elif 'Joi.object()' in line:
                prop_type = 'object'
            
            prop_def = {'type': prop_type}
            
            if 'required()' in line:
                required.append(prop_name)
            
            if 'email()' in line:
                prop_def['format'] = 'email'
            
            if 'guid()' in line or 'uuid()' in line:
                prop_def['format'] = 'uuid'
            
            if 'valid(' in line:
                enums_match = re.search(r'valid\((.*?)\)', line)
                if enums_match:
                    enums = [e.strip().strip("'").strip('"') for e in enums_match.group(1).split(',')]
                    prop_def['enum'] = enums
            
            properties[prop_name] = prop_def
            
        results[name] = {
            'type': 'object',
            'properties': properties
        }
        if required:
            results[name]['required'] = required

    # Print out as YAML-like format
    for name, schema in results.items():
        print(f"{name}:")
        print(f"  type: {schema['type']}")
        if 'required' in schema:
            print(f"  required:")
            for req in schema['required']:
                print(f"    - {req}")
        print(f"  properties:")
        for prop, details in schema['properties'].items():
            print(f"    {prop}:")
            for k, v in details.items():
                if isinstance(v, list):
                    print(f"      {k}: [{', '.join(v)}]")
                else:
                    print(f"      {k}: {v}")
        print("")

if __name__ == "__main__":
    parse_joi_to_openapi()
