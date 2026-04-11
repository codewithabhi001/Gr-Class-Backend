import os
import re

modules_dir = 'src/modules'
api_list = {}

# Mapping from module directory/file basename to the route prefix defined in routes.js
module_to_prefix = {
    'auth': '/auth',
    'public': '/public',
    'contact': '/contact',
    'support': '/support',
    'search': '/search',
    'compliance': '/compliance',
    'clients': '/clients',
    'vessels': '/vessels',
    'jobs': '/jobs',
    'surveys': '/surveys',
    'certificates': '/certificates',
    'payments': '/payments',
    'surveyors': '/surveyors',
    'checklists': '/checklists',
    'checklist_template': '/checklist-templates',
    'non_conformities': '/non-conformities',
    'toca': '/toca',
    'flags': '/flags',
    'approvals': '/approvals',
    'notifications': '/notifications',
    'users': '/users',
    'documents': '/documents',
    'system': '/system',
    'reports': '/reports',
    'change_requests': '/change-requests',
    'templates': '/certificate-templates',
    'incidents': '/incidents',
    'activity_requests': '/activity-requests',
    'feedback': '/customer-feedback',
    'portfolioFeedback': '/portfolio-feedback',
    'dashboard': '/dashboard',
    'website': '/website',
    'nc': '/non-conformities'
}

base_api_url = '/api/v1'

route_pattern = re.compile(r"router\.(get|post|put|delete|patch)\(\s*['\"]([^'\"]+)['\"]")
roles_pattern = re.compile(r"authorizeRoles\(([^)]+)\)")

def parse_routes():
    for root, dirs, files in os.walk(modules_dir):
        for file in files:
            if file.endswith('.routes.js'):
                file_path = os.path.join(root, file)
                module_dir = os.path.basename(root)
                file_base = file.split('.')[0]
                
                # Determine prefix
                prefix = module_to_prefix.get(file_base) or module_to_prefix.get(module_dir, f"/{module_dir}")
                
                with open(file_path, 'r') as f:
                    content = f.read()
                    lines = content.split('\n')
                    for line_num, line in enumerate(lines, 1):
                        route_match = route_pattern.search(line)
                        if route_match:
                            method = route_match.group(1).upper()
                            path = route_match.group(2)
                            if path == '/':
                                path = ''
                            
                            full_url = f"{base_api_url}{prefix}{path}"
                            
                            roles_match = roles_pattern.search(line)
                            roles = []
                            if roles_match:
                                roles = [r.strip().strip("'").strip('"') for r in roles_match.group(1).split(',')]
                            else:
                                roles = ['Public']

                            for role in roles:
                                if role not in api_list:
                                    api_list[role] = []
                                api_list[role].append({
                                    'module': prefix.strip('/'),
                                    'method': method,
                                    'url': full_url
                                })

parse_routes()

# Directory for separate files
docs_dir = 'api_docs'
os.makedirs(docs_dir, exist_ok=True)

# Generate individual files
for role in api_list.keys():
    safe_role_name = role.replace('/', '_').replace('.', '_')
    filename = os.path.join(docs_dir, f"API_DOCS_{safe_role_name}.md")
    
    with open(filename, 'w') as md:
        md.write(f"# 🛰️ Girik Backend - API Endpoints for {role}\n\n")
        md.write(f"Base Path: `{base_api_url}`\n\n")
        
        # Group by module/prefix
        modules = {}
        for api in api_list[role]:
            if api['module'] not in modules:
                modules[api['module']] = []
            modules[api['module']].append(f"| `{api['method']}` | `{api['url']}` |")
        
        for module in sorted(modules.keys()):
            md.write(f"### 📦 Module: {module.capitalize()}\n")
            md.write("| Method | Full Endpoint URL |\n")
            md.write("| :--- | :--- |\n")
            for entry in sorted(modules[module]):
                md.write(f"{entry}\n")
            md.write("\n")

print(f"Separate Markdown files generated in: {docs_dir}/")
