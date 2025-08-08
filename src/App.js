import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import InvoiceForm from "./InvoiceForm";
import InvoicePreview from "./InvoicePreview";

const currencySymbols = { INR: "₹", USD: "$" };

// Generate invoice number in your custom format
const generateInvoiceNumber = ({ projectCode, projectType, year, serialNumber }) => {
  return `Invoice-${projectCode}-${projectType}-${year}-${serialNumber}`;
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
    currency: "INR",      // Default currency
    paymentMade: 0,       // Payments made so far
  });

  // Update invoiceNumber whenever project code/type/date/serial changes
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

  // Calculate subtotal and balance due
  const subtotal = invoiceData.items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );
  const balanceDue = subtotal - invoiceData.paymentMade;
 
 // Handle partial state update from InvoiceForm
  const handleChange = (data) => {
    setInvoiceData((prev) => ({ ...prev, ...data }));
  };

  // Increment serial number for next invoice
  const incrementSerial = () => {
    setInvoiceData((prev) => ({
      ...prev,
      serialNumber: prev.serialNumber + 1,
    }));
  };
const currencySymbols = { INR: "₹", USD: "$" };
const currencySymbol = currencySymbols[invoiceData.currency] || "";

  // PDF generation with currency symbols included everywhere
  const handleDownload = () => {
    const doc = new jsPDF();
    const currencySymbols = { INR: "₹", USD: "$" };
    const currencySymbol = currencySymbols[invoiceData.currency] || "";

    const leftMargin = 10;
    let vertical = 10;
    const lineHeight = 8;

    // Company info header
    doc.setFontSize(20);
    doc.text("Leads To Company", leftMargin, vertical);
    vertical += lineHeight;
    doc.setFontSize(10);
    doc.text("S.M. Sarani, Kolkata", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("PIN-700127", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("8296343757 / 8240245144", leftMargin, vertical);
    vertical += lineHeight;
    doc.text("support@leadstocompany.com", leftMargin, vertical);
    vertical += lineHeight * 2;

    // Invoice info right aligned
    const pageWidth = doc.internal.pageSize.getWidth();
    const rightStart = pageWidth / 2 + 20;
    vertical = 10;

    doc.setFontSize(16);
    doc.text("Invoice", rightStart, vertical);
    vertical += lineHeight + 2;

    let invoiceNumberFormatted = invoiceData.invoiceNumber;
    if (invoiceData.invoiceNumber) {
      const parts = invoiceData.invoiceNumber.split("-");
      if (parts.length === 5) {
        invoiceNumberFormatted = `${parts[1]}/${parts[2]}/${parts[3]}-${parts[4]}`;
      }
    }

    doc.setFontSize(12);
    doc.text(`# ${invoiceNumberFormatted}`, rightStart, vertical);
    vertical += lineHeight;

    doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, rightStart, vertical);
    vertical += lineHeight;

    doc.text(`Project: ${invoiceData.project.name || "Ongoing Work"}`, rightStart, vertical);
    vertical += lineHeight * 2;

    // Client info left aligned
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
  const amount = item.quantity * item.unitPrice;
  doc.text(item.description, leftMargin, vertical);
  doc.text(String(item.quantity), leftMargin + 80, vertical);
  doc.text(`${currencySymbol}${item.unitPrice.toFixed(2)}`, leftMargin + 110, vertical);  // ₹ for INR
  doc.text(`${currencySymbol}${amount.toFixed(2)}`, leftMargin + 150, vertical);         // ₹ for INR
  vertical += lineHeight;
    });

    vertical += 5;
    doc.text("Subtotal:", leftMargin + 110, vertical);
    doc.text(`${currencySymbol}${subtotal.toFixed(2)}`, leftMargin + 150, vertical);
    vertical += lineHeight;

    doc.text("Payment Made:", leftMargin + 110, vertical);
    doc.text(`${currencySymbol}${invoiceData.paymentMade.toFixed(2)}`, leftMargin + 150, vertical);
    vertical += lineHeight;

    doc.setTextColor(255, 0, 0);
    doc.text("Balance Due:", leftMargin + 110, vertical);
    doc.text(`${currencySymbol}${balanceDue.toFixed(2)}`, leftMargin + 150, vertical);
    doc.setTextColor(0, 0, 0);
    vertical += lineHeight * 2;

    // Terms
    doc.setFontSize(14);
    doc.text("Terms", leftMargin, vertical);
    vertical += lineHeight;
    doc.setFontSize(11);
    doc.text(
      "Payments will be made to the following account through NEFT:",
      leftMargin,
      vertical,
      { maxWidth: 190 }
    );
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
    vertical += lineHeight * 2;

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
          balanceDue,
          currencySymbol,
        }}
      />
    </div>
  );
}
