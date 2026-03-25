// cierrex.js — Lógica del Wizard de 3 pasos para el Registro de Cierres

let currentStep = 1;

// =============================================
//  UTILIDADES
// =============================================
function getValues() {
    return {
        efectivo:       parseFloat(document.getElementById('efectivo').value)       || 0,
        debito:         parseFloat(document.getElementById('debito').value)         || 0,
        credito:        parseFloat(document.getElementById('credito').value)        || 0,
        pagoMovil:      parseFloat(document.getElementById('pagoMovil').value)      || 0,
        transferencias: parseFloat(document.getElementById('transferencias').value) || 0,
        divisas:        parseFloat(document.getElementById('divisas').value)        || 0,
        zelle:          parseFloat(document.getElementById('zelle').value)          || 0,
        tasa:           parseFloat(document.getElementById('tasa').value)           || 0,
        date:           document.getElementById('date').value,
        description:    document.getElementById('description').value.trim(),
    };
}

function calcTotals(v) {
    const totalVes = v.efectivo + v.debito + v.credito + v.pagoMovil + v.transferencias + (v.divisas + v.zelle) * v.tasa;
    const totalUsd = v.divisas + v.zelle + (v.efectivo + v.debito + v.credito + v.pagoMovil + v.transferencias) / (v.tasa || 1);
    return { totalVes, totalUsd };
}

function formatCurrency(num, suffix) {
    return num.toFixed(2) + ' ' + suffix;
}

// =============================================
//  STEP 1 — Totales en vivo
// =============================================
function updateTotals() {
    const v = getValues();
    const { totalVes, totalUsd } = calcTotals(v);
    document.getElementById('totalBs').textContent  = totalVes.toFixed(2);
    document.getElementById('totalUsd').textContent = totalUsd.toFixed(2);
}

// =============================================
//  STEPPER VISUAL
// =============================================
function setStepperState(active) {
    for (let i = 1; i <= 3; i++) {
        const el = document.getElementById(`step-dot-${i}`);
        el.classList.remove('active', 'completed');
        if (i < active)  el.classList.add('completed');
        if (i === active) el.classList.add('active');
    }
}

