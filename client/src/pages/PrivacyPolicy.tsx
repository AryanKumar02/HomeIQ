import React from 'react'
import { Box, Paper } from '@mui/material'
import ReactMarkdown from 'react-markdown'

const privacyContent = `# EstateLink – Privacy Policy
*Version 1.0 — Effective 1 June 2025*

EstateLink ("**EstateLink**", "**we**", "**us**" or "**our**") respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, disclose and safeguard information when you visit our websites, use our property‑management software‑as‑a‑service platform, mobile applications or otherwise interact with us (collectively, the **"Service"**).

By accessing or using the Service, you acknowledge that you have read and understood this Privacy Policy.

---

## 1. Who We Are
**EstateLink** is an online platform that helps landlords manage properties and tenancies. For the purposes of the UK General Data Protection Regulation (**UK GDPR**) and the Data Protection Act 2018, EstateLink acts as:

* **Controller** of personal data relating to visitors, users and prospective customers (e.g., Landlords); and
* **Processor** of personal data that Landlords upload about Tenants or other individuals, pursuant to our [Data Processing Addendum].

---

## 2. Personal Data We Collect
We may collect and process the following categories of personal data:

| Category | Description | Examples |
| --- | --- | --- |
| **Account Data** | Information you provide when you create or update an EstateLink account | Name, email address, phone number, login credentials |
| **Property & Tenancy Data** | Data entered by Landlords about properties and Tenants | Property address, rental amounts, lease dates, Tenant contact details, maintenance records |
| **Payment Data** | Data related to transactions processed through the Service | Billing address, partial card details, payment history (handled via third‑party processors) |
| **Communications** | Content of messages exchanged via the Service or sent to support | Emails, chat messages, support tickets |
| **Usage & Log Data** | Technical data gathered automatically when you interact with the Service | IP address, browser type, device identifiers, pages viewed, timestamps |
| **Cookies & Similar Tech** | Data collected via cookies, pixels and local storage | Session tokens, analytics IDs, preference cookies |

We do **not** intentionally collect special‑category data (e.g., health or biometric data) unless you or your Landlord voluntarily provide it.

---

## 3. How We Use Your Data
We use personal data to:

1. **Provide and operate the Service** (create accounts, display property information, process payments, facilitate communications).
2. **Improve and develop the Service** (analytics, research, troubleshooting, testing, and new‑feature development).
3. **Communicate with you** (transactional emails, service notifications, responses to inquiries).
4. **Market our services** (sending newsletters or promotional content with your consent).
5. **Ensure security and prevent fraud** (detecting suspicious activity, enforcing our Terms of Service).
6. **Comply with legal obligations** and respond to lawful requests from authorities.

---

## 4. Legal Bases for Processing
Under UK GDPR we rely on the following legal bases:

* **Contract** – Processing necessary to perform our contract with you (e.g., providing the Service).
* **Legitimate interests** – To pursue our legitimate business interests (e.g., improving the Service), provided those interests are not overridden by your rights.
* **Consent** – For optional activities such as marketing emails; you may withdraw consent at any time.
* **Legal obligation** – Where processing is required to comply with applicable law.

---

## 5. Cookies and Similar Technologies
We use first‑ and third‑party cookies to remember your preferences, enable core functionality and analyse site usage. You can control cookies through your browser settings and, where required by law, we will request your consent.

---

## 6. How We Share Personal Data
We only share personal data:

* **With service providers** who perform services for us (e.g., cloud hosting, payment processing, email delivery) under binding agreements.
* **With Landlords and Tenants** as necessary to perform the Service (e.g., Tenant details displayed to the relevant Landlord).
* **With professional advisers** (lawyers, auditors) where necessary.
* **In business transfers** (e.g., merger or acquisition) with appropriate protections.
* **To comply with the law** or protect rights, property or safety (yours, ours or others).

We do **not** sell or rent personal data.

---

## 7. International Transfers
The Service may involve transferring your data to countries outside the UK/EEA that have different data‑protection laws. Where we transfer data internationally, we rely on appropriate safeguards such as UK Addendum‑approved Standard Contractual Clauses.

---

## 8. Data Retention
We retain personal data only as long as necessary for the purposes described in this policy, including to comply with legal, accounting or reporting obligations, resolve disputes and enforce agreements. When no longer needed, data is securely deleted or anonymised.

---

## 9. Security
We implement administrative, technical and organisational measures designed to protect personal data against unauthorised access, loss or alteration. However, no online platform can guarantee absolute security.

---

## 10. Your Rights
Subject to certain conditions, you have the right to:

* Request **access** to your personal data.
* Request **correction** of inaccurate data.
* Request **erasure** of your data ("right to be forgotten").
* Object to or request **restriction** of processing.
* Request **data portability**.
* Withdraw consent where processing is based on consent.

To exercise your rights, email us at **support@estatelink.com**. We may need to verify your identity before fulfilling your request.

You also have the right to lodge a complaint with the UK Information Commissioner's Office (**ICO**).

---

## 11. Children's Privacy
The Service is not directed to children under 16. We do not knowingly collect personal data from children. If we learn we have collected such data, we will delete it promptly.

---

## 12. Changes to This Policy
We may update this Privacy Policy from time to time. If we make material changes, we will notify you through the Service or by email and indicate the "Effective" date. Your continued use of the Service after any update constitutes acceptance of the revised policy.

---

## 13. Contact Us
If you have questions about this Privacy Policy or our privacy practices, please email **support@estatelink.com**.

---

© 2025 EstateLink. All rights reserved.
`

