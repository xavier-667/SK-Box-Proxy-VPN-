export interface ParsedProfile {
  protocol: string;
  name: string;
  address: string;
  port: string;
  raw: string;
}

export function parseProxyUrl(url: string): ParsedProfile | null {
  if (!url) return null;
  
  try {
    const trimmedUrl = url.trim();

    // vmess standard base64 format: vmess://base64(...)
    if (trimmedUrl.startsWith('vmess://')) {
      const b64 = trimmedUrl.replace('vmess://', '');
      try {
        const jsonString = atob(b64);
        const json = JSON.parse(jsonString);
        return {
          protocol: 'vmess',
          name: json.ps || 'VMess Server',
          address: json.add || 'unknown',
          port: json.port || 'unknown',
          raw: trimmedUrl
        };
      } catch (e) {
        return null; // Invalid base64 or JSON
      }
    }

    if (!trimmedUrl.includes('://')) {
      const match = trimmedUrl.match(/^([\w.-]+):(\d+)@([^:]+):(.+)$/);
      if (match) {
        return {
          protocol: 'custom',
          name: `${match[3]}@${match[1]}`,
          address: match[1],
          port: match[2],
          raw: trimmedUrl
        };
      }
    }

    // Standard URI parsable formats: vless, trojan, ss, etc.
    // e.g., vless://uuid@host:port?params#name
    const parsed = new URL(trimmedUrl);
    const protocol = parsed.protocol.replace(':', '');
    const name = decodeURIComponent(parsed.hash.replace('#', ''));

    // Shadowsocks legacy might be base64 encoded user info
    let address = parsed.hostname;
    let port = parsed.port;

    if (protocol === 'ss' && !address) {
       // Deeply encoded ss links can be more complex, basic fallback used here 
       address = "ss-server";
    }

    return {
      protocol,
      name: name || `${protocol.toUpperCase()} Server`,
      address: address || 'unknown',
      port: port || 'unknown',
      raw: trimmedUrl
    };
  } catch (error) {
    return null;
  }
}