// =============================================
//  PASO 1 → PASO 2
// =============================================
function goToStep2() {
    const v = getValues();
    const alertBox = document.getElementById('cierreAlert');

    if (v.tasa <= 0) {
        showAlert('danger', 'La tasa del dólar debe ser mayor a 0.');
        return;
    }
    if (!v.date) {
        showAlert('danger', 'Debe seleccionar una fecha.');
        return;
    }

    alertBox.style.display = 'none';
    document.getElementById('wizardStep1').style.display = 'none';
    document.getElementById('wizardStep2').style.display = '';
    currentStep = 2;
    setStepperState(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
//  PASO 2 → PASO 3 (llenar confirmación)
// =============================================
function goToStep3() {
    const v = getValues();
    const { totalVes, totalUsd } = calcTotals(v);

    // — Grilla de montos —
    const fields = [
        { lbl: '💵 Efectivo',       val: formatCurrency(v.efectivo,       'Bs')  },
        { lbl: '💳 Débito',         val: formatCurrency(v.debito,         'Bs')  },
        { lbl: '🏦 Crédito',        val: formatCurrency(v.credito,        'Bs')  },
        { lbl: '📱 Pago Móvil',     val: formatCurrency(v.pagoMovil,      'Bs')  },
        { lbl: '🔄 Transferencias', val: formatCurrency(v.transferencias, 'Bs')  },
        { lbl: '💵 Efectivo USD',   val: formatCurrency(v.divisas,        'USD') },
        { lbl: '💚 Zelle',          val: formatCurrency(v.zelle,          'USD') },
    ];

    const grid = document.getElementById('confirmGrid');
    grid.innerHTML = fields.map(f => `
        <div class="confirm-item">
            <div class="c-lbl">${f.lbl}</div>
            <div class="c-val">${f.val}</div>
        </div>
    `).join('');

    // — Totales —
    document.getElementById('confirmTotalBs').textContent  = totalVes.toFixed(2);
    document.getElementById('confirmTotalUsd').textContent = totalUsd.toFixed(2);

    // — Imagen —
    const imgEl = document.getElementById('imagePreview');
    const imgArea = document.getElementById('confirmImgArea');
    if (imgEl.dataset.base64) {
        imgArea.innerHTML = `<img class="confirm-img-preview" src="${imgEl.dataset.base64}" alt="Comprobante">`;
    } else {
        imgArea.innerHTML = `<div class="confirm-no-img">📷 Sin imagen adjunta</div>`;
    }

    // — Detalles —
    document.getElementById('confirmDate').textContent = v.date || '—';
    document.getElementById('confirmTasa').textContent = v.tasa ? `${v.tasa.toFixed(2)} Bs/USD` : '—';
    document.getElementById('confirmDesc').textContent = v.description || '—';

    document.getElementById('wizardStep2').style.display = 'none';
    document.getElementById('wizardStep3').style.display = '';
    currentStep = 3;
    setStepperState(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackTo(step) {
    document.getElementById(`wizardStep${step + 1}`).style.display = 'none';
    document.getElementById(`wizardStep${step}`).style.display = '';
    currentStep = step;
    setStepperState(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
//  IMAGEN — upload
// =============================================
function handleImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('imagePreview');
        img.src = e.target.result;
        img.dataset.base64 = e.target.result;
        document.getElementById('previewWrap').classList.remove('d-none');
        document.getElementById('uploadZone').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    const img = document.getElementById('imagePreview');
    img.src = '';
    delete img.dataset.base64;
    document.getElementById('previewWrap').classList.add('d-none');
    document.getElementById('uploadZone').style.display = '';
    document.getElementById('imageInputStep2').value = '';
}

// =============================================
//  ALERT HELPER
// =============================================
function showAlert(type, msg) {
    const box = document.getElementById('cierreAlert');
    box.className = `alert alert-${type}`;
    box.textContent = msg;
    box.style.display = 'block';
}

// =============================================
//  REGISTRAR CIERRE (final)
// =============================================
async function registerCierre() {
    const user = getCurrentUser();
    if (!user) return;

    const v = getValues();
    const { totalVes, totalUsd } = calcTotals(v);
    const imageBase64 = document.getElementById('imagePreview').dataset.base64 || '';

    const btn = document.getElementById('registerCierreBtn');
    btn.disabled = true;
    btn.textContent = 'Guardando…';

    const cierre = {
        user_id: user.id,
        efectivo:       v.efectivo,
        debito:         v.debito,
        credito:        v.credito,
        pagoMovil:      v.pagoMovil,
        transferencias: v.transferencias,
        divisas:        v.divisas,
        zelle:          v.zelle,
        tasa:           v.tasa,
        totalUsd:       totalUsd.toFixed(2),
        totalVes:       totalVes.toFixed(2),
        date:           v.date,
        description:    v.description,
        image:          imageBase64
    };

    try {
        const response = await fetch(`${BASE_URL}/cierres`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cierre)
        });

        if (response.ok) {
            btn.textContent = 'Enviando Alertas...';
            try {
                // Generar PDF silenciosamente
                const pdfBase64 = typeof generatePDF === 'function' ? generatePDF(cierre, user.name || "Usuario", true) : null;
                // Disparar las notificaciones
                await fetch(`${BASE_URL}/notifications/notify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pdfBase64: pdfBase64, cierreDetails: cierre })
                });
            } catch (notifyErr) {
                console.warn("Fallo al enviar notificaciones:", notifyErr);
            }

            showAlert('success', `✅ Cierre registrado y alertas enviadas.`);
            setTimeout(() => {
                if (user.role_level > 1) {
                    window.location.href = 'historial.html';
                } else {
                    // Reset wizard al paso 1
                    document.getElementById('wizardStep3').style.display = 'none';
                    document.getElementById('wizardStep1').style.display = '';
                    document.getElementById('cierreForm') && document.getElementById('cierreForm').reset();
                    // Reset campos manualmente
                    ['efectivo','debito','credito','pagoMovil','transferencias','divisas','zelle'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.value = '0';
                    });
                    document.getElementById('tasa').value = '36.50';
                    document.getElementById('date').valueAsDate = new Date();
                    document.getElementById('description').value = '';
                    removeImage();
                    updateTotals();
                    currentStep = 1;
                    setStepperState(1);
                }
            }, 1500);
        } else {
            const data = await response.json();
            showAlert('danger', data.error || 'Error al registrar el cierre.');
            btn.disabled = false;
            btn.textContent = '✅ Registrar Cierre';
        }
    } catch (error) {
        console.error(error);
        showAlert('danger', 'Error de conexión con el servidor.');
        btn.disabled = false;
        btn.textContent = '✅ Registrar Cierre';
    }
}

// =============================================
//  EXPORTAR PDF desde paso 3
// =============================================
function exportCurrentCierreToPdf() {
    const user = getCurrentUser();
    const v = getValues();
    const { totalVes, totalUsd } = calcTotals(v);
    const imageBase64 = document.getElementById('imagePreview').dataset.base64 || '';

    if (totalVes === 0 && !imageBase64 && !v.description) {
        showAlert('danger', 'Debe ingresar al menos un monto, una imagen o una descripción.');
        return;
    }

    try {
        generatePDF({ ...v, totalUsd: totalUsd.toFixed(2), totalVes: totalVes.toFixed(2), image: imageBase64 }, user ? user.name : 'Usuario');
        showAlert('success', '📄 PDF generado y descargado.');
        setTimeout(() => document.getElementById('cierreAlert').style.display = 'none', 3000);
    } catch (err) {
        console.error(err);
        showAlert('danger', 'Error al generar el PDF.');
    }
}

// =============================================
//  BCV
// =============================================
async function fetchBcvRate() {
    const btn = document.getElementById('fetchBcvBtn');
    btn.disabled = true;
    btn.textContent = '…';
    document.getElementById('cierreAlert').style.display = 'none';

    try {
        const res = await fetch(`${BASE_URL}/bcv`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.tasa) {
                document.getElementById('tasa').value = data.tasa.toFixed(2);
                updateTotals();
                showAlert('success', `Tasa BCV aplicada: ${data.tasa.toFixed(2)} Bs/USD`);
                setTimeout(() => document.getElementById('cierreAlert').style.display = 'none', 3000);
            }
        } else {
            showAlert('danger', 'No se pudo obtener la tasa del BCV.');
        }
    } catch {
        showAlert('danger', 'Error de red al consultar BCV.');
    } finally {
        btn.disabled = false;
        btn.textContent = '⚡ BCV';
    }
}

// =============================================
//  INIT
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    // Totales en tiempo real
    ['efectivo','debito','credito','pagoMovil','transferencias','divisas','zelle','tasa'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateTotals);
    });

    // Fecha inicial
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.valueAsDate = new Date();

    // Calcular inicial
    updateTotals();

    // Botones de navegación wizard
    document.getElementById('nextStep1Btn').addEventListener('click', goToStep2);
    document.getElementById('backStep2Btn').addEventListener('click', () => goBackTo(1));
    document.getElementById('nextStep2Btn').addEventListener('click', goToStep3);
    document.getElementById('backStep3Btn').addEventListener('click', () => goBackTo(2));

    // Registrar
    document.getElementById('registerCierreBtn').addEventListener('click', registerCierre);

    // BCV
    document.getElementById('fetchBcvBtn').addEventListener('click', fetchBcvRate);

    // PDF (solo roles >= 2)
    const user = getCurrentUser();
    const exportBtn = document.getElementById('exportCierreBtn');
    if (exportBtn) {
        if (user && user.role_level >= 2) {
            exportBtn.addEventListener('click', exportCurrentCierreToPdf);
        } else {
            exportBtn.style.display = 'none';
        }
    }

    // Upload zona de imagen
    const fileInput = document.getElementById('imageInputStep2');
    const uploadZone = document.getElementById('uploadZone');

    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', e => {
        if (e.target.files[0]) handleImageFile(e.target.files[0]);
    });

    // Drag & drop
    uploadZone.addEventListener('dragover', e => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageFile(file);
    });

    document.getElementById('removeImgBtn').addEventListener('click', removeImage);
});
