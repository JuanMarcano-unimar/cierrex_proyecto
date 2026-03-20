// cierrex.js

// Actualizar totales
function updateTotals() {
    const efectivo = parseFloat(document.getElementById('efectivo').value) || 0;
    const debito = parseFloat(document.getElementById('debito').value) || 0;
    const credito = parseFloat(document.getElementById('credito').value) || 0;
    const pagoMovil = parseFloat(document.getElementById('pagoMovil').value) || 0;
    const transferencias = parseFloat(document.getElementById('transferencias').value) || 0;
    const divisas = parseFloat(document.getElementById('divisas').value) || 0;
    const zelle = parseFloat(document.getElementById('zelle').value) || 0;
    const tasa = parseFloat(document.getElementById('tasa').value) || 0;

    const totalVes = efectivo + debito + credito + pagoMovil + transferencias + (divisas + zelle) * tasa;
    const totalUsd = divisas + zelle + (efectivo + debito + credito + pagoMovil + transferencias) / (tasa || 1);

    document.getElementById('totalUsd').textContent = totalUsd.toFixed(2);
    document.getElementById('totalBs').textContent = totalVes.toFixed(2);
}

// Manejar carga de imagen
function handleImageUpload(event) {
    const file = event.target.files[0];
    const imagePreview = document.getElementById('imagePreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('d-none');
            imagePreview.dataset.base64 = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.src = '';
        imagePreview.classList.add('d-none');
        delete imagePreview.dataset.base64;
    }
}

