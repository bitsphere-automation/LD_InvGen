import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import InvoiceForm from "./InvoiceForm";
import InvoicePreview from "./InvoicePreview";
// Update paths to your actual logos in src/assets
import logoLeadsToCompany from "./assets/logo_leads_to_company.png";
import logoLeadsDigital from "./assets/logo_leads_digital.png";

const currencySymbols = { INR: "₹", USD: "$" };

const generateInvoiceNumber = ({ projectCode, projectType, year, serialNumber }) => {
  return `Invoice-${projectCode}-${projectType}-${year}-${serialNumber}`;
};

const getLogoByProjectCode = (projectCode) => {
  if (projectCode === "LD") return logoLeadsDigital;
  if (projectCode === "LTC") return logoLeadsToCompany;
  return logoLeadsToCompany;
};

const getCompanyNameByProjectCode = (projectCode) => {
  if (projectCode === "LD") return "Leads Digital";
  if (projectCode === "LTC") return "Leads To Company";
  return "Leads To Company";
};

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
  });

  useEffect(() => {
    const year = new Date(invoiceData.date).getFullYear();
    const invoiceNumber = generateInvoiceNumber({
      projectCode: invoiceData.project.projectCode || "LD",
      projectType: invoiceData.project.projectType || "OvP",
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
  const gstAmount = subtotal * (Number(invoiceData.gstPercent) || 0) / 100;
  const totalAfterGST = subtotal + gstAmount;
  const balanceDue = totalAfterGST - Number(invoiceData.paymentMade);
//const currencySymbols = { INR: "\u20B9", USD: "$" };
const currencySymbols = { INR: "Rs.", USD: "$" };
  const currencySymbol = currencySymbols[invoiceData.currency] || "";
  const handleChange = (data) => setInvoiceData((prev) => ({ ...prev, ...data }));
  const incrementSerial = () =>
    setInvoiceData((prev) => ({ ...prev, serialNumber: prev.serialNumber + 1 }));

  const handleDownload = () => {
    const doc = new jsPDF();

    // Initialize page dimensions immediately after doc creation
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const leftMargin = 10;
    let vertical = 10;
    const lineHeight = 8;

    const logoImage = getLogoByProjectCode(invoiceData.project.projectCode);
    const companyHeader = getCompanyNameByProjectCode(invoiceData.project.projectCode);

    // Logo natural dimensions & sizing
    const desiredLogoHeight = 25;
    let logoOriginalWidth = 500;
    let logoOriginalHeight = 500;

    if (invoiceData.project.projectCode === "LD") {
      logoOriginalWidth = 2560;
      logoOriginalHeight = 2560;
    }

    const aspectRatio = logoOriginalWidth / logoOriginalHeight;
    const desiredLogoWidth = desiredLogoHeight * aspectRatio;

    // Draw logo preserving aspect ratio
    if (logoImage) {
      doc.addImage(logoImage, "PNG", leftMargin, vertical, desiredLogoWidth, desiredLogoHeight);
    }
    vertical += desiredLogoHeight + 4; // spacing after logo

    // Centered bold header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const textWidth = doc.getTextWidth(companyHeader);
    const xCenter = (pageWidth - textWidth) / 2;
    doc.text(companyHeader, xCenter, vertical - 8);
    doc.setFont("helvetica", "normal");

    // Company address and contact info
    doc.setFontSize(10);
    doc.text("S.M. Sarani, Kolkata", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("PIN-700127", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("8296343757 / 8240245144", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("support@leadstocompany.com", leftMargin, vertical);
    vertical += lineHeight * 2;

    // Right side Invoice info
    const rightStart = pageWidth / 2 + 20;
    vertical = 10 + desiredLogoHeight + 4; // align with logo bottom space

    doc.setFontSize(16);
    doc.text("Invoice", rightStart, vertical);
    vertical += lineHeight + 2;

    let invoiceNumberFormatted = invoiceData.invoiceNumber;
    if (invoiceData.invoiceNumber) {
      const parts = invoiceData.invoiceNumber.split("-");
      if (parts.length === 5) {
        invoiceNumberFormatted = `${parts}/${parts}/${parts}-${parts}`;
      }
    }
    doc.setFontSize(12);
    doc.text(`# ${invoiceNumberFormatted}`, rightStart, vertical);
    vertical += lineHeight;
    doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, rightStart, vertical);
    vertical += lineHeight;
    doc.text(`Project: ${invoiceData.project.name || "Ongoing Work"}`, rightStart, vertical);
    vertical += lineHeight;
    doc.text(`Currency: ${currencySymbol}`, rightStart, vertical);
    vertical += lineHeight * 2;

    // Client info left side
    doc.setFontSize(12);
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

    // Table headers
    doc.setFontSize(12);
    doc.text("Item", leftMargin, vertical);
    doc.text("Quantity", leftMargin + 80, vertical);
    doc.text("Rate", leftMargin + 110, vertical);
    doc.text("Amount", leftMargin + 150, vertical);
    vertical += lineHeight;
    doc.setLineWidth(0.5);
    doc.line(leftMargin, vertical - 4, leftMargin + 180, vertical - 4);

    // Items rows
    invoiceData.items.forEach((item) => {
      const amount = Number(item.quantity) * Number(item.unitPrice);
      doc.text(item.description, leftMargin, vertical);
      doc.text(String(item.quantity), leftMargin + 80, vertical);
      doc.text(`${currencySymbol}${Number(item.unitPrice).toFixed(2)}`, leftMargin + 110, vertical);
      doc.text(`${currencySymbol}${amount.toFixed(2)}`, leftMargin + 150, vertical);
      vertical += lineHeight;
    });

    // Calculation rows
    vertical += 5;
    doc.text("Subtotal:", leftMargin + 110, vertical);
    doc.text(`${currencySymbol}${subtotal.toFixed(2)}`, leftMargin + 150, vertical);
    vertical += lineHeight;
    doc.text(`GST (${invoiceData.gstPercent}%):`, leftMargin + 110, vertical);
    doc.text(`${currencySymbol}${gstAmount.toFixed(2)}`, leftMargin + 150, vertical);
    vertical += lineHeight;
    doc.setFont("bold");
    doc.text("Total:", leftMargin + 110, vertical);
    doc.text(`${currencySymbol}${totalAfterGST.toFixed(2)}`, leftMargin + 150, vertical);
    doc.setFont("normal");
    vertical += lineHeight;
    doc.text("Payment Made:", leftMargin + 110, vertical);
    doc.text(`${currencySymbol}${Number(invoiceData.paymentMade).toFixed(2)}`, leftMargin + 150, vertical);
    vertical += lineHeight;
    doc.setTextColor(255, 0, 0);
    doc.text("Balance Due:", leftMargin + 110, vertical);
    doc.text(`${currencySymbol}${balanceDue.toFixed(2)}`, leftMargin + 150, vertical);
    doc.setTextColor(0, 0, 0);
    vertical += lineHeight * 2;

    // Terms section
    doc.setFontSize(14);
    doc.text("Terms", leftMargin, vertical);
    vertical += lineHeight;
    doc.setFontSize(11);
    doc.text("Payments will be made to the following account through NEFT:", leftMargin, vertical, { maxWidth: 190 });
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
    const yBottom = pageHeight - 40;
    doc.setFontSize(12);
    doc.text(`Prepared by: ${invoiceData.preparedBy || ""}`, pageWidth - 80, yBottom);
    doc.text(`Verified by: ${invoiceData.verifiedBy || ""}`, pageWidth - 80, yBottom + 8);

    doc.save(`${invoiceData.invoiceNumber}.pdf`);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>Dynamic React Invoice Generator</h2>
      <InvoiceForm data={invoiceData} onChange={handleChange} />
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
