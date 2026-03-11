// Text converter utilities for Base64, URL, JWT, Hex
// Usage: import and call the relevant function

export function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

export function base64Decode(str) {
    return decodeURIComponent(escape(atob(str)));
}

export function urlEncode(str) {
    return encodeURIComponent(str);
}

export function urlDecode(str) {
    return decodeURIComponent(str);
}

export function hexEncode(str) {
    return Array.from(str, c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}

export function hexDecode(hex) {
    return hex.match(/.{1,2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
}

// JWT decode (header, payload, signature)
export function jwtDecode(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
        const header = JSON.parse(base64Decode(parts[0]));
        const payload = JSON.parse(base64Decode(parts[1]));
        const signature = parts[2];
        return { header, payload, signature };
    } catch (e) {
        return null;
    }
}
