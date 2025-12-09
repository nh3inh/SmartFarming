'use client';

export async function fetchAllFields() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/`);
        if (!res.ok) throw new Error(`Lỗi tải tất cả ruộng: ${res.statusText}`);
        return await res.json();
    } catch (err) {
        console.error('fetchAllFields error:', err);
        return [];
    }
}

export async function fetchAllUserFieldsInfo() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/info/public/`);
        if (!res.ok) throw new Error(`Lỗi tải ruộng tất cả nông dân: ${res.statusText}`);
        return await res.json();
    } catch (err) {
        console.error('fetchAllUserFieldsInfo error:', err);
        return [];
    }
}

export async function fetchMyFields() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}cornfields/info/my-field/`, {
            credentials: "include",
        });
        if (!res.ok) throw new Error(`Lỗi tải ruộng người dùng: ${res.statusText}`);
        return await res.json();
    } catch (err) {
        console.error('fetchMyFields error:', err);
        return [];
    }
}
