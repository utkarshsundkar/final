import os
import subprocess

target_sha1 = "96:4D:54:DC:D7:79:29:FA:20:41:25:7D:F8:98:70:60:8E:B9:46:98"
search_dir = os.path.expanduser("~/Desktop")

for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith((".keystore", ".jks")):
            path = os.path.join(root, file)
            try:
                # Try common passwords
                for password in ["android", "password", "123456"]:
                    cmd = f'keytool -list -v -keystore "{path}" -storepass {password}'
                    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                    if target_sha1.lower() in result.stdout.lower():
                        print(f"MATCH FOUND: {path}")
                        print(f"Password: {password}")
                        # Extract alias
                        for line in result.stdout.split('\n'):
                            if "Alias name:" in line:
                                print(f"Alias: {line.split(':')[1].strip()}")
                        exit(0)
            except Exception as e:
                pass
