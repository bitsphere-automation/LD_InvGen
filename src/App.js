import React, { useState } from "react";
import jsPDF from "jspdf";
import InvoiceForm from "./InvoiceForm";
import InvoicePreview from "./InvoicePreview";

const generateInvoiceNumber = () => {
  const date = new Date();
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
  const unique = String(Math.floor(1000 + Math.random()*9000));
  return `INV-${yyyymmdd}-${unique}`;
}

export default function App() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: generateInvoiceNumber(),
    client: {},
    project: {},
    items: [],
    date: (new Date()).toISOString().substring(0,10)
  });

  const handleChange = (data) => setInvoiceData((prev) => ({ ...prev, ...data }));

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Define page dimensions and margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - (margin * 2); // Content area width
    
    let yPosition = 20;
    const lineHeight = 7;
    
    // Helper function to add wrapped text
    const addWrappedText = (text, x, y, maxW) => {
      const lines = doc.splitTextToSize(text, maxW);
      doc.text(lines, x, y);
      return lines.length * lineHeight; // Return height used
    };
    
    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };
    
    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("INVOICE", margin, yPosition);
    yPosition += lineHeight + 3;
    
    // Invoice Details
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const invoiceNumHeight = addWrappedText(
      `Invoice #: ${invoiceData.invoiceNumber}`, 
      margin, 
      yPosition, 
      maxWidth
    );
    yPosition += invoiceNumHeight;
    
    const dateHeight = addWrappedText(
      `Date: ${invoiceData.date}`, 
      margin, 
      yPosition, 
      maxWidth
    );
    yPosition += dateHeight + 3;
    
    // Client Information
    checkPageBreak(30);
    doc.setFont(undefined, 'bold');
    doc.text("Bill To:", margin, yPosition);
    yPosition += lineHeight;
    
    doc.setFont(undefined, 'normal');
    const clientName = invoiceData.client.name || "N/A";
    const clientHeight = addWrappedText(
      clientName, 
      margin, 
      yPosition, 
      maxWidth
    );
    yPosition += clientHeight;
    
    if (invoiceData.client.email) {
      const emailHeight = addWrappedText(
        invoiceData.client.email, 
        margin, 
        yPosition, 
        maxWidth
      );
      yPosition += emailHeight;
    }
    yPosition += 3;
    
    // Project Information
    checkPageBreak(30);
    doc.setFont(undefined, 'bold');
    doc.text("Project:", margin, yPosition);
    yPosition += lineHeight;
    
    doc.setFont(undefined, 'normal');
    const projectName = invoiceData.project.name || "N/A";
    const projectHeight = addWrappedText(
      projectName, 
      margin, 
      yPosition, 
      maxWidth
    );
    yPosition += projectHeight;
    
    if (invoiceData.project.desc) {
      const descHeight = addWrappedText(
        invoiceData.project.desc, 
        margin, 
        yPosition, 
        maxWidth
      );
      yPosition += descHeight;
    }
    yPosition += 5;
    
    // Items Table Header
    checkPageBreak(50);
    doc.setFont(undefined, 'bold');
    doc.text("Item", margin, yPosition);
    doc.text("Qty", pageWidth - 80, yPosition);
    doc.text("Price", pageWidth - 55, yPosition);
    doc.text("Amount", pageWidth - 30, yPosition, { align: 'right' });
    yPosition += lineHeight;
    
    // Draw line under header
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 2;
    
    // Items
    doc.setFont(undefined, 'normal');
    let total = 0;
    
    invoiceData.items.forEach((item, i) => {
      checkPageBreak(15);
      
      const amount = item.quantity * item.unitPrice;
      total += amount;
      
      // Description (with wrapping if needed)
      const descLines = doc.splitTextToSize(item.description || "Item", maxWidth - 90);
      doc.text(descLines, margin, yPosition);
      
      // Quantity, Price, Amount (right-aligned)
      doc.text(String(item.quantity), pageWidth - 80, yPosition);
      doc.text(`$${item.unitPrice.toFixed(2)}`, pageWidth - 55, yPosition);
      doc.text(`$${amount.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
      
      yPosition += descLines.length * lineHeight;
    });
    
    // Total
    yPosition += 3;
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 2;
    
    checkPageBreak(15);
    doc.setFont(undefined, 'bold');
    doc.text("Total:", pageWidth - 60, yPosition);
    doc.text(`$${total.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
    
    // Footer
    yPosition += 15;
    checkPageBreak(20);
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    const footerText = "Thank you for your business!";
    doc.text(footerText, pageWidth / 2, yPosition, { align: 'center' });
    
    // Save PDF
    doc.save(`${invoiceData.invoiceNumber}.pdf`);
  }

  return (
    <div style={{maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif"}}>
      <h2>Dynamic React Invoice Generator</h2>
      <InvoiceForm data={invoiceData} onChange={handleChange} />
      <button onClick={handleDownload} style={{
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
        marginBottom: "20px"
      }}>
        Download PDF
      </button>
      <InvoicePreview data={invoiceData} />
    </div>
  );
}
