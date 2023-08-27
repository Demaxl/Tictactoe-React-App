import React, {useReducer, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import "./css/main.scss"

const initialBoard = [[0, 0, 0],
					  [0, 0, 0],
				      [0, 0, 0]]
const initialState = {
	board: initialBoard,
	stopGame: false,
	turn: "X",
	winBoxes: [],
	get heading() {
		return `Player ${this.turn} turn`
	}
}
const reducer = (state, action) => {

	switch (action.type) {
		case "CLICK":
			const row = action.row;
			const col = action.col;

			if (state.board[row][col]) return state

			switch (state.turn) {
				case 'X':
					state.board[row][col] = 'X'
					state.turn = 'O'
					break;
				default:
					state.board[row][col] = 'O'
					state.turn = 'X'
					break;
			}
			return {...state, heading: `Player ${state.turn} turn`}
			break;
		case "CHECK_WIN":
			const [status, statusBoxes] = checkWin(state.board);
			return {...state, 
					stopGame:status, 
					winBoxes:statusBoxes, 
					heading: (status) ? `Player ${(state.turn === "X" ? "O":"X")} wins!` : state.heading
					}
			break;
		
		case "CHECK_DRAW":
			const boxesFull = state.board.every((row) => row.every((box) => box === "X" || box === "O"))
			
			if (boxesFull) {
				const winBoxes = [];
				state.board.forEach((row, r) => row.forEach((box, c) => {winBoxes.push(`[${r},${c}]`)}))
				
				return {...state, 
						winBoxes:winBoxes,
						heading: "GAME OVER! DRAW!!",
						stopGame: true
						}
			}
			break;	
		
		case "RESTART":
			return {
				board: [[0, 0, 0],[0, 0, 0],[0, 0, 0]],
				stopGame: false,
				turn: "X",
				winBoxes: [],
				get heading() {
					return `Player ${this.turn} turn`
				}
			}
	}
	return state
}

const boxesEqual = (g, h, f) => g === h && g === f && g !== 0

function checkWin(board) {
	var winBoxes = [];
	var stopGame = false;

    for (var i = 0; i < 3; i++) {
        if (boxesEqual(board[i][0], board[i][1], board[i][2]))  {
			winBoxes.push(...[`[${i},0]`, `[${i},1]`, `[${i},2]`])
            stopGame = true
        }
    }
    for (var i = 0; i < 3; i++) {
        if (boxesEqual(board[0][i], board[1][i], board[2][i]))  {
			winBoxes.push(...[`[0,${i}]`, `[1,${i}]`, `[2,${i}]`])
            stopGame = true
        }
    }

    if (boxesEqual(board[0][0], board[1][1], board[2][2]))  {
			winBoxes.push(...["[0,0]", "[1,1]", "[2,2]"])
            stopGame = true
    }
    if (boxesEqual(board[2][0], board[1][1], board[0][2]))  {
			winBoxes.push(...["[2,0]", "[1,1]", "[0,2]"])
            stopGame = true
    }

	return [stopGame, winBoxes]
}

function Box(props) {

	var classes = "box";

	if (props.value == "X") {
		classes += " playerx";
	} else if (props.value == "O") {
		classes += " playero";
	};
	
	if (props.winBoxes.includes(`[${props.r},${props.c}]`)) {
		classes += " win-box"
	}

	return (
		<div 
			className={classes}
			key={props.c}
			onClick={() => props.click(props.r, props.c)}>{props.value != 0 && props.value}
		</div>
	)
}

function Board() {
	const [state, dispatch] = useReducer(reducer, initialState);

	const boxClicked = (r, c) => {
		if (state.stopGame) return
		dispatch({type:"CLICK", row: r, col: c});
		dispatch({type:"CHECK_WIN"})
		dispatch({type:"CHECK_DRAW"})
		
	}

	useEffect(() => {
		if (state.stopGame) {
			let timer = setTimeout(() => {
				dispatch({type:"RESTART"})
			}, 3000);

			return () => clearTimeout(timer)
		}
	}, [state.stopGame])

	return (
		<>
			<h2 id="turn-heading">{state.heading}</h2>
			
			<div className="game-board">
				{
					state.board.map((row, r) => {
						return (
							<React.Fragment key={r}>
								{
									row.map((box, c) => <Box key={c} value={box} r={r} c={c} click={boxClicked} winBoxes={state.winBoxes}/>)
								}
							</React.Fragment>
						)	
					})
				}
				
			</div>
		</>
	)

}


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<Board />)


