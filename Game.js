class Player {
  // Full explanation of API can be found in the Game class docstring
  constructor(name) {
    this.name = name;
    // board instance includes a blank board for guessing
    // and a pre-filled board with ships legally placed
    this.board = new Board();
    this.score = this.board.shipSum;
    this.loss = false;
  }

  checkLoss() {
    this.loss = this.score === 0 ? true : false;
  }
}

class Board {
  constructor() {
    this.size = 10;
    this.shipSizes = [5, 4, 3, 3, 2];
    this.shipSum = this.shipSizes.reduce((a, b) => a + b);
    this.guessBoard = this.makeBoard();
    this.playerBoard = this.makePlayerBoard();
  }

  // Helper functions
  getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
  }

  coordToIndex(x, y) {
    return y * this.size + x;
  }

  indexToCoord(index) {
    return [index % this.size, Math.floor(index / this.size)];
  }

  makeBoard() {
    // Makes a board object which is full of 'NONE' values
    let board = [];
    for (let i = 0; i < this.size * this.size; i++) {
      board[i] = {
        x: i % this.size,
        y: Math.floor(i / this.size),
        value: 'NONE',
      };
    }
    return board;
  }

  makePlayerBoard() {
    // Randomly generate a valid placement of all ships
    // First make blank board, then fill it
    let board = this.makeBoard();
    let shipSizes = this.shipSizes;

    for (let i = 0; i < shipSizes.length; i) {
      let seed = this.getRandomInt(this.size * this.size);
      let direction = this.getRandomInt(1); // 0 horizontal, 1 vertical
      let x = this.indexToCoord(seed)[0];
      let y = this.indexToCoord(seed)[1];
      let newX = direction === 0 ? x : x + shipSizes[i] - 1;
      let newY = direction === 0 ? y + shipSizes[i] - 1 : y;

      // Restart if suggested coordinates are off the board
      if (newX >= this.size || newY >= this.size) {
        continue;
      }

      // Store indexes of unoccupied squares or break...
      let shipIndex = [];
      for (let j = 0; j < shipSizes[i]; j++) {
        let index = this.coordToIndex(x, y);
        if (board[index].value === 'NONE') {
          shipIndex.push(index);
          x === newX ? y++ : x++;
        } else {
          // Clear out bad indexes before restart
          shipIndex = [];
          break;
        }
      }
      // ...A break above should trigger a restart here
      if (newX - x + newY - y + 1 !== 0) {
        continue;
      }

      // Set ship coordinates on board
      for (let j = 0; j < shipSizes[i]; j++) {
        let index = shipIndex.pop();
        board[index].value = 'SHIP';
      }

      // Only increment once a ship is successfully placed
      i++;
    }

    return board;
  }

  prettyPrint(board) {
    // Display results of ship generation with coordinate numbers
    // X (target) represents SHIP
    // @ (big ripple) represents HIT
    // . (small ripple) represents MISS
    // ~ (wave) represents NONE
    let lastRow = [' '];
    for (let i = 0; i < this.size; i++) {
      let row = [];
      row.push(i);
      lastRow.push(i);
      for (let j = 0; j < this.size; j++) {
        let index = this.coordToIndex(j, i);
        if (board[index].value === 'SHIP') {
          row.push('X');
        } else if (board[index].value === 'HIT') {
          row.push('@');
        } else if (board[index].value === 'MISS') {
          row.push('.');
        } else {
          row.push('~');
        }
      }
      let line = String(row).replace(/,/g, ' ');
      console.log(line);
    }
    let line = String(lastRow).replace(/,/g, ' ');
    console.log(line);
  }
}

