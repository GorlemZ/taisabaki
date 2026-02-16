const MOVES = {
  irimi: (pos, facing) => ({ position: pos + facing, facing }),
  tenshin: (pos, facing) => ({ position: pos - facing, facing }),
  kaiten: (pos, facing) => ({ position: pos, facing: -facing }),
  tenkan: (pos, facing) => ({ position: pos + facing, facing: -facing }),
  'irimi-tenkan': (pos, facing) => ({ position: pos + 2 * facing, facing: -facing }),
};

export function createEngine(maxDrift) {
  let position = 0;
  let facing = 1;

  function getNextMove() {
    const candidates = Object.entries(MOVES)
      .map(([name, apply]) => {
        const result = apply(position, facing);
        return { name, ...result };
      })
      .filter(({ position: newPos }) => newPos >= -maxDrift && newPos + 1 <= maxDrift);

    const pick = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : { name: 'kaiten', position, facing: -facing };

    position = pick.position;
    facing = pick.facing;

    return pick.name;
  }

  function reset() {
    position = 0;
    facing = 1;
  }

  function getState() {
    return { position, facing };
  }

  function setMaxDrift(val) {
    maxDrift = val;
  }

  function setState(pos, fac) {
    position = pos;
    facing = fac;
  }

  return { getNextMove, reset, getState, setState, setMaxDrift };
}
