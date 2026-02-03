function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export async function enablePushAndSaveSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push not supported in this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission not granted.");
  }

  const reg = await navigator.serviceWorker.register("/sw.js");

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  // Call Supabase Edge Function to store it
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/save-subscription`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important so Supabase auth cookies go along
      body: JSON.stringify(subscription),
    },
  );

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? "Failed to save subscription");

  return true;
}
