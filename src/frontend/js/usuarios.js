// usuarios.js

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    // Validar en el frontend y redirigir si intenta entrar sin permisos Nivel 3
    if (!user || user.role_level < 3) {
        alert('Acceso denegado. Solo cuentas Corporativas pueden gestionar usuarios.');
        window.location.href = 'cierrex.html'; 
    } else {
        fetchUsers();
    }
});

function getRoleName(level) {
    if (level === 1) return 'Cajero';
    if (level === 2) return 'Administrativo';
    if (level === 3) return 'Corporativo';
    return 'Desconocido';
}

async function fetchUsers() {
    const tableBody = document.getElementById('usersTable');
    tableBody.innerHTML = '';

    try {
        const response = await fetch(`${BASE_URL}/users`);
        const users = await response.json();

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${getRoleName(user.role_level)}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="openEditModal('${user.id}', '${user.name}', '${user.email}', '${user.role_level}')">Editar</button>
                    ${user.email !== 'admin@cierrex.com' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">Eliminar</button>` : '<span class="badge bg-secondary">Admin Default</span>'}
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch(err) {
        console.error("Error al obtener usuarios: ", err);
    }
}

async function createUser() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role_level = parseInt(document.getElementById('role').value, 10);
    const alertBox = document.getElementById('userAlert');
    alertBox.style.display = 'none';

    if (!name || !email || !password || isNaN(role_level)) {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Por favor, completa todos los campos.';
        alertBox.style.display = 'block';
        return;
    }
    if (password.length < 6) {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        alertBox.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role_level })
        });

        const data = await response.json();

        if (response.ok) {
            alertBox.className = 'alert alert-success';
            alertBox.textContent = 'Usuario creado exitosamente.';
            alertBox.style.display = 'block';
            document.getElementById('userForm').reset();
            fetchUsers();
        } else {
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = data.error || 'Error al crear el usuario.';
            alertBox.style.display = 'block';
        }
    } catch (err) {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Error de comunicación con el servidor.';
        alertBox.style.display = 'block';
    }
}

async function deleteUser(id) {
    if(confirm("¿Estás seguro de que quieres eliminar a este empleado?")) {
        try {
            const response = await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchUsers();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al eliminar usuario.');
            }
        } catch(err) {
            alert('Error de red.');
        }
    }
}

function openEditModal(id, name, email, role) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editEmail').value = email;
    document.getElementById('editRole').value = role;
    document.getElementById('editPassword').value = '';

    const modalElement = document.getElementById('userEditModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

async function updateUser() {
    const id = document.getElementById('editUserId').value;
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const password = document.getElementById('editPassword').value;
    const role_level = parseInt(document.getElementById('editRole').value, 10);

    if (!name || !email || isNaN(role_level)) {
        alert('Por favor, completa los campos requeridos.');
        return;
    }

    const payload = { name, email, role_level };
    if (password) payload.password = password;

    try {
        const response = await fetch(`${BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const modalElement = document.getElementById('userEditModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
            fetchUsers();
            alert('Usuario actualizado correctamente.');
        } else {
            const data = await response.json();
            alert(data.error || 'Error al actualizar usuario.');
        }
    } catch (err) {
        alert('Error de red.');
    }
}
