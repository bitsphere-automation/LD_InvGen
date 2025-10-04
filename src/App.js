import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import InvoiceForm from "./InvoiceForm";
import InvoicePreview from "./InvoicePreview";
import logoLeadsToCompany from "./assets/logo_leads_to_company.png";
import logoLeadsDigital from "./assets/logo_leads_digital.png";

const currencySymbols = { INR: "Rs.", USD: "$" };

const generateInvoiceNumber = ({ projectCode, projectType, year, serialNumber }) =>
  `Invoice-${projectCode}-${projectType}-${year}-${serialNumber}`;

const getLogoByProjectCode = (projectCode) =>
  projectCode === "LD" ? logoLeadsDigital : logoLeadsToCompany;

const getCompanyNameByProjectCode = (projectCode) =>
  projectCode === "LD" ? "Leads Digital" : "Leads To Company";

export default function App() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    client: {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zip: "",
    },
    project: {
      name: "",
      projectCode: "LD",
      projectType: "OvP",
    },
    items: [],
    date: new Date().toISOString().substring(0, 10),
    serialNumber: 1,
    currency: "INR",
    paymentMade: 0,
    gstPercent: 18,
    preparedBy: "",
    verifiedBy: "",
    invoiceType: "Tax Invoice", // NEW: Controls Tax Invoice / Bill of Supply
  });

  useEffect(() => {
    const year = new Date(invoiceData.date).getFullYear();
    const invoiceNumber = generateInvoiceNumber({
      projectCode: invoiceData.project.projectCode,
      projectType: invoiceData.project.projectType,
      year,
      serialNumber: invoiceData.serialNumber,
    });
    if (invoiceData.invoiceNumber !== invoiceNumber) {
      setInvoiceData((prev) => ({ ...prev, invoiceNumber }));
    }
  }, [
    invoiceData.project.projectCode,
    invoiceData.project.projectType,
    invoiceData.date,
    invoiceData.serialNumber,
  ]);

  // Calculations
  const subtotal = invoiceData.items.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.unitPrice),
    0
  );
  // GST only for Tax Invoice
  const gstAmount = invoiceData.invoiceType === "Tax Invoice"
    ? subtotal * (Number(invoiceData.gstPercent) || 0) / 100
    : 0;
  const totalAfterGST = subtotal + gstAmount;
  const balanceDue = totalAfterGST - Number(invoiceData.paymentMade);
  const currencySymbol = currencySymbols[invoiceData.currency] || "";

  const handleChange = (data) => setInvoiceData((prev) => ({ ...prev, ...data }));
  const handleTypeChange = (type) => setInvoiceData((prev) => ({ ...prev, invoiceType: type }));
  const incrementSerial = () =>
    setInvoiceData((prev) => ({ ...prev, serialNumber: prev.serialNumber + 1 }));

  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Margins and vertical spacing
    const leftMargin = 16;
    const rightMargin = pageWidth - 16;
    let vertical = 18;
    const lineHeight = 8;

    // Company logo and header
    const logoImage = getLogoByProjectCode(invoiceData.project.projectCode);
    const companyHeader = getCompanyNameByProjectCode(invoiceData.project.projectCode);
    const desiredLogoHeight = 22;
    const logoOriginalWidth = invoiceData.project.projectCode === "LD" ? 2560 : 500;
    const logoOriginalHeight = invoiceData.project.projectCode === "LD" ? 2560 : 500;
    const aspectRatio = logoOriginalWidth / logoOriginalHeight;
    const desiredLogoWidth = desiredLogoHeight * aspectRatio;

    // Draw logo and header side by side
    if (logoImage) {
      doc.addImage(logoImage, "PNG", leftMargin, vertical, desiredLogoWidth, desiredLogoHeight);
    }

    // Center the Invoice Type at top
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(invoiceData.invoiceType, pageWidth / 2, vertical + 6, { align: "center" });
    doc.setFontSize(20);
    doc.text(companyHeader, leftMargin + desiredLogoWidth + 10, vertical + 14);

    vertical += desiredLogoHeight + 7;

    // Company address and contact info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("S.M. Sarani, Kolkata | PIN-700127 | 8296343757 / 8240245144 | support@leadstocompany.com", leftMargin, vertical);
    vertical += lineHeight * 2;

    // Invoice meta (right-aligned)
    doc.setFontSize(12);
    doc.text(`# ${invoiceData.invoiceNumber}`, rightMargin - doc.getTextWidth(`# ${invoiceData.invoiceNumber}`), vertical);
    vertical += lineHeight;
    doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, rightMargin - doc.getTextWidth(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`), vertical);
    vertical += lineHeight;
    doc.text(`Project: ${invoiceData.project.name || "Ongoing Work"}`, rightMargin - doc.getTextWidth(`Project: ${invoiceData.project.name || "Ongoing Work"}`), vertical);
    vertical += lineHeight;
    doc.text(`Currency: ${currencySymbol}`, rightMargin - doc.getTextWidth(`Currency: ${currencySymbol}`), vertical);
    vertical += lineHeight * 2;

    // Client Info (left block)
    doc.text("Bill To:", leftMargin, vertical);
    vertical += lineHeight;
    if (invoiceData.client.name) {
      doc.text(invoiceData.client.name, leftMargin, vertical);
      vertical += lineHeight;
    }
    if (invoiceData.client.address) {
      doc.text(invoiceData.client.address, leftMargin, vertical);
      vertical += lineHeight;
    }
    const cityLineArr = [];
    if (invoiceData.client.city) cityLineArr.push(invoiceData.client.city);
    if (invoiceData.client.state) cityLineArr.push(invoiceData.client.state);
    if (invoiceData.client.zip) cityLineArr.push(invoiceData.client.zip);
    if (cityLineArr.length) {
      doc.text(cityLineArr.join(", "), leftMargin, vertical);
      vertical += lineHeight;
    }
    if (invoiceData.client.country) {
      doc.text(invoiceData.client.country, leftMargin, vertical);
      vertical += lineHeight;
    }
    vertical += lineHeight;

    // Table layout: columns
    const colItem = leftMargin;
    const colQty = colItem + 72;
    const colRate = colQty + 30;
    const colAmt = colRate + 38;

    doc.setFontSize(12);
    doc.text("Item", colItem, vertical);
    doc.text("Quantity", colQty, vertical);
    doc.text("Rate", colRate, vertical);
    doc.text("Amount", colAmt, vertical);

    vertical += lineHeight;
    doc.setLineWidth(0.5);
    doc.line(leftMargin, vertical - 4, colAmt + 38, vertical - 4);

    // Items
    invoiceData.items.forEach((item) => {
      const amount = Number(item.quantity) * Number(item.unitPrice);
      doc.text(item.description, colItem, vertical);
      doc.text(String(item.quantity), colQty, vertical);
      doc.text(`${currencySymbol}${Number(item.unitPrice).toFixed(2)}`, colRate, vertical);
      doc.text(`${currencySymbol}${amount.toFixed(2)}`, colAmt, vertical);
      vertical += lineHeight;
    });

    // Calculation rows (handle GST conditional)
    vertical += 4;
    doc.text("Subtotal:", colRate, vertical);
    doc.text(`${currencySymbol}${subtotal.toFixed(2)}`, colAmt, vertical);
    vertical += lineHeight;

    if (invoiceData.invoiceType === "Tax Invoice") {
      doc.text(`GST (${invoiceData.gstPercent}%):`, colRate, vertical);
      doc.text(`${currencySymbol}${gstAmount.toFixed(2)}`, colAmt, vertical);
      vertical += lineHeight;
    }

    doc.setFont("bold");
    doc.text("Total:", colRate, vertical);
    doc.text(`${currencySymbol}${totalAfterGST.toFixed(2)}`, colAmt, vertical);
    doc.setFont("normal");
    vertical += lineHeight;
    doc.text("Payment Made:", colRate, vertical);
    doc.text(`${currencySymbol}${Number(invoiceData.paymentMade).toFixed(2)}`, colAmt, vertical);
    vertical += lineHeight;
    doc.setTextColor(255, 0, 0);
    doc.text("Balance Due:", colRate, vertical);
    doc.text(`${currencySymbol}${balanceDue.toFixed(2)}`, colAmt, vertical);
    doc.setTextColor(0, 0, 0);
    vertical += lineHeight * 2;

    // Terms
    doc.setFontSize(14);
    doc.text("Terms", leftMargin, vertical);
    vertical += lineHeight;
    doc.setFontSize(11);
    doc.text("Payments will be made to the following account through NEFT:", leftMargin, vertical, { maxWidth: pageWidth - 2 * leftMargin });
    vertical += lineHeight * 2;
    doc.text("MANAS DATTA", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("176010100013621", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("Union Bank Of India", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("IFSC Code : UBIN0911488", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("OR", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("UPI: mansumseo-2@oksbi", leftMargin, vertical);

    // Prepared By / Verified By at bottom-right
    const yBottom = doc.internal.pageSize.getHeight() - 28;
    doc.setFontSize(12);
    doc.text(`Prepared by: ${invoiceData.preparedBy || ""}`, rightMargin - doc.getTextWidth(`Prepared by: ${invoiceData.preparedBy || ""}`), yBottom);
    doc.text(`Verified by: ${invoiceData.verifiedBy || ""}`, rightMargin - doc.getTextWidth(`Verified by: ${invoiceData.verifiedBy || ""}`), yBottom + 8);

    doc.save(`${invoiceData.invoiceNumber}.pdf`);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>Dynamic React Invoice Generator</h2>
      <InvoiceForm
        data={invoiceData}
        onChange={handleChange}
        onTypeChange={handleTypeChange}
      />
      <button onClick={handleDownload} style={{ marginRight: 10 }}>
        Download PDF
      </button>
      <button onClick={incrementSerial}>Next Invoice Number</button>
      <InvoicePreview
        data={{
          ...invoiceData,
          subtotal,
          gstAmount,
          totalAfterGST,
          balanceDue,
          currencySymbol,
          logo: getLogoByProjectCode(invoiceData.project.projectCode),
          companyHeader: getCompanyNameByProjectCode(invoiceData.project.projectCode),
        }}
      />
    </div>
  );
}
