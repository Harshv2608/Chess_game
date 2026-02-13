const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const historyElement = document.getElementById("history");
const undoBtn = document.getElementById("undoBtn");
const promotionModal = document.getElementById("promotionModal");
const promotionChoices = document.getElementById("promotionChoices");

let board;
let currentTurn;
let selected = null;
let moveHistory = [];
let lastMove = null;
let castlingRights;
let enPassantTarget = null;
let pendingPromotion = null;

const pieces = {
    wp:"♙", wr:"♖", wn:"♘", wb:"♗", wq:"♕", wk:"♔",
    bp:"♟", br:"♜", bn:"♞", bb:"♝", bq:"♛", bk:"♚"
};

function initGame(){
    board = [
        ["br","bn","bb","bq","bk","bb","bn","br"],
        ["bp","bp","bp","bp","bp","bp","bp","bp"],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["wp","wp","wp","wp","wp","wp","wp","wp"],
        ["wr","wn","wb","wq","wk","wb","wn","wr"]
    ];

    currentTurn = "w";

    castlingRights = {
        w:{kingSide:true,queenSide:true},
        b:{kingSide:true,queenSide:true}
    };

    moveHistory = [];
    historyElement.innerHTML = "";
    render();
}

function render(){
    boardElement.innerHTML = "";

    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            const sq = document.createElement("div");
            sq.className = "square " + ((r+c)%2===0?"light":"dark");
            sq.dataset.row = r;
            sq.dataset.col = c;

            if(board[r][c]) {
               sq.textContent = pieces[board[r][c]];
               if(board[r][c][0] === "w")
                   sq.classList.add("white-piece");
               else
                  sq.classList.add("black-piece");
            }


            if(lastMove &&
               (lastMove.from[0]===r && lastMove.from[1]===c ||
                lastMove.to[0]===r && lastMove.to[1]===c)){
                sq.classList.add("last-move");
            }

            sq.onclick = handleClick;
            boardElement.appendChild(sq);
        }
    }

    if(isKingInCheck(currentTurn)){
        const [kr,kc] = findKing(currentTurn);
        document.querySelector(`[data-row="${kr}"][data-col="${kc}"]`)
            .classList.add("check");
    }

    statusElement.textContent = currentTurn==="w"?"White to move":"Black to move";
}

function handleClick(e){
    if(pendingPromotion) return;

    const r = +e.target.dataset.row;
    const c = +e.target.dataset.col;

    if(selected){
        if(isValidMove(selected[0],selected[1],r,c)){
            makeMove(selected[0],selected[1],r,c);
            selected = null;
            render();
            checkGameEnd();
        } else {
            selected = null;
            render();
        }
    } else {
        if(board[r][c] && board[r][c][0]===currentTurn){
            selected = [r,c];
            showMoves(r,c);
        }
    }
}

function showMoves(r,c){
    render();
    for(let tr=0;tr<8;tr++){
        for(let tc=0;tc<8;tc++){
            if(isValidMove(r,c,tr,tc)){
                document.querySelector(`[data-row="${tr}"][data-col="${tc}"]`)
                    .classList.add("highlight");
            }
        }
    }
}

function makeMove(fr,fc,tr,tc){

    moveHistory.push(JSON.stringify({
        board: structuredClone(board),
        currentTurn,
        castlingRights: structuredClone(castlingRights),
        enPassantTarget,
        lastMove
    }));

    const piece = board[fr][fc];

    // CASTLING
    if(piece[1]==="k" && Math.abs(tc-fc)===2){
        const rookFrom = tc>fc ? 7 : 0;
        const rookTo = tc>fc ? tc-1 : tc+1;
        board[fr][rookTo] = board[fr][rookFrom];
        board[fr][rookFrom] = "";
    }

    // EN PASSANT CAPTURE
    if(piece[1]==="p" && enPassantTarget &&
       tr===enPassantTarget[0] && tc===enPassantTarget[1]){
        const dir = currentTurn==="w"?1:-1;
        board[tr+dir][tc] = "";
    }

    board[tr][tc] = piece;
    board[fr][fc] = "";

    // PAWN PROMOTION
    if(piece[1]==="p" && (tr===0 || tr===7)){
        pendingPromotion = {r:tr,c:tc,color:piece[0]};
        showPromotion();
        return;
    }

    finalizeMove(piece,fr,fc,tr,tc);
}

function finalizeMove(piece,fr,fc,tr,tc){

    updateCastlingRights(piece,fr,fc);

    // EN PASSANT TARGET
    if(piece[1]==="p" && Math.abs(tr-fr)===2){
        enPassantTarget = [(fr+tr)/2, fc];
    } else {
        enPassantTarget = null;
    }

    lastMove = {from:[fr,fc],to:[tr,tc]};
    addMoveToHistory(piece,fr,fc,tr,tc);

    currentTurn = currentTurn==="w"?"b":"w";
}

function updateCastlingRights(piece,fr,fc){
    if(piece[1]==="k"){
        castlingRights[piece[0]].kingSide = false;
        castlingRights[piece[0]].queenSide = false;
    }
    if(piece[1]==="r"){
        if(fc===0) castlingRights[piece[0]].queenSide = false;
        if(fc===7) castlingRights[piece[0]].kingSide = false;
    }
}

