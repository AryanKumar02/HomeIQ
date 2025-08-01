import React from 'react'
import { Box, Paper } from '@mui/material'
import ReactMarkdown from 'react-markdown'

const termsContent = `
# EstateLink – Terms of Service

*Version 1.0 — Effective 1 June 2025*

> **IMPORTANT:** Please read these Terms carefully. They constitute a legally binding agreement between you and **EstateLink** ("**EstateLink**", "**we**", "**us**" or "**our**") governing your access to and use of the EstateLink property‑management software‑as‑a‑service platform, mobile applications, related websites, and any associated services (collectively, the "**Service**"). By creating an EstateLink account, clicking "I agree", or otherwise accessing or using the Service, you acknowledge that you have read, understood and agree to be bound by these Terms.

If you do not agree to these Terms, you may not access or use the Service.

---

## 1. Definitions

**"Account"** – a unique account created for you to access the Service.

**"Landlord"** – a user who registers properties for management through the Service.

**"Tenant"** – a user who interacts with a Landlord via the Service in relation to a property.

**"Content"** – text, images, data, files, and all other information uploaded to, transmitted through, or generated by the Service.

**"Subscription Plan"** – the fee‑bearing plan chosen by a Landlord (or other commercial user) setting subscription term, price and feature set.

**"Applicable Law"** – all laws, rules and regulations that apply to you, including the United Kingdom General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

## 2. Eligibility and Account Registration

* You must be at least 18 years old and have capacity to enter into contracts to create an Account.
* You agree to provide accurate, current and complete information during registration and to keep your information up to date.
* You are responsible for safeguarding your login credentials and for all activity under your Account.

## 3. Subscription Plans and Fees

* Access to certain features requires a paid Subscription Plan. Plan details, pricing and billing cycles are presented at checkout and may change from time to time.
* Fees are stated and must be paid in pounds sterling (GBP) unless we agree otherwise.
* Unless otherwise specified, Subscription Plans renew automatically at the then‑current price until cancelled.
* You may cancel at any time, but no refunds are provided for partial subscription periods except as required by Applicable Law.

## 4. Use of the Service

### 4.1 Landlord Obligations

* Ensure that all property details and tenancy information you upload are accurate and lawful.
* Comply with all landlord obligations under Applicable Law, including (where relevant) the Landlord and Tenant Act 1985, the Housing Act 2004 and tenancy‑deposit regulations.
* Obtain all required consents (including from Tenants) before sharing personal data through the Service.

### 4.2 Tenant Obligations

* Provide accurate personal and tenancy information.
* Use the Service only for legitimate communications with your Landlord and for managing your tenancy.

### 4.3 Property Listings & Content

* You are solely responsible for Content you post and for ensuring you have the necessary rights to do so.
* Estate Link does not verify the accuracy of Listings or Tenancy information and is not party to any tenancy agreement.

## 5. Payment Processing

* We may provide integrated payment processing via third‑party providers to collect rent or other charges. All payment services are subject to the provider's separate terms.
* Estate Link is not responsible for chargebacks, payment disputes, or tax obligations arising from transactions between Landlords and Tenants.

## 6. Third‑Party Services and Integrations

The Service may interoperate with third‑party products (e.g., accounting, identity‑verification or messaging platforms). Estate Link is not responsible for the availability or performance of such third‑party services.

## 7. Data Protection and Privacy

* Our collection and processing of personal data is described in the Estate Link **Privacy Notice**, which forms part of these Terms.
* Each party shall comply with Applicable Law relating to data protection.
* Where Estate Link processes personal data on your behalf, the **Data Processing Addendum** applies.

## 8. Intellectual Property

* Estate Link and its licensors own all intellectual‑property rights in and to the Service, including trademarks, software, and all related materials.
* You receive a limited, non‑exclusive, non‑transferable, revocable licence to access and use the Service in accordance with these Terms.

## 9. Prohibited Activities

You agree not to:

1. Copy, modify, decompile, disassemble, or reverse‑engineer any part of the Service.
2. Upload Content that is unlawful, offensive, or infringes another party's rights.
3. Use the Service to send unauthorised commercial communications (spam).
4. Interfere with the integrity or performance of the Service.
5. Misrepresent your affiliation with any person or entity.

## 10. Suspension and Termination

* We may suspend or terminate your access to the Service (with or without notice) if you breach these Terms or if required by law.
* Upon termination, your right to use the Service will immediately cease; Sections 8, 11, 12, 14, 16 and 19 survive termination.

## 11. Disclaimers

* The Service is provided **"as is"** and **"as available"** without warranty of any kind, whether express or implied.
* Estate Link does **not** act as an agent or insurer for Landlords or Tenants, nor does it provide legal, financial or professional advice.
* Estate Link is **not** a party to any tenancy or property‑management agreement between Landlords and Tenants.

## 12. Limitation of Liability

To the maximum extent permitted by law, in no event will Estate Link be liable for:

* Any indirect, incidental, special, consequential or punitive damages; or
* Aggregate liability exceeding (a) the amounts you have paid to Estate Link in the 12 months preceding the claim, or (b) £100, whichever is greater.

Nothing in these Terms limits liability that cannot be excluded by law (e.g., death or personal injury caused by negligence, or fraud).

## 13. Indemnification

You agree to indemnify and hold harmless Estate Link and its directors, officers, employees and agents from any claims, damages, liabilities, and expenses arising from (a) your breach of these Terms, (b) your Content, or (c) your interactions with other users.

## 14. Changes to the Service or Terms

We may modify the Service or these Terms at any time. We will give you at least 30 days' notice of material changes via the Service or by email. Continued use after the effective date of the revised Terms constitutes acceptance.

## 15. Governing Law and Jurisdiction

These Terms and any dispute or claim (including non‑contractual disputes) are governed by the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction, unless Applicable Law requires otherwise.

## 16. Dispute Resolution

Before commencing court proceedings, you agree to attempt to resolve any dispute with us informally by contacting us at **support@estatelink.com**. If the dispute is not resolved within 30 days, either party may pursue formal proceedings in the courts identified above.

## 17. Notices

Notices to Estate Link must be sent by email to **support@estatelink.com**. We may provide notices to you via the email address associated with your Account or through the Service.

## 18. Miscellaneous

* **Entire Agreement.** These Terms, together with any Supplemental Terms (e.g., Data Processing Addendum), constitute the entire agreement between you and Estate Link.
* **Severability.** If any provision is held invalid, the remaining provisions remain in full force.
* **No Waiver.** Failure to enforce any provision is not a waiver of future enforcement.
* **Assignment.** You may not assign or transfer these Terms without our prior written consent; we may assign our rights and obligations without restriction.

---

**Contact Us**

If you have questions about these Terms, please email **support@estatelink.com** or write to **EstateLink**.

---

*© 2025 EstateLink.  All rights reserved.*
`

