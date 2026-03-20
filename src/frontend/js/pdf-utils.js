// pdf-utils.js

function generatePDF(cierre, userName = "") {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let config = {};
    try {
        config = JSON.parse(localStorage.getItem('globalConfig') || '{}');
    } catch (e) {}

    const primaryBlue = config.primary_color || '#1E3A8A';
    const accentOrange = config.secondary_color || '#FB923C';
    const textDark = '#172554';

    doc.setFillColor(primaryBlue);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(24);
    doc.setTextColor('#fff');
    doc.setFont('helvetica', 'bold');
    
    // Si hay un logo de empresa, dibujarlo, si no dibujar texto.
    if (config.logo_base64) {
        try {
            doc.addImage(config.logo_base64, 'JPEG', 15, 5, 40, 30);
        } catch(err) {
            console.warn("Could not add logo to PDF:", err);
        }
        doc.text('Cierre Diario', 105, 20, { align: 'center' });
    } else {
        doc.text('Cierre Diario - CIERREX', 105, 20, { align: 'center' });
    }

    doc.setFontSize(14);
    doc.setTextColor(accentOrange);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${cierre.date} ${userName ? '| Empleado: ' + userName : ''}`, 105, 30, { align: 'center' });

    doc.setDrawColor(accentOrange);
    doc.setLineWidth(1);
    doc.line(20, 45, 190, 45);

    const startY = 55;
    doc.setFontSize(12);
    doc.setTextColor(textDark);
    doc.setFont('helvetica', 'bold');

    doc.setFillColor('#f0f0f0');
    doc.rect(20, startY, 80, 10, 'F');
    doc.rect(100, startY, 90, 10, 'F');
    doc.text('Forma de Pago', 25, startY + 7);
    doc.text('Monto', 105, startY + 7);

    let y = startY + 10;
    const data = [
        ['Efectivo (Bs)', parseFloat(cierre.efectivo).toFixed(2)],
        ['Débito (Bs)', parseFloat(cierre.debito).toFixed(2)],
        ['Crédito (Bs)', parseFloat(cierre.credito).toFixed(2)],
        ['Pago Móvil (Bs)', parseFloat(cierre.pagoMovil).toFixed(2)],
        ['Transferencias (Bs)', parseFloat(cierre.transferencias).toFixed(2)],
        ['Divisas (USD)', parseFloat(cierre.divisas).toFixed(2)],
        ['Zelle (USD)', parseFloat(cierre.zelle).toFixed(2)],
        ['Tasa del Dólar (Bs/USD)', parseFloat(cierre.tasa).toFixed(2)],
        ['Total USD', parseFloat(cierre.totalUsd).toFixed(2)],
        ['Total Bs', parseFloat(cierre.totalVes).toFixed(2)]
    ];

    data.forEach(([categoria, valor], index) => {
        const rowColor = index % 2 === 0 ? '#fff' : '#f9f9f9';
        doc.setFillColor(rowColor);
        doc.rect(20, y, 80, 10, 'F');
        doc.rect(100, y, 90, 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.text(categoria, 25, y + 7);
        doc.text(String(valor), 105, y + 7);
        y += 10;
    });

    doc.setDrawColor(primaryBlue);
    doc.line(20, y + 5, 190, y + 5);

    doc.setFontSize(12);
    doc.setTextColor(textDark);
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción:', 20, y + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(cierre.description || 'Sin descripción', 20, y + 22, { maxWidth: 170 });
    y += 30;

    if (cierre.image && cierre.image.includes('data:image')) {
        doc.setFontSize(14);
        doc.setTextColor(primaryBlue);
        doc.setFont('helvetica', 'bold');
        doc.text('Comprobante:', 20, y + 15);
        const imgWidth = 80;
        const imgHeight = 80;
        try {
            doc.addImage(cierre.image, 'JPEG', 20, y + 20, imgWidth, imgHeight);
        } catch(err) {
            console.warn("Could not add closure image to PDF:", err);
        }
        y += 105;
    } else {
        doc.setFontSize(12);
        doc.setTextColor(textDark);
        doc.text('Sin comprobante adjunto.', 20, y + 15);
        y += 20;
    }

    doc.setDrawColor(primaryBlue);
    doc.line(20, 280, 190, 280);
    doc.setFontSize(10);
    doc.setTextColor(textDark);
    doc.text('© 2025 CIERREX', 105, 290, { align: 'center' });
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, 295, { align: 'center' });

    doc.save(`Cierre_Diario_${cierre.date}.pdf`);
}
