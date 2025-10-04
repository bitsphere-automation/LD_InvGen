import React from "react";

const styles = {
  container: {
    maxWidth: "800px",
    margin: "20px auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    border: "1px solid #ddd",
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#fff",
    position: "relative"
  },
  header: { borderBottom: "2px solid #000", marginBottom: 20, paddingBottom: 10 },
  invoiceType: { textAlign: "center", fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  companyName: { fontSize: 28, fontWeight: "bold" },
  companyDetails: { fontSize: 12, marginTop: 4 },
  section: { marginBottom: 20 },
  itemTable: { width: "100%", borderCollapse: "collapse", marginBottom: 20 },
  th: { borderBottom: "1px solid #aaa", textAlign: "left", padding: "8px 6px", fontWeight: "bold" },
  td: { borderBottom: "1px solid #eee", padding: "8px 6px" },
  totalsRow: { fontWeight: "bold" },
  notes: { fontSize: 12, marginTop: 15, borderTop: "1px dashed #ccc", paddingTop: 10 },
};

export default function InvoicePreview({ data }) {
  const {
    invoiceNumber,
    date,
    client,
    project,
    items,
    subtotal,
    gstPercent,
    gstAmount,
    totalAfterGST,
    paymentMade = 0,
    balanceDue,
    currencySymbol = "₹",
    logo,
    preparedBy,
    verifiedBy,
    invoiceType = "Tax Invoice",
  } = data;

  let invoiceNumberFormatted = invoiceNumber;
  if (invoiceNumber) {
    const parts = invoiceNumber.split("-");
    if (parts.length === 5) {
      invoiceNumberFormatted = `# ${parts[1]}/${parts[2]}/${parts[3]}-${parts[4]}`;
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.invoiceType}>
        {invoiceType}
      </div>
      {logo && (
        <img src={logo} alt="Logo" style={{ width: 120, marginBottom: 16 }} />
      )}
      <div style={styles.header}>
        <div style={styles.companyName}>Leads To Company</div>
        <div style={styles.companyDetails}>
          S.M. Sarani, Kolkata<br />
          PIN-700127<br />
          8296343757 / 8240245144<br />
          support@leadstocompany.com
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", ...styles.section }}>
        <div>
          <div><strong>Invoice Number:</strong> {invoiceNumberFormatted}</div>
          <div><strong>Date:</strong> {new Date(date).toLocaleDateString()}</div>
          <div><strong>Project:</strong> {project.name || "Ongoing Work"}</div>
          <div><strong>Currency:</strong> {currencySymbol === "₹" ? "INR" : "USD"}</div>
        </div>
        <div>
          <div><strong>Bill To:</strong></div>
          <div>{client.name}</div>
          <div>{client.address}</div>
          <div>{client.city}, {client.state}</div>
          <div>{client.country} {client.zip}</div>
        </div>
      </div>
      <table style={styles.itemTable}>
        <thead>
          <tr>
            <th style={styles.th}>Item</th>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>Rate</th>
            <th style={styles.th}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: 15 }}>
                No items added
              </td>
            </tr>
          )}
          {items.map((item, i) => {
            const amount = item.quantity * item.unitPrice;
            return (
              <tr key={i}>
                <td style={styles.td}>{item.description}</td>
                <td style={styles.td}>{item.quantity}</td>
                <td style={styles.td}>{currencySymbol}{item.unitPrice.toFixed(2)}</td>
                <td style={styles.td}>{currencySymbol}{amount.toFixed(2)}</td>
              </tr>
            );
          })}
          <tr>
            <td colSpan="3" style={styles.td}>Subtotal:</td>
            <td style={styles.td}>{currencySymbol}{subtotal.toFixed(2)}</td>
          </tr>
          {invoiceType === "Tax Invoice" && (
            <tr>
              <td colSpan="3" style={styles.td}>GST ({gstPercent}%):</td>
              <td style={styles.td}>{currencySymbol}{gstAmount.toFixed(2)}</td>
            </tr>
          )}
          <tr style={styles.totalsRow}>
            <td colSpan="3" style={{ ...styles.td, textAlign: "right" }}>Total:</td>
            <td style={styles.td}>{currencySymbol}{totalAfterGST.toFixed(2)}</td>
          </tr>
          <tr style={styles.totalsRow}>
            <td colSpan="3" style={{ ...styles.td, textAlign: "right" }}>Payments Made:</td>
            <td style={styles.td}>{currencySymbol}{Number(paymentMade).toFixed(2)}</td>
          </tr>
          <tr style={styles.totalsRow}>
            <td colSpan="3" style={{ ...styles.td, textAlign: "right" }}>Balance Due:</td>
            <td style={{ ...styles.td, color: "red" }}>{currencySymbol}{balanceDue.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div style={styles.notes}>
        <h4>Terms</h4>
        <p>Payments will be made to the following account through NEFT:</p>
        <p>
          MANAS DATTA<br />
          176010100013621<br />
          Union Bank Of India<br />
          IFSC Code : UBIN0911488<br />
          OR<br />
          UPI: mansumseo-2@oksbi
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
        <div style={{ textAlign: "right", marginTop: 28 }}>
          <div>Prepared by: {preparedBy}</div>
          <div>Verified by: {verifiedBy}</div>
        </div>
      </div>
    </div>
  );
}
