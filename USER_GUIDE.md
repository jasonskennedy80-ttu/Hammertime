# Hammertime — User Guide

A construction business management app for residential contractors. Manage customers, projects, scope of work, pricing, payment schedules, and generate proposals — all in one place.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Customers](#customers)
4. [Projects](#projects)
5. [Scope of Work](#scope-of-work)
6. [Line Items & Pricing](#line-items--pricing)
7. [Payment Schedule](#payment-schedule)
8. [Proposals](#proposals)
9. [Settings](#settings)
10. [Dark Mode](#dark-mode)

---

## Getting Started

### Signing In

1. Navigate to the app URL in your browser
2. Enter your email address and password on the sign-in screen
3. Click **Sign In** — you'll be taken to the Dashboard

> Your session stays active between visits. Click **Sign out** in the top-right corner to log out.

---

## Dashboard

The Dashboard is your home base. It shows a real-time snapshot of your business.

**Stats Cards (top row)**
| Card | What it shows |
|---|---|
| Total Customers | All customers in the system — click to go to the Customers list |
| Active Projects | Projects that are not Completed or Cancelled — click to go to Projects |
| In Progress | Projects currently marked as In Progress |
| Pipeline Value | Total estimated value of all active projects combined |

**Recent Projects** — The 5 most recently updated projects. Click any row to open that project.

**Recent Activity** — A live feed of the latest actions taken in the system (creates, updates, status changes).

---

## Customers

### Viewing All Customers

Click **Customers** in the left sidebar. The list shows every customer with their name, company, phone, email, status badge, and last activity date.

**Filtering & Searching**
- Type in the search bar to filter by name, phone, or email
- Use the **Status** dropdown to filter by Lead, Active, or Inactive

### Creating a New Customer

1. Click **New Customer** (top-right of the Customers page or Dashboard)
2. Fill in the form:

| Section | Fields |
|---|---|
| **Basic Info** | First Name *(required)*, Last Name *(required)*, Company |
| **Contact** | Primary Phone, Secondary Phone, Primary Email, Secondary Email, Preferred Contact Method, Status |
| **Address** | Street, Apt/Suite, City, State, ZIP |
| **Mailing Address** | Check "Same as above" or uncheck to enter a separate mailing address |
| **Notes** | Any internal notes about this customer |

3. Click **Create Customer** — you'll be taken to the customer's detail page

**Customer Statuses**
- **Lead** — A prospect, not yet a paying customer
- **Active** — Current customer with active or recent work
- **Inactive** — Past customer with no current work

### Viewing a Customer

Click any customer row to open their detail page. You'll see:
- Contact info and address
- All projects linked to this customer
- Activity feed showing every action taken on this customer's record

### Editing a Customer

From the customer detail page, click **Edit** (pencil icon, top-right). Make your changes and click **Save Changes**.

### Deleting a Customer

From the customer detail page, scroll to the **Danger Zone** card and click **Delete Customer**. Confirm in the dialog. This cannot be undone.

---

## Projects

Projects are linked to a customer and hold all the details of a job — scope, pricing, and payment schedule.

### Creating a New Project

Projects must be linked to a customer. There are two ways to create one:

**From a Customer's page:**
1. Open the customer
2. Click **New Project** (top-right or inside the Projects card)

**From the Projects list:**
Projects can only be created from a customer record — navigate to the customer first.

**Project Form Fields**

| Section | Fields |
|---|---|
| **Project Info** | Project Name *(required)*, Project Type *(required)*, Status, Job Site Address |
| **Dates** | Start Date, Estimated Completion Date |
| **Description** | Project Description (overview), Customer-Facing Notes (appears on proposals), Internal Notes (never shown to customer) |
| **Pricing** | Tax Rate (%), Discount ($) |

**Project Types**
- Metal Building
- Wood Building
- Fence
- Gate
- Patio Cover
- Patio Extension
- Other

**Project Statuses**
- **Lead** — Initial inquiry, no commitment yet
- **Estimating** — Actively building a quote
- **Proposal Sent** — Quote has been sent to the customer
- **Approved** — Customer has approved the proposal
- **In Progress** — Work has started on site
- **Completed** — Job is finished
- **Cancelled** — Job was cancelled

Click **Create Project** — you'll be taken to the project detail page.

### Viewing a Project

Click any project from the Customers page or the Projects list. The detail page has:
- Project summary (type, status, location, dates, total)
- Scope of Work sections
- Line Items & Pricing
- Payment Schedule
- Notes
- Activity Feed

### Changing Project Status (Quick Change)

On the project detail page, the status is shown as a **dropdown selector** in the info card at the top. Simply select a new status — it saves automatically without opening the edit form.

### Editing a Project

Click **Edit** (pencil icon, top-right of the project detail page) to change the project's name, type, dates, notes, tax rate, or discount.

### Deleting a Project

From the project detail page, scroll to the **Danger Zone** card and click **Delete Project**. This also deletes all scope sections, line items, and the payment schedule. This cannot be undone.

---

## Scope of Work

The Scope of Work describes what will be done on the job. It's broken into sections that appear on proposals.

### Adding a Scope Section

1. On the project detail page, find the **Scope of Work** card
2. Click **Add Section**
3. Fill in the form:
   - **Title** *(required)* — e.g. "Concrete Slab", "Building Installation"
   - **Section Type** — choose the category that best fits
   - **Description** — detailed description of the work in this section
   - **Sort Order** — controls the order sections appear (lower numbers appear first)
4. Click **Add Section**

**Available Section Types**
Concrete Slab, Driveway, Building Installation, Electrical, Plumbing, Insulation, Barn Doors, Mezzanine, Framing, Roofing, Doors & Windows, Fencing, Gates, Patio Structure, Included Items, Not Included, Notes, Custom

### Editing or Deleting a Scope Section

- Click the **pencil icon** on any section row to edit it
- Click the **trash icon** to delete it (no confirmation — be careful)
- Click the **section row** to expand/collapse and read the description

---

## Line Items & Pricing

Line items build the pricing breakdown for the project. Each item calculates its total automatically.

**Total formula:** `Quantity × Unit Price × (1 + Markup %)`

### Adding a Line Item

1. On the project detail page, find the **Line Items** card
2. Click **Add Item**
3. Fill in the form:

| Field | Description |
|---|---|
| **Item Name** *(required)* | e.g. "40x60 Metal Building", "Concrete — 4 inch slab" |
| **Description** | Optional detail shown under the name |
| **Quantity** *(required)* | How many units |
| **Unit** *(required)* | e.g. "sq ft", "linear ft", "each", "lot" |
| **Unit Price** *(required)* | Price per unit before markup |
| **Markup %** | Percentage markup applied on top of unit price (0 = no markup) |
| **Taxable** | Check if this item is subject to sales tax |
| **Sort Order** | Controls order in the pricing table |

4. Click **Add Item**

The **Pricing Summary** at the bottom of the card updates automatically:
- **Subtotal** — sum of all line item totals
- **Tax** — subtotal × tax rate (set in the project edit form)
- **Discount** — fixed discount amount (set in the project edit form)
- **Total** — the final project price

### Editing or Deleting a Line Item

- Click the **pencil icon** on any row to edit
- Click the **trash icon** to delete (confirms with a browser dialog)

---

## Payment Schedule

The payment schedule defines the draws (installment payments) for the project. Draws appear on proposals.

### Opening the Payment Schedule Editor

On the project detail page, click **Edit Schedule** in the Payment Schedule card.

### Adding Draws

**Quick Add** — Click any of the pre-built draw buttons at the top to instantly add common construction draws:
- Acceptance Draw
- Framing Draw
- Sheet & Trim
- Concrete Draw
- Doors & Windows
- Final Payment

Each quick-add creates a draw with a standard due trigger pre-filled. You just need to enter the dollar amount.

**Manual Add** — Click **Add Draw** to add a blank draw and fill in:
- **Draw Label** — e.g. "Foundation Draw"
- **Amount** — dollar amount for this draw
- **Due Trigger** — when this payment is due, e.g. "Due upon framing completion"

### Balance Indicator

A status bar at the bottom shows whether your scheduled draws add up to the project total:
- **Green** — Schedule is balanced (draws = project total)
- **Amber** — Over or under the project total

Click **Save Schedule** when done.

---

## Proposals

A proposal is a professional, print-ready document you can hand or email to a customer for approval. It includes your company info, project details, scope of work, line items, payment schedule, and a signature block.

### Generating a Proposal

1. Open the project detail page
2. Click **Proposal** (document icon, top-right, next to Edit)
3. The proposal opens in a full-page preview

### Before Printing

- **Valid for ___ days** — Change the validity period in the toolbar (default: 30 days). The "valid until" date on the document updates instantly.
- Review the document to make sure all scope sections, line items, and payment schedule are correct

### Printing / Saving as PDF

Click **Print / Save PDF** in the toolbar. Your browser's print dialog will open.

**To save as PDF (recommended):**
- **Mac:** Change the destination to "Save as PDF" or use the PDF dropdown in the bottom-left
- **Windows:** Choose "Microsoft Print to PDF" or "Save as PDF" as the printer

The toolbar and navigation disappear automatically when printing — only the document itself prints.

### What Appears on the Proposal

| Section | Source |
|---|---|
| Company header | Settings page |
| Customer info | Customer record |
| Project details | Project record |
| Project overview | Project description field |
| Scope of work | All scope sections with descriptions |
| Pricing table | All line items |
| Payment schedule | Payment draws |
| Notes | Customer-facing notes field |
| Terms & Conditions | Standard terms (auto-included) |
| Signature block | Customer name + contractor name from Settings |

---

## Settings

The Settings page stores your company information, which is used on every proposal.

### Accessing Settings

Click **Settings** at the bottom of the left sidebar.

### Available Fields

| Field | Used On Proposal |
|---|---|
| **Company Name** | Header, signature block |
| **Tagline** | Under company name in header |
| **Phone** | Header |
| **Email** | Header |
| **Address** | Header |
| **Contractor License #** | Header, signature block |

Click **Save Settings** — a "Saved!" confirmation appears. Settings are stored on this device.

> **Note:** Settings are saved locally in your browser. If you use the app on a different device or browser, you'll need to re-enter your company info on that device.

---

## Dark Mode

Click the **sun/moon icon** in the top-right corner of the navigation bar to toggle between light and dark mode. Your preference is saved and remembered across visits.

---

## Tips & Workflow

**Recommended workflow for a new job:**

1. **Create or find the customer** — check if they already exist before creating a new one
2. **Create a project** — link it to the customer, set the type and a descriptive name
3. **Add scope sections** — describe each phase or component of the work
4. **Add line items** — build out the pricing with quantities, units, and prices
5. **Set tax rate and discount** — edit the project to add these if needed
6. **Build the payment schedule** — use quick-add draws and fill in the amounts
7. **Review the proposal** — open the Proposal page and check everything looks right
8. **Set company info** — make sure Settings has your company name, phone, and license number
9. **Print / Save PDF** — send it to the customer

**After the customer approves:**
- Change the project status to **Approved** using the status dropdown on the project detail page
- Change to **In Progress** when work begins
- Change to **Completed** when the job is done

---

## Keyboard & Navigation

- Use the **back arrow** (top-left of detail pages) to return to the previous page
- The sidebar is always available on desktop; on mobile tap the **hamburger menu** (≡) in the top-left to open it
- Tap anywhere outside the mobile sidebar to close it