function showPromotion(){
    promotionModal.classList.remove("hidden");
    promotionChoices.innerHTML = "";

    ["q","r","b","n"].forEach(type=>{
        const span = document.createElement("span");
        span.textContent = pieces[pendingPromotion.color+type];
        span.onclick = ()=>{
            board[pendingPromotion.r][pendingPromotion.c] =
                pendingPromotion.color+type;

            promotionModal.classList.add("hidden");
            const piece = board[pendingPromotion.r][pendingPromotion.c];

            finalizeMove(piece,
                lastMove?.from?.[0] ?? 0,
                lastMove?.from?.[1] ?? 0,
                pendingPromotion.r,
                pendingPromotion.c
            );

            pendingPromotion = null;
            render();
            checkGameEnd();
        };
        promotionChoices.appendChild(span);
    });
}

function undoMove(){
    if(moveHistory.length===0) return;
    const prev = JSON.parse(moveHistory.pop());
    board = prev.board;
    currentTurn = prev.currentTurn;
    castlingRights = prev.castlingRights;
    enPassantTarget = prev.enPassantTarget;
    lastMove = prev.lastMove;
    render();
}

undoBtn.onclick = undoMove;

function addMoveToHistory(piece,fr,fc,tr,tc){
    const moveText =
        `${pieces[piece]} ${String.fromCharCode(97+fc)}${8-fr} → ${String.fromCharCode(97+tc)}${8-tr}`;
    historyElement.innerHTML += moveText + "<br>";
}

function isValidMove(fr,fc,tr,tc){
    const piece = board[fr][fc];
    if(!piece) return false;
    if(board[tr][tc] && board[tr][tc][0]===currentTurn) return false;
    if(!basicMove(piece,fr,fc,tr,tc)) return false;
    if(causesSelfCheck(fr,fc,tr,tc)) return false;
    return true;
}

function basicMove(piece,fr,fc,tr,tc){
    const type = piece[1];
    const dr = tr-fr;
    const dc = tc-fc;

    switch(type){

        case "p":{
            const dir = piece[0]==="w"?-1:1;

            if(dc===0 && dr===dir && !board[tr][tc]) return true;

            if(dc===0 && dr===2*dir &&
               !board[tr][tc] &&
               !board[fr+dir][fc] &&
               fr === (piece[0]==="w"?6:1)) return true;

            if(Math.abs(dc)===1 && dr===dir){
                if(board[tr][tc] &&
                   board[tr][tc][0]!==piece[0]) return true;

                if(enPassantTarget &&
                   tr===enPassantTarget[0] &&
                   tc===enPassantTarget[1]) return true;
            }
            return false;
        }

        case "r":
            if(fr!==tr && fc!==tc) return false;
            return pathClear(fr,fc,tr,tc);

        case "b":
            if(Math.abs(dr)!==Math.abs(dc)) return false;
            return pathClear(fr,fc,tr,tc);

        case "q":
            if(fr===tr||fc===tc||Math.abs(dr)===Math.abs(dc))
                return pathClear(fr,fc,tr,tc);
            return false;

        case "n":
            return (Math.abs(dr)===2 && Math.abs(dc)===1) ||
                   (Math.abs(dr)===1 && Math.abs(dc)===2);

        case "k":
            if(Math.abs(dr)<=1 && Math.abs(dc)<=1) return true;

            if(dr===0 && Math.abs(dc)===2){
                return validateCastling(fr,fc,tr,tc,piece[0]);
            }
            return false;
    }
}

function validateCastling(fr,fc,tr,tc,color){
    if(isKingInCheck(color)) return false;

    const side = tc>fc ? "kingSide":"queenSide";
    if(!castlingRights[color][side]) return false;

    const rookCol = side==="kingSide"?7:0;
    const step = side==="kingSide"?1:-1;

    for(let c=fc+step;c!==rookCol;c+=step){
        if(board[fr][c]) return false;
    }

    for(let c=fc;c!==tc+step;c+=step){
        if(squareAttacked(fr,c,color)) return false;
    }

    return true;
}

function squareAttacked(r,c,color){
    const opponent = color==="w"?"b":"w";
    for(let i=0;i<8;i++){
        for(let j=0;j<8;j++){
            if(board[i][j] && board[i][j][0]===opponent){
                if(basicMove(board[i][j],i,j,r,c)) return true;
            }
        }
    }
    return false;
}

function pathClear(fr,fc,tr,tc){
    const dr = Math.sign(tr-fr);
    const dc = Math.sign(tc-fc);
    let r=fr+dr,c=fc+dc;
    while(r!==tr || c!==tc){
        if(board[r][c]) return false;
        r+=dr; c+=dc;
    }
    return true;
}

function causesSelfCheck(fr,fc,tr,tc){
    const temp = board[tr][tc];
    board[tr][tc]=board[fr][fc];
    board[fr][fc]="";
    const check = isKingInCheck(currentTurn);
    board[fr][fc]=board[tr][tc];
    board[tr][tc]=temp;
    return check;
}

function findKing(color){
    for(let r=0;r<8;r++)
        for(let c=0;c<8;c++)
            if(board[r][c]===color+"k") return [r,c];
}

function isKingInCheck(color){
    const [kr,kc]=findKing(color);
    return squareAttacked(kr,kc,color);
}

function hasAnyLegalMove(color){
    for(let r=0;r<8;r++)
        for(let c=0;c<8;c++)
            if(board[r][c] && board[r][c][0]===color)
                for(let tr=0;tr<8;tr++)
                    for(let tc=0;tc<8;tc++)
                        if(isValidMove(r,c,tr,tc)) return true;
    return false;
}

function checkGameEnd(){
    if(isKingInCheck(currentTurn) && !hasAnyLegalMove(currentTurn)){
        alert("Checkmate!");
    } else if(!isKingInCheck(currentTurn) && !hasAnyLegalMove(currentTurn)){
        alert("Stalemate!");
    }
}

initGame();
