const API_BASE = "/api/todos";

// DOM Elements - Login
const loginContainer = document.getElementById("loginContainer");
const appContainer = document.getElementById("appContainer");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const toggleText = document.getElementById("toggleText");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");

// DOM Elements - App
const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const errorContainer = document.getElementById("errorContainer");
const counter = document.getElementById("counter");
const currentDateEl = document.getElementById("currentDate");
const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");

let todos = [];
let authToken = localStorage.getItem("authToken");
let isSignupMode = false;

// ===== Auth Functions =====

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
    };
}

function showLoginScreen() {
    loginContainer.classList.remove("hidden");
    appContainer.classList.add("hidden");
    usernameInput.focus();
}

function showAppScreen(username) {
    loginContainer.classList.add("hidden");
    appContainer.classList.remove("hidden");
    userInfo.textContent = username;
    setCurrentDate();
    fetchTodos();
    todoInput.focus();
}

async function checkAuth() {
    if (!authToken) {
        showLoginScreen();
        return;
    }

    try {
        const response = await fetch("/api/me", {
            headers: getAuthHeaders(),
        });

        if (response.ok) {
            const data = await response.json();
            showAppScreen(data.username);
        } else {
            localStorage.removeItem("authToken");
            authToken = null;
            showLoginScreen();
        }
    } catch (error) {
        console.error("Auth check failed:", error);
        showLoginScreen();
    }
}

async function login(username, password) {
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }

        authToken = data.token;
        localStorage.setItem("authToken", authToken);
        showAppScreen(data.username);
        loginError.innerHTML = "";
    } catch (error) {
        loginError.innerHTML = `<div class="login-error">${error.message}</div>`;
    }
}

async function logout() {
    try {
        await fetch("/api/logout", {
            method: "POST",
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error("Logout error:", error);
    }

    localStorage.removeItem("authToken");
    authToken = null;
    todos = [];

    // Reset to login mode (not signup mode)
    if (isSignupMode) {
        isSignupMode = false;
        formTitle.textContent = "Notes";
        formSubtitle.textContent = "Sign in to manage your notes";
        submitBtn.textContent = "Sign In";
        toggleText.textContent = "Don't have an account?";
        toggleFormBtn.textContent = "Sign Up";
        usernameHint.classList.remove("show");
        passwordHint.classList.remove("show");
    }

    showLoginScreen();
}

async function signup(username, password) {
    try {
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Sign up failed");
        }

        authToken = data.token;
        localStorage.setItem("authToken", authToken);
        showAppScreen(data.username);
        loginError.innerHTML = "";
    } catch (error) {
        loginError.innerHTML = `<div class="login-error">${error.message}</div>`;
    }
}

function toggleFormMode() {
    isSignupMode = !isSignupMode;
    loginError.innerHTML = "";
    usernameInput.value = "";
    passwordInput.value = "";

    if (isSignupMode) {
        formTitle.textContent = "Sign Up";
        formSubtitle.textContent = "Create a new account";
        submitBtn.textContent = "Sign Up";
        toggleText.textContent = "Already have an account?";
        toggleFormBtn.textContent = "Sign In";
        usernameInput.placeholder = "";
        passwordInput.placeholder = "";
    } else {
        formTitle.textContent = "Notes";
        formSubtitle.textContent = "Sign in to manage your notes";
        submitBtn.textContent = "Sign In";
        toggleText.textContent = "Don't have an account?";
        toggleFormBtn.textContent = "Sign Up";
        usernameInput.placeholder = "";
        passwordInput.placeholder = "";
    }

    usernameInput.focus();
}

// ===== App Functions =====

function setCurrentDate() {
    const now = new Date();
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    };
    currentDateEl.textContent = now.toLocaleDateString("en-US", options);
}

function showError(message) {
    errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
    setTimeout(() => {
        errorContainer.innerHTML = "";
    }, 3000);
}

function updateCounter() {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;

    if (total === 0) {
        counter.style.display = "none";
    } else {
        counter.style.display = "block";
        counter.textContent = `${completed}/${total} completed`;
    }
}

async function fetchTodos() {
    try {
        const response = await fetch(API_BASE, {
            headers: getAuthHeaders(),
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) throw new Error("Failed to fetch notes");
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error("Error fetching todos:", error);
        showError("Failed to load notes");
    }
}

async function createTodo(title) {
    try {
        const response = await fetch(API_BASE, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ title }),
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) throw new Error("Failed to create note");

        const newTodo = await response.json();
        todos.unshift(newTodo);
        renderTodos();
        todoInput.value = "";
    } catch (error) {
        console.error("Error creating todo:", error);
        showError("Failed to add note");
    }
}

async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) throw new Error("Failed to toggle note");

        const updatedTodo = await response.json();
        todos = todos.map((todo) => (todo.id === id ? updatedTodo : todo));
        renderTodos();
    } catch (error) {
        console.error("Error toggling todo:", error);
        showError("Failed to update note");
    }
}

async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) throw new Error("Failed to delete note");

        todos = todos.filter((todo) => todo.id !== id);
        renderTodos();
    } catch (error) {
        console.error("Error deleting todo:", error);
        showError("Failed to delete note");
    }
}

function renderTodos() {
    updateCounter();

    if (todos.length === 0) {
        todoList.innerHTML = `
      <li class="empty-state">
        Add your first note
      </li>
    `;
        return;
    }

    todoList.innerHTML = todos
        .map(
            (todo) => `
      <li class="todo-item ${todo.completed ? "completed" : ""}">
        <label class="checkbox-wrapper">
          <input
            type="checkbox"
            ${todo.completed ? "checked" : ""}
            onchange="toggleTodo(${todo.id})"
          >
          <span class="checkmark">
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>
        <span class="todo-text">${escapeHtml(todo.title)}</span>
        <button class="delete-btn" onclick="deleteTodo(${
            todo.id
        })">Delete</button>
      </li>
    `
        )
        .join("");
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ===== Event Listeners =====

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        loginError.innerHTML =
            '<div class="login-error">Please enter username and password</div>';
        return;
    }

    if (isSignupMode) {
        signup(username, password);
    } else {
        login(username, password);
    }
});

toggleFormBtn.addEventListener("click", toggleFormMode);

logoutBtn.addEventListener("click", logout);

addBtn.addEventListener("click", () => {
    const title = todoInput.value.trim();
    if (!title) {
        showError("Please enter a note");
        todoInput.focus();
        return;
    }
    createTodo(title);
});

todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addBtn.click();
    }
});

// ===== Initialize =====
checkAuth();
