
import os
import subprocess

target_sha = "04:57:A8:BB:57:69:96:BF:89:E8:EC:80:8C:06:B6:D8:60:11:FF:34".replace(":", "").lower()
passwords = ["android", "password", "Arthlete2025@", "123456"]

print("Scanning for keystore matching SHA:", target_sha)

for root, dirs, files in os.walk("/Users/utkarshsundkar/Desktop/ios/final/Ai"):
    if "node_modules" in root or ".git" in root or "build" in root:
        continue
    
    for file in files:
        path = os.path.join(root, file)
        # Skip obviously text/small files to save time
        if os.path.getsize(path) < 1000:
            continue
            
        for password in passwords:
            try:
                # Run keytool list
                cmd = ['keytool', '-list', '-v', '-keystore', path, '-storepass', password]
                # Suppress stderr to avoid 'not a keystore' spam
                result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
                
                output = result.stdout.lower()
                clean_output = output.replace(":", "")
                
                if target_sha in clean_output:
                    print(f"\n✅ FOUND MATCHING KEY!")
                    print(f"File: {path}")
                    print(f"Password: {password}")
                    print("-" * 20)
                    print(result.stdout)
                    exit(0)
            except Exception:
                pass

print("Scan complete. No matching key found.")
