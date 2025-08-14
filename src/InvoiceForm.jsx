import React from "react";

const currencyOptions = [
  { value: "INR", label: "INR (₹)" },
  { value: "USD", label: "USD ($)" },
];

export default function InvoiceForm({ data, onChange }) {
  const handleClientChange = (e) => {
    const { name, value } = e.target;
    onChange({ client: { ...data.client, [name]: value } });
  };
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    onChange({ project: { ...data.project, [name]: value } });
  };
  const handleDateChange = (e) => {
    onChange({ date: e.target.value });
  };
  const handleCurrencyChange = (e) => {
    onChange({ currency: e.target.value });
  };
  const handlePaymentMadeChange = (e) => {
    const val = Number(e.target.value);
    onChange({ paymentMade: isNaN(val) ? 0 : val });
  };
  const handleGstChange = (e) => {
    onChange({ gstPercent: e.target.value });
  };
  const handlePreparedByChange = (e) => {
    onChange({ preparedBy: e.target.value });
  };
  const handleVerifiedByChange = (e) => {
    onChange({ verifiedBy: e.target.value });
  };
  const addItem = () => {
    onChange({ items: [...(data.items || []), { description: "", quantity: 1, unitPrice: 0 }] });
  };
  const handleItemChange = (index, field, value) => {
    const newItems = data.items ? [...data.items] : [];
    newItems[index] = { ...newItems[index], [field]: field === "description" ? value : Number(value) };
    onChange({ items: newItems });
  };
  const removeItem = (index) => {
    const newItems = data.items ? [...data.items] : [];
    newItems.splice(index, 1);
    onChange({ items: newItems });
  };

  return (
    <form style={{ marginBottom: 20 }}>
      <h3>Client Information</h3>
      <input type="text" name="name" placeholder="Client Name" value={data.client.name || ""}
        onChange={handleClientChange} style={{ width: "100%", marginBottom: 6 }} />
      <input type="text" name="address" placeholder="Client Address" value={data.client.address || ""}
        onChange={handleClientChange} style={{ width: "100%", marginBottom: 6 }} />
      <input type="text" name="city" placeholder="City" value={data.client.city || ""}
        onChange={handleClientChange} style={{ width: "48%", marginRight: "4%", marginBottom: 6 }} />
      <input type="text" name="state" placeholder="State" value={data.client.state || ""}
        onChange={handleClientChange} style={{ width: "48%", marginBottom: 6 }} />
      <input type="text" name="zip" placeholder="ZIP / Postal Code" value={data.client.zip || ""}
        onChange={handleClientChange} style={{ width: "48%", marginRight: "4%", marginBottom: 6 }} />
      <input type="text" name="country" placeholder="Country" value={data.client.country || ""}
        onChange={handleClientChange} style={{ width: "48%", marginBottom: 6 }} />

      <h3>Project Information</h3>
      <input type="text" name="name" placeholder="Project Name" value={data.project.name || ""}
        onChange={handleProjectChange} style={{ width: "100%", marginBottom: 6 }} />

      <label style={{ display: "block", marginBottom: 6 }}>
        Project Code (Logo):
        <select name="projectCode" value={data.project.projectCode || "LD"}
          onChange={handleProjectChange} style={{ marginLeft: 10 }}>
          <option value="LD">Leads Digital</option>
          <option value="LTC">Leads To Company</option>
        </select>
      </label>
      <label style={{ display: "block", marginBottom: 6 }}>
        Project Type:
        <select name="projectType" value={data.project.projectType || "OvP"}
          onChange={handleProjectChange} style={{ marginLeft: 10 }}>
          <option value="OvP">OvP (Overseas Project)</option>
          <option value="CwP">CwP (Country Wise Project)</option>
        </select>
      </label>

      <h3>Invoice Date</h3>
      <input type="date" value={data.date} onChange={handleDateChange} style={{ width: 200, marginBottom: 10 }} />

      <h3>Currency</h3>
      <select value={data.currency} onChange={handleCurrencyChange} style={{ marginBottom: 10, width: 120 }}>
        {currencyOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <h3>GST (%)</h3>
      <input type="number" min="0" max="100" value={data.gstPercent}
        onChange={handleGstChange} placeholder="GST %" style={{ width: 80, marginBottom: 10 }} />

      <h3>Payment Made</h3>
      <input type="number" min="0" step="0.01" value={data.paymentMade}
        onChange={handlePaymentMadeChange} placeholder="Amount paid so far" style={{ width: 200, marginBottom: 10 }} />

      <h3>Items</h3>
      {(data.items || []).map((item, index) => (
        <div key={index} style={{
          marginBottom: 8, borderBottom: "1px dashed #ccc",
          paddingBottom: 8, display: "flex", alignItems: "center"
        }}>
          <input type="text" placeholder="Description" value={item.description}
            onChange={(e) => handleItemChange(index, "description", e.target.value)}
            style={{ width: "40%", marginRight: 8 }} />
          <input type="number" min="1" placeholder="Quantity" value={item.quantity}
            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
            style={{ width: "15%", marginRight: 8 }} />
          <input type="number" min="0" step="0.01" placeholder="Unit Price" value={item.unitPrice}
            onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
            style={{ width: "20%", marginRight: 8 }} />
          <button type="button" onClick={() => removeItem(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addItem}>Add Item</button>

      <h3 style={{ marginTop: 18 }}>Signatory</h3>
      <input type="text" value={data.preparedBy || ""} onChange={handlePreparedByChange}
        placeholder="Prepared by" style={{ width: "48%", marginRight: "4%", marginBottom: 6 }} />
      <input type="text" value={data.verifiedBy || ""} onChange={handleVerifiedByChange}
        placeholder="Verified by" style={{ width: "48%", marginBottom: 6 }} />
    </form>
  );
}
