export const SOCIAL_PRESETS = [
  {
    id: 'tiktok',
    name: 'TikTok',
    prefix: 'https://www.tiktok.com/@',
    displayPrefix: 'tiktok.com/@',
    placeholder: 'iamhalis (tên người dùng)',
    defaultType: 'social'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    prefix: 'https://facebook.com/',
    displayPrefix: 'facebook.com/',
    placeholder: 'iamhalis (username hoặc ID)',
    defaultType: 'social'
  },
  {
    id: 'discord',
    name: 'Discord',
    prefix: 'https://discord.gg/',
    displayPrefix: 'discord.gg/',
    placeholder: 'ma-moi-server (hoặc discord.com/users/ID)',
    defaultType: 'social'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    prefix: 'https://instagram.com/',
    displayPrefix: 'instagram.com/',
    placeholder: 'iamhalis (tên người dùng)',
    defaultType: 'social'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    prefix: 'https://youtube.com/@',
    displayPrefix: 'youtube.com/@',
    placeholder: 'iamhalis (handle hoặc tên kênh)',
    defaultType: 'social'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    prefix: 'https://t.me/',
    displayPrefix: 't.me/',
    placeholder: 'iamhalis (username)',
    defaultType: 'social'
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    prefix: 'https://x.com/',
    displayPrefix: 'x.com/',
    placeholder: 'iamhalis (username)',
    defaultType: 'social'
  },
  {
    id: 'github',
    name: 'GitHub',
    prefix: 'https://github.com/',
    displayPrefix: 'github.com/',
    placeholder: 'iamhalis (username)',
    defaultType: 'social'
  },
  {
    id: 'roblox',
    name: 'Roblox',
    prefix: 'https://www.roblox.com/users/',
    displayPrefix: 'roblox.com/users/',
    placeholder: 'User ID (VD: 34567890)',
    defaultType: 'link'
  },
  {
    id: 'threads',
    name: 'Threads',
    prefix: 'https://threads.net/@',
    displayPrefix: 'threads.net/@',
    placeholder: 'iamhalis (username)',
    defaultType: 'social'
  }
];

export function detectPlatform(iconName, url = '') {
  if (iconName && iconName !== 'custom') return iconName.toLowerCase();
  const lowerUrl = (url || '').toLowerCase();
  if (lowerUrl.includes('tiktok.com')) return 'tiktok';
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) return 'facebook';
  if (lowerUrl.includes('discord.gg') || lowerUrl.includes('discord.com')) return 'discord';
  if (lowerUrl.includes('instagram.com')) return 'instagram';
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram.me')) return 'telegram';
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'x';
  if (lowerUrl.includes('github.com')) return 'github';
  if (lowerUrl.includes('roblox.com')) return 'roblox';
  if (lowerUrl.includes('threads.net')) return 'threads';
  return 'link';
}

export function getIconSvg(iconName, url = '', className = 'w-5 h-5') {
  const platform = detectPlatform(iconName, url);
  
  switch (platform) {
    case 'tiktok':
      return `<svg class="${className} fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.76 1.42-.05 2.67-.99 3.09-2.34.19-.58.26-1.2.25-1.82V.02h-.02z"/></svg>`;

    case 'facebook':
      return `<svg class="${className} fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;

    case 'discord':
      return `<svg class="${className} fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;

    case 'instagram':
      return `<svg class="${className} fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;

    case 'youtube':
      return `<svg class="${className} fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;

    case 'telegram':
      return `<svg class="${className} fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.945z"/></svg>`;

    case 'x':
      return `<svg class="${className} fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

    case 'github':
      return `<svg class="${className} fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`;

    case 'roblox':
      return `<svg class="${className} fill-current" viewBox="0 0 24 24"><path d="M5.33 0 0 18.67l18.67 5.33L24 5.33 5.33 0zm9.44 14.88-4.67-1.33 1.33-4.67 4.67 1.33-1.33 4.67z"/></svg>`;

    case 'threads':
      return `<svg class="${className} fill-current" viewBox="0 0 24 24"><path d="M12.001 0C5.384 0 0 5.384 0 12.001s5.384 12.001 12.001 12.001c4.544 0 8.528-2.529 10.518-6.273l-2.909-1.455c-1.42 2.673-4.264 4.478-7.609 4.478-4.823 0-8.751-3.928-8.751-8.751s3.928-8.751 8.751-8.751c4.78 0 8.685 3.864 8.749 8.643h-2.188c-.062-3.567-2.981-6.455-6.561-6.455-3.627 0-6.563 2.936-6.563 6.563s2.936 6.563 6.563 6.563c2.477 0 4.639-1.374 5.76-3.414l.024-.047-5.784.001v-2.188h7.973c.007.25.011.501.011.754 0 6.075-4.926 11.001-11.001 11.001z"/></svg>`;

    default:
      return `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>`;
  }
}
