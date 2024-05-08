const CURRENT_RESOURCE_NAME = GetCurrentResourceName();

const queue: (boolean | number)[] = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
];

function findPositionInQueue() {
  let pos = -1;
  for (let i = 0; i < queue.length; i++) {
    if (queue[i] === false) {
      pos = i;
      break;
    }
  }
  return pos;
}

function getPositionInQueue(source: number) {
  let pos = -1;
  for (let i = 0; i < queue.length; i++) {
    if (queue[i] === source) {
      pos = i;
      break;
    }
  }
  return pos;
}

function setPositionInQueue(source: number, queueId: number) {
  queue[queueId] = source;
}

function resetPositionInQueue(source: number) {
  let pos = -1;
  for (let i = 0; i < queue.length; i++) {
    if (queue[i] === source) {
      pos = i;
      queue[i] = false;
      break;
    }
  }
  return pos;
}

onNet(`${CURRENT_RESOURCE_NAME}:requestQueuePosition`, () => {
  const queueId = findPositionInQueue();
  if (queueId === -1) {
    return emitNet(
      `${CURRENT_RESOURCE_NAME}:responseRejection`,
      source,
      "queue"
    );
  }
  setPositionInQueue(source, queueId);
  console.log(
    `[${CURRENT_RESOURCE_NAME}] Player ${source} was assigned ${queueId}`
  );

  emitNet(`${CURRENT_RESOURCE_NAME}:responseQueuePosition`, source, queueId);
});

onNet(`${CURRENT_RESOURCE_NAME}:requestAbandonQueue`, () => {
  resetPositionInQueue(source);
});

onNet(`${CURRENT_RESOURCE_NAME}:dispatchAddTexture`, (url: string) => {
  emitNet(
    `${CURRENT_RESOURCE_NAME}:broadcastAddTexture`,
    -1,
    url,
    getPositionInQueue(source)
  );
});

onNet(`${CURRENT_RESOURCE_NAME}:dispatchRemoveTexture`, () => {
  const queueId = resetPositionInQueue(source);
  if (queueId !== -1) {
    emitNet(`${CURRENT_RESOURCE_NAME}:broadcastRemoveTexture`, -1, queueId);
  }
});
