type SessionExpiredHandler = () => void | Promise<void>;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let sessionExpiredNotified = false;
let sessionExpiredPending = false;

export const registerSessionExpiredHandler = (
  handler: SessionExpiredHandler,
) => {
  sessionExpiredHandler = handler;

  if (sessionExpiredPending) {
    sessionExpiredPending = false;
    void sessionExpiredHandler?.();
  }

  return () => {
    if (sessionExpiredHandler === handler) {
      sessionExpiredHandler = null;
    }
  };
};

export const notifySessionExpired = () => {
  if (sessionExpiredNotified) return;
  sessionExpiredNotified = true;

  if (sessionExpiredHandler) {
    void sessionExpiredHandler();
  } else {
    sessionExpiredPending = true;
  }
};

export const resetSessionExpiredNotification = () => {
  sessionExpiredNotified = false;
  sessionExpiredPending = false;
};
