# 📞 FARM SEVA — PHASE 11 TELEPHONY / IVR OPERATIONAL SPECIFICATION

## Executive Summary
IVR (Interactive Voice Response) telephony is a core accessibility channel for FARM SEVA, enabling smallholder farmers without smartphones or internet access to manage orders, check delivery status, report crop issues, and connect with call-center agents using basic feature phones.

---

## 1. Multilingual Call Flow Architecture

```
[ Farmer Calls Toll-Free Number ]
               │
               ▼
[ Language Selection Menu ] (Press 1: Telugu, 2: Hindi, 3: Kannada, 4: Tamil, 5: Marathi, 6: English)
               │
               ▼
[ Farmer Authentication ] (Matched by incoming Caller ID / Phone Number)
               │
               ▼
┌──────────────┴──────────────┬──────────────────────────────┬──────────────────────────────┐
▼                             ▼                              ▼                              ▼
[ Option 1: Order Status ]  [ Option 2: Delivery Details ] [ Option 3: Report Crop Bug ]  [ Option 9: Agent Transfer ]
```

---

## 2. Supported Language Prompts & DTMF Menus

- **Telugu Prompt:** "ఫార్మ్ సేవకు స్వాగతం. మీ చివరి ఆర్డర్ స్థితి తెలుసుకోవడానికి 1 నొక్కండి. పైరు తెగులు సహాయం కోసం 3 నొక్కండి. కాల్ సెంటర్ ఏజెంట్‌తో మాట్లాడటానికి 9 నొక్కండి."
- **Hindi Prompt:** "फार्म सेवा में आपका स्वागत है। अपने अंतिम ऑर्डर की स्थिति जानने के लिए 1 दबाएं। फसल सहायता के लिए 3 दबाएं। एजेंट से बात करने के लिए 9 दबाएं।"
- **Kannada Prompt:** "ಫಾರ್ಮ್ ಸೇವಾಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಕೊನೆಯ ಆರ್ಡರ್ ಸ್ಥಿತಿ ತಿಳಿಯಲು 1 ಒತ್ತಿ. ಬೆಳೆ ನೆರವಿಗೆ 3 ಒತ್ತಿ. ಏಜೆಂಟ್ ಜತೆ ಮಾತನಾಡಲು 9 ಒತ್ತಿ."

---

## 3. Privacy & Security Constraints

- Sensitive account details (bank account, full payment history) are NEVER spoken over IVR voice flows.
- Automated voice responses speak only high-level status (e.g., "Out for delivery with OTP 4589", "Expert advisory submitted").