// Registrar cierre
async function registerCierre() {
    const alertBox = document.getElementById('cierreAlert');
    alertBox.style.display = 'none';

    const user = getCurrentUser();
    if (!user) return;

    const efectivo = parseFloat(document.getElementById('efectivo').value) || 0;
    const debito = parseFloat(document.getElementById('debito').value) || 0;
    const credito = parseFloat(document.getElementById('credito').value) || 0;
    const pagoMovil = parseFloat(document.getElementById('pagoMovil').value) || 0;
    const transferencias = parseFloat(document.getElementById('transferencias').value) || 0;
    const divisas = parseFloat(document.getElementById('divisas').value) || 0;
    const zelle = parseFloat(document.getElementById('zelle').value) || 0;
    const tasa = parseFloat(document.getElementById('tasa').value) || 0;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value.trim();
    const imagePreview = document.getElementById('imagePreview');
    const imageBase64 = imagePreview.dataset.base64 || '';

    const totalVes = efectivo + debito + credito + pagoMovil + transferencias + (divisas + zelle) * tasa;
    const totalUsd = divisas + zelle + (efectivo + debito + credito + pagoMovil + transferencias) / (tasa || 1);

    if (totalVes === 0 && !imageBase64 && !description) {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Debe ingresar al menos un monto, una imagen o una descripción.';
        alertBox.style.display = 'block';
        return;
    }
    if (tasa <= 0) {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'La tasa del dólar debe ser mayor a 0.';
        alertBox.style.display = 'block';
        return;
    }
    if (!date) {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Debe seleccionar una fecha.';
        alertBox.style.display = 'block';
        return;
    }

    const cierre = {
        user_id: user.id,
        efectivo,
        debito,
        credito,
        pagoMovil,
        transferencias,
        divisas,
        zelle,
        tasa,
        totalUsd: totalUsd.toFixed(2),
        totalVes: totalVes.toFixed(2),
        date,
        description,
        image: imageBase64
    };

    try {
        const response = await fetch(`${BASE_URL}/cierres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cierre)
        });

        if (response.ok) {
            alertBox.className = 'alert alert-success';
            alertBox.textContent = `Cierre registrado: ${totalVes.toFixed(2)} Bs / ${totalUsd.toFixed(2)} USD`;
            alertBox.style.display = 'block';

            setTimeout(() => {
                document.getElementById('cierreForm').reset();
                imagePreview.classList.add('d-none');
                delete imagePreview.dataset.base64;
                updateTotals();
                if (user.role_level > 1) {
                    window.location.href = 'historial.html';
                }
            }, 1500);
        } else {
            const data = await response.json();
            alertBox.className = 'alert alert-danger';
            alertBox.textContent = data.error || 'Error al registrar el cierre.';
            alertBox.style.display = 'block';
        }
    } catch (error) {
        console.error(error);
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Error de conexión con el servidor.';
        alertBox.style.display = 'block';
    }
}

// Exportar cierre actual a PDF
function exportCurrentCierreToPdf() {
    const user = getCurrentUser();
    const alertBox = document.getElementById('cierreAlert');
    alertBox.style.display = 'none';

    const efectivo = parseFloat(document.getElementById('efectivo').value) || 0;
    const debito = parseFloat(document.getElementById('debito').value) || 0;
    const credito = parseFloat(document.getElementById('credito').value) || 0;
    const pagoMovil = parseFloat(document.getElementById('pagoMovil').value) || 0;
    const transferencias = parseFloat(document.getElementById('transferencias').value) || 0;
    const divisas = parseFloat(document.getElementById('divisas').value) || 0;
    const zelle = parseFloat(document.getElementById('zelle').value) || 0;
    const tasa = parseFloat(document.getElementById('tasa').value) || 0;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value.trim();
    const imagePreview = document.getElementById('imagePreview');
    const imageBase64 = imagePreview.dataset.base64 || '';

    const totalVes = efectivo + debito + credito + pagoMovil + transferencias + (divisas + zelle) * tasa;
    const totalUsd = divisas + zelle + (efectivo + debito + credito + pagoMovil + transferencias) / (tasa || 1);

    if (totalVes === 0 && !imageBase64 && !description) {
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Debe ingresar al menos un monto, una imagen o una descripción para exportar.';
        alertBox.style.display = 'block';
        return;
    }

    const cierreDataForPdf = {
        efectivo, debito, credito, pagoMovil, transferencias, divisas, zelle, tasa,
        totalUsd: totalUsd.toFixed(2),
        totalVes: totalVes.toFixed(2),
        date, description, image: imageBase64
    };

    try {
        generatePDF(cierreDataForPdf, user ? user.name : "Usuario");
        alertBox.className = 'alert alert-success';
        alertBox.textContent = 'PDF generado y descargado.';
        alertBox.style.display = 'block';
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alertBox.className = 'alert alert-danger';
        alertBox.textContent = 'Error al generar el PDF.';
        alertBox.style.display = 'block';
    }
}

// Fetch BCV auto
async function fetchBcvRate() {
    const btn = document.getElementById('fetchBcvBtn');
    const alertBox = document.getElementById('cierreAlert');
    alertBox.style.display = 'none';
    btn.disabled = true;
    btn.textContent = '...';

    try {
        const response = await fetch(`${BASE_URL}/bcv`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.tasa) {
                document.getElementById('tasa').value = data.tasa.toFixed(2);
                updateTotals();
                alertBox.className = 'alert alert-success mt-2';
                alertBox.textContent = `Tasa del BCV (${data.tasa}) aplicada correctamente.`;
                alertBox.style.display = 'block';
                setTimeout(() => alertBox.style.display = 'none', 3000);
            }
        } else {
            alertBox.className = 'alert alert-danger mt-2';
            alertBox.textContent = 'No se pudo obtener la tasa del BCV en este momento.';
            alertBox.style.display = 'block';
        }
    } catch (err) {
        alertBox.className = 'alert alert-danger mt-2';
        alertBox.textContent = 'Error de red al consultar BCV.';
        alertBox.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Consultar BCV';
    }
}

// Configuración inicial
document.addEventListener('DOMContentLoaded', function () {
    const inputs = ['efectivo', 'debito', 'credito', 'pagoMovil', 'transferencias', 'divisas', 'zelle', 'tasa'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateTotals);
    });
    const imgInput = document.getElementById('image');
    if (imgInput) imgInput.addEventListener('change', handleImageUpload);
    
    const regBtn = document.getElementById('registerCierreBtn');
    if (regBtn) regBtn.addEventListener('click', registerCierre);

    const fetchBcvBtn = document.getElementById('fetchBcvBtn');
    if (fetchBcvBtn) fetchBcvBtn.addEventListener('click', fetchBcvRate);

    const user = getCurrentUser();
    const exportBtn = document.getElementById('exportCierreBtn');
    if (exportBtn && user && user.role_level >= 2) {
        exportBtn.addEventListener('click', exportCurrentCierreToPdf);
    }

    updateTotals();
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.valueAsDate = new Date();
});
