# MediPlan Tracker — Application Requirements & Specifications

This document outlines the detailed system requirements, core logic, user schemas, and customized functional enhancements that have been implemented and rectified in the **MediPlan Tracker** application.

---

## 1. Core Architecture & Profile Management
* **Multi-Profile Support**: Allows the tracking and management of separate medication cabinetry for multiple family members or profiles (e.g., "My Profile", "Dad", "Sarah").
* **Auto-Initialization**: 
  - On startup or database clearance, a default user profile named `"My Profile"` is automatically created if no profiles are present.
  - Active user session is managed securely via state and persists correctly.
* **Profile Migration Strategy** *(Rectified)*: On app loading, any legacy or orphaned medicines without a profile association are automatically assigned to the first active user.
* **Cabinet Interoperability**:
  - Medicine cards can be easily transferred/moved between family profiles via a dedicated `"Move Profile"` modal.
  - Target profiles list excludes the current owner of the medicine for clean UX.

---

## 2. Dynamic Medicine Database & Form Schemas
* **Medicine Registry**: Stores Medicine properties including:
  - Unique Identifier (`generateId()`)
  - Target Owner User Association ID (`userId`)
  - Medicine Name (trimmed, normalized string)
  - Current Available Stock (non-negative number)
  - Unit/Category Type
  - Usage dosage criteria (daily dosage or fixed monthly dosage)
  - Up-to-date Modification Timestamps (`updatedAt`)
* **Flexible Measurement Units**: Supports multiple medicine types:
  - `tablets` (Pills)
  - `bottles` (Drops/Liquid)
  - `sachets`
  - `tubes`
  - `drops`
* **Custom Verification & Form Validations** *(Rectified / Specialized)*:
  - **Duplicate Check**: Prevents adding a medicine that already exists under the active profile (checks case-insensitively).
  - **Pill/Tablet Dosage Strictness**: Daily dosages for `tablets` are strictly validated to be **whole integers greater than 0** (e.g. 1, 2, etc.), preventing fractional pill dosage entries which cause miscalculations.
  - **Alternative Unit Quantities**: Liquid dose, drops, sachets, etc., are validated only to be numbers greater than 0, with a dynamic guide note explaining that monthly consumption levels are linear.
  - **Stock Validity**: Current stock is bounded to non-negative numeric quantities.

---

## 3. High-Precision Calculation Engine
* **Varied Computation Logic based on Unit**:
  - **Daily Dosage Unit (`tablets`)**: Calculates the needed amount mathematically: 
    * $\text{Required} = \lceil \text{Daily Dosage} \times \text{Configured Tracking Days} \rceil$
  - **Linear Duration Scaling (`bottles`, `sachets`, etc.)**: Accounts for liquid bottles or sachet boxes where a base 30-day quantity is entered:
    * $\text{Required} = \lceil (\text{Monthly Refill Quantity} / 30) \times \text{Configured Tracking Days} \rceil$
* **Replenishment Analysis**:
  - Subtracts current stock from the forecasted required quantity.
  - Generates `isSufficient` flag (true if currently stocked $\ge$ required).
  - Calculates precise extra quantity needed (`toBuy` value) when current stock is insufficient.
* **Custom Measurement Period Duration**:
  - Offers a dynamic time-planning modifier globally in the header.
  - Users can adjust days count (minimum is 1) to see custom stock coverage (e.g., calculating requirements for 15, 30, 45, or 90 days), with the entire inventory and shopping lists recalculating instantly.

---

## 4. Family Shopping List & Reporting
* **Consolidated Family view**: Shows medicines requiring restock grouped and listed globally for all members.
* **Logical Ordering**: Shopping items are sorted alphabetically by **User Profile Name** first, and then alphabetically by **Medicine Name** for structured purchasing.
* **Interactive Family PDF Exporter**:
  - Directly exports the premium layout into high-resolution **A4 portrait PDF** templates.
  - Utilizes `html2canvas` for precise layout rendering and `jspdf` for high-quality file assembly.
  - Built-in loading states with a spinning loader and disabled buttons to prevent double-generation during exports.
* **Paper-Print Optimization & Styles**:
  - Injected CSS `@media print` rules hide interactive interface segments (such as header, sidebar tabs, and main actions buttons).
  - Keeps only key elements visible, overrides dark-theme text with high-contrast printer-friendly dark shades on pure white backgrounds, and optimizes table border sizing and page-breaks.

---

## 5. Security, Portability & Local Persistence
* **Robust ID Generation**:
  - Employs a secure ID generator utilizing `crypto.randomUUID` where available.
  - Incorporates dynamic fallback timestamps + entropy strings to prevent browser crashes in older browsers, sandboxed elements, or non-secure contexts.
* **Offline-First Storage**: Local state management and persistence using clean `localStorage` wrapping hooks.
* **Secure Enterprise Backups**:
  - **JSON Export**: Encodes complete profiles, medicine arrays, and configured preferences into single, download-ready backup files.
  - **Restore Validation**: Thoroughly parses, verifies, and restores user-uploaded data files, automatically resetting state to the newly imported profile list. It gracefully displays context-safe error messages if invalid files are uploaded.
