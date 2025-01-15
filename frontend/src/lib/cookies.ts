export function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    const encodedValue = parts.pop()?.split(';').shift();
    return encodedValue ? decodeURIComponent(encodedValue) : undefined;
}

export function setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export function deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function parseSubscribedLinks(): number[] {
    const cookieValue = getCookie('subscribed_links');
    return cookieValue
        ? cookieValue.split(',').map(Number).filter((id) => Number.isInteger(id))
        : [];
}
