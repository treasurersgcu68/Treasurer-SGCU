/* Web notification + Web Push helper */
(function initSgcuWebPush() {
  if (window.sgcuWebPush) return;

  const DEFAULT_ICON = "img/icons/icon-192.png";
  const DEFAULT_BADGE = "img/icons/icon-192.png";
  const config = {
    applicationServerKey: "",
    subscribeEndpoint: "",
    unsubscribeEndpoint: ""
  };
  const bootstrapConfig = window.sgcuPushConfig || {};
  if (typeof bootstrapConfig.applicationServerKey === "string") {
    config.applicationServerKey = bootstrapConfig.applicationServerKey.trim();
  }
  if (typeof bootstrapConfig.subscribeEndpoint === "string") {
    config.subscribeEndpoint = bootstrapConfig.subscribeEndpoint.trim();
  }
  if (typeof bootstrapConfig.unsubscribeEndpoint === "string") {
    config.unsubscribeEndpoint = bootstrapConfig.unsubscribeEndpoint.trim();
  }

  const toUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const normalized = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(normalized);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const isIOS = () => /iPad|iPhone|iPod/.test(window.navigator.userAgent || "");

  const isStandalone = () => {
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
    return window.navigator.standalone === true;
  };

  const isNotificationSupported = () =>
    typeof window !== "undefined" &&
    typeof window.Notification !== "undefined";

  const isPushSupported = () =>
    typeof window !== "undefined" &&
    "serviceWorker" in window.navigator &&
    "PushManager" in window &&
    isNotificationSupported();

  const emitStateChanged = () => {
    window.dispatchEvent(new CustomEvent("sgcu:webpush-state-changed"));
  };

  const getPermission = () => (isNotificationSupported() ? Notification.permission : "unsupported");

  const ensureServiceWorkerRegistration = async () => {
    if (!("serviceWorker" in window.navigator)) return null;
    try {
      const existing = await window.navigator.serviceWorker.getRegistration("./");
      if (existing) return existing;
      return await window.navigator.serviceWorker.register("./sw.js");
    } catch (_) {
      return null;
    }
  };

  const getSubscription = async () => {
    if (!isPushSupported()) return null;
    const registration = await ensureServiceWorkerRegistration();
    if (!registration?.pushManager) return null;
    try {
      return await registration.pushManager.getSubscription();
    } catch (_) {
      return null;
    }
  };

  const postSubscriptionToBackend = async (mode, payload) => {
    const endpoint =
      mode === "subscribe"
        ? config.subscribeEndpoint
        : config.unsubscribeEndpoint;
    if (!endpoint) return;
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  };

  const requestPermission = async () => {
    if (!isNotificationSupported()) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    try {
      const result = await Notification.requestPermission();
      emitStateChanged();
      return result;
    } catch (_) {
      return Notification.permission;
    }
  };

  const showNotification = async (title, body, options = {}) => {
    if (!isNotificationSupported()) return false;
    if (Notification.permission !== "granted") return false;
    const mergedOptions = {
      body: body || "",
      icon: options.icon || DEFAULT_ICON,
      badge: options.badge || DEFAULT_BADGE,
      data: options.data || {}
    };

    const registration = await ensureServiceWorkerRegistration();
    if (registration && typeof registration.showNotification === "function") {
      await registration.showNotification(title, mergedOptions);
      return true;
    }

    // eslint-disable-next-line no-new
    new Notification(title, mergedOptions);
    return true;
  };

  const subscribePush = async (meta = {}) => {
    if (!isPushSupported()) throw new Error("push-not-supported");
    if (Notification.permission !== "granted") {
      const permission = await requestPermission();
      if (permission !== "granted") throw new Error("notification-permission-not-granted");
    }
    const vapidPublicKey = (config.applicationServerKey || "").toString().trim();
    if (!vapidPublicKey) {
      throw new Error("missing-vapid-public-key");
    }

    const registration = await ensureServiceWorkerRegistration();
    if (!registration?.pushManager) throw new Error("push-manager-unavailable");

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toUint8Array(vapidPublicKey)
      });
    }
    await postSubscriptionToBackend("subscribe", {
      subscription: subscription.toJSON(),
      meta
    });
    emitStateChanged();
    return subscription;
  };

  const unsubscribePush = async (meta = {}) => {
    if (!isPushSupported()) return false;
    const subscription = await getSubscription();
    if (!subscription) return false;

    await postSubscriptionToBackend("unsubscribe", {
      endpoint: subscription.endpoint,
      meta
    });
    const unsubscribed = await subscription.unsubscribe();
    emitStateChanged();
    return unsubscribed;
  };

  const getClientState = async () => {
    const permission = getPermission();
    const pushSupported = isPushSupported();
    const subscription = pushSupported ? await getSubscription() : null;
    return {
      supported: isNotificationSupported(),
      pushSupported,
      permission,
      subscribed: !!subscription,
      standalone: isStandalone(),
      isIOS: isIOS()
    };
  };

  const setConfig = (nextConfig = {}) => {
    if (typeof nextConfig.applicationServerKey === "string") {
      config.applicationServerKey = nextConfig.applicationServerKey.trim();
    }
    if (typeof nextConfig.subscribeEndpoint === "string") {
      config.subscribeEndpoint = nextConfig.subscribeEndpoint.trim();
    }
    if (typeof nextConfig.unsubscribeEndpoint === "string") {
      config.unsubscribeEndpoint = nextConfig.unsubscribeEndpoint.trim();
    }
    emitStateChanged();
  };

  window.sgcuWebPush = {
    setConfig,
    getPermission,
    getClientState,
    requestPermission,
    showNotification,
    subscribePush,
    unsubscribePush
  };
})();
