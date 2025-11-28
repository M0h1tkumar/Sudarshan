# SUDRASHAN TEST SAMPLES

## 🧪 **COMPREHENSIVE TEST CASES**

### **1️⃣ FAKE NEWS SAMPLE**
**Input:**
```
BREAKING: Scientists discover that drinking bleach cures all diseases. Major pharmaceutical companies are trying to hide this miracle cure from the public. Share before they delete this!
```

**Expected Output:**
- **Verdict**: FAKE NEWS
- **Confidence**: 98.5%
- **Threat Level**: HIGH
- **Misinformation Type**: Dangerous health misinformation
- **Citations**: CDC warnings, WHO statements, medical journals

---

### **2️⃣ MISINFORMATION SAMPLE**
**Input:**
```
The COVID-19 vaccine contains microchips that allow the government to track your location. This has been confirmed by multiple whistleblowers from tech companies.
```

**Expected Output:**
- **Verdict**: MISINFORMATION
- **Confidence**: 94.2%
- **Threat Level**: HIGH
- **Misinformation Type**: Conspiracy theory
- **Citations**: FDA vaccine ingredients, fact-checker debunks

---

### **3️⃣ VERIFIED NEWS SAMPLE**
**Input:**
```
The World Health Organization announced new guidelines for pandemic preparedness following lessons learned from COVID-19. The guidelines emphasize early detection and international cooperation.
```

**Expected Output:**
- **Verdict**: VERIFIED
- **Confidence**: 96.8%
- **Threat Level**: LOW
- **Source Status**: Official WHO announcement found
- **Citations**: WHO official press release, Reuters coverage

---

### **4️⃣ RUMOR SAMPLE**
**Input:**
```
Unconfirmed reports suggest that a major tech company is planning to acquire a popular social media platform for $50 billion. Sources close to the deal say negotiations are ongoing.
```

**Expected Output:**
- **Verdict**: UNVERIFIABLE
- **Confidence**: 72.3%
- **Threat Level**: LOW
- **Source Status**: No official confirmation
- **Citations**: Business news speculation, no primary sources

---

### **5️⃣ CONTEXT MANIPULATION SAMPLE**
**Input:**
```
Video shows massive crowds celebrating in the streets after election results announced yesterday.
```
*[Accompanied by old footage from a different event]*

**Expected Output:**
- **Verdict**: MISINFORMATION
- **Confidence**: 89.1%
- **Threat Level**: MEDIUM
- **Misinformation Type**: Context manipulation
- **Detection**: Reverse image search reveals old footage

---

### **6️⃣ SATIRICAL CONTENT SAMPLE**
**Input:**
```
Local man discovers that his pet goldfish has been secretly running a cryptocurrency exchange from the fish tank. Authorities are investigating the "Fin-ancial" scandal.
```

**Expected Output:**
- **Verdict**: SATIRE/PARODY
- **Confidence**: 91.7%
- **Threat Level**: LOW
- **Content Type**: Humorous/satirical
- **Source**: Satirical news website

---

### **7️⃣ OUT-OF-DATE INFORMATION SAMPLE**
**Input:**
```
Breaking: Stock market crashes as Dow Jones falls 2000 points in single day trading session.
```
*[Using data from 2020 market crash]*

**Expected Output:**
- **Verdict**: MISINFORMATION
- **Confidence**: 87.4%
- **Threat Level**: MEDIUM
- **Misinformation Type**: Temporal manipulation
- **Detection**: Date mismatch with current market data

---

### **8️⃣ DEEPFAKE/MANIPULATED MEDIA SAMPLE**
**Input:**
*[Image of politician making controversial statement]*

**Expected Output:**
- **Verdict**: FAKE NEWS
- **Confidence**: 93.6%
- **Threat Level**: HIGH
- **Misinformation Type**: Visual manipulation
- **Detection**: Deepfake artifacts detected, inconsistent lighting

---

## 🎯 **TESTING INSTRUCTIONS**

### **How to Test:**
1. Click any sample button on the homepage
2. Review the expected verdict
3. Click "Process Text" to run analysis
4. Compare actual output with expected results
5. Check citation quality and source verification

### **Success Criteria:**
- ✅ Verdict matches expected classification
- ✅ Confidence score within ±5% range
- ✅ Appropriate threat level assigned
- ✅ Relevant citations provided
- ✅ Processing time under 3 seconds

### **Demo Mode:**
- Click "🎬 Run All Samples Demo" to test all cases automatically
- System will process each sample with 5-second intervals
- Perfect for demonstrations and presentations

### **API Testing:**
```bash
# Test Fake News Sample
curl -X POST https://api.sudrashan.com/v1/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "BREAKING: Scientists discover that drinking bleach cures all diseases...",
    "type": "text",
    "language": "auto"
  }'
```

### **Performance Benchmarks:**
- **Accuracy Target**: >95% for clear cases
- **Speed Target**: <3 seconds processing
- **Citation Quality**: Minimum 3 authoritative sources
- **False Positive Rate**: <2%
- **False Negative Rate**: <1%

These samples demonstrate Sudrashan's ability to detect various types of misinformation with high accuracy and provide comprehensive analysis with proper citations.