import re

with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

# Find the start and end of SiteBuilder
start_pattern = r'const SiteBuilder = \(\{ showToast \}: \{ showToast: \(msg: string, type: ToastType\) => void \}\) => \{'
end_pattern = r'const OnSaleManager = '

match = re.search(start_pattern, content)
if not match:
    print("Could not find SiteBuilder start")
    exit(1)
start_idx = match.start()

match_end = re.search(end_pattern, content)
if not match_end:
    print("Could not find OnSaleManager start")
    exit(1)
end_idx = match_end.start()

# Read the new SiteBuilder code from a separate file
with open('new_sitebuilder.tsx', 'r') as f:
    new_sitebuilder = f.read()

new_content = content[:start_idx] + new_sitebuilder + '\n\n' + content[end_idx:]

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(new_content)

print("SiteBuilder replaced successfully.")