const TermsOfService: React.FC = () => {
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
            color: 'secondary.main',
            fontWeight: 900,
            mb: 2,
            letterSpacing: -1.2,
            textAlign: { xs: 'center', md: 'left' },
          },
          '& h2': {
            fontSize: { xs: '1.35rem', md: '1.7rem' },
            color: 'secondary.main',
            fontWeight: 700,
            mt: 4,
            mb: 2,
            letterSpacing: -0.5,
          },
          '& h3': {
            fontSize: { xs: '1.1rem', md: '1.2rem' },
            color: 'secondary.main',
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
            color: 'secondary.main',
            fontWeight: 600,
            textDecoration: 'underline',
            transition: 'color 0.2s',
            '&:hover': { color: '#02486e' },
          },
          '& blockquote': {
            fontStyle: 'italic',
            color: 'secondary.main',
            background: 'linear-gradient(90deg, #e3f1fa 0%, #f5faff 100%)',
            borderLeft: '4px solid #036CA3',
            pl: 2,
            mb: 3,
            py: 1,
            borderRadius: 2,
          },
          '& hr': { my: 3, borderColor: 'secondary.main', opacity: 0.12 },
        }}
      >
        <ReactMarkdown>{termsContent}</ReactMarkdown>
      </Box>
    </Paper>
  )
}

export default TermsOfService
