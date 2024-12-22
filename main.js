const API_URL = "http://localhost:3000/notes";
let notes = [];
let editIndex = null;

const notesContainer = document.getElementById("notesContainer");
const noteOverlay = document.getElementById("noteOverlay");
const addNoteButton = document.getElementById("addNoteButton");
const saveNoteButton = document.getElementById("saveNoteButton");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const overlayTitle = document.getElementById("overlayTitle");
const titleError = document.getElementById("titleError");
const contentError = document.getElementById("contentError");
const closeOverlayButton = document.createElement("button");

async function fetchNotes() {
  const response = await fetch(API_URL);
  notes = await response.json();
  notesContainer.innerHTML = "";
  notes.forEach((note, index) => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note");
    noteElement.innerHTML = `
        <h3>Title: ${note.title}</h3>
        <p>Description: ${note.description}</p>
        <div class="actions">
          <button onclick="editNote(${index})">Edit</button>
          <button class="deleteBtn" data-id="${note.id}">Delete</button>
        </div>
      `;
    notesContainer.appendChild(noteElement);
  });

  // Add event listeners for all delete buttons
  const deleteButtons = document.querySelectorAll(".deleteBtn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const id = event.target.getAttribute("data-id");
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          console.log("Note deleted successfully");
          fetchNotes();
        } else {
          console.error("Failed to delete note");
        }
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    });
  });
}

function toggleOverlay(show, isEdit = false) {
  noteOverlay.classList.toggle("active", show);
  if (!show) {
    noteTitle.value = "";
    noteContent.value = "";
    titleError.textContent = "";
    contentError.textContent = "";
    editIndex = null;
  }
  overlayTitle.textContent = isEdit ? "Edit Note" : "Add Note";
}

function validateInput() {
  let isValid = true;

  if (noteTitle.value.trim().length < 6) {
    titleError.textContent = "Title must be at least 6 characters";
    isValid = false;
  } else {
    titleError.textContent = "";
  }

  if (noteContent.value.trim().length < 20) {
    contentError.textContent = "Description must be at least 20 characters";
    isValid = false;
  } else {
    contentError.textContent = "";
  }

  return isValid;
}

noteTitle.addEventListener("blur", validateInput);
noteContent.addEventListener("blur", validateInput);

closeOverlayButton.textContent = "X";
closeOverlayButton.classList = "close";
document.querySelector(".overlay-content").appendChild(closeOverlayButton);
closeOverlayButton.addEventListener("click", () => toggleOverlay(false));

addNoteButton.addEventListener("click", () => toggleOverlay(true));

saveNoteButton.addEventListener("click", async () => {
  if (!validateInput()) return;

  const note = {
    title: noteTitle.value.trim(),
    description: noteContent.value.trim(),
  };

  if (editIndex !== null) {
    note.id = notes[editIndex].id;

    await fetch(`${API_URL}/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
  }

  fetchNotes();
  toggleOverlay(false);
});

async function editNote(index) {
  editIndex = index;
  const note = notes[index];
  noteTitle.value = note.title;
  noteContent.value = note.description;
  toggleOverlay(true, true);
}

fetchNotes();
