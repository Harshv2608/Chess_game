# ♟ Chess Engine

A fully rule-compliant chess engine built from scratch using **HTML, CSS, and Vanilla JavaScript**.

This project implements real chess rules with a clean architecture that separates engine logic from UI rendering.

---

## 🚀 Live Demo

(You can deploy this using GitHub Pages)

👉 Live Demo Link: [https://harshv2608.github.io/Chess_game/]

---

## 📸 Screenshots

### 🏁 Main Board View
<img width="793" height="790" alt="image" src="https://github.com/user-attachments/assets/c40c54db-dd14-4f37-9df2-40b8cb397636" />

---

### ♜ Move Highlighting
<img width="779" height="791" alt="image" src="https://github.com/user-attachments/assets/6ae9a3f3-0929-4417-ae6d-9618a32c8a7f" />


---

### 👑 Pawn Promotion Modal
<img width="632" height="689" alt="image" src="https://github.com/user-attachments/assets/ce8981ac-cb3b-4056-8c4d-7e9ce759d405" />


---

### 📜 Move History & Undo
<img width="394" height="731" alt="image" src="https://github.com/user-attachments/assets/6886ec6a-6217-4560-af8a-8a9fe4534626" />


---

## ✨ Features

### ♟ Core Chess Rules
- Full piece movement validation
- Turn-based gameplay
- Prevents illegal moves
- Self-check prevention
- Check detection
- Checkmate detection
- Stalemate detection

### 🏰 Special Moves
- Castling (King-side & Queen-side with proper validation)
- En Passant
- Pawn Promotion (UI-based modal selection)

### 🔁 Game Management
- Undo system (restores full board state)
- Move history sidebar
- Last move highlighting
- King-in-check highlighting

### 🎨 UI & Design
- Modern responsive chess board
- Equal-sized grid squares using CSS Grid
- Professional typography
- Clean dark-themed side panel
- Smooth hover animations
- Highlight indicators using border effects (not background override)

---

## 🧠 Architecture

The project is structured around a clean separation of concerns:

### 1️⃣ Game Engine (Logic Layer)
- 2D board representation
- Central move validation system
- Check detection through board simulation
- Castling rights tracking
- En passant target tracking
- Full game state serialization for undo

### 2️⃣ Rendering Layer (UI)
- DOM-based board rendering
- Dynamic square highlighting
- Promotion modal overlay
- Move history display

The engine is completely independent of the UI logic.

---

## 🛠 Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, Modern Styling)
- Vanilla JavaScript (ES6+)
- No external chess libraries
- No frameworks

Everything is implemented manually from scratch.

---

## 🎯 Learning Objectives

This project demonstrates understanding of:

- Data structures (2D arrays for board state)
- State management
- Algorithmic move validation
- Simulation-based rule enforcement
- Event-driven programming
- DOM manipulation
- Clean UI architecture
- Game logic implementation

---

## 🔄 How to Run Locally

1. Clone the repository:

```bash
git clone https://github.com/Harshv2608/Chess_game.git
```

2. Open the project folder.  
3. Launch `index.html` in your browser.  

No installation or dependencies required.

---

## 📌 Future Enhancements

- Drag-and-drop piece movement  
- Chess timers  
- AI opponent (Minimax algorithm)  
- PGN export  
- FEN import/export  
- Online multiplayer (WebSockets)  
- Sound effects  
- Theme switcher (Classic / Modern / Neon)  

---

## 👨‍💻 Author

**Harsh Vardhan**

If you found this project interesting or helpful, consider giving it a ⭐ on GitHub.

---

## 📜 License

This project is open-source and available under the MIT License.