const PrivacyPolicy: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: '100vh',
        width: '100vw',
        borderRadius: 0,
        backgroundColor: '#fff',
        p: { xs: 2, sm: 4, md: 8 },
        fontFamily: 'Roboto, Arial, sans-serif',
        boxShadow: 'none',
        m: 0,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          color: 'black',
          fontFamily: 'inherit',
          fontSize: { xs: '1.04rem', md: '1.13rem' },
          lineHeight: 1.75,
          maxWidth: 900,
          mx: 'auto',
          '& h1': {
            fontSize: { xs: '2.1rem', md: '2.7rem' },
            color: 'primary.main',
            fontWeight: 900,
            mb: 2,
            letterSpacing: -1.2,
            textAlign: { xs: 'center', md: 'left' },
          },
          '& h2': {
            fontSize: { xs: '1.35rem', md: '1.7rem' },
            color: 'primary.main',
            fontWeight: 700,
            mt: 4,
            mb: 2,
            letterSpacing: -0.5,
          },
          '& h3': {
            fontSize: { xs: '1.1rem', md: '1.2rem' },
            color: 'primary.main',
            fontWeight: 700,
            mt: 3,
            mb: 1.5,
          },
          '& p': { mb: 2 },
          '& ul, & ol': { pl: 3, mb: 2 },
          '& li': { mb: 1 },
          '& strong': { fontWeight: 700 },
          '& em': { fontStyle: 'italic' },
          '& a': {
            color: 'primary.main',
            fontWeight: 600,
            textDecoration: 'underline',
            transition: 'color 0.2s',
            '&:hover': { color: '#02486e' },
          },
          '& blockquote': {
            fontStyle: 'italic',
            color: 'primary.main',
            background: 'linear-gradient(90deg, #e3f1fa 0%, #f5faff 100%)',
            borderLeft: '4px solid #036CA3',
            pl: 2,
            mb: 3,
            py: 1,
            borderRadius: 2,
          },
          '& hr': { my: 3, borderColor: 'primary.main', opacity: 0.12 },
        }}
      >
        <ReactMarkdown>{privacyContent}</ReactMarkdown>
      </Box>
    </Paper>
  )
}

export default PrivacyPolicy
