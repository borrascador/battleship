class Player {
  constructor(name) {
    this.name = name;
    // board instance includes a blank board for guessing 
    // and a pre-filled board with ships legally placed
    this.board = new Board();
  }
}

class Game {
  constructor() {
    this.player1 = new Player("Jan");
    this.player2 = new Player("Marek");
    this.order = Math.floor(Math.random() * 2);
    
    this.testGame();
  }

  testGame() {
    for (; this.order<15; this.order++) {
      if (this.order % 2 === 1) {
        this.tick(this.player1);
        this.guess(this.player1, this.player2);
      } else {
        this.tick(this.player2);
        this.guess(this.player2, this.player1);
      }
    }
  }
  
  guess(player, opponent) {
    let myGuessBoard = player.board.guessBoard;
    let oppPlayerBoard = opponent.board.playerBoard;
    let myGuess = player.board.getRandomInt(player.board.size*player.board.size);
    if (oppPlayerBoard[myGuess].value==='SHIP') {
      myGuessBoard[myGuess].value = 'HIT';
      oppPlayerBoard[myGuess].value = 'HIT';
    } else if (oppPlayerBoard[myGuess].value==='NONE') {
      myGuessBoard[myGuess].value = 'MISS';
      oppPlayerBoard[myGuess].value = 'MISS';
    }
  }
  
  tick(player) {
    player.board.prettyPrint(player.board.playerBoard);
    console.log('\n');
    player.board.prettyPrint(player.board.guessBoard);
    console.log('\n');
  }

  // Place ships
  // No overlap
  // No going over edge
  //
  // Take turns calling out coordinates
  // Evaluate hit or miss
}

class Board {
  constructor() {
    this.size = 10;
    this.guessBoard = this.makeBoard();
    this.playerBoard = this.makePlayerBoard();
  }
  
  // Helper functions
  getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
  }

  coordToIndex(x, y) {
    return (y * this.size) + x;
  }

  indexToCoord(index) {
    return [ index % this.size, Math.floor(index / this.size) ];
  }
  
  makeBoard() {
    // Makes a board object which is full of null values
    let board = [];
    for (let i=0; i<this.size*this.size; i++) {
      board[i] = {
        x: i % this.size,
        y: Math.floor(i / this.size),
        value: 'NONE'
      }
    }
    return board;
  }
  
  makePlayerBoard() {
    // Randomly generate a valid combination of ship placement
    let board = this.makeBoard();
    let shipSizes = [5,4,3,3,2];

    for (let i=0; i < shipSizes.length; i) {
      let seed = this.getRandomInt(this.size*this.size);
      let direction = this.getRandomInt(1); // 0 horizontal, 1 vertical
      let x = this.indexToCoord(seed)[0];
      let y = this.indexToCoord(seed)[1];
      let newX = direction === 0 ? x : x+shipSizes[i]-1;
      let newY = direction === 0 ? y+shipSizes[i]-1 : y;
      
      // Restart if suggested coordinates are off the board
      if (newX >= this.size || newY >= this.size) {
        continue;
      }
      
      // Store indexes of unoccupied squares or break...
      let shipIndex = [];
      for (let j=0; j < shipSizes[i]; j++) {
        let index = this.coordToIndex(x, y);
        if (board[index].value === 'NONE') {
          shipIndex.push(index);
          (x === newX) ? y++ : x++;
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
      for (let j=0; j < shipSizes[i]; j++) {
        let index = shipIndex.pop();
        board[index].value = 'SHIP';
      }
      
      // Only increment once a ship is successfully placed
      i++;
    }
    
    return board;
  }
  
  prettyPrint(board) {
    // Display results of ship generation with Xs and Os
    for (let i=0; i<this.size; i++) {
      let row = [];
      for (let j=0; j<this.size; j++) {
        let index = this.coordToIndex(j, i);
        if (board[index].value==='SHIP') {
          row.push('X');
        } else if (board[index].value==='HIT') {
          row.push('@');
        } else if (board[index].value==='MISS') {
          row.push('o');
        } else {
          row.push('.');
        }
      }
      console.log(String(row));
    }
  }
}

// Test, prints out placed ships on a grid of Xs and Os
let game = new Game();
