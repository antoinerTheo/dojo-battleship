const BOARD_SIZE = 10;
const SHIPS = {
  Carrier: 5,
  Battleship: 4,
  Cruiser: 3,
  Submarine: 3,
  Destroyer: 2
};
const DIRECTIONS = ["up", "down", "left", "right"];
export const ITERATION_LIMIT = 100;

export const CHAR_CODE_OFFSET = 65;

export function generateRandomBoard() {
  let boardCells = {};
  let boats = {};

  for (let row = 1; row <= BOARD_SIZE; row++) {
    for (let column = 1; column <= BOARD_SIZE; column++) {
      boardCells[getCell(row, column)] = undefined;
    }
  }

  Object.keys(SHIPS).forEach(shipName => {
    const shipSize = SHIPS[shipName];
    const newShipCells = generateRandomBoatPosition(shipSize, boardCells);
    // TODO what happend if no board is found ?
    boardCells = { ...boardCells, ...newShipCells };
    boats[shipName] = newShipCells;
  });
  return { boardCells, boats };
}

function generateRandomBoatPosition(shipSize, boardCells) {
  for (let i = 0; i < ITERATION_LIMIT; i++) {
    const startingCell = findAvailableCell(boardCells);
    const newShipCells = findNewShipCells(shipSize, boardCells, startingCell);
    return newShipCells;
  }
  return {};
}

function findAvailableCell(boardCells) {
  let cell = "";

  const availableCells = Object.keys(boardCells).filter(
    key => !boardCells[key]
  );
  const randomIndex = Math.floor(availableCells.length * Math.random());

  for (let index = 0; index < availableCells.length; index++) {
    cell = availableCells[(index + randomIndex) % availableCells.length];
    if (areNeighborsAvailabale(cell, boardCells)) {
      break;
    }
  }
  return cell;
}
function findNewShipCells(shipSize, boardCells, startingCell) {
  const startingCellIndexes = getCellIndexes(startingCell);
  const shipCellsCandidates = {};

  DIRECTIONS.forEach(direction => {
    const shipCellsCandidate = {};
    shipCellsCandidate[startingCell] = "ship";

    for (let distance = 1; distance < shipSize; distance++) {
      const cell = getNeighborFromDirectionAndDistance(
        startingCellIndexes.row,
        startingCellIndexes.column,
        direction,
        distance
      );
      if (!isCellRespectingShipConstraints(cell, boardCells)) {
        break;
      }
      shipCellsCandidate[cell] = "ship";
    }
    if (Object.keys(shipCellsCandidate).length === shipSize) {
      shipCellsCandidates[direction] = shipCellsCandidate;
    }
  });

  const directionCandidates = Object.keys(shipCellsCandidates);

  if (directionCandidates.length > 0) {
    const randomIndex = Math.floor(Math.random() * directionCandidates.length);
    return shipCellsCandidates[directionCandidates[randomIndex]];
  }

  return {};
}

export function getCell(row, column) {
  const columnLetter = String.fromCharCode(column - 1 + CHAR_CODE_OFFSET);
  return columnLetter.concat(row.toString());
}

export function getCellIndexes(cell) {
  const column = cell[0].charCodeAt(0) - CHAR_CODE_OFFSET + 1;
  const row = parseInt(cell.substr(1));

  return { row: row, column: column };
}

export function getNeighbors(row, column) {
  let neighbors = {};
  DIRECTIONS.forEach(direction => {
    const neighbor = getNeighborFromDirectionAndDistance(
      row,
      column,
      direction,
      1
    );
    if (neighbor) {
      neighbors[direction] = neighbor;
    }
  });

  return neighbors;
}

function getNeighborFromDirectionAndDistance(row, column, direction, distance) {
  switch (direction) {
    case "up":
      if (row - distance > 0) {
        // check that we are not on the top border of the board
        return getCell(row - distance, column);
      }
      break;
    case "down":
      if (row + distance <= BOARD_SIZE) {
        return getCell(row + distance, column);
      }
      break;
    case "left":
      if (column - distance > 0) {
        return getCell(row, column - distance);
      }
      break;
    case "right":
      if (column + distance <= BOARD_SIZE) {
        return getCell(row, column + distance);
      }
      break;
    default:
      return null;
  }
}

function areNeighborsAvailabale(cell, boardCells) {
  const cellIndexes = getCellIndexes(cell);
  const neighbors = getNeighbors(cellIndexes.row, cellIndexes.column);

  let areAvailable = true;
  Object.keys(neighbors).forEach(direction => {
    if (!isCellAvailable(neighbors[direction], boardCells)) {
      areAvailable = false;
    }
  });
  return areAvailable;
}

function isCellRespectingShipConstraints(cell, boardCells) {
  return (
    !!cell &&
    isCellAvailable(cell, boardCells) &&
    areNeighborsAvailabale(cell, boardCells)
  );
}

function isCellAvailable(candidate, boardCells) {
  return !boardCells[candidate];
}
