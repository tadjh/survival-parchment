const CURRENT_RESOURCE_NAME = GetCurrentResourceName();
const MAX_THROTTLE_TIMEOUT = 60000;
let isThrottled = false;

onNet(`${CURRENT_RESOURCE_NAME}:dispatchAddTexture`, (url: string) => {
  if (!isThrottled) {
    isThrottled = true;
    emitNet(`${CURRENT_RESOURCE_NAME}:broadcastAddTexture`, -1, url);
    const timeout = setTimeout(() => {
      isThrottled = false;
      clearTimeout(timeout);
    }, MAX_THROTTLE_TIMEOUT);
  } else {
    emitNet(`${CURRENT_RESOURCE_NAME}:broadcastRejection`, source, false);
  }
});

onNet(`${CURRENT_RESOURCE_NAME}:dispatchRemoveTexture`, () => {
  emitNet(`${CURRENT_RESOURCE_NAME}:broadcastRemoveTexture`, -1);
});
