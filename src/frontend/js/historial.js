// historial.js

function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    if (user) {
        // Ocultar acciones basadas en el rol
        const adminActionsHeader = document.getElementById('adminActionsHeader');
        if (user.role_level >= 3) {
            adminActionsHeader.style.display = 'table-cell';
        } else {
            adminActionsHeader.style.display = 'none';
        }

        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        document.getElementById('endDate').value = formatDate(today);
        document.getElementById('startDate').value = formatDate(sevenDaysAgo);

        fetchCierres();
    }
});

async function fetchCierres() {
    const startDateStr = document.getElementById('startDate').value;
    const endDateStr = document.getElementById('endDate').value;
    const tableBody = document.getElementById('cierresTable');
    tableBody.innerHTML = '';

    try {
        const response = await fetch(`${BASE_URL}/cierres`);
        let allCierres = await response.json();

        let filteredCierres = allCierres;

        if (startDateStr && endDateStr) {
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            endDate.setHours(23, 59, 59, 999);

            filteredCierres = allCierres.filter(cierre => {
                const cierreDate = new Date(cierre.date);
                return cierreDate >= startDate && cierreDate <= endDate;
            });
        }

        const user = getCurrentUser();
        const userIsAdmin = user && user.role_level >= 3; 
        
        if (filteredCierres.length === 0) {
            const row = document.createElement('tr');
            const colspan = userIsAdmin ? 13 : 12;
            row.innerHTML = `<td colspan="${colspan}" class="text-center">No hay cierres registrados para el período seleccionado.</td>`;
            tableBody.appendChild(row);
            return;
        }

        filteredCierres.forEach(cierre => {
            const row = document.createElement('tr');
            let actionButtonsHtml = '';

            if (userIsAdmin) {
                actionButtonsHtml = `
                    <div class="action-buttons-container">
                        <button class="btn btn-sm btn-info" onclick="recreatePdf('${cierre.id}')">PDF</button>
                        <button class="btn btn-sm btn-warning" onclick="openEditCierreModal('${cierre.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCierre('${cierre.id}')">Eliminar</button>
                    </div>
                `;
            }

            row.innerHTML = `
                <td>${cierre.date}</td>
                <td><small><b>${cierre.user_name}</b></small></td>
                <td>${parseFloat(cierre.efectivo || 0).toFixed(2)}</td>
                <td>${parseFloat(cierre.debito || 0).toFixed(2)}</td>
                <td>${parseFloat(cierre.credito || 0).toFixed(2)}</td>
                <td>${parseFloat(cierre.pagoMovil || 0).toFixed(2)}</td>
                <td>${parseFloat(cierre.transferencias || 0).toFixed(2)}</td>
                <td>${parseFloat(cierre.divisas || 0).toFixed(2)}</td>
                <td>${parseFloat(cierre.zelle || 0).toFixed(2)}</td>
                <td>Bs ${parseFloat(cierre.totalVes || 0).toFixed(2)}<br>$${parseFloat(cierre.totalUsd || 0).toFixed(2)}</td>
                <td><small>${cierre.description || '-'}</small></td>
                <td>${cierre.image ? `<img src="${cierre.image}" class="img-preview" onclick="showImage('${cierre.image}')">` : '-'}</td>
                ${userIsAdmin ? `<td>${actionButtonsHtml}</td>` : ''}`;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error("Error fetching cierres:", err);
    }
}

function showImage(imageSrc) {
    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageSrc;
    const modal = new bootstrap.Modal(document.getElementById('imageModal'));
    modal.show();
}

async function deleteCierre(cierreId) {
    const user = getCurrentUser();
    if (!user || user.role_level < 3) {
        alert('No tienes permisos para realizar esta acción.');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar este cierre? Esta acción es irreversible.')) {
        try {
            const response = await fetch(`${BASE_URL}/cierres/${cierreId}`, { method: 'DELETE' });
            if (response.ok) {
                fetchCierres(); 
                alert('Cierre eliminado exitosamente.');
            } else {
                alert('Error al eliminar.');
            }
        } catch(err) {
            alert('Error de red al intentar eliminar.');
        }
    }
}

async function recreatePdf(id) {
    try {
        const response = await fetch(`${BASE_URL}/cierres/${id}`);
        if (response.ok) {
            const cierre = await response.json();
            generatePDF(cierre, cierre.user_name || "Usuario");
        }
    } catch(err) {
        alert("Error al regenerar PDF.");
    }
}

async function openEditCierreModal(id) {
    try {
        const response = await fetch(`${BASE_URL}/cierres/${id}`);
        if (response.ok) {
            const cierre = await response.json();
            document.getElementById('editCierreId').value = id;
            document.getElementById('editEfectivo').value = cierre.efectivo;
            document.getElementById('editDebito').value = cierre.debito;
            document.getElementById('editCredito').value = cierre.credito;
            document.getElementById('editPagoMovil').value = cierre.pagoMovil;
            document.getElementById('editTransferencias').value = cierre.transferencias;
            document.getElementById('editDivisas').value = cierre.divisas;
            document.getElementById('editZelle').value = cierre.zelle;
            document.getElementById('editTasa').value = cierre.tasa;
            document.getElementById('editDate').value = cierre.date;
            document.getElementById('editDescription').value = cierre.description;
            document.getElementById('editImage').value = cierre.image;

            const modal = new bootstrap.Modal(document.getElementById('editCierreModal'));
            modal.show();
        }
    } catch(err) {
        alert("Error al cargar cierre.");
    }
}

async function updateCierre() {
    const id = document.getElementById('editCierreId').value;
    const efectivo = parseFloat(document.getElementById('editEfectivo').value) || 0;
    const debito = parseFloat(document.getElementById('editDebito').value) || 0;
    const credito = parseFloat(document.getElementById('editCredito').value) || 0;
    const pagoMovil = parseFloat(document.getElementById('editPagoMovil').value) || 0;
    const transferencias = parseFloat(document.getElementById('editTransferencias').value) || 0;
    const divisas = parseFloat(document.getElementById('editDivisas').value) || 0;
    const zelle = parseFloat(document.getElementById('editZelle').value) || 0;
    const tasa = parseFloat(document.getElementById('editTasa').value) || 0;
    const date = document.getElementById('editDate').value;
    const description = document.getElementById('editDescription').value;
    const image = document.getElementById('editImage').value;

    const totalVes = efectivo + debito + credito + pagoMovil + transferencias + (divisas + zelle) * tasa;
    const totalUsd = divisas + zelle + (efectivo + debito + credito + pagoMovil + transferencias) / (tasa || 1);

    const payload = {
        efectivo, debito, credito, pagoMovil, transferencias, divisas, zelle, tasa,
        totalUsd: totalUsd.toFixed(2),
        totalVes: totalVes.toFixed(2),
        date, description, image
    };

    try {
        const response = await fetch(`${BASE_URL}/cierres/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('editCierreModal')).hide();
            fetchCierres();
            alert('Cierre actualizado correctamente.');
        } else {
            alert('Error al actualizar cierre.');
        }
    } catch(err) {
        alert('Error de red.');
    }
}