class Game {
  // API is operated entirely through a single instance of the Game class.
  // The API holds onto all relevant state data.
  // Optionally outputs to console for ease of use.
  //
  // Instructions:
  // For two player mode, players may take turns at the console.
  // The recommended order of play is to first call Game.showBoard(), then
  // to make a guess with Game.playTurn(x,y), and finally to clear the board
  // with Game.hideBoard(), then to switch places and repeat the process
  // until the game ends.
  // Game.playTurn() may be called either with (x, y) coordinates or without.
  // Leaving coordinates out will generate a random guess.
  // In order to observe a full simulated game, call Game.testFullGame()
  constructor() {
    this.player1 = new Player('Alice');
    this.player2 = new Player('Bob');
    this.turnCount = Math.floor(Math.random() * 2);
  }

  whoseTurn() {
    // Return current player
    return this.turnCount % 2 === 0 ? this.player1 : this.player2;
  }

  showBoard() {
    // Formats and outputs multiple game boards and pieces of information
    let player = this.whoseTurn();

    console.log('=====================');
    console.log(
      `${player.name}, ${player.score} Left to Lose`
    );
    console.log('=====================');
    console.log('       Guesses       ');
    player.board.prettyPrint(player.board.guessBoard);
    console.log('_____________________');
    console.log('        Ships        ');
    player.board.prettyPrint(player.board.playerBoard);
    console.log('_____________________');
    console.log('\n');
  }

  playTurn(x, y) {
    // Main interaction between player and game
    // x and y are optional parameters
    // In the absence of parameters a random guess is made
    if (!this.player1.loss && !this.player2.loss) {
      if (this.guess(x, y) === 0) {
        console.log('Invalid selection, please guess again');
        return 0;
      }
      this.turnCount++;
    } else {
      this.reset();
    }
  }

  hideBoard() {
    console.clear();
  }

  testFullGame() {
    // Simulates full 2 player game with random guesses and visible boards
    while (!this.player1.loss && !this.player2.loss) {
      this.showBoard();
      this.playTurn();
    }
    this.reset();
  }

  reset() {
    // States who won, then reinitializes Game state
    console.log(
      `${this.whoseTurn().name} wins! Game over in ${this.turnCount} turns`
    );
    this.player1 = new Player('Alice');
    this.player2 = new Player('Bob');
    this.turnCount = Math.floor(Math.random() * 2);
  }

  guess(x, y) {
    // Detect current player and opponent
    let player = this.whoseTurn();
    let opponent = this.turnCount % 2 === 0 ? this.player2 : this.player1;

    // Set descriptive variable names
    let myGuessBoard = player.board.guessBoard;
    let oppPlayerBoard = opponent.board.playerBoard;
    let size = player.board.size;

    // Guess control
    // If entered manually, throw an error for repeat or invalid guesses
    // If not, generate random valid guess
    let myGuess = 0;
    if (arguments.length === 0 || arguments[0] !== undefined) {
      myGuess = player.board.coordToIndex(x, y);
      if (
        myGuessBoard[myGuess].value !== 'NONE' ||
        myGuess < 0 ||
        myGuess > size * size - 1
      ) {
        return 0;
      }
    } else if (arguments.length > 0 || arguments[0] === undefined) {
      myGuess = player.board.getRandomInt(size * size - 1);
      while (myGuessBoard[myGuess].value !== 'NONE') {
        myGuess = player.board.getRandomInt(size * size - 1);
      }
    }

    if (oppPlayerBoard[myGuess].value === 'SHIP') {
      myGuessBoard[myGuess].value = 'HIT';
      oppPlayerBoard[myGuess].value = 'HIT';
      opponent.score--;
      player.checkLoss();
    } else if (oppPlayerBoard[myGuess].value === 'NONE') {
      myGuessBoard[myGuess].value = 'MISS';
      oppPlayerBoard[myGuess].value = 'MISS';
    }
  }
}

// Test prints output of a complete random game
function testGame() {
  let game = new Game();
  game.testFullGame();
}

// Test prints out placed ships on a grid of Xs and Os
// Along with a HIT (@ symbol) at (0, 0).
function testBoard() {
  let board = new Board();
  let index = board.coordToIndex(0, 0);
  board.playerBoard[index].value = 'HIT';
  board.prettyPrint(board.playerBoard);
}

let game = new Game();
