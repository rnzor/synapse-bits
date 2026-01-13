
import { Tutorial } from '../types';

export const INITIAL_TUTORIALS: Tutorial[] = [
    {
        id: 't-1',
        slug: 'securing-your-vps',
        title: 'Ironclad: Securing Your Linux VPS',
        description: 'The mandatory first steps for any new server. SSH keys, firewalls, and automated defense against brute force attacks.',
        coverGradient: 'bg-gradient-to-br from-slate-900 via-[#0f172a] to-emerald-900',
        duration: '15 min',
        level: 'Intermediate',
        tags: ['security', 'linux', 'devops'],
        author: 'Cipher_One',
        isPremium: true,
        timestamp: Date.now(),
        content: `
# 1. Update Your System

Before anything else, update the package repositories and upgrade existing packages. This ensures you have the latest security patches.

\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

# 2. Create a Non-Root User

Never operate as \`root\`. Create a new user with sudo privileges.

\`\`\`bash
adduser samurai
usermod -aG sudo samurai
\`\`\`

Now, switch to this user: \`su - samurai\`.

# 3. SSH Key Authentication

Password authentication is vulnerable to brute-force attacks. We will use SSH keys.

**On your local machine:**
\`\`\`bash
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-copy-id samurai@your_server_ip
\`\`\`

# 4. Hardening SSH

Now we disable root login and password authentication entirely.

Edit the config file:
\`\`\`bash
sudo nano /etc/ssh/sshd_config
\`\`\`

Change these settings:
\`\`\`text
PermitRootLogin no
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM no
\`\`\`

Restart SSH: \`sudo systemctl restart ssh\`.

# 5. Firewall Setup (UFW)

Uncomplicated Firewall (UFW) is the easiest way to manage iptables.

\`\`\`bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
\`\`\`

# 6. Install Fail2Ban

Fail2Ban scans log files and bans IPs that show malicious signs (like too many password failures).

\`\`\`bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
\`\`\`

Your server is now significantly harder to breach. Stay safe.
        `
    }
];
